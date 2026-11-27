import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const jsonTypes = (body: string) => `static class Json
{
    // Serializes: null, bool, int/long/double/decimal (invariant culture), string,
    // IDictionary<string, object> (an object, keys in insertion order) and IEnumerable (an array).
    // Compact output: no spaces. Anything else throws NotSupportedException.
    public static string Serialize(object value)
    {
        var sb = new StringBuilder();
        Write(sb, value);
        return sb.ToString();
    }

    private static void Write(StringBuilder sb, object value)
    {
${body.split("@@")[0]}
    }

    // Quotes and escapes a string: \\" \\\\ \\n \\r \\t, and other control characters as \\u00XX.
    private static void WriteString(StringBuilder sb, string s)
    {
${body.split("@@")[1]}
    }
}`;

const jsonSolution = `        if (value == null) { sb.Append("null"); return; }
        if (value is bool) { sb.Append((bool)value ? "true" : "false"); return; }
        if (value is string) { WriteString(sb, (string)value); return; }
        if (value is int || value is long || value is double || value is decimal)
        {
            sb.Append(Convert.ToString(value, CultureInfo.InvariantCulture));
            return;
        }
        var dict = value as IDictionary<string, object>;
        if (dict != null)
        {
            sb.Append('{');
            bool first = true;
            foreach (var pair in dict)
            {
                if (!first) sb.Append(',');
                first = false;
                WriteString(sb, pair.Key);
                sb.Append(':');
                Write(sb, pair.Value);
            }
            sb.Append('}');
            return;
        }
        var list = value as IEnumerable;
        if (list != null)
        {
            sb.Append('[');
            bool first = true;
            foreach (var item in list)
            {
                if (!first) sb.Append(',');
                first = false;
                Write(sb, item);
            }
            sb.Append(']');
            return;
        }
        throw new NotSupportedException("Can't serialize " + value.GetType().Name);@@        sb.Append('"');
        foreach (char c in s)
        {
            switch (c)
            {
                case '"': sb.Append("\\\\\\""); break;
                case '\\\\': sb.Append("\\\\\\\\"); break;
                case '\\n': sb.Append("\\\\n"); break;
                case '\\r': sb.Append("\\\\r"); break;
                case '\\t': sb.Append("\\\\t"); break;
                default:
                    if (c < ' ') sb.Append("\\\\u").Append(((int)c).ToString("x4"));
                    else sb.Append(c);
                    break;
            }
        }
        sb.Append('"');`;

const jsonMain = `        CultureInfo.CurrentCulture = new CultureInfo("uk-UA");   // the decimal separator must still be a dot
        var order = new Dictionary<string, object>
        {
            { "id", 42 },
            { "customer", "Ann \\"The Boss\\" O'Neil" },
            { "paid", true },
            { "total", 1234.5m },
            { "tags", new List<object> { "gift", "express" } },
            { "lines", new List<object>
                {
                    new Dictionary<string, object> { { "sku", "PEN" }, { "qty", 10 } },
                    new Dictionary<string, object> { { "sku", "INK" }, { "qty", 2 }, { "note", null } },
                }
            },
            { "comment", "line1\\nline2\\ttab \\\\ path" },
        };
        Console.WriteLine(Json.Serialize(order));
        Console.WriteLine(Json.Serialize(new object[] { 1, 2.5, -3L, false, null, new List<object>() }));
        Console.WriteLine(Json.Serialize("bell\\u0007"));
        try { Json.Serialize(DateTime.MinValue); }
        catch (NotSupportedException e) { Console.WriteLine(e.Message); }`;

export const xmlJsonModule: ModuleDef = {
  slug: "xml-json",
  title: { en: "XML and JSON", uk: "XML і JSON" },
  slides: [
    lecture("linq-to-xml-dom", "LINQ to XML: the X-DOM", "LINQ to XML: X-DOM"),
    lecture("linq-to-xml-querying", "Querying, updating and namespaces in LINQ to XML", "Запити, оновлення та простори імен у LINQ to XML"),
    lecture("xmlreader-xmlwriter", "Streaming XML with XmlReader and XmlWriter", "Потокова обробка XML через XmlReader і XmlWriter"),
    lecture("system-text-json", "JSON with System.Text.Json", "JSON із System.Text.Json"),
    lecture("json-dom-streaming", "JsonDocument, JsonNode and Utf8JsonReader", "JsonDocument, JsonNode і Utf8JsonReader"),
    quiz("xml-json-quiz", "XML and JSON", "XML і JSON", [
      question(
        "xelement-value",
        ["`XElement e = new XElement(\"price\", 9.99m);` How do you read it back as a decimal safely?", "`XElement e = new XElement(\"price\", 9.99m);` Як безпечно прочитати це як decimal?"],
        [
          ["`decimal.Parse(e.Value)`", "`decimal.Parse(e.Value)`"],
          ["`(decimal)e`: the explicit conversion uses XML (culture-invariant) formatting; `(decimal?)` returns null for a missing element", "`(decimal)e`: явне перетворення використовує формат XML (незалежний від культури); `(decimal?)` повертає null для відсутнього елемента"],
          ["`e.ToString()`", "`e.ToString()`"],
          ["`Convert.ToDecimal(e.Name)`", "`Convert.ToDecimal(e.Name)`"],
        ],
        "b",
      ),
      question(
        "functional-construction",
        ["What is \"functional construction\" in LINQ to XML?", "Що таке «функціональна побудова» в LINQ to XML?"],
        [
          ["Building an XML tree in a single expression by nesting `new XElement(name, content...)` calls, often with LINQ queries inside", "Побудова XML-дерева одним виразом через вкладені виклики `new XElement(name, content...)`, часто з LINQ-запитами всередині"],
          ["Using XSLT", "Використання XSLT"],
          ["Parsing XML with regular expressions", "Розбір XML регулярними виразами"],
          ["A way to write XML schemas", "Спосіб писати XML-схеми"],
        ],
        "a",
      ),
      question(
        "namespace",
        ["`<root xmlns=\"urn:shop\"><item/></root>`. Why does `doc.Root.Element(\"item\")` return null?", "`<root xmlns=\"urn:shop\"><item/></root>`. Чому `doc.Root.Element(\"item\")` повертає null?"],
        [
          ["The document is invalid", "Документ невалідний"],
          ["Element names are case-insensitive", "Назви елементів не чутливі до регістру"],
          ["`item` is in the `urn:shop` namespace; you must ask for `ns + \"item\"` with `XNamespace ns = \"urn:shop\"`", "`item` належить простору імен `urn:shop`; треба шукати `ns + \"item\"` з `XNamespace ns = \"urn:shop\"`"],
          ["Element() only searches attributes", "Element() шукає лише атрибути"],
        ],
        "c",
      ),
      question(
        "xmlreader",
        ["When should you prefer `XmlReader` over loading an `XDocument`?", "Коли варто віддати перевагу `XmlReader`, а не завантаженню `XDocument`?"],
        [
          ["For small configuration files", "Для невеликих конфігураційних файлів"],
          ["When you need to modify the document", "Коли документ треба змінювати"],
          ["Never, XmlReader is obsolete", "Ніколи, XmlReader застарів"],
          ["For very large files: it reads forward-only with constant memory instead of building the whole tree", "Для дуже великих файлів: він читає лише вперед зі сталою пам'яттю, не будуючи все дерево"],
        ],
        "d",
      ),
      question(
        "json-case",
        ["By default, how does `JsonSerializer.Serialize` name the property `FirstName`?", "Як за замовчуванням `JsonSerializer.Serialize` називає властивість `FirstName`?"],
        [
          ["`FirstName`: exactly as declared, unless you set `PropertyNamingPolicy = JsonNamingPolicy.CamelCase` (ASP.NET Core sets camelCase for you)", "`FirstName`: точно як оголошено, якщо не задати `PropertyNamingPolicy = JsonNamingPolicy.CamelCase` (ASP.NET Core ставить camelCase сам)"],
          ["`firstName`", "`firstName`"],
          ["`first_name`", "`first_name`"],
          ["`FIRSTNAME`", "`FIRSTNAME`"],
        ],
        "a",
      ),
      question(
        "json-attrs",
        ["Which attributes customize System.Text.Json serialization?", "Які атрибути налаштовують серіалізацію System.Text.Json?"],
        [
          ["`[JsonPropertyName(\"id\")]`", "`[JsonPropertyName(\"id\")]`"],
          ["`[JsonIgnore]`", "`[JsonIgnore]`"],
          ["`[JsonConverter(typeof(...))]`", "`[JsonConverter(typeof(...))]`"],
          ["`[Serializable]`", "`[Serializable]`"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "jsonnode",
        ["You need to read and modify a JSON document whose shape you don't have a class for. Which API fits?", "Треба прочитати й змінити JSON-документ, для форми якого немає класу. Який API підходить?"],
        [
          ["`JsonDocument`, because it's mutable", "`JsonDocument`, бо він змінний"],
          ["`JsonNode` (`JsonObject`/`JsonArray`, .NET 6): a mutable DOM", "`JsonNode` (`JsonObject`/`JsonArray`, .NET 6): змінний DOM"],
          ["`Utf8JsonWriter` alone", "Лише `Utf8JsonWriter`"],
          ["`XDocument`", "`XDocument`"],
        ],
        "b",
      ),
      question(
        "jsondocument-dispose",
        ["Why must a `JsonDocument` be disposed?", "Чому `JsonDocument` треба звільняти (Dispose)?"],
        [
          ["It holds a file handle", "Він тримає дескриптор файлу"],
          ["It starts a background thread", "Він запускає фоновий потік"],
          ["It rents buffers from a shared array pool for its read-only representation; disposing returns them", "Він позичає буфери зі спільного пулу масивів для свого подання лише для читання; Dispose їх повертає"],
          ["It doesn't need to be", "Не треба"],
        ],
        "c",
      ),
    ]),
    practice("json-writer-practice", "A tiny JSON serializer", "Крихітний JSON-серіалізатор", {
      starter: PROGRAM_WITH(jsonTypes(`${TODO}@@${TODO}`), jsonMain, "using System.Collections;\nusing System.Collections.Generic;\nusing System.Globalization;\nusing System.Text;"),
      solution: PROGRAM_WITH(jsonTypes(jsonSolution), jsonMain, "using System.Collections;\nusing System.Collections.Generic;\nusing System.Globalization;\nusing System.Text;"),
      expectedOutput: `{"id":42,"customer":"Ann \\"The Boss\\" O'Neil","paid":true,"total":1234.5,"tags":["gift","express"],"lines":[{"sku":"PEN","qty":10},{"sku":"INK","qty":2,"note":null}],"comment":"line1\\nline2\\ttab \\\\ path"}\n[1,2.5,-3,false,null,[]]\n"bell\\u0007"\nCan't serialize DateTime\n`,
    }),
  ],
};
