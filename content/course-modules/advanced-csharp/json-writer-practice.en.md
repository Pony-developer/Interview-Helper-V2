## Task

The practice runtime has no `System.Text.Json`, which is a good excuse to write the core of a JSON serializer yourself and learn the rules every JSON writer follows.

Implement **`Write(sb, value)`** recursively:

| Value | Output |
| --- | --- |
| `null` | `null` |
| `bool` | `true` / `false` |
| `string` | via `WriteString` |
| `int`, `long`, `double`, `decimal` | the number with `CultureInfo.InvariantCulture` (a dot, whatever the current culture; `Main` sets uk-UA on purpose) |
| `IDictionary<string, object>` | `{"key":value,...}` in enumeration order. Check this **before** `IEnumerable`, because a dictionary is also enumerable |
| other `IEnumerable` | `[value,...]` |
| anything else | throw `NotSupportedException("Can't serialize " + type name)` |

Implement **`WriteString(sb, s)`**: wrap in double quotes; escape `"` as `\"`, `\` as `\\`, newline as `\n`, carriage return as `\r`, tab as `\t`, and any other character below U+0020 as `\u` plus four lowercase hex digits.

The output is compact: no spaces.

Expected output:

```
{"id":42,"customer":"Ann \"The Boss\" O'Neil","paid":true,"total":1234.5,"tags":["gift","express"],"lines":[{"sku":"PEN","qty":10},{"sku":"INK","qty":2,"note":null}],"comment":"line1\nline2\ttab \\ path"}
[1,2.5,-3,false,null,[]]
"bell\u0007"
Can't serialize DateTime
```
