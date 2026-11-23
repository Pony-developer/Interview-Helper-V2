Settings files are everywhere, and reading them is a typical job for a program. In the practice runner there are no files, so the text of the file is given to you as a string, and you read it **line by line** with a `StringReader`, exactly as you would read a real file.

The format is a simple INI file:

```text
# settings
name = Assay
[server]
host = localhost
port = 8080

[user]
name = Ann
; a comment
 lang = uk 
oops, this line has no equals sign
[links]
url = http://x.org/?a=b
```

Implement `Parse(text)`. It returns a `Dictionary<string, string>` with the settings.

The rules:

- Spaces around a line, around a key and around a value are ignored.
- **Blank lines** and **comment lines**, which start with `#` or `;`, are skipped.
- A line `[name]` starts a **section**. The keys that follow are stored as `name.key`. Before the first section, a key is stored without a prefix.
- A line `key = value` is split at the **first** `=`, so the value itself may contain `=`.
- A line that does not fit any of these (no `=`) is ignored.

`Main` parses the text above and prints the entries, sorted by key. Do not change `Main`. Expected output:

```text
links.url = http://x.org/?a=b
name = Assay
server.host = localhost
server.port = 8080
user.lang = uk
user.name = Ann
```

Note that `name` appears twice in the text: once without a section, and once in `[user]`. They are different keys, `name` and `user.name`.

Hint: `reader.ReadLine()` returns `null` at the end of the text. `line.IndexOf('=')` gives the position of the first `=`, and `Substring` cuts the key and the value.
