## Завдання

Питання 54 — що відбувається на рівні HTTP, коли ви відкриваєте сторінку. Найкращий спосіб запам'ятати, як виглядає запит HTTP/1.1, — розібрати його:

```text
GET /search?q=c%23+tips&page=2 HTTP/1.1\r\n
Host: google.com\r\n
Accept: text/html\r\n
\r\n                                  ← порожній рядок завершує заголовки
<тіло, Content-Length байтів>
```

Допишіть **`HttpParser.Parse(raw)`**:

1. Відокремте заголовки від тіла за першим `"\r\n\r\n"`.
2. **Рядок запиту** має містити рівно три частини, розділені пробілами: метод, ціль, версію. Інакше киньте `FormatException`.
3. Розділіть **ціль** на `Path` і рядок запиту. Кожна пара `name=value` іде в `Query` **декодованою з URL**: `+` означає пробіл, а `%23` — `#` (замініть `+` на пробіл, потім `Uri.UnescapeDataString`).
4. Кожен рядок заголовка `Name: value` іде в `Headers` (обріжте пробіли з обох частин). Словник уже нечутливий до регістру — назви заголовків у HTTP нечутливі до регістру.
5. **Тіло** — рівно `Content-Length` символів після порожнього рядка (без тіла, якщо `Content-Length` немає). Усе, що далі, належить наступному запиту в keep-alive з'єднанні, тож ігноруйте це.

Очікуваний вивід:

```
GET /search
q = c# tips
page = 2
query keys: 2
host: google.com
accept-language: uk
body: (empty)
POST /orders (0 query keys)
content-type: application/json
body: {"id":42,"x"}
FormatException
```
