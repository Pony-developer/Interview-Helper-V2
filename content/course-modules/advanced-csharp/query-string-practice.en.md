## Task

Write the two halves of query-string handling.

1. **`Query.Build(baseUrl, pairs)`**:
   - skip pairs whose value is `null`;
   - escape every key and value with `Uri.EscapeDataString` (so `&`, `#`, spaces and non-ASCII letters are encoded);
   - join them as `key=value` with `&` and append after a `?`; if nothing is left, return `baseUrl` unchanged (no dangling `?`).
2. **`Query.Parse(url)`**:
   - take the text after `?` and before any `#`;
   - split on `&`, ignoring empty parts; split each part at the **first** `=` (a part without `=` gets an empty value);
   - treat `+` as a space, then unescape with `Uri.UnescapeDataString`;
   - store in a dictionary with **case-insensitive** keys; if a key repeats, the last value wins.

Expected output:

```
https://shop.test/search?q=C%23%20%26%20.NET&city=%D0%9A%D0%B8%D1%97%D0%B2&page=2
https://shop.test/
C# & .NET | Київ | 2 | 3
sort=name flag=''
shop.test /search https 443
```
