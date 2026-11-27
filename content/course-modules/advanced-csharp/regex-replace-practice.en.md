## Task

Four text transformations, each a single `Regex` call.

1. **`MaskEmails`**: replace each e-mail address with its first character, `***`, `@` and the original domain (`anna.k@shop.test` → `a***@shop.test`). Capture the first character and the domain, and use a replacement pattern with `$1` and `$2`.
2. **`MaskCards`**: find 16-digit card numbers, optionally grouped in fours by spaces or dashes (`(?:\d{4}[ -]?){3}(\d{4})` between word boundaries), and replace them with `**** **** **** ` plus the last 4 digits using a **`MatchEvaluator`** lambda. A plain 10-digit order number must stay untouched.
3. **`IsoDates`**: turn `dd.MM.yyyy` into `yyyy-MM-dd` with named groups and a replacement pattern `${y}-${m}-${d}`. `1.2.2024` doesn't have two-digit day and month, so it stays.
4. **`SplitList`**: split on commas or semicolons with optional spaces around them (`\s*[,;]\s*`) and drop empty items.

Expected output:

```
Contact a***@shop.test or B***@Example.org; card **** **** **** 1234, backup **** **** **** 0004. Order 1234567890 is fine.
Shipped 2024-03-05, delivered 2024-03-07; invoice 1.2.2024 stays.
pens|ink|pads
```
