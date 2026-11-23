`string` — це послідовність символів у подвійних лапках. Окремий символ має інший тип, `char`, і записується в одинарних лапках:

```csharp
string word = "Hello";
char letter = 'H';
string empty = "";      // рядок без жодного символу
```

## Складаємо рядки

`+` склеює рядки (**конкатенація**). Якщо з одного боку рядок, а з другого — ні, друге значення перетворюється на текст:

```csharp
string name = "Ann";
int age = 31;
Console.WriteLine("Name: " + name + ", age: " + age);   // Name: Ann, age: 31
```

Зазвичай зрозуміліша **інтерполяція рядків**. Поставте `$` перед лапкою й пишіть вирази у фігурних дужках:

```csharp
Console.WriteLine($"Name: {name}, age: {age}");
Console.WriteLine($"Next year: {age + 1}");   // Next year: 32
```

Пильнуйте порядок: `+` виконується зліва направо, тож числа додаються лише доти, доки не з'явиться перший рядок:

```csharp
Console.WriteLine(1 + 2 + "3");   // 33
Console.WriteLine("1" + 2 + 3);   // 123
```

## Escape-послідовності

Зворотна скісна риска починає спеціальний символ усередині рядка:

| Запис | Значення |
| --- | --- |
| `\n` | новий рядок |
| `\t` | табуляція |
| `\"` | подвійна лапка |
| `\\` | зворотна скісна риска |

```csharp
Console.WriteLine("He said \"hi\"");   // He said "hi"
Console.WriteLine("Line 1\nLine 2");
```

**Дослівний рядок** `@"..."` сприймає зворотні скісні риски буквально, що зручно для шляхів. Лапка всередині нього записується двічі:

```csharp
Console.WriteLine(@"C:\temp\notes.txt");   // C:\temp\notes.txt
Console.WriteLine(@"He said ""hi""");      // He said "hi"
```

## Довжина та символи

Позиції рахуються **з нуля**. `s[i]` повертає `char` на позиції `i`:

```csharp
string s = "Hello, World";
Console.WriteLine(s.Length);              // 12
Console.WriteLine(s[0]);                  // H
Console.WriteLine(s[s.Length - 1]);       // d, останній символ
```

Звернення до неіснуючої позиції, наприклад `s[12]`, кидає `IndexOutOfRangeException`.

## Корисні методи

```csharp
s.ToUpper()                  // "HELLO, WORLD"
s.ToLower()                  // "hello, world"
"  hi  ".Trim()              // "hi"
s.Substring(7)               // "World", з позиції 7 до кінця
s.Substring(0, 5)            // "Hello", 5 символів з позиції 0
s.IndexOf("World")           // 7, позиція першого збігу
s.IndexOf("xyz")             // -1, не знайдено
s.Contains("lo,")            // True
s.StartsWith("Hell")         // True
s.EndsWith("!")              // False
s.Replace("World", "C#")     // "Hello, C#"
string.IsNullOrEmpty(s)      // False
```

## Рядки незмінні

Метод ніколи не змінює рядок, на якому його викликали; він повертає **новий**. Класична помилка — забути скористатися результатом:

```csharp
string text = "hello";
text.ToUpper();                // результат загубився
Console.WriteLine(text);       // hello

text = text.ToUpper();         // зберігаємо результат
Console.WriteLine(text);       // HELLO
```

## Порівняння рядків

`==` порівнює **вміст** двох рядків і враховує регістр:

```csharp
Console.WriteLine("abc" == "abc");   // True
Console.WriteLine("abc" == "ABC");   // False
Console.WriteLine(string.Equals("abc", "ABC", StringComparison.OrdinalIgnoreCase));   // True
```

Порожній рядок `""` має довжину 0. Змінна зі значенням `null` взагалі не містить рядка, і виклик методу на ній кидає `NullReferenceException`. `string.IsNullOrEmpty` перевіряє обидва випадки.
