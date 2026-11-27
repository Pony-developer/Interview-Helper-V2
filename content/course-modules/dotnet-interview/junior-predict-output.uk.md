«Що надрукує цей код?» — улюблений формат на рівні Junior: він перевіряє, чи розумієте ви, як насправді поводиться рантайм. Прочитайте фрагмент, вирішіть, потім перевірте відповідь.

## Винятки та finally

```csharp
static int Get()
{
    try { return 1; }
    finally { Console.Write("F"); }
}
Console.Write(Get());          // "F1": finally виконується, перш ніж значення дійде до викликача
```

```csharp
try
{
    try { throw new InvalidOperationException("inner"); }
    finally { Console.Write("1"); }
}
catch (Exception ex) { Console.Write("2" + ex.Message); }
// "12inner": внутрішній finally виконується, поки виняток іде вгору
```

```csharp
static int Count()
{
    int x = 1;
    try { return x; }
    finally { x = 10; }        // значення повернення вже скопійовано: метод повертає 1
}
```

## Делегати й замикання

```csharp
var actions = new List<Action>();
for (int i = 0; i < 3; i++) actions.Add(() => Console.Write(i));
actions.ForEach(a => a());     // "333": одна спільна i, уже 3
foreach (var n in new[] { 0, 1, 2 }) actions.Add(() => Console.Write(n));   // ці надрукують 012
```

```csharp
Func<int, int> twice = x => x * 2;
Func<int, int> plusOne = x => x + 1;
Console.Write(twice(plusOne(3)));   // 8
Action a = () => Console.Write("A");
a += () => Console.Write("B");
a -= () => Console.Write("A");      // НОВИЙ екземпляр лямбди: нічого не видаляється
a();                                // "AB"
```

## LINQ

```csharp
var numbers = new List<int> { 3, 1, 2 };
var sorted = numbers.OrderBy(n => n);
numbers.Add(0);
Console.Write(string.Join(",", sorted));   // "0,1,2,3": відкладено, бачить доданий 0

var evens = numbers.Where(n => { Console.Write("?"); return n % 2 == 0; });
var first = evens.First();                 // друкує "???" і повертає 2
```

Останнє — класична пастка: `First()` бере елементи по одному, тож предикат виконується лише до першого збігу. Для `{ 3, 1, 2, 0 }` він виконується для 3, 1 і 2, друкує `???` і не дивиться на 0. Лінивість також означає, що побічні ефекти всередині `Where` непередбачувані — тримайте предикати чистими.

```csharp
var words = new[] { "apple", "avocado", "banana" };
var groups = words.GroupBy(w => w[0]);
Console.Write(groups.Count());                         // 2
Console.Write(words.Any(w => w.Length > 6));           // True
Console.Write(words.Select(w => w.Length).Sum());      // 18
```

## Рядки й типи

```csharp
string s = "abc";
s.Replace("a", "x");
Console.Write(s);              // "abc": рядки незмінні, результат відкинуто

object o1 = 5, o2 = 5;
Console.Write(o1 == o2);       // False: дві «коробки», порівняння посилань
Console.Write(o1.Equals(o2));  // True: Int32.Equals порівнює значення

int? n = null;
Console.Write(n > 0);          // False
Console.Write(n == null);      // True
```

Квіз після цієї лекції містить ще більше саме таких фрагментів.
