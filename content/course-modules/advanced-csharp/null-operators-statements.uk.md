## Null-оператори

| Оператор | Значення | Приклад |
| --- | --- | --- |
| `??` | об'єднання з null: ліва частина, якщо вона не null, інакше права | `string name = input ?? "guest";` |
| `??=` | присвоїти, лише якщо змінна null (C# 8) | `cache ??= LoadCache();` |
| `?.` | null-умовний доступ до члена: якщо зліва null, увесь вираз — null | `int? len = text?.Length;` |
| `?[]` | null-умовний індексатор | `char? first = text?[0];` |

```csharp
string city = order?.Customer?.Address?.City ?? "unknown";
handler?.Invoke(this, EventArgs.Empty);   // стандартний потокобезпечний спосіб викликати подію
```

Зверніть увагу, як `?.` змінює тип: `text.Length` має тип `int`, а `text?.Length` — `int?`, бо результат може бути null.

## switch: інструкція та вираз

Класична **інструкція** виконує код для кожного випадку:

```csharp
switch (command)
{
    case "start":
    case "run":
        Start();
        break;                 // кожна секція має закінчуватися break, return, throw або goto
    case string s when s.StartsWith("stop"):
        Stop();
        break;
    default:
        Help();
        break;
}
```

**switch-вираз** (C# 8) повертає значення й зазвичай коротший:

```csharp
decimal fee = customer.Tier switch
{
    Tier.Gold => 0m,
    Tier.Silver => 2.5m,
    _ when amount > 1000 => 5m,
    _ => 10m,
};
```

Якщо жодна гілка не підійшла, кидається `SwitchExpressionException`; компілятор попереджає, коли гілки не вичерпні.

## Інші інструкції, які варто знати

- `foreach` працює з будь-чим, що має метод `GetEnumerator()`, не лише з `IEnumerable`.
- `goto case` і `goto default` переходять між секціями switch.
- `using var file = File.OpenRead(path);` (C# 8): **using-оголошення** звільняє ресурс наприкінці охопного блоку, без зайвої пари дужок.

## Простори імен

```csharp
namespace Shop.Billing;            // C# 10 на рівні файлу: діє на весь файл

using static System.Math;          // викликати Sqrt(2) замість Math.Sqrt(2)
using Json = System.Text.Json.JsonSerializer;   // псевдонім типу чи простору імен
global using System.Linq;          // C# 10: діє в кожному файлі проєкту
```

З `<ImplicitUsings>enable</ImplicitUsings>` SDK генерує глобальні using для найпоширеніших просторів імен (`System`, `System.Linq`, `System.Collections.Generic`, ...), тому в нових проєктах .NET 6 майже немає рядків `using`.

Пошук імені йде від найвнутрішнього простору імен назовні. Коли два простори імен містять тип з однаковою назвою, вкажіть повне ім'я, дайте псевдонім або почніть від кореня через `global::`: `global::System.String`.

## Що сказати на співбесіді

- `?.` обриває весь ланцюжок і робить результати-значення nullable.
- switch-вираз — коли обчислюєте значення; інструкцію — коли кожен випадок виконує роботу.
- Простори імен на рівні файлу та глобальні using у C# 10 прибирають більшість церемоній у кожному файлі.
