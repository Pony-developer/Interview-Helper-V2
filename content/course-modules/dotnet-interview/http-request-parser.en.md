## Task

Question 54 asks what happens at the HTTP level when you open a page. The best way to remember what an HTTP/1.1 request looks like is to parse one:

```text
GET /search?q=c%23+tips&page=2 HTTP/1.1\r\n
Host: google.com\r\n
Accept: text/html\r\n
\r\n                                  ← an empty line ends the headers
<body, Content-Length bytes>
```

Complete **`HttpParser.Parse(raw)`**:

1. Split the headers from the body at the first `"\r\n\r\n"`.
2. The **request line** must have exactly three parts separated by spaces: method, target, version. Otherwise throw `FormatException`.
3. Split the **target** into `Path` and the query string. Each `name=value` pair goes into `Query`, **URL-decoded**: `+` means a space and `%23` is `#` (replace `+` with a space, then use `Uri.UnescapeDataString`).
4. Each header line `Name: value` goes into `Headers` (trim both parts). The dictionary is already case-insensitive — header names are case-insensitive in HTTP.
5. The **body** is exactly `Content-Length` characters after the empty line (none if there is no `Content-Length`). Anything after that belongs to the next request on a keep-alive connection, so ignore it.

Expected output:

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
