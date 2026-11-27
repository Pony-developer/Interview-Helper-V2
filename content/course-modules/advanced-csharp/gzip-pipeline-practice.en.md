## Task

Build a two-way text pipeline by stacking streams: a `StreamWriter` (adapter) over a `GZipStream` (decorator) over the caller's stream (backing store).

1. **`Compress(output, lines)`** writes each line through `StreamWriter` → `GZipStream(CompressionMode.Compress, leaveOpen: true)` → `output`. Dispose the writer and the gzip stream (so the final compressed block is written), but leave `output` open: the caller reads it afterwards.
2. **`CountLinesContaining(input, word)`** stacks `StreamReader` → `GZipStream(CompressionMode.Decompress, leaveOpen: true)` → `input` and reads **line by line** with `ReadLine` (never the whole text at once), counting lines that contain `word` ignoring case.

`Main` generates 2,000 log lines, checks the compressed size is less than a quarter of the raw size, and runs two searches over the same compressed stream.

Expected output:

```
compressed smaller: True
output still usable: True
errors: 200
request 1999: 1
```
