## Вбудований стек JSON

`System.Text.Json` (.NET Core 3.0+) — стандартна JSON-бібліотека сучасного .NET і ASP.NET Core. Вона створена для швидкості й мінімуму алокацій: працює безпосередньо з байтами UTF-8.

```csharp
public record Order(int Id, string Customer, decimal Total, DateTime Placed, List<string> Tags);

var order = new Order(42, "Ann", 99.5m, DateTime.UtcNow, new() { "gift" });
string json = JsonSerializer.Serialize(order);
// {"Id":42,"Customer":"Ann","Total":99.5,"Placed":"2024-03-05T12:30:00Z","Tags":["gift"]}

Order? back = JsonSerializer.Deserialize<Order>(json);
byte[] utf8 = JsonSerializer.SerializeToUtf8Bytes(order);          // оминаючи рядок UTF-16
await JsonSerializer.SerializeAsync(stream, order);                // одразу в потік
```

## Параметри

```csharp
var options = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,       // "customer" замість "Customer"
    PropertyNameCaseInsensitive = true,                       // читання: приймати будь-який регістр
    WriteIndented = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    NumberHandling = JsonNumberHandling.AllowReadingFromString,
    Converters = { new JsonStringEnumConverter() },           // enum як назви, а не числа
};
```

- Значення за замовчуванням суворі: назви властивостей **чутливі до регістру**, вивід у **PascalCase**, без коментарів і завершальних ком. ASP.NET Core використовує `JsonSerializerDefaults.Web` (camelCase, без урахування регістру).
- **Кешуйте й повторно використовуйте** екземпляр параметрів: створення нового на кожен виклик викидає закешовані метадані й повільне.

## Атрибути

```csharp
public class Product
{
    [JsonPropertyName("sku")] public string Code { get; set; } = "";
    [JsonIgnore] public decimal Cost { get; set; }                       // ніколи не серіалізується
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public int Stock { get; set; }
    [JsonInclude] private DateTime _created;                             // увімкнути непублічний член (.NET 5)
    [JsonConverter(typeof(JsonStringEnumConverter))] public Category Category { get; set; }
    [JsonExtensionData] public Dictionary<string, JsonElement>? Extra { get; set; }   // невідомі властивості
}
```

Record і класи з конструкторами десеріалізуються через конструктор, коли назви параметрів збігаються з назвами властивостей (`[JsonConstructor]` обирає один явно).

## Власні конвертери

```csharp
public class UnixTimeConverter : JsonConverter<DateTimeOffset>
{
    public override DateTimeOffset Read(ref Utf8JsonReader reader, Type type, JsonSerializerOptions o)
        => DateTimeOffset.FromUnixTimeSeconds(reader.GetInt64());
    public override void Write(Utf8JsonWriter writer, DateTimeOffset value, JsonSerializerOptions o)
        => writer.WriteNumberValue(value.ToUnixTimeSeconds());
}
```

## Поліморфізм

За замовчуванням серіалізація використовує **оголошений** тип: змінна `Shape`, що містить `Circle`, запише лише властивості `Shape`. Оголосіть змінну як `object` або (.NET 7+) використайте `[JsonDerivedType(typeof(Circle), "circle")]` з дискримінатором типу.

## Генерація коду (.NET 6)

```csharp
[JsonSerializable(typeof(Order))]
public partial class AppJsonContext : JsonSerializerContext { }

string json = JsonSerializer.Serialize(order, AppJsonContext.Default.Order);
```

Код серіалізатора генерується під час компіляції: швидший старт, без рефлексії, і він працює з trimming і Native AOT.

## Newtonsoft.Json

Json.NET досі поширений. Він поблажливіший і багатший на можливості (`JObject`, `TypeNameHandling`, безліч конвертерів), але повільніший. Обережно: `TypeNameHandling.All` на недовіреному вводі — відомий ризик віддаленого виконання коду.

## Що сказати на співбесіді

- `JsonSerializer.Serialize/Deserialize`; за замовчуванням PascalCase і чутливість до регістру (Web-налаштування — camelCase).
- Повторно використовуйте `JsonSerializerOptions`; налаштовуйте атрибутами та `JsonConverter<T>`.
- Генерація коду прибирає рефлексію та уможливлює AOT.
