Окрім великих можливостей, кожна версія додавала менші, які ви побачите в будь-якому сучасному коді.

## Кортежі та деконструкція (C# 7)

```csharp
static (int Min, int Max) Range(int[] values) => (values.Min(), values.Max());

var (min, max) = Range(data);       // деконструкція у дві змінні
var r = Range(data);
Console.WriteLine(r.Min);           // іменовані елементи
(a, b) = (b, a);                    // обмін значеннями без тимчасової змінної
var (_, maxOnly) = Range(data);     // _ відкидає значення
```

Кортежі — значущі типи (`ValueTuple`). Використовуйте їх для приватних і внутрішніх результатів; для публічних API зрозуміліший record з іменованими властивостями. Деконструювати можна будь-який тип, що має метод `Deconstruct(out ..., out ...)`.

## Локальні функції (C# 7)

Допоміжний метод, оголошений усередині іншого методу. Його видно лише там, і він може користуватися зовнішніми змінними:

```csharp
static int CountValid(string[] lines)
{
    int count = 0;
    foreach (var line in lines)
        if (IsValid(line)) count++;
    return count;

    static bool IsValid(string s) => s.Length > 0 && s[0] != '#';   // static: нічого не захоплює
}
```

## Індекси та діапазони (C# 8)

```csharp
int last = items[^1];             // ^1 — перший з кінця
int[] middle = items[1..^1];      // усі, крім першого й останнього
string prefix = text[..3];        // перші три символи
```

## Менше церемоній (C# 9–10)

```csharp
// Program.cs з інструкціями верхнього рівня: без class Program і без Main
Console.WriteLine("Hello");

namespace Shop.Orders;            // простір імен на рівні файлу: без дужок, на рівень відступу менше
global using System.Text.Json;    // один using для всього проєкту
List<int> numbers = new();        // new з виведенням типу: тип уже є ліворуч
```

Нові проєкти також мають **неявні using** (implicit usings): `System`, `System.Linq`, `System.Collections.Generic` та інші підключаються автоматично.

## «Сирі» рядкові літерали (C# 11)

Текст із лапками та зворотними скісними рисками без екранування — зручно для JSON, SQL і регулярних виразів:

```csharp
string sql = """
    SELECT "Name" FROM "Users" WHERE "Folder" = 'C:\temp'
    """;
```

Відступ закривальних `"""` прибирається з кожного рядка.

## Вирази колекцій (C# 12)

Один синтаксис для масивів, списків, span та інших колекцій, із `..`, щоб «розгорнути» іншу колекцію:

```csharp
int[] a = [1, 2, 3];
List<int> b = [0, .. a, 4];      // 0 1 2 3 4
```

## Методи інтерфейсів за замовчуванням (C# 8)

Інтерфейс може містити метод із тілом. Старі реалізації отримують його безкоштовно, тож бібліотека може додати метод в опублікований інтерфейс, нікого не зламавши:

```csharp
public interface ILogger
{
    void Log(string message);
    void LogError(string message) => Log("ERROR: " + message);   // реалізація за замовчуванням
}
```

## Члени-розширення (C# 14)

Методи розширення тепер можна групувати в блок `extension`, що дозволяє також **властивості**-розширення:

```csharp
public static class TextExtensions
{
    extension(string text)
    {
        public bool IsBlank => string.IsNullOrWhiteSpace(text);
        public string Shorten(int max) => text.Length <= max ? text : text[..max] + "…";
    }
}

if (title.IsBlank) { }
```

## Правило

Не обов'язково використовувати кожну нову можливість, але **читати** треба вміти всі: сучасний код, документація та задачі на співбесідах користуються ними постійно.
