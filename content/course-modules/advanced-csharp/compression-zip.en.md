## Compression streams

`System.IO.Compression` provides decorator streams:

| Stream | Format | Notes |
| --- | --- | --- |
| `DeflateStream` | raw DEFLATE | the base algorithm |
| `GZipStream` | DEFLATE + gzip header and CRC32 | `.gz` files, HTTP `Content-Encoding: gzip` |
| `ZLibStream` (.NET 6) | DEFLATE + zlib header | some protocols and file formats |
| `BrotliStream` (.NET Core 2.1) | Brotli | usually 15–25% smaller than gzip for text; `Content-Encoding: br` |

```csharp
// compress
using (var output = File.Create("data.json.gz"))
using (var gzip = new GZipStream(output, CompressionLevel.Optimal))
using (var input = File.OpenRead("data.json"))
    input.CopyTo(gzip);

// decompress
using var compressed = File.OpenRead("data.json.gz");
using var unzip = new GZipStream(compressed, CompressionMode.Decompress);
using var reader = new StreamReader(unzip);
string json = reader.ReadToEnd();
```

Things to know:

- A compressing stream writes its **final block when it's disposed** (or flushed). Read the underlying `MemoryStream` only after disposing the compressor (with `leaveOpen: true` to keep the memory stream).
- Compression streams are **forward-only**: no `Seek`, no `Length`.
- `CompressionLevel`: `Optimal`, `Fastest`, `NoCompression`, `SmallestSize` (.NET 6). Text compresses well (often 5–10×); already-compressed data (JPEG, ZIP, encrypted bytes) doesn't.
- Compress **before** encrypting, never after: encrypted data looks random and won't compress.

## ZIP archives

A ZIP file holds many entries, each compressed separately, with a central directory.

```csharp
// quick helpers
ZipFile.CreateFromDirectory("reports", "reports.zip");
ZipFile.ExtractToDirectory("reports.zip", "out", overwriteFiles: true);

// fine-grained: ZipArchive
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

`ZipArchive` also works over any seekable `Stream` (e.g. building a ZIP in memory to return from an API).

## Security: zip slip and zip bombs

- **Zip slip**: an entry named `../../etc/passwd` can escape the target folder. When extracting manually, resolve the full path and check it stays inside the destination (`ExtractToDirectory` does this check).
- **Zip/decompression bombs**: a tiny archive that expands to gigabytes. When decompressing untrusted data, cap the number of bytes you read and the number of entries.

## Interview takeaways

- `GZipStream`/`DeflateStream`/`BrotliStream` are decorators; dispose to write the final block.
- `ZipFile`/`ZipArchive` read and write multi-file archives.
- Compress before encrypting; guard against path traversal and decompression bombs with untrusted archives.
