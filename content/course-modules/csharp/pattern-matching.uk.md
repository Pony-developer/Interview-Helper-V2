Зіставлення зі зразком (pattern matching) перевіряє **форму** значення (тип, властивості, діапазон) і розбирає його на частини одним виразом.

## Шаблони типів (C# 7)

```csharp
if (shape is Circle c)              // перевіряємо тип і одразу отримуємо типізовану змінну
    Console.WriteLine(c.Radius);

switch (shape)
{
    case Circle c when c.Radius == 0:   // шаблон типу з умовою
        return "a point";
    case Circle c:
        return "circle";
    case null:
        return "nothing";
    default:
        return "unknown";
}
```

В інструкції `switch` порядок випадків важливий: перемагає перший випадок, що підійшов, а компілятор повідомляє про помилку, якщо випадок недосяжний, бо попередній уже перехоплює все, що підійшло б йому.

## Switch-вирази (C# 8)

`switch`, що **повертає значення**, зі стрілками замість `case` і `_` замість `default`:

```csharp
string Describe(Shape shape) => shape switch
{
    Circle { Radius: 0 }                      => "a point",
    Circle c                                  => $"circle, area {Math.PI * c.Radius * c.Radius:F2}",
    Rectangle { Width: var w, Height: var h } when w == h => $"square {w}",
    Rectangle r                               => $"rectangle {r.Width} x {r.Height}",
    null                                      => "nothing",
    _                                         => "unknown shape",
};
```

Якщо жодна гілка не підійшла, він кидає `SwitchExpressionException`. Компілятор попереджає, коли бачить, що якісь вхідні значення не покрито.

## Види шаблонів

| Шаблон | Приклад | Відколи |
|---|---|---|
| тип | `Circle c`, `Circle` | C# 7, 9 |
| константа | `0`, `"admin"`, `null` | C# 7 |
| властивість | `{ Length: 0 }`, `{ Address.City: "Kyiv" }` | C# 8, 10 |
| позиційний (використовує `Deconstruct`) | `Point(0, 0)` | C# 8 |
| кортеж | `(true, false)` | C# 8 |
| реляційний | `> 0`, `<= 100` | C# 9 |
| логічний | `>= 18 and < 65`, `not null`, `"Sat" or "Sun"` | C# 9 |
| список | `[]`, `[1, ..]`, `[var first, .., var last]` | C# 11 |
| відкидання | `_` | C# 8 |

Приклади:

```csharp
string Category(int age) => age switch
{
    < 0           => throw new ArgumentOutOfRangeException(nameof(age)),
    < 18          => "child",
    >= 18 and < 65 => "adult",
    _             => "senior",
};

string Move(bool up, bool down) => (up, down) switch
{
    (true, false) => "up",
    (false, true) => "down",
    _             => "stay",
};

if (args is [var command, .. var rest])   // принаймні один елемент
    Run(command, rest);

if (user is not null) { }                 // перевантажений оператор != тут не обдурить
```

## Шаблони чи поліморфізм?

Раніше в курсі ви замінювали `switch` за типом віртуальними методами. Обидва інструменти мають своє місце:

- **поліморфізм** — коли поведінка належить класам, а нові типи додають часто;
- **шаблони** — коли дані приходять ззовні (повідомлення, DTO, JSON), набір випадків фіксований, а часто додають нові **операції**.

## Правило

Використовуйте шаблони `is` для однієї перевірки, switch-вирази — для вибору значення за формою даних, а гілки впорядковуйте від конкретних до загальних.
