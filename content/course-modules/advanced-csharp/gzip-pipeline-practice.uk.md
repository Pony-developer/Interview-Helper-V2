## Завдання

Побудуйте двобічний текстовий конвеєр, склавши потоки один на одного: `StreamWriter` (адаптер) над `GZipStream` (декоратор) над потоком викликача (сховище).

1. **`Compress(output, lines)`** пише кожен рядок через `StreamWriter` → `GZipStream(CompressionMode.Compress, leaveOpen: true)` → `output`. Звільніть писача й gzip-потік (щоб записався фінальний стиснений блок), але залиште `output` відкритим: викликач потім його читає.
2. **`CountLinesContaining(input, word)`** складає `StreamReader` → `GZipStream(CompressionMode.Decompress, leaveOpen: true)` → `input` і читає **рядок за рядком** через `ReadLine` (ніколи не весь текст одразу), рахуючи рядки, що містять `word` без урахування регістру.

`Main` генерує 2 000 рядків логу, перевіряє, що стиснений розмір менший за чверть сирого, і виконує два пошуки по тому самому стисненому потоку.

Очікуваний результат:

```
compressed smaller: True
output still usable: True
errors: 200
request 1999: 1
```
