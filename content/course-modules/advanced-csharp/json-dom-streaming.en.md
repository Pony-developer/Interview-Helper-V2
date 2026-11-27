## Three levels of JSON APIs

| API | Model | Mutable | Typical use |
| --- | --- | --- | --- |
| `JsonSerializer` | your classes | n/a | typed DTOs |
| `JsonDocument` / `JsonElement` | read-only DOM | no | inspect JSON of unknown shape fast |
| `JsonNode` (`JsonObject`, `JsonArray`, `JsonValue`) (.NET 6) | mutable DOM | yes | read, edit and write JSON without classes |
| `Utf8JsonReader` / `Utf8JsonWriter` | forward-only tokens | n/a | maximum performance, huge documents, custom converters |

## JsonDocument

```csharp
using JsonDocument doc = JsonDocument.Parse(json);       // pooled buffers: always dispose
JsonElement root = doc.RootElement;

string name = root.GetProperty("customer").GetString()!;
decimal total = root.GetProperty("total").GetDecimal();
if (root.TryGetProperty("discount", out JsonElement d) && d.ValueKind == JsonValueKind.Number) { }
foreach (JsonElement line in root.GetProperty("lines").EnumerateArray())
    Console.WriteLine(line.GetProperty("sku").GetString());
```

- Read-only and very cheap: a single parse into a compact token table in rented memory.
- `JsonElement` values are only valid while the document is alive; use `element.Clone()` to keep one longer.

## JsonNode: a mutable DOM

```csharp
JsonNode node = JsonNode.Parse(json)!;
string customer = (string)node["customer"]!;
node["status"] = "shipped";                                // add or replace a property
node["lines"]!.AsArray().Add(new JsonObject { ["sku"] = "PAD", ["qty"] = 1 });
node.AsObject().Remove("internalNotes");
string updated = node.ToJsonString(new JsonSerializerOptions { WriteIndented = true });

var fresh = new JsonObject
{
    ["id"] = 7,
    ["tags"] = new JsonArray("a", "b"),
};
```

Use it for patching config files, transforming payloads, or tests.

## Utf8JsonReader: tokens at full speed

```csharp
var reader = new Utf8JsonReader(utf8Bytes);
decimal sum = 0;
while (reader.Read())
{
    if (reader.TokenType == JsonTokenType.PropertyName && reader.ValueTextEquals("total"))
    {
        reader.Read();
        sum += reader.GetDecimal();
    }
}
```

- A `ref struct` over a `ReadOnlySpan<byte>`: zero allocations, no strings created unless you ask.
- Forward-only; for streams you feed it buffer by buffer (or let `JsonSerializer.DeserializeAsyncEnumerable` stream arrays for you).
- It's what custom `JsonConverter<T>.Read` methods receive.

## Utf8JsonWriter

```csharp
using var stream = new MemoryStream();
using (var w = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = false }))
{
    w.WriteStartObject();
    w.WriteNumber("id", 42);
    w.WriteString("customer", "Ann \"The Boss\"");   // escaping is handled for you
    w.WriteStartArray("tags");
    w.WriteStringValue("gift");
    w.WriteEndArray();
    w.WriteNull("note");
    w.WriteEndObject();
}
string json = Encoding.UTF8.GetString(stream.ToArray());
```

## Escaping rules (what every JSON writer must do)

Strings are wrapped in double quotes; `"` and `\` get a backslash; control characters (below U+0020) are written as `\n`, `\r`, `\t` or `\uXXXX`. System.Text.Json also escapes HTML-sensitive characters (`<`, `>`, `&`, `'`) by default via `JavaScriptEncoder.Default`; `JavaScriptEncoder.UnsafeRelaxedJsonEscaping` relaxes that when output isn't embedded in HTML.

Numbers must use a **dot** as the decimal separator regardless of culture; `NaN` and infinity aren't valid JSON.

## Interview takeaways

- `JsonDocument`: fast read-only DOM, must be disposed. `JsonNode`: mutable DOM.
- `Utf8JsonReader`/`Writer`: forward-only, zero-allocation building blocks.
- JSON output is culture-invariant, with escaped quotes, backslashes and control characters.
