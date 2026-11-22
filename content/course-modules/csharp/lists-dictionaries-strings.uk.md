Масиви мають фіксований розмір. Для даних, що зростають, і для пошуку за ключем беріть колекції з `System.Collections.Generic`.

## List&lt;T&gt;

```csharp
var cities = new List<string> { "Kyiv", "Lviv" };
cities.Add("Odesa");
cities.Remove("Lviv");
Console.WriteLine(cities.Count);       // 2
Console.WriteLine(cities.Contains("Kyiv")); // True
```

## Dictionary&lt;TKey, TValue&gt;

Словник зіставляє унікальні ключі зі значеннями й знаходить ключ у середньому за сталий час:

```csharp
var ages = new Dictionary<string, int>();
ages["Ann"] = 31;                      // додати або замінити
if (ages.ContainsKey("Bo")) { /* ... */ }
if (ages.TryGetValue("Ann", out var age))
    Console.WriteLine(age);            // 31
```

Читання `ages["Bo"]` для відсутнього ключа кидає `KeyNotFoundException`. Спершу перевіряйте або використовуйте `TryGetValue`. Не покладайтеся на порядок, у якому словник перелічує ключі; якщо порядок важливий, тримайте окремий список.

## Рядки

Рядки **незмінні**: методи повертають новий рядок, а початковий лишається як був.

```csharp
var s = "  Hello, World  ";
s.Trim();                    // "Hello, World"
s.ToLower();                 // "  hello, world  "
"a,b,c".Split(',');          // { "a", "b", "c" }
string.Join("-", new[] { "a", "b" }); // "a-b"
"assay".Substring(1, 3);     // "ssa"
var name = "Ann";
Console.WriteLine($"Hi, {name}!");   // інтерполяція
```

Довгий рядок, зібраний через `+` у циклі, щоразу створює новий рядок. Для багатьох частин беріть `StringBuilder`.

## Файли

`System.IO.File` читає та записує цілі файли одним викликом:

```csharp
File.WriteAllText("notes.txt", "first line");
string[] lines = File.ReadAllLines("notes.txt");
```

В онлайн-запускачі цього курсу ваших файлів немає, тож практичні завдання працюють із рядками в пам'яті. На вашому комп'ютері той самий код працюватиме з файлами.
