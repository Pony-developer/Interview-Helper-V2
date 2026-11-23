Кожен виняток у .NET — це об'єкт класу, похідного від `System.Exception`. Його найкорисніші члени:

- `Message`: зрозумілий людині опис;
- `StackTrace`: де виняток кинуто і які виклики до цього привели;
- `InnerException`: виняток, що спричинив цей, або `null`;
- `ToString()`: усе перелічене одним текстом — саме його варто зберігати в логах.

## Дерево, яке варто знати

```text
Exception
└── SystemException
    ├── ArgumentException
    │   ├── ArgumentNullException
    │   └── ArgumentOutOfRangeException
    ├── InvalidOperationException
    │   └── ObjectDisposedException
    ├── NotSupportedException
    ├── NotImplementedException
    ├── FormatException
    ├── KeyNotFoundException
    ├── OperationCanceledException
    ├── IOException
    │   └── FileNotFoundException
    ├── NullReferenceException        (кидає лише середовище виконання)
    └── IndexOutOfRangeException      (кидає лише середовище виконання)
```

## Який кидати

| Ситуація | Виняток |
|---|---|
| Аргумент дорівнює `null` | `ArgumentNullException` |
| Аргумент поза дозволеним діапазоном | `ArgumentOutOfRangeException` |
| Аргумент неправильний в інший спосіб | `ArgumentException` |
| Об'єкт у стані, в якому виклик не має сенсу (`Pop` з порожнього стека) | `InvalidOperationException` |
| Об'єкт уже звільнено (disposed) | `ObjectDisposedException` |
| Операція не підтримується взагалі (`Add` у список лише для читання) | `NotSupportedException` |
| Текст має неправильний формат | `FormatException` |

```csharp
public void Withdraw(decimal amount)
{
    if (amount <= 0)
        throw new ArgumentOutOfRangeException(nameof(amount), "The amount must be positive");
    if (amount > balance)
        throw new InvalidOperationException("Not enough money on the account");
    balance -= amount;
}
```

`nameof(amount)` дає назву параметра рядком, і вона переживе перейменування. Починаючи з .NET 6 є й скорочення на кшталт `ArgumentNullException.ThrowIfNull(user)`.

**Ніколи не кидайте** самі `Exception` чи `SystemException` (їх неможливо перехопити вибірково), і ніколи не кидайте `NullReferenceException`, `IndexOutOfRangeException` чи `StackOverflowException`: вони зарезервовані для середовища виконання й означають помилку в коді, а не перевірену умову. `NotImplementedException` — заглушка для недописаного коду, і в релізі її бути не повинно.

## Перехоплюйте від конкретного до загального

Перемагає перший `catch`, тип якого підходить. Загальніший `catch` над конкретнішим зробив би другий недосяжним, тому компілятор це забороняє:

```csharp
try { File.ReadAllText(path); }
catch (FileNotFoundException) { Console.WriteLine("No such file"); }
catch (IOException e)         { Console.WriteLine("Disk problem: " + e.Message); }
// catch (IOException) над FileNotFoundException був би помилкою компіляції
```

## Правило

Кидайте **найконкретніший** стандартний виняток, що описує проблему, з повідомленням про те, чого очікували. Перехоплюйте найконкретніший тип, який вмієте обробити, а загальні `catch` ставте в кінець.
