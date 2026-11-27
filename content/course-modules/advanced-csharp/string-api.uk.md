## Створення й дослідження рядків

```csharp
string dashes = new string('-', 20);
string fromChars = new string(new[] { 'a', 'b', 'c' });
string empty = string.Empty;                 // те саме, що ""

bool blank = string.IsNullOrWhiteSpace(input);
int pos = "invoice-2024".IndexOf('-');       // 7
bool has = path.EndsWith(".json", StringComparison.OrdinalIgnoreCase);
char last = name[^1];
```

Кожен метод, що ніби змінює рядок, повертає **новий**: `Trim`, `Replace`, `Insert`, `Remove`, `PadLeft`, `ToUpperInvariant`, `Substring`.

## Розбиття та з'єднання

```csharp
string[] parts = "a, b,,c".Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
// { "a", "b", "c" }   (TrimEntries: .NET 5+)

string csv = string.Join(",", new[] { 1, 2, 3 });   // "1,2,3"
string all = string.Concat(words);                  // без роздільника
```

## Порівняння рядків: найважливіше рішення

| Порівняння | Для чого |
| --- | --- |
| `Ordinal` | ідентифікатори, ключі, шляхи до файлів, токени протоколів, усе машинне |
| `OrdinalIgnoreCase` | те саме без урахування регістру (HTTP-заголовки, імена файлів у Windows) |
| `CurrentCulture` / `InvariantCulture` | текст, який бачать і сортують люди |

```csharp
bool same = string.Equals(a, b, StringComparison.OrdinalIgnoreCase);
var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
list.Sort(StringComparer.CurrentCulture);
```

Порівняння з урахуванням культури може здивувати: турецькою `"file".ToUpper()` дає `"FİLE"` (İ з крапкою), тож `"FILE" == "file".ToUpper()` не виконується. Завжди передавайте `StringComparison` явно, а для не-користувацького тексту беріть `ToUpperInvariant`/`ToLowerInvariant`.

`==` на рядках — **ординальне** і чутливе до регістру. `CompareTo` і `string.Compare` без аргументів — **чутливі до культури**: легке джерело помилок.

## Інтернування рядків

Рядкові літерали **інтернуються**: однакові літерали в збірці — це один екземпляр. `string.Intern(s)` додає до цього пулу рядки, створені під час виконання. Прикладному коду це рідко допомагає і тримає рядки живими назавжди.

## StringBuilder

```csharp
var sb = new StringBuilder(capacity: 256);
foreach (var line in lines)
    sb.Append(line.Id).Append(';').AppendLine(line.Name);
sb.Insert(0, "Report\n").Replace(';', ',');
string report = sb.ToString();
```

`StringBuilder` тримає буфер змінного розміру (всередині — зв'язаний список фрагментів), тож кожен `Append` у середньому O(1). Емпіричні правила:

- кілька склеювань в одному виразі → `+` чи інтерполяція (компілятор перетворює `a + b + c` на один `string.Concat`);
- цикл чи невідома кількість частин → `StringBuilder` або `string.Join`;
- `sb.Clear()` дозволяє повторно використати буфер.

## Ефективна інтерполяція

C# 10 переписав інтерпольовані рядки на `DefaultInterpolatedStringHandler`: `$"{id}: {total}"` більше не пакує `id` і `total` і будує результат на буферах із пулу. Бібліотеки можуть приймати власні обробники — так логування може не будувати повідомлення, коли рівень логування вимкнено.

## Що сказати на співбесіді

- Рядки незмінні; кожна «зміна» алокує новий рядок.
- Передавайте `StringComparison` явно: `Ordinal` для машин, культуру для людей.
- `StringBuilder` для циклів; звичайний `+` чи інтерполяція для фіксованої кількості частин.
