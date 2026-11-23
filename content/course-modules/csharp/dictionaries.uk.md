`Dictionary<TKey, TValue>` зберігає **пари**: унікальний ключ і значення, прикріплене до нього. Значення запитують за ключем, і словник знаходить його швидко, не переглядаючи всі пари. Це правильний інструмент для телефонної книги, лічильника слів, таблиці налаштувань чи кешу.

```csharp
var ages = new Dictionary<string, int>();
ages["Ann"] = 31;                 // додати нову пару
ages["Bo"] = 25;
ages["Ann"] = 32;                 // ключ існує: значення замінюється
Console.WriteLine(ages["Ann"]);   // 32
Console.WriteLine(ages.Count);    // 2
```

Працює й ініціалізатор:

```csharp
var capitals = new Dictionary<string, string>
{
    { "Ukraine", "Kyiv" },
    { "Poland", "Warsaw" },
};
```

## Додавання: індексатор і `Add`

| | Ключ уже існує | Ключ новий |
| --- | --- | --- |
| `d[key] = value` | замінює значення | додає пару |
| `d.Add(key, value)` | кидає `ArgumentException` | додає пару |

Використовуйте `Add`, коли дублікат — помилка, що має гучно проявитися. Використовуйте індексатор, коли потрібне «встановити або замінити».

## Безпечне читання

Читання ключа, якого немає, кидає `KeyNotFoundException`:

```csharp
Console.WriteLine(ages["Zed"]);   // KeyNotFoundException
```

Є два безпечні способи:

```csharp
if (ages.ContainsKey("Zed"))
{
    Console.WriteLine(ages["Zed"]);
}

if (ages.TryGetValue("Ann", out int age))     // один пошук замість двох
{
    Console.WriteLine(age);
}
```

`TryGetValue` повертає, чи знайдено ключ, і віддає значення через `out`. Якщо ключа немає, значення `out` — типове (`0` для `int`).

## Видалення

```csharp
ages.Remove("Bo");          // True, якщо такий ключ був
ages.Clear();               // видаляє все
```

## Обхід словника

Кожен елемент — це `KeyValuePair` із властивостями `Key` та `Value`:

```csharp
foreach (KeyValuePair<string, int> pair in ages)
{
    Console.WriteLine(pair.Key + " is " + pair.Value);
}

foreach (string name in ages.Keys) { }       // лише ключі
foreach (int value in ages.Values) { }       // лише значення
```

**Порядок не гарантується.** Не покладайтеся на те, що пари виходитимуть у порядку додавання. Якщо порядок потрібен, візьміть ключі, покладіть у список і відсортуйте його:

```csharp
var keys = new List<string>(ages.Keys);
keys.Sort(StringComparer.Ordinal);
foreach (string key in keys)
{
    Console.WriteLine(key + ": " + ages[key]);
}
```

Як і зі списком, не додавайте й не видаляйте пари під час `foreach` по тому самому словнику.

## Шаблон підрахунку

Найпоширеніше завдання для словника — рахувати, скільки разів трапляється кожна річ:

```csharp
var counts = new Dictionary<char, int>();
foreach (char c in "banana")
{
    if (counts.ContainsKey(c)) counts[c]++;
    else counts[c] = 1;
}
// a: 3, b: 1, n: 2
```

## Групування

Коли ключ має **кілька** значень, зробіть значенням список:

```csharp
var byLetter = new Dictionary<char, List<string>>();
foreach (string word in new[] { "apple", "avocado", "banana" })
{
    char first = word[0];
    if (!byLetter.ContainsKey(first)) byLetter[first] = new List<string>();
    byLetter[first].Add(word);
}
// a: apple, avocado    b: banana
```

## Ключі

- Ключ має бути **унікальним** і не може бути `null`.
- Рядки порівнюються **точно**: `"Ann"` і `"ann"` — різні ключі. Для ключів без урахування регістру передайте компаратор: `new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)`.
- Користуйтеся як ключами значеннями, що не змінюються: числами, рядками, переліками. Ключ, що змінився після додавання, більше не знайти.
- Пошук швидкий, бо словник використовує **хеш** ключа. Через це час пошуку майже не залежить від розміру словника, на відміну від перегляду списку.

## Множина: лише ключі

Якщо потрібно знати лише те, чи значення **є**, без прикріпленого значення, використовуйте `HashSet<T>`:

```csharp
var seen = new HashSet<string>();
seen.Add("a");                 // True: додано
seen.Add("a");                 // False: воно вже було
Console.WriteLine(seen.Contains("a"));   // True
```

Множина ідеальна для видалення дублікатів і для питання «чи я це вже бачив?».
