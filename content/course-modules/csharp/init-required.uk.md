## Проблема ініціалізаторів об'єктів

Ініціалізатор об'єкта зручний:

```csharp
var user = new User { Name = "Ann", Email = "ann@example.com" };
```

але потребує публічних **сеттерів**, тож будь-хто може пізніше змінити об'єкт: `user.Name = "";`. Конструктор робить об'єкт безпечним, але з десятьма властивостями стає довгим, і його легко викликати з аргументами в неправильному порядку.

## `init` (C# 9)

Аксесор `init` дозволяє задати властивість **лише під час створення об'єкта**: у конструкторі або в ініціалізаторі об'єкта.

```csharp
public class User
{
    public string Name { get; init; }
    public string Email { get; init; }
}

var user = new User { Name = "Ann", Email = "ann@example.com" };   // OK
user.Name = "Bob";                                                 // помилка компіляції
```

Щоб отримати змінену копію, records (а з C# 10 і структури) мають `with`: `var renamed = person with { Name = "Bob" };`. Звичайний клас `with` не підтримує.

## `required` (C# 11)

`init` нікого не змушує задавати властивість: `new User()` залишає `Name` рівним `null`. Модифікатор `required` змушує:

```csharp
public class User
{
    public required string Name { get; init; }
    public string? Nickname { get; init; }
}

var a = new User { Name = "Ann" };   // OK
var b = new User();                  // помилка компіляції: Name обов'язкове
```

Якщо конструктор сам задає всі обов'язкові члени, позначте його атрибутом `[SetsRequiredMembers]`, щоб у тих, хто викликає цей конструктор, не вимагали ініціалізатора.

## Первинні конструктори (C# 12)

Records від початку мали параметри в оголошенні типу. C# 12 дозволяє їх для будь-якого класу чи структури:

```csharp
public class OrderService(IOrderRepository repository, ILogger<OrderService> logger)
{
    public void Place(Order order)
    {
        repository.Add(order);
        logger.LogInformation("Order {Id} placed", order.Id);
    }
}
```

Це прибирає звичний шаблонний код конструктора, що лише копіює аргументи в приватні поля, тому первинні конструктори популярні для впровадження залежностей.

Важливі відмінності від records:

- параметри первинного конструктора класу **не стають публічними властивостями**: це просто параметри, видимі в усьому тілі класу;
- вони **не readonly**: клас може їм присвоювати. Якщо це важливо, скопіюйте параметр у `readonly`-поле: `private readonly IOrderRepository repository = repository;`;
- кожен інший конструктор мусить викликати первинний через `: this(...)`.

## Ключове слово `field` (C# 14)

Властивість із невеликою логікою раніше вимагала написаного вручну поля. Тепер аксесор може звертатися до поля, яке створює компілятор:

```csharp
public string Name
{
    get;
    set => field = value?.Trim() ?? throw new ArgumentNullException(nameof(value));
}
```

## Правило

Створюйте об'єкти даних через `init` і `required` замість публічних сеттерів чи величезних конструкторів; використовуйте первинні конструктори, щоб скоротити класи, конструктор яких лише зберігає залежності.
