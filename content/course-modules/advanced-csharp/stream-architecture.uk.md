## Три шари

Введення-виведення в .NET побудоване з трьох видів деталей, що з'єднуються між собою:

```
 Адаптери        StreamReader / StreamWriter, BinaryReader / BinaryWriter, XmlReader ...
                 (перетворюють байти на текст, числа, XML)
 Декоратори      BufferedStream, GZipStream, BrotliStream, CryptoStream, SslStream ...
                 (перетворюють байти; обгортають інший потік)
 Сховища         FileStream, MemoryStream, NetworkStream, PipeStream ...
                 (де байти насправді живуть)
```

```csharp
using var file = new FileStream("log.gz", FileMode.Create);         // сховище
using var gzip = new GZipStream(file, CompressionLevel.Optimal);   // декоратор
using var writer = new StreamWriter(gzip, Encoding.UTF8);          // адаптер
writer.WriteLine("hello");
```

Оскільки кожен шар знає лише `Stream`, будь-який декоратор працює над будь-яким сховищем: можна стискати в мережевий потік чи шифрувати в пам'ять без нового коду.

## Клас Stream

```csharp
public abstract class Stream : IDisposable, IAsyncDisposable
{
    bool CanRead, CanWrite, CanSeek, CanTimeout;
    int Read(byte[] buffer, int offset, int count);   // також Read(Span<byte>), ReadAsync(Memory<byte>)
    void Write(byte[] buffer, int offset, int count);
    long Length; long Position; long Seek(long offset, SeekOrigin origin); void SetLength(long);
    void Flush();
    void CopyTo(Stream destination); Task CopyToAsync(Stream destination);
}
```

Ключові правила:

- **`Read` може повернути менше байтів, ніж просили**, навіть коли дані ще надходять (мережеві потоки, розпакування). Він повертає **0 лише в кінці**. Завжди читайте в циклі:

```csharp
int total = 0;
while (total < buffer.Length)
{
    int n = stream.Read(buffer, total, buffer.Length - total);
    if (n == 0) throw new EndOfStreamException();
    total += n;
}
// .NET 7: stream.ReadExactly(buffer);
```

- **Seek** можливий лише коли `CanSeek` істинний (файли, пам'ять; не мережа й не стиснення). Інакше `Length` і `Position` кидають винятки.
- **Flush** проштовхує буферизовані дані в сховище. `Dispose` скидає буфер і закриває.
- У серверному коді для файлів і мережі віддавайте перевагу асинхронним методам; передавайте `CancellationToken`.

## Сховища

| Потік | Примітки |
| --- | --- |
| `FileStream` | `new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize, useAsync: true)` або `File.OpenRead`/`OpenWrite`/`Create`. `FileMode`: `CreateNew`, `Create`, `Open`, `OpenOrCreate`, `Truncate`, `Append` |
| `MemoryStream` | масив байтів у пам'яті, що росте; `ToArray()`, `GetBuffer()`, `TryGetBuffer`. Чудово для тестів і побудови payload-ів |
| `NetworkStream` | над сокетом (див. мережу) |
| `PipeStream` | іменовані й анонімні канали для міжпроцесної взаємодії |
| `BufferedStream` | декоратор, що додає буфер потоку, який його не має (FileStream уже буферизує) |

## Потокобезпечність

Потоки даних **не потокобезпечні**. `Stream.Synchronized(stream)` обгортає потік блокуванням, але одночасне читання/запис одного потоку рідко має сенс.

## Сучасні альтернативи

- `System.IO.Pipelines` (`PipeReader`/`PipeWriter`) бере на себе буферизацію й часткові читання для високопродуктивних парсерів (використовується Kestrel).
- `RandomAccess` (.NET 6) дає потокобезпечні читання й записи файлу за зсувом без спільної `Position`.

## Що сказати на співбесіді

- Сховища тримають байти, декоратори їх перетворюють, адаптери інтерпретують.
- `Read` може повернути менше байтів, ніж просили; читайте в циклі до 0 чи до потрібної кількості.
- Dispose скидає буфер; перевіряйте `CanSeek` перед використанням `Position`/`Length`.
