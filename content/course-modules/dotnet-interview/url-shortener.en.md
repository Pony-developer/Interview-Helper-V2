## Task

The core of the URL shortener from the lecture. Complete:

1. **`Base62.Encode(n)`** — write `n` in base 62 with the alphabet `0-9a-zA-Z`: take `n % 62` as the last digit, divide by 62, repeat, then reverse. `0` → `"0"`, `61` → `"Z"`, `62` → `"10"`.
2. **`Base62.Decode(s)`** — the reverse (`n = n * 62 + digit`); a character outside the alphabet → `FormatException`.
3. **`Shortener.Shorten(url)`** — normalize the URL (trim spaces, remove one trailing `/`). If this URL was shortened before, return the **same** code (idempotent); otherwise take `nextId++`, remember the URL in both dictionaries and return the Base62 code of the id.
4. **`Shortener.Resolve(code)`** — the original URL, or `null` for an unknown code and for an invalid one (catch the `FormatException`).

Expected output:

```
0 Z 10 ZZ 100
61 62 123456789
q0U q0V True
https://dou.ua/lenta/articles/interview-questions-net-developer
https://learn.microsoft.com/dotnet
unknown
invalid
```
