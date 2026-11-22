Програми ухвалюють рішення за допомогою умов — виразів типу `bool`, які дорівнюють `true` або `false`.

## Порівняння та логіка

```csharp
int age = 20;
bool adult = age >= 18;              // == != < <= > >=
bool teen = age >= 13 && age <= 19;  // && і, || або, ! не
```

`&&` і `||` обчислюються **скорочено**: у `a && b` вираз `b` не обчислюється, якщо `a` вже `false`. Тому можна безпечно писати `s.Length > 0 && s[0] == '#'`.

## if та else

```csharp
if (temperature > 30)
    Console.WriteLine("Hot");
else if (temperature > 15)
    Console.WriteLine("Mild");
else
    Console.WriteLine("Cold");
```

Гілки перевіряються згори донизу, і виконується лише перша відповідна. Ставте фігурні дужки `{ }`, коли в гілці більше однієї інструкції; багато команд ставлять їх завжди.

## Умовний оператор

Щоб обрати одне з двох значень, `condition ? a : b` коротший за `if`:

```csharp
var label = count == 1 ? "item" : "items";
```

## switch

Коли одне значення порівнюється з багатьма константами, `switch` читається краще:

```csharp
switch (day)
{
    case "Sat":
    case "Sun":
        Console.WriteLine("Weekend");
        break;
    default:
        Console.WriteLine("Weekday");
        break;
}
```

Кожна секція закінчується `break` (або `return`); C# не дозволяє виконанню «провалитися» в наступний case.
