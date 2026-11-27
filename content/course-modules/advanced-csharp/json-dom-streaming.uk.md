## Три рівні JSON API

| API | Модель | Змінна | Типове використання |
| --- | --- | --- | --- |
| `JsonSerializer` | ваші класи | — | типізовані DTO |
| `JsonDocument` / `JsonElement` | DOM лише для читання | ні | швидко дослідити JSON невідомої форми |
| `JsonNode` (`JsonObject`, `JsonArray`, `JsonValue`) (.NET 6) | змінний DOM | так | читати, змінювати й писати JSON без класів |
| `Utf8JsonReader` / `Utf8JsonWriter` | токени лише вперед | — | максимальна продуктивність, величезні документи, власні конвертери |

## JsonDocument

```csharp
using JsonDocument doc = JsonDocument.Parse(json);       // буфери з пулу: завжди звільняйте
JsonElement root = doc.RootElement;

string name = root.GetProperty("customer").GetString()!;
decimal total = root.GetProperty("total").GetDecimal();
if (root.TryGetProperty("discount", out JsonElement d) && d.ValueKind == JsonValueKind.Number) { }
foreach (JsonElement line in root.GetProperty("lines").EnumerateArray())
    Console.WriteLine(line.GetProperty("sku").GetString());
```

- Лише для читання і дуже дешевий: один розбір у компактну таблицю токенів у позиченій пам'яті.
- Значення `JsonElement` дійсні лише поки живий документ; щоб зберегти довше, використайте `element.Clone()`.

## JsonNode: змінний DOM

```csharp
JsonNode node = JsonNode.Parse(json)!;
string customer = (string)node["customer"]!;
node["status"] = "shipped";                                // додати чи замінити властивість
node["lines"]!.AsArray().Add(new JsonObject { ["sku"] = "PAD", ["qty"] = 1 });
node.AsObject().Remove("internalNotes");
string updated = node.ToJsonString(new JsonSerializerOptions { WriteIndented = true });

var fresh = new JsonObject
{
    ["id"] = 7,
    ["tags"] = new JsonArray("a", "b"),
};
```

Використовуйте для латання конфігураційних файлів, перетворення payload-ів чи в тестах.

## Utf8JsonReader: токени на повній швидкості

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

- `ref struct` над `ReadOnlySpan<byte>`: нуль алокацій, рядки не створюються, якщо ви не попросите.
- Лише вперед; для потоків його годують буфер за буфером (або нехай `JsonSerializer.DeserializeAsyncEnumerable` потоково читає масиви за вас).
- Саме його отримують методи `JsonConverter<T>.Read` власних конвертерів.

## Utf8JsonWriter

```csharp
using var stream = new MemoryStream();
using (var w = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = false }))
{
    w.WriteStartObject();
    w.WriteNumber("id", 42);
    w.WriteString("customer", "Ann \"The Boss\"");   // екранування зроблять за вас
    w.WriteStartArray("tags");
    w.WriteStringValue("gift");
    w.WriteEndArray();
    w.WriteNull("note");
    w.WriteEndObject();
}
string json = Encoding.UTF8.GetString(stream.ToArray());
```

## Правила екранування (що мусить робити кожен JSON-писач)

Рядки беруться в подвійні лапки; перед `"` і `\` ставиться зворотна скісна; керівні символи (нижче U+0020) пишуться як `\n`, `\r`, `\t` або `\uXXXX`. System.Text.Json за замовчуванням ще й екранує символи, чутливі для HTML (`<`, `>`, `&`, `'`), через `JavaScriptEncoder.Default`; `JavaScriptEncoder.UnsafeRelaxedJsonEscaping` послаблює це, коли вивід не вбудовується в HTML.

Числа мають використовувати **крапку** як десятковий роздільник незалежно від культури; `NaN` і нескінченність — невалідний JSON.

## Що сказати на співбесіді

- `JsonDocument`: швидкий DOM лише для читання, треба звільняти. `JsonNode`: змінний DOM.
- `Utf8JsonReader`/`Writer`: будівельні блоки лише вперед без алокацій.
- Вивід JSON незалежний від культури, з екранованими лапками, зворотними скісними й керівними символами.
