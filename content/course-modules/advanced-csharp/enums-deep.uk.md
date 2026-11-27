## Enum — це іменовані цілі числа

```csharp
public enum OrderStatus : byte     // базовий тип: за замовчуванням int; дозволено будь-який цілий тип
{
    Draft = 0,
    Placed = 1,
    Shipped = 2,
    Cancelled = 9,
}
```

Значення enum — це просто його базове число з прикріпленим типом. Наслідки:

```csharp
int n = (int)OrderStatus.Shipped;          // 2
var s = (OrderStatus)9;                    // Cancelled
var weird = (OrderStatus)42;               // компілюється І виконується: жодної перевірки!
Console.WriteLine(weird);                  // "42"
Console.WriteLine(Enum.IsDefined(typeof(OrderStatus), weird));   // False
```

Завжди перевіряйте значення enum, що приходять ззовні (запит до API, база даних, файл).

`default(OrderStatus)` дорівнює `0`, незалежно від того, чи є член зі значенням 0. Дайте нулю змістовну назву, наприклад `None` або `Unknown`.

## Enum-прапорці

Коли значення можна комбінувати, використовуйте степені двійки та `[Flags]`:

```csharp
[Flags]
public enum FileAccessRights
{
    None    = 0,
    Read    = 1 << 0,   // 1
    Write   = 1 << 1,   // 2
    Execute = 1 << 2,   // 4
    ReadWrite = Read | Write,   // складені значення — нормально
}

var rights = FileAccessRights.Read | FileAccessRights.Execute;   // комбінувати
bool canWrite = (rights & FileAccessRights.Write) != 0;          // перевірити один прапорець
bool hasBoth = (rights & FileAccessRights.ReadWrite) == FileAccessRights.ReadWrite;  // перевірити всі
rights |= FileAccessRights.Write;                                // додати
rights &= ~FileAccessRights.Execute;                             // прибрати
rights ^= FileAccessRights.Read;                                 // перемкнути
Console.WriteLine(rights);                                       // "Write"
```

`[Flags]` змінює `ToString()` і `Enum.Parse` так, що комбінації показуються як `"Read, Execute"`. `HasFlag` читається приємно і на сучасному .NET працює швидко.

## Корисні API Enum

```csharp
Enum.GetValues<OrderStatus>();                    // усі значення (узагальнена версія: .NET 5+)
Enum.GetNames(typeof(OrderStatus));               // усі назви
Enum.TryParse<OrderStatus>("shipped", ignoreCase: true, out var st);
OrderStatus.Placed.ToString("D");                 // "1" (формат: G назва, D десяткове, X hex, F прапорці)
```

## Оператори enum

Enum підтримують порівняння (`<`, `>`), `+`/`-` з цілим числом і порозрядні оператори `&`, `|`, `^`, `~`. Вони не перетворюються неявно на цілі числа чи з них, окрім літерала `0`.

## Коли enum не підходить

Якщо кожен випадок потребує власних даних чи поведінки, набір класів (або `switch` по record) часто зрозуміліший, ніж enum плюс `switch`-інструкції, розкидані по всьому коду.

## Що сказати на співбесіді

- Enum — типізовані цілі числа; привести до нього будь-яке число законно, тож перевіряйте вхід.
- Прапорці: степені двійки, `[Flags]`, комбінувати через `|`, перевіряти через `&`, прибирати через `& ~`.
- Завжди давайте назву значенню `0`.
