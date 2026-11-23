The compiler chooses an overload by the **declared types** of the arguments. In this task, you write a family of `Show` methods, and `Main` tests which of them is chosen. **Write these `static string Show(...)` methods** in the class `Program` (the compiler needs a **unique** parameter list for each one):

| Signature | Returns |
|---|---|
| `Show(int n)` | `int:` + the number |
| `Show(double d)` | `double:` + the number |
| `Show(string s)` | `string:` + the text |
| `Show(bool b)` | `bool:yes` or `bool:no` |
| `Show(int[] items)` | `ints:` + the numbers, joined with a comma, such as `ints:1,2,3` |
| `Show(object o)` | `object:` + `o` as text |
| `Show(int a, int b)` | `pair:` + `a` + `-` + `b` |
| `Show(string s, int times)` | the text `s` repeated `times` times, with nothing between |

Do not change `Main`. Expected output:

```text
int:5
double:5.5
int:120
double:5
string:hi
bool:yes
ints:1,2,3
object:text
pair:1-2
ababab
object:5
string:
```

The lines in order: an `int`; a `double`; a `char` `'x'` (its code is 120, and `int` is the best match among the methods that accept it); a `long` `5L` (it converts to `double`, but not to `int`); a string; a `bool`; an array; a variable of the type `object` that holds a **string** (the **declared** type decides: `object:text`); two numbers; a string with a count; the number `5` cast to `object` (it is boxed, and the object overload is chosen); and a string variable that is `null` (the overload `Show(string)` is chosen, and the text after `string:` is empty).

Hint: you do not have to decide which method is called: the compiler does it, so just write all eight, each with the **exact** parameter types from the table. `string.Join(",", items)` joins the numbers. For the repeated text, the simplest way is a loop with `+=`.
