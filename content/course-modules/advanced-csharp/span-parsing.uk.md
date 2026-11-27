## Проблема зі Split і Substring

Типовий парсер:

```csharp
foreach (string line in text.Split('\n'))              // алокує масив і рядок на кожен рядок тексту
{
    string[] fields = line.Split(',');                  // ще масиви й рядки
    total += int.Parse(fields[2].Trim());               // і ще один рядок від Trim
}
```

Для великого файлу це мільйони короткоживучих рядків: купа роботи для GC заради даних, на які дивляться лише раз.

## Розбір лише вперед через ReadOnlySpan<char>

Спосіб зі спанами йде текстом за допомогою індексів і зрізів, нічого не алокуючи:

```csharp
static long SumThirdColumn(ReadOnlySpan<char> text)
{
    long total = 0;
    while (!text.IsEmpty)
    {
        int nl = text.IndexOf('\n');
        ReadOnlySpan<char> line = nl < 0 ? text : text[..nl];
        text = nl < 0 ? ReadOnlySpan<char>.Empty : text[(nl + 1)..];

        for (int field = 0; ; field++)
        {
            int comma = line.IndexOf(',');
            ReadOnlySpan<char> value = comma < 0 ? line : line[..comma];
            if (field == 2)
            {
                if (int.TryParse(value.Trim(), out int n)) total += n;   // розбирає прямо зі span
                break;
            }
            if (comma < 0) break;
            line = line[(comma + 1)..];
        }
    }
    return total;
}
```

Текст поглинається **лише вперед**: кожен крок відрізає оброблене. `int.TryParse`, `double.TryParse`, `DateTime.TryParse`, `Guid.TryParse` та багато інших приймають `ReadOnlySpan<char>` напряму.

## Енумератори на спанах

Можна писати `ref struct`-енумератори, що віддають зрізи без алокацій, і використовувати їх у `foreach`:

```csharp
public ref struct SplitEnumerator
{
    private ReadOnlySpan<char> _rest;
    private readonly char _sep;
    public SplitEnumerator(ReadOnlySpan<char> text, char sep) { _rest = text; _sep = sep; Current = default; }
    public ReadOnlySpan<char> Current { get; private set; }
    public SplitEnumerator GetEnumerator() => this;
    public bool MoveNext()
    {
        if (_rest.IsEmpty) return false;
        int i = _rest.IndexOf(_sep);
        Current = i < 0 ? _rest : _rest[..i];
        _rest = i < 0 ? ReadOnlySpan<char>.Empty : _rest[(i + 1)..];
        return true;
    }
}

foreach (ReadOnlySpan<char> part in new SplitEnumerator("a,b,c", ','))
    Console.WriteLine(part.ToString());
```

`foreach` працює завдяки **патерну** (`GetEnumerator` з `MoveNext` і `Current`), а не інтерфейсу, тож ref struct можна перелічувати. Вбудовані приклади — `string.EnumerateLines()` і `MemoryExtensions.EnumerateRunes()`.

## Двійковий розбір

Для байтів `BinaryPrimitives` читає цілі числа із заданим порядком байтів зі спанів, а `Utf8Parser`/`Utf8Formatter` розбирають і форматують числа напряму в UTF-8:

```csharp
ReadOnlySpan<byte> packet = buffer.AsSpan(0, read);
ushort type = BinaryPrimitives.ReadUInt16BigEndian(packet);
uint length = BinaryPrimitives.ReadUInt32BigEndian(packet[2..]);
ReadOnlySpan<byte> body = packet.Slice(6, (int)length);
```

## Що сказати на співбесіді

- `Split`/`Substring` алокують на кожен шматок; нарізання спанів нічого не алокує.
- Розбирайте лише вперед через `IndexOf` + зрізи; більшість методів `TryParse` приймають спани.
- `ref struct`-енумератори дозволяють `foreach` віддавати спани; `BinaryPrimitives` розбирає двійкові формати.
