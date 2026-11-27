## Де трапляються патерни

Патерни перевіряють форму значення. Їх можна використовувати в трьох місцях:

```csharp
if (x is <патерн>) ...                        // вираз is
switch (x) { case <патерн>: ... }             // інструкція switch
var r = x switch { <патерн> => ..., ... };     // switch-вираз (C# 8)
```

## Патерн типу та патерн оголошення

```csharp
object o = GetValue();

if (o is string s)                  // перевірити тип І присвоїти новій змінній
    Console.WriteLine(s.Length);

if (o is int)                       // лише тип (C# 9: простий патерн типу)
    Console.WriteLine("an int");
```

Змінна `s` **гарантовано присвоєна лише там, де відомо, що патерн спрацював**. У поєднанні з `!` це зручно для раннього виходу:

```csharp
if (o is not string text) return;
Console.WriteLine(text.ToUpper());  // text тут в області видимості й присвоєна
```

## Патерн константи

```csharp
if (code is 404) ...
if (status is OrderStatus.Cancelled) ...
if (o is null) ...                  // найпоширеніший
```

`is null` і `is not null` не можна перенаправити перевантаженим оператором `==`, тому це найнадійніші перевірки на null.

## Реляційні патерни (C# 9)

```csharp
string Grade(int score) => score switch
{
    >= 90 => "A",
    >= 75 => "B",
    >= 60 => "C",
    _ => "F",
};
```

Дозволено `<`, `<=`, `>`, `>=` з константою.

## Логічні патерни (C# 9): and, or, not

```csharp
bool IsLetter(char c) => c is >= 'a' and <= 'z' or >= 'A' and <= 'Z';
bool IsWeekend(DayOfWeek d) => d is DayOfWeek.Saturday or DayOfWeek.Sunday;
if (input is not (null or "")) ...
```

Пріоритет: найсильніше зв'язує `not`, далі `and`, далі `or`. Для ясності ставте дужки.

## Патерн var і відкидання

```csharp
if (GetOrder() is var order && order.Total > 100) ...   // var підходить завжди, навіть для null
case _: ...                                            // відкидання: підходить для всього
```

Патерн var зручний, щоб дати ім'я результату виразу посеред умови.

## Інструкція switch з патернами та умовами

```csharp
switch (shape)
{
    case Circle c when c.Radius == 0:      // 'when' додає умову-охоронця
        Console.WriteLine("a point");
        break;
    case Circle c:
        Console.WriteLine($"circle r={c.Radius}");
        break;
    case Rectangle { Width: var w, Height: var h } when w == h:
        Console.WriteLine("square");
        break;
    case null:
        throw new ArgumentNullException(nameof(shape));
    default:
        Console.WriteLine("something else");
        break;
}
```

З патернами **порядок важливий**: випадки перевіряються згори донизу, а компілятор повідомляє про недосяжні.

## Що сказати на співбесіді

- `is T x` перевіряє й приводить за один крок; це краще, ніж `as` + перевірка на null.
- Реляційні та логічні патерни (C# 9) перетворюють перевірки діапазонів на читабельні однорядкові вирази.
- `is null` / `is not null` ігнорують перевантаження операторів.
