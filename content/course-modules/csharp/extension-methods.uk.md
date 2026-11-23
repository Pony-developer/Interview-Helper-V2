Припустімо, вам потрібен метод `IsPalindrome` для `string`. Додати метод у клас `string` не можна: він не ваш. Можна написати статичний метод `TextTools.IsPalindrome(s)`. Але `s.IsPalindrome()` читається краще, і саме це дають **методи розширення**: статичний метод, який викликають так, ніби це метод екземпляра наявного типу.

## Синтаксис

```csharp
static class StringExtensions                 // статичний клас...
{
    public static bool IsPalindrome(this string s)      // ...і "this" перед першим параметром
    {
        string lower = s.ToLower();
        for (int i = 0; i < lower.Length / 2; i++)
        {
            if (lower[i] != lower[lower.Length - 1 - i]) return false;
        }
        return true;
    }
}

Console.WriteLine("Level".IsPalindrome());          // True
Console.WriteLine("hello".IsPalindrome());          // False
```

Три речі роблять метод методом розширення:

1. Він оголошений у **статичному класі**, що **не вкладений** в інший клас і не є узагальненим.
2. Сам метод **статичний**.
3. Його **перший параметр** має модифікатор **`this`**. Тип цього параметра — це тип, який розширюється.

Виклик `"Level".IsPalindrome()` компілятор перетворює на `StringExtensions.IsPalindrome("Level")`. Це лише **інший синтаксис** виклику статичного методу. Обидві форми еквівалентні.

## Більше параметрів

Решта параметрів звичайні:

```csharp
static class StringExtensions
{
    public static string Truncate(this string s, int maxLength)
    {
        if (s.Length <= maxLength) return s;
        return s.Substring(0, maxLength - 3) + "...";
    }

    public static int WordCount(this string s)
    {
        return s.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length;
    }
}

Console.WriteLine("Hello, World!".Truncate(8));     // Hello...
Console.WriteLine("a  b   c".WordCount());           // 3
```

## Розширення будь-якого типу

Не лише `string`. Можна розширювати масиви, числа, колекції, інтерфейси та власні класи:

```csharp
static class IntExtensions
{
    public static bool IsEven(this int n) => n % 2 == 0;
    public static int Squared(this int n) => n * n;
}

static class ArrayExtensions
{
    public static bool IsSorted(this int[] a)
    {
        for (int i = 1; i < a.Length; i++)
            if (a[i - 1] > a[i]) return false;
        return true;
    }
}

Console.WriteLine(7.IsEven());                       // False
Console.WriteLine(5.Squared());                      // 25
Console.WriteLine(new[] { 1, 2, 3 }.IsSorted());     // True
```

**Ланцюжок** читається зліва направо, як речення: `text.Trim().ToLower().Truncate(20)`.

## Ви вже ними користуєтеся: LINQ

**LINQ**, бібліотека для запитів до колекцій, — це набір методів розширення для `IEnumerable<T>`:

```csharp
using System.Linq;

int[] numbers = { 5, 2, 8, 1 };
int total = numbers.Sum();                    // метод розширення
int biggest = numbers.Max();
var sorted = numbers.OrderBy(n => n).ToArray();
```

Ці методи не є частиною `int[]`. Вони живуть у статичному класі `System.Linq.Enumerable`, а рядок `using System.Linq;` робить їх видимими.

## Видимість: простори імен

Метод розширення доступний лише там, де **імпортовано його простір імен**. Якщо він в іншому просторі імен, додайте `using` для нього. Якщо метод не з'являється в підказках, перший підозрюваний — відсутній `using`.

## Правила та межі

- **Метод екземпляра перемагає.** Якщо тип уже має метод із такою самою назвою й такими самими параметрами, виклик іде до методу екземпляра, а ваше розширення мовчки ігнорується.
- **Немає доступу до приватних членів.** Метод розширення поза типом, тож бачить лише **публічний** інтерфейс. Він не може порушити інкапсуляцію.
- **Його не можна перевизначити**, і він не є частиною успадкування типу.
- **`this` може бути `null`.** Виклик `nullString.IsPalindrome()` не падає на самому виклику: метод викликається з `null` як аргументом. Перевіряйте це, коли воно важливе.

```csharp
public static bool IsNullOrBlank(this string s) => s == null || s.Trim().Length == 0;   // працює для null
```

## Коли писати

Пишіть метод розширення, коли:

- ви хочете додати корисну операцію до типу, який **не можете змінити** (стандартна бібліотека, сторонні бібліотеки);
- операцію можна виразити через **публічні** члени типу;
- вона природно читається як дія над об'єктом: `text.Truncate(20)`, `order.Total()`.

Не пишіть, коли:

- тип ваш: **додайте звичайний метод** до класу;
- операція має сенс лише в одному місці: підійде приватний допоміжний метод;
- назва розпливчаста й **засмічує** підказки дуже поширеного типу (розширення `Do()` для `object` з'являлося б усюди).

## Добрі звички

- Кладіть методи розширення однієї теми в один статичний клас із назвою `<Type>Extensions` (`StringExtensions`, `EnumerableExtensions`).
- Називайте їх **природними дієсловами чи питаннями**: `IsPalindrome`, `Truncate`, `ToTitleCase`.
- Тримайте їх **малими й чистими**: жодного прихованого стану, жодних несподіваних побічних ефектів.
- Документуйте, що буде з `null` і з порожніми вхідними даними.

## Підсумок

- Метод розширення — це **статичний метод** у **статичному класі** з `this` перед першим параметром.
- Його викликають як метод екземпляра, і він еквівалентний звичайному статичному виклику.
- Він бачить лише **публічну** частину типу й не може замінити наявний метод екземпляра.
- LINQ — найвідоміший приклад.
