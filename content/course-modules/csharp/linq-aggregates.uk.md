**Функції агрегування** зводять всю послідовність до одного значення: кількість, суму, мінімум, середнє.

```csharp
var numbers = new[] { 4, 9, 1, 7 };

Console.WriteLine(numbers.Count());                    // 4
Console.WriteLine(numbers.Sum());                      // 21
Console.WriteLine(numbers.Min());                      // 1
Console.WriteLine(numbers.Max());                      // 9
Console.WriteLine(numbers.Average());                  // 5.25
```

Більшість із них приймає лямбду, що вибирає значення для агрегування:

```csharp
var words = new[] { "pear", "fig", "apple" };
Console.WriteLine(words.Sum(w => w.Length));           // 12
Console.WriteLine(words.Max(w => w.Length));           // 5
Console.WriteLine(words.Count(w => w.Length > 3));     // 2
```

## Порожні послідовності

`Count` і `Sum` порожньої послідовності дають `0`. `Min`, `Max` і `Average` кидають `InvalidOperationException`, бо мінімуму з нічого немає. Вживайте `DefaultIfEmpty` або спершу перевіряйте `Any()`, якщо послідовність може бути порожньою.

## Питання «так чи ні»

```csharp
Console.WriteLine(numbers.Any());                      // True: є принаймні один елемент
Console.WriteLine(numbers.Any(n => n > 8));            // True
Console.WriteLine(numbers.All(n => n > 0));            // True: кожен елемент пройшов
```

`Any` зупиняється на першому елементі, що пройшов, тож він дешевший за `Count() > 0`.

## Aggregate: власне згортання

`Aggregate` поєднує елементи функцією, крок за кроком, починаючи з початкового значення:

```csharp
int product = numbers.Aggregate(1, (acc, n) => acc * n);    // 252
string joined = words.Aggregate((a, b) => a + ", " + b);     // "pear, fig, apple"
```

`Sum` — це просто `Aggregate` з додаванням. Вживайте `Aggregate`, коли писали б цикл, що накопичує одне значення.

## Вартість

Кожна агрегація читає всю послідовність один раз. Якщо з тих самих даних потрібно кілька результатів, спершу збережіть послідовність у списку (через `ToList()`), щоб джерело не читалося заново для кожної функції.
