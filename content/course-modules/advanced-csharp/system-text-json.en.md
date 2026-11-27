## The built-in JSON stack

`System.Text.Json` (.NET Core 3.0+) is the default JSON library in modern .NET and ASP.NET Core. It's designed for speed and low allocations: it works on UTF-8 bytes directly.

```csharp
public record Order(int Id, string Customer, decimal Total, DateTime Placed, List<string> Tags);

var order = new Order(42, "Ann", 99.5m, DateTime.UtcNow, new() { "gift" });
string json = JsonSerializer.Serialize(order);
// {"Id":42,"Customer":"Ann","Total":99.5,"Placed":"2024-03-05T12:30:00Z","Tags":["gift"]}

Order? back = JsonSerializer.Deserialize<Order>(json);
byte[] utf8 = JsonSerializer.SerializeToUtf8Bytes(order);          // skip the UTF-16 string
await JsonSerializer.SerializeAsync(stream, order);                // straight to a stream
```

## Options

```csharp
var options = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,       // "customer" instead of "Customer"
    PropertyNameCaseInsensitive = true,                       // reading: accept any casing
    WriteIndented = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    NumberHandling = JsonNumberHandling.AllowReadingFromString,
    Converters = { new JsonStringEnumConverter() },           // enums as names, not numbers
};
```

- Defaults are strict: **case-sensitive** property names and **PascalCase** output, no comments or trailing commas. ASP.NET Core uses `JsonSerializerDefaults.Web` (camelCase, case-insensitive).
- **Cache and reuse** the options instance: creating one per call throws away cached metadata and is slow.

## Attributes

```csharp
public class Product
{
    [JsonPropertyName("sku")] public string Code { get; set; } = "";
    [JsonIgnore] public decimal Cost { get; set; }                       // never serialized
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public int Stock { get; set; }
    [JsonInclude] private DateTime _created;                             // opt in a non-public member (.NET 5)
    [JsonConverter(typeof(JsonStringEnumConverter))] public Category Category { get; set; }
    [JsonExtensionData] public Dictionary<string, JsonElement>? Extra { get; set; }   // unknown properties
}
```

Records and classes with constructors deserialize through the constructor when parameter names match property names (`[JsonConstructor]` picks one explicitly).

## Custom converters

```csharp
public class UnixTimeConverter : JsonConverter<DateTimeOffset>
{
    public override DateTimeOffset Read(ref Utf8JsonReader reader, Type type, JsonSerializerOptions o)
        => DateTimeOffset.FromUnixTimeSeconds(reader.GetInt64());
    public override void Write(Utf8JsonWriter writer, DateTimeOffset value, JsonSerializerOptions o)
        => writer.WriteNumberValue(value.ToUnixTimeSeconds());
}
```

## Polymorphism

By default, serialization uses the **declared** type: a `Shape` variable holding a `Circle` writes only `Shape`'s properties. Declare the variable as `object`, or (.NET 7+) use `[JsonDerivedType(typeof(Circle), "circle")]` with a type discriminator.

## Source generation (.NET 6)

```csharp
[JsonSerializable(typeof(Order))]
public partial class AppJsonContext : JsonSerializerContext { }

string json = JsonSerializer.Serialize(order, AppJsonContext.Default.Order);
```

The serializer code is generated at compile time: faster startup, no reflection, and it works with trimming and Native AOT.

## Newtonsoft.Json

Json.NET is still widespread. It's more lenient and feature-rich (`JObject`, `TypeNameHandling`, many converters), but slower. Beware: `TypeNameHandling.All` on untrusted input is a known remote-code-execution risk.

## Interview takeaways

- `JsonSerializer.Serialize/Deserialize`; defaults are case-sensitive PascalCase (Web defaults are camelCase).
- Reuse `JsonSerializerOptions`; customize with attributes and `JsonConverter<T>`.
- Source generation removes reflection and enables AOT.
