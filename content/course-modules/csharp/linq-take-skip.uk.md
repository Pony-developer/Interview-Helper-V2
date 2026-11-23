Ці методи вибирають **скільки** елементів взяти і звідки почати.

```csharp
var numbers = new[] { 10, 20, 30, 40, 50 };

Console.WriteLine(string.Join(" ", numbers.Take(2).Select(n => n.ToString())));    // 10 20
Console.WriteLine(string.Join(" ", numbers.Skip(3).Select(n => n.ToString())));    // 40 50
Console.WriteLine(numbers.TakeWhile(n => n < 30).Count());                         // 2: зупиняється на першому 30
Console.WriteLine(numbers.SkipWhile(n => n < 30).First());                         // 30
```

- `Take(n)` дає перші `n` елементів;
- `Skip(n)` пропускає перші `n` елементів і дає решту;
- `TakeWhile` і `SkipWhile` роблять те саме, але зупиняються на першому елементі, що не пройшов перевірку.

Взяти більше елементів, ніж є, — не помилка: `numbers.Take(100)` дає всі п'ять.

## Сторінки

`Skip` і `Take` разом дають сторінку результатів, так розбивають списки на веб-сторінках:

```csharp
int pageSize = 2;
int pageNumber = 2;                              // друга сторінка
var page = numbers.Skip((pageNumber - 1) * pageSize).Take(pageSize);   // 30, 40
```

## Отримати конкретний результат

Більшість методів LINQ дає послідовність, яку читають ліниво. `ToArray()` і `ToList()` читають її всю **зараз** і зберігають елементи:

```csharp
int[] copy = numbers.Take(3).ToArray();          // масив 10, 20, 30
List<int> list = numbers.Skip(1).ToList();       // список 20, 30, 40, 50
```

Вживайте їх, коли результат треба прочитати кілька разів, коли потім змінюватимете список або коли джерело може змінитися до читання.

## First, Last і одиничні елементи

`First()` дає перший елемент і кидає виняток, якщо його немає. `FirstOrDefault()` натомість дає типове значення (`0` або `null`). Те саме стосується `Last` і `Single`.
