## Завдання

У рантаймі практики немає `System.Text.Json` — чудовий привід написати ядро JSON-серіалізатора самому й вивчити правила, яких дотримується кожен JSON-писач.

Реалізуйте **`Write(sb, value)`** рекурсивно:

| Значення | Вивід |
| --- | --- |
| `null` | `null` |
| `bool` | `true` / `false` |
| `string` | через `WriteString` |
| `int`, `long`, `double`, `decimal` | число з `CultureInfo.InvariantCulture` (крапка за будь-якої поточної культури; `Main` навмисно ставить uk-UA) |
| `IDictionary<string, object>` | `{"key":value,...}` у порядку перелічення. Перевіряйте це **перед** `IEnumerable`, бо словник теж перелічуваний |
| інший `IEnumerable` | `[value,...]` |
| будь-що інше | кинути `NotSupportedException("Can't serialize " + назва типу)` |

Реалізуйте **`WriteString(sb, s)`**: обгорніть у подвійні лапки; екрануйте `"` як `\"`, `\` як `\\`, новий рядок як `\n`, повернення каретки як `\r`, табуляцію як `\t`, а будь-який інший символ нижче U+0020 — як `\u` плюс чотири шістнадцяткові цифри в нижньому регістрі.

Вивід компактний: без пробілів.

Очікуваний результат:

```
{"id":42,"customer":"Ann \"The Boss\" O'Neil","paid":true,"total":1234.5,"tags":["gift","express"],"lines":[{"sku":"PEN","qty":10},{"sku":"INK","qty":2,"note":null}],"comment":"line1\nline2\ttab \\ path"}
[1,2.5,-3,false,null,[]]
"bell\u0007"
Can't serialize DateTime
```
