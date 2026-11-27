## Методи для типів, які вам не належать

Метод розширення — це **статичний метод у статичному класі**, перший параметр якого має модифікатор `this`. Тоді його можна викликати так, ніби це метод екземпляра типу цього параметра.

```csharp
public static class StringExtensions
{
    public static bool IsBlank(this string? s) => string.IsNullOrWhiteSpace(s);

    public static string Capitalize(this string s) =>
        s.Length == 0 ? s : char.ToUpper(s[0]) + s.Substring(1);
}

"hello".Capitalize();     // "Hello"
"   ".IsBlank();          // true
```

Компілятор просто переписує `"hello".Capitalize()` у `StringExtensions.Capitalize("hello")`. Жодної магії під час виконання і жодного доступу до приватних членів.

## Правила

- Клас має бути статичним, **не вкладеним** і не узагальненим.
- Розширення видно лише там, де **імпортовано його простір імен** (`using`). Саме так `using System.Linq;` «додає» `Where` і `Select` кожному `IEnumerable<T>`.
- **Методи екземпляра завжди перемагають.** Якщо тип уже має метод із сумісною сигнатурою, розширення ніколи не викликається.
- Між двома методами розширення перемагає конкретніший тип параметра (`string` перемагає `object`); справжня нічия — помилка компіляції, яку розв'язують явним викликом статичного методу.

## Виклик на null

Оскільки це статичний виклик, виклик розширення на null-посиланні **сам по собі не** кидає винятку:

```csharp
string? s = null;
bool blank = s.IsBlank();   // true, без винятку
```

Це зручно для помічників, толерантних до null, але дивує читачів; нехай це буде очевидно з назви методу.

## Розширення інтерфейсів і узагальнень

Справжня сила проявляється, коли розширюють інтерфейс: метод отримує кожна реалізація.

```csharp
public static class EnumerableExtensions
{
    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source) where T : class
    {
        foreach (var item in source)
            if (item != null) yield return item;
    }
}

IEnumerable<string> names = rawNames.WhereNotNull();
```

LINQ — саме це: великий набір методів розширення для `IEnumerable<T>` і `IQueryable<T>`.

## Ланцюжки

Розширення, що повертають тип свого входу, складаються в читабельні конвеєри:

```csharp
var report = orders
    .WhereNotNull()
    .Where(o => o.Total > 100)
    .OrderBy(o => o.Placed)
    .Take(10);
```

## Розширення для enum, типів значень і ref

```csharp
public static string Label(this OrderStatus s) => s switch { OrderStatus.Placed => "New", _ => s.ToString() };
public static void Increment(this ref int value) => value++;   // C# 7.2: ref-розширення для структури
```

## Коли використовувати (і коли ні)

Добре для: помічників на типах, які не можна змінити (BCL, сторонні бібліотеки), fluent API, додавання поведінки інтерфейсам, щоб DTO лишалися без логіки.

Уникайте, коли: тип ваш (додайте справжній метод), методу потрібен приватний стан, або узагальнене розширення на `object` засмічуватиме IntelliSense всюди.

## Що сказати на співбесіді

- `static`-метод у `static`-класі з `this` на першому параметрі; розв'язується під час компіляції.
- Методи екземпляра мають пріоритет; простір імен має бути імпортований.
- Працює на null-отримувачах, інтерфейсах і узагальненнях: так побудований LINQ.
