## Навіщо потокова обробка XML

`XDocument.Load` будує все дерево в пам'яті: нормально для мегабайтів, болісно для гігабайтів. `XmlReader` і `XmlWriter` — API **лише вперед і без кешування**: стала пам'ять, дуже швидко, але ви бачите по одному вузлу.

## XmlReader

```csharp
var settings = new XmlReaderSettings
{
    IgnoreWhitespace = true,
    IgnoreComments = true,
    DtdProcessing = DtdProcessing.Prohibit,   // за замовчуванням: захист від XXE та атак розгортання сутностей
    Async = true,
};

using XmlReader r = XmlReader.Create("orders.xml", settings);
while (r.Read())
{
    if (r.NodeType == XmlNodeType.Element && r.Name == "order")
    {
        int id = int.Parse(r.GetAttribute("id")!);
        Console.WriteLine($"order {id}");
    }
}
```

Reader — це курсор: `Read()` переходить до наступного вузла, а `NodeType`, `Name`, `Value`, `Depth`, `IsEmptyElement` описують поточний.

Допоміжні методи скорочують типовий код:

```csharp
r.ReadToFollowing("customer");            // перейти до наступного <customer>
r.ReadStartElement("order");              // перевірити й поглинути відкривальний тег
string name = r.ReadElementContentAsString("name", "");
decimal total = r.ReadElementContentAsDecimal();
r.ReadToDescendant("line"); r.ReadToNextSibling("line");
r.Skip();                                  // пропустити поточний елемент і його нащадків
```

## Гібридний патерн

Найпрактичніший підхід для великих файлів: читати потоком через `XmlReader`, але **кожен запис** завантажувати як невеликий `XElement`:

```csharp
using var r = XmlReader.Create(path);
r.MoveToContent();
while (r.ReadToFollowing("order"))
{
    var order = (XElement)XNode.ReadFrom(r);   // лише це піддерево <order>
    Process((int)order.Attribute("id"), (decimal)order.Element("total"));
}
```

Ви отримуєте зручність LINQ to XML для кожного запису і сталу пам'ять загалом.

## XmlWriter

```csharp
var settings = new XmlWriterSettings { Indent = true, Encoding = new UTF8Encoding(false) };
using XmlWriter w = XmlWriter.Create("export.xml", settings);
w.WriteStartDocument();
w.WriteStartElement("orders");
foreach (var o in orders)
{
    w.WriteStartElement("order");
    w.WriteAttributeString("id", o.Id.ToString(CultureInfo.InvariantCulture));
    w.WriteElementString("customer", o.Customer);           // екранування автоматичне
    w.WriteStartElement("total");
    w.WriteValue(o.Total);                                   // форматування за стандартом XML
    w.WriteEndElement();
    w.WriteEndElement();
}
w.WriteEndElement();
```

Гібридний трюк працює й для виводу: `xelement.WriteTo(writer)` пише невелике піддерево, побудоване функціонально.

## Нотатки з безпеки

- Для недовіреного вводу лишайте `DtdProcessing.Prohibit` (або `Ignore`): DTD уможливлюють **XXE** (читання локальних файлів через зовнішні сутності) та **billion laughs** (експоненційне розгортання сутностей).
- `XmlResolver = null` не дає reader завантажувати зовнішні ресурси.
- Значення за замовчуванням у .NET Core безпечні; старий код .NET Framework з `XmlDocument.Load` і стандартними налаштуваннями — не обов'язково.

## Що сказати на співбесіді

- `XmlReader`/`XmlWriter`: лише вперед, мало пам'яті, швидко; X-DOM: зручно, у пам'яті.
- Гібрид: потоком через `XmlReader`, кожен запис матеріалізувати через `XNode.ReadFrom`.
- Не вмикайте обробку DTD для недовіреного XML.
