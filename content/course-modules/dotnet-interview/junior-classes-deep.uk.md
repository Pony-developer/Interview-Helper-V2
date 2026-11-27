Ця лекція проходить питання 36–44 з кодом, який можна відтворити на дошці.

## Клас, абстрактний клас, інтерфейс (П36–38)

```csharp
public interface INotifier                        // контракт: що, а не як
{
    Task SendAsync(string to, string text);
}

public abstract class NotifierBase : INotifier    // спільна «обв'язка» + шаблонний метод
{
    private readonly ILogger _log;
    protected NotifierBase(ILogger log) => _log = log;   // абстрактні класи можуть мати конструктори

    public async Task SendAsync(string to, string text)
    {
        if (string.IsNullOrWhiteSpace(to)) throw new ArgumentException("No recipient", nameof(to));
        await SendCoreAsync(to, text);            // змінний крок
        _log.LogInformation("Sent to {To}", to);
    }

    protected abstract Task SendCoreAsync(string to, string text);
}

public sealed class SmsNotifier(ILogger log, ISmsApi api) : NotifierBase(log)
{
    protected override Task SendCoreAsync(string to, string text) => api.SendAsync(to, text);
}
```

| | Абстрактний клас | Інтерфейс |
|---|---|---|
| Екземпляри | ні | ні |
| Поля / стан | так | немає полів екземпляра |
| Конструктори | так | ні |
| Реалізація | так | методи за замовчуванням з C# 8 |
| Модифікатори доступу членів | будь-які | public за замовчуванням (інші дозволені з C# 8) |
| Скільки на клас | один базовий клас | багато |
| Виражає | «є різновидом», спільний код | «вміє», роль |

Інтерфейси існують, щоб код залежав від ролі (`INotifier`), а не від класу: моки в тестах, заміна реалізацій, плагіни та DI.

## Модифікатори доступу (П39)

```csharp
public class Account                      // видимий усюди
{
    private decimal _balance;             // лише цей клас
    protected void Audit() { }            // цей клас + похідні
    internal void Recalculate() { }       // та сама збірка (проєкт)
    protected internal void Sync() { }    // та сама збірка АБО похідні будь-де
    private protected void Lock() { }     // лише похідні в тій самій збірці
}
file class Helper { }                     // лише цей файл (C# 11)
```

`[InternalsVisibleTo("Shop.Tests")]` дозволяє тестовому проєкту бачити `internal`-члени.

## Статичні класи (П40)

```csharp
public static class StringExtensions
{
    public static bool IsBlank(this string? s) => string.IsNullOrWhiteSpace(s);
}
```

Статичний клас в IL — це `abstract` + `sealed`: без екземплярів, без успадкування, без інтерфейсів, лише статичні члени. Він ініціалізується один раз, ліниво, своїм статичним конструктором. Добрий для чистих помічників і методів розширення; поганий для всього зі станом чи I/O, бо викликачі не можуть підмінити його в тестах.

## new і override (П41)

```csharp
class Base    { public virtual string Who() => "Base";  public string Plain() => "Base"; }
class Derived : Base
{
    public override string Who() => "Derived";   // заміна у віртуальній таблиці
    public new string Plain() => "Derived";      // приховування; інший метод з тією самою назвою
}

Base b = new Derived();
b.Who();    // "Derived" — вирішує тип під час виконання
b.Plain();  // "Base"    — вирішує тип під час компіляції
((Derived)b).Plain();  // "Derived"
```

Без жодного з ключових слів приховування однаково відбувається, але компілятор попереджає (CS0108). `new` у доброму коді трапляється рідко — зазвичай це ознака проблеми в дизайні.

## const і readonly (П42)

```csharp
public class Limits
{
    public const int MaxItems = 100;                         // час компіляції, вбудовується у викликачів
    public static readonly TimeSpan Timeout = TimeSpan.FromSeconds(30);   // обчислюється під час виконання
    public readonly Guid InstanceId = Guid.NewGuid();        // для кожного екземпляра, задається раз
}
```

`const` працює лише з примітивами, `string` і `null`; він неявно статичний. Оскільки значення копіюється в кожну збірку, що його використовує, публічна `const`, яка може змінитися між версіями, має бути `static readonly`.

## Структури (П43–44)

```csharp
public readonly record struct Money(decimal Amount, string Currency)
{
    public Money Add(Money other) =>
        Currency == other.Currency ? this with { Amount = Amount + other.Amount }
                                   : throw new InvalidOperationException("Currency mismatch");
}
```

Структура — для невеликих незмінних значень без ідентичності: `DateTime`, `TimeSpan`, `Guid`, `decimal`, `KeyValuePair<K,V>`, `ValueTuple`, `Span<T>`, `CancellationToken`. Робіть її `readonly`; змінні структури породжують баги, бо часто ви змінюєте копію.

Структура опиняється в **купі**, коли вона є полем класу, елементом масиву чи `List<T>`, упакована (приведена до `object`/інтерфейсу), захоплена замиканням лямбди або збережена між `await`/`yield` (автомат зберігає її в об'єкті в купі). Лише типи `ref struct` (`Span<T>`) гарантовано лишаються в стеку — тому їх не можна упакувати, захопити чи використати в async-методах.
