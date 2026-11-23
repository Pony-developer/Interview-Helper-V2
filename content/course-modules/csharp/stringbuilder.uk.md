`string` не можна змінити. Кожен `+`, `Replace` чи `Insert` будує **новий** рядок і копіює в нього символи. Коли ви складаєте довгий текст із багатьох дрібних шматків, це копіювання накопичується.

```csharp
string result = "";
for (int i = 0; i < 100000; i++)
{
    result += "x";    // 100000 нових рядків, кожен трохи довший за попередній
}
```

Робота зростає зі **квадратом** кількості додавань. `StringBuilder` — інструмент для цього завдання: він тримає буфер, який можна змінювати на місці.

```csharp
using System.Text;

var sb = new StringBuilder();
for (int i = 0; i < 100000; i++)
{
    sb.Append("x");
}
string result = sb.ToString();
```

## Основи

`StringBuilder` міститься в `System.Text`, тож додайте на початку `using System.Text;`.

```csharp
var sb = new StringBuilder();
sb.Append("Hello");         // Hello
sb.Append(", ");            // Hello, 
sb.Append("world");         // Hello, world
sb.Append('!');             // Hello, world!   (char теж підходить)
sb.Append(42);              // Hello, world!42 (числа перетворюються)
sb.AppendLine();            // додає перенесення рядка
Console.WriteLine(sb.ToString());
```

`ToString()` повертає готовий текст як звичайний рядок. `Console.WriteLine(sb)` викликав би його за вас.

## Ланцюжки викликів

Кожен `Append` повертає сам builder, тож виклики можна поєднувати в ланцюжок:

```csharp
string line = new StringBuilder()
    .Append("Total: ")
    .Append(12.5)
    .Append(" USD")
    .ToString();
```

## Зміна того, що вже є

```csharp
var sb = new StringBuilder("Hello, world");
sb.Insert(0, ">> ");              // >> Hello, world
sb.Replace("world", "C#");        // >> Hello, C#
sb.Remove(0, 3);                  // Hello, C#
sb[0] = 'J';                      // Jello, C#  (символу можна присвоїти!)
Console.WriteLine(sb.Length);     // 9
sb.Clear();                       // порожній
```

На відміну від рядка, `StringBuilder` можна індексувати **та присвоювати**: `sb[i] = 'x'`. Його `Length` — поточна довжина, і її також можна встановити, щоб обрізати текст.

## Складання тексту в циклі

```csharp
var sb = new StringBuilder();
for (int i = 1; i <= 5; i++)
{
    if (i > 1) sb.Append(", ");
    sb.Append(i * i);
}
Console.WriteLine(sb);     // 1, 4, 9, 16, 25
```

Прийом `if (i > 1)` ставить роздільник **між** елементами без зайвого наприкінці. Для простих випадків коротший `string.Join`.

## Перетворення тексту символ за символом

Типове застосування — побудова перетвореної копії:

```csharp
static string Mask(string card)
{
    var sb = new StringBuilder();
    for (int i = 0; i < card.Length; i++)
    {
        bool last4 = i >= card.Length - 4;
        sb.Append(last4 ? card[i] : '*');
    }
    return sb.ToString();
}

Console.WriteLine(Mask("1234567812345678"));   // ************5678
```

## Ємність

Буфер усередині — це масив символів, що росте за потреби, приблизно подвоюючись. Якщо ви знаєте кінцевий розмір, можна сказати про це наперед, що уникне повторного росту:

```csharp
var sb = new StringBuilder(1000);
```

Це лише оптимізація: builder працює й без неї.

## Коли його використовувати

| Ситуація | Що брати |
| --- | --- |
| кілька шматків в одній інструкції | `+` або `$"..."` |
| об'єднання елементів колекції | `string.Join` |
| багато додавань у **циклі** або покрокове складання тексту | `StringBuilder` |
| зміна символів наявного тексту | `ToCharArray()` або `StringBuilder` |

Не хапайтеся за `StringBuilder` за рефлексом. Для коротких текстів `+` зрозуміліший і так само швидкий. Builder виграє, коли кількість додавань велика або невідома.

## Пастки

- Забутий `ToString()`: `StringBuilder` — не `string`, тож `string s = sb;` не компілюється.
- Порівняння builder-ів через `==`: це різні об'єкти. Порівнюйте значення `sb.ToString()` або користуйтеся `sb.Equals(other)`.
- Використання `sb.Append(a + b)` для кожного шматка: ви знову будуєте тимчасовий рядок. Пишіть `sb.Append(a).Append(b)`.
