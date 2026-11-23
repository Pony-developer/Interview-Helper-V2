Текст, який ввів користувач, прочитали з файлу чи отримали з мережі, — це завжди **рядок**, навіть якщо він схожий на число. Рядок не можна використати в арифметиці, а `+` просто склеює його:

```csharp
string a = "12";
string b = "30";
Console.WriteLine(a + b);   // 1230, а не 42
```

Щоб порахувати, спершу перетворіть текст на число. Це називається **парсингом**.

## Parse

Кожен числовий тип має метод `Parse`:

```csharp
int n = int.Parse("42");
double d = double.Parse("3.5", CultureInfo.InvariantCulture);
long big = long.Parse("9000000000");
Console.WriteLine(n + 1);   // 43
```

`CultureInfo` міститься в `System.Globalization`, тому додайте на початку `using System.Globalization;`. Без нього `double.Parse` використовує **регіональні налаштування** комп'ютера: в українській системі десятковий роздільник — кома, тож `"3.5"` там не розпізнається, а `"3,5"` працює. `CultureInfo.InvariantCulture` означає «завжди крапка», однаково скрізь.

`Parse` терпимо ставиться до пробілів навколо числа (`int.Parse(" 42 ")` спрацює) і суворо — до всього іншого. Якщо текст не є коректним числом, виникає виняток:

| Вхідні дані | Що робить `int.Parse` |
| --- | --- |
| `"abc"` | `FormatException` |
| `"3.5"` | `FormatException` (це не ціле число) |
| `""` | `FormatException` |
| `"99999999999"` | `OverflowException` (не вміщується в `int`) |
| `null` | `ArgumentNullException` |

## TryParse

Коли вхідні дані можуть бути хибними, питайте ввічливо, а не провокуйте аварію. `TryParse` повертає `true` або `false`, а число віддає через `out`-параметр:

```csharp
string text = "42x";

if (int.TryParse(text, out int number))
{
    Console.WriteLine("Got " + number);
}
else
{
    Console.WriteLine("Not a number");   // виконається ця гілка
}
```

У разі невдачі `number` стає `0`, і жодного винятку не виникає. Інструкцію `if` ми розглянемо в одному з наступних модулів; поки що зверніть увагу, що виклик має значення `true` або `false`.

`double.TryParse` працює так само й додатково приймає культуру:

```csharp
double.TryParse("3.5", NumberStyles.Float, CultureInfo.InvariantCulture, out double value);
```

## Convert

`Convert.ToInt32` та подібні — третій варіант. Вони поводяться як `Parse`, але `null` перетворюють на `0`. Це також той інструмент, що **округлює** дробове число, тоді як приведення типу відкидає дробову частину:

```csharp
Console.WriteLine(Convert.ToInt32("42"));   // 42
Console.WriteLine(Convert.ToInt32(3.7));    // 4
Console.WriteLine((int)3.7);                // 3
```

## Що обрати

- Перевірені дані, як-от літерал у вашому коді: `Parse`.
- Усе, що ввела людина або що надійшло ззовні: `TryParse`.

## Число в рядок

У зворотний бік простіше. `ToString()` є в усіх типів, а ще працює інтерполяція рядків:

```csharp
int n = 42;
string text = n.ToString();      // "42"
string same = $"{n}";            // "42"
Console.WriteLine(n.ToString().Length);   // 2
```
