## Потоки стиснення

`System.IO.Compression` дає потоки-декоратори:

| Потік | Формат | Примітки |
| --- | --- | --- |
| `DeflateStream` | сирий DEFLATE | базовий алгоритм |
| `GZipStream` | DEFLATE + заголовок gzip і CRC32 | файли `.gz`, HTTP `Content-Encoding: gzip` |
| `ZLibStream` (.NET 6) | DEFLATE + заголовок zlib | деякі протоколи й формати файлів |
| `BrotliStream` (.NET Core 2.1) | Brotli | для тексту зазвичай на 15–25% менше, ніж gzip; `Content-Encoding: br` |

```csharp
// стиснути
using (var output = File.Create("data.json.gz"))
using (var gzip = new GZipStream(output, CompressionLevel.Optimal))
using (var input = File.OpenRead("data.json"))
    input.CopyTo(gzip);

// розпакувати
using var compressed = File.OpenRead("data.json.gz");
using var unzip = new GZipStream(compressed, CompressionMode.Decompress);
using var reader = new StreamReader(unzip);
string json = reader.ReadToEnd();
```

Що варто знати:

- Потік стиснення пише **фінальний блок, коли його звільняють** (або скидають). Читайте `MemoryStream` під ним лише після звільнення компресора (з `leaveOpen: true`, щоб зберегти потік у пам'яті).
- Потоки стиснення **лише вперед**: ні `Seek`, ні `Length`.
- `CompressionLevel`: `Optimal`, `Fastest`, `NoCompression`, `SmallestSize` (.NET 6). Текст стискається добре (часто у 5–10 разів); уже стиснені дані (JPEG, ZIP, зашифровані байти) — ні.
- Стискайте **до** шифрування, а не після: зашифровані дані виглядають випадковими й не стискаються.

## ZIP-архіви

ZIP-файл містить багато записів, кожен стиснений окремо, з центральним каталогом.

```csharp
// швидкі помічники
ZipFile.CreateFromDirectory("reports", "reports.zip");
ZipFile.ExtractToDirectory("reports.zip", "out", overwriteFiles: true);

// детально: ZipArchive
using (var zip = ZipFile.Open("bundle.zip", ZipArchiveMode.Create))
{
    zip.CreateEntryFromFile("invoice.pdf", "docs/invoice.pdf");
    ZipArchiveEntry entry = zip.CreateEntry("summary.txt", CompressionLevel.Optimal);
    using var writer = new StreamWriter(entry.Open());
    writer.Write("3 documents");
}

using (var zip = ZipFile.OpenRead("bundle.zip"))
{
    foreach (ZipArchiveEntry e in zip.Entries)
        Console.WriteLine($"{e.FullName}: {e.Length} → {e.CompressedLength} bytes");
}
```

`ZipArchive` також працює поверх будь-якого `Stream` з Seek (наприклад, щоб зібрати ZIP у пам'яті й повернути з API).

## Безпека: zip slip і zip-бомби

- **Zip slip**: запис з назвою `../../etc/passwd` може вийти за межі цільової теки. Розпаковуючи вручну, обчисліть повний шлях і перевірте, що він лишається всередині теки призначення (`ExtractToDirectory` таку перевірку робить).
- **Zip-бомби/бомби розпакування**: крихітний архів, що розгортається в гігабайти. Розпаковуючи недовірені дані, обмежуйте кількість прочитаних байтів і кількість записів.

## Що сказати на співбесіді

- `GZipStream`/`DeflateStream`/`BrotliStream` — декоратори; звільняйте, щоб записати фінальний блок.
- `ZipFile`/`ZipArchive` читають і пишуть багатофайлові архіви.
- Стискайте до шифрування; для недовірених архівів захищайтеся від виходу за межі шляху й бомб розпакування.
