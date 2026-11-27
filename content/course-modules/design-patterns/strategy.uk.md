**Простими словами:** Strategy виносить **кожен спосіб виконання задачі в окремий клас** за одним інтерфейсом. Основний код тримає «якусь стратегію» і може замінити її, не змінюючись сам.

## Картинка з життя

Дістатися до аеропорту: таксі, автобусом, потягом. Мета та сама, спосіб різний, і ви вибираєте залежно від часу та грошей. План поїздки не змінюється, змінюється лише частина «як доїхати».

## Проблема

```csharp
int ShippingCost(string method, int weightKg)
{
    switch (method)
    {
        case "pickup": return 0;
        case "post": return 60 + 10 * weightKg;
        case "courier": return weightKg <= 5 ? 120 : 120 + 20 * (weightKg - 5);
        // новий спосіб наступного місяця — знову правимо тут...
    }
    throw new ArgumentException(method);
}
```

Switch росте, змішує непов'язані правила в одному методі, і кожен новий варіант означає правку (і повторне тестування) старого коду.

## На C#

```csharp
interface IShippingStrategy
{
    int Cost(int weightKg);
}

class PickupShipping : IShippingStrategy { public int Cost(int weightKg) { return 0; } }
class PostShipping : IShippingStrategy { public int Cost(int weightKg) { return 60 + 10 * weightKg; } }

class Checkout
{
    private readonly IShippingStrategy shipping;

    public Checkout(IShippingStrategy shipping) { this.shipping = shipping; }

    public int Total(int itemsSum, int weightKg) { return itemsSum + shipping.Cost(weightKg); }
}

var total = new Checkout(new PostShipping()).Total(1500, 2);
```

Додати «доставку дроном» — це новий клас. `Checkout` не змінюється взагалі.

## Легша версія: делегати

У C# стратегія з одним методом часто є просто `Func`:

```csharp
Func<int, int> post = weight => 60 + 10 * weight;
```

`List<T>.Sort(comparison)` і `OrderBy(x => x.Name)` у LINQ приймають стратегії саме так.

## Де ви вже це бачите

- `IComparer<T>`, переданий у `Sort`, `IEqualityComparer<T>`, переданий у `Dictionary`.
- Правила ціноутворення, податкові правила для різних країн, різні схеми автентифікації в ASP.NET Core.

## Коли застосовувати, а коли ні

- **Пасує:** кілька взаємозамінних способів зробити те саме, які вибираються за даними чи конфігурацією і постійно додаються.
- **Зайве:** два варіанти, які ніколи не зміняться. `if` цілком годиться.

## Запам'ятайте

Strategy = «**алгоритм — це змінна деталь**». Контекст тримає інтерфейс; клієнт вибирає, яку реалізацію туди вставити.
