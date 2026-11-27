## Директиви препроцесора

У C# немає справжнього препроцесора (ні макросів, ні `#include`), але компілятор розуміє набір директив, що починаються з `#`.

### Умовна компіляція

```csharp
#define TRACE_SQL          // має стояти перед будь-яким кодом у файлі

#if DEBUG
    Console.WriteLine("debug build");
#elif TRACE_SQL
    Console.WriteLine("tracing SQL");
#else
    // шлях лише для release
#endif

#if NET6_0_OR_GREATER
    ArgumentNullException.ThrowIfNull(arg);
#else
    if (arg == null) throw new ArgumentNullException(nameof(arg));
#endif
```

- Символи визначають через `#define` у файлі чи через `<DefineConstants>` у проєкті. SDK визначає `DEBUG` у Debug-збірках, `TRACE` і символи фреймворку на кшталт `NET6_0`, `NETSTANDARD2_0`, `NET6_0_OR_GREATER`.
- Вирази підтримують `!`, `&&`, `||`, `==`, `!=`: `#if DEBUG && !TESTS`.
- Код, виключений через `#if`, взагалі не компілюється, а отже й не перевіряється.

### [Conditional] проти #if

```csharp
[Conditional("DEBUG")]
static void Trace(string message) => Console.WriteLine(message);

Trace(ExpensiveDescription());   // у Release зникає весь виклик разом з аргументом
```

Метод існує й компілюється в кожній збірці; видаляються лише **виклики**, коли символ не визначено в місці виклику. Саме так працює `Debug.WriteLine`. На відміну від `#if`, код лишається перевіреним за типами.

### Інші директиви

| Директива | Призначення |
| --- | --- |
| `#warning text` / `#error text` | видати попередження чи помилку компілятора |
| `#region` / `#endregion` | згортні блоки в редакторі; на код не впливають |
| `#pragma warning disable CS0618` / `restore` | локально вимкнути конкретні попередження |
| `#nullable enable` / `disable` / `restore` | керувати nullable-аналізом посилань для фрагмента |
| `#line 100 "Generated.cs"` / `#line hidden` | змінити номери рядків у повідомленнях (для генераторів коду) |

## XML-коментарі документації

Коментарі з трьома скісними перетворюються на документацію, яку показує IntelliSense і можуть публікувати інструменти:

```csharp
/// <summary>
/// Calculates the total price of an order, including tax.
/// </summary>
/// <param name="order">The order to price. Must not be null.</param>
/// <param name="taxRate">The tax rate as a fraction, e.g. <c>0.2m</c> for 20%.</param>
/// <returns>The gross total, rounded to two decimals.</returns>
/// <exception cref="ArgumentNullException"><paramref name="order"/> is null.</exception>
/// <remarks>Discounts are applied before tax. See <see cref="DiscountPolicy"/>.</remarks>
/// <example>
/// <code>var total = pricing.Total(order, 0.2m);</code>
/// </example>
public decimal Total(Order order, decimal taxRate) { /* ... */ }
```

Увімкніть `<GenerateDocumentationFile>true</GenerateDocumentationFile>`, щоб отримати `.xml`-файл поруч зі збіркою; NuGet-пакети постачають його, і споживачі отримують IntelliSense. Тоді компілятор ще й попереджає (CS1591) про публічні члени без документації.

Корисні теги: `<summary>`, `<param>`, `<typeparam>`, `<returns>`, `<exception>`, `<remarks>`, `<example>`, `<code>`, `<c>`, `<see cref>`, `<seealso>`, `<paramref>`, `<inheritdoc/>` (скопіювати документацію з базового члена чи інтерфейсу).

Посилання `cref` перевіряє компілятор, тож рефакторинг перейменування тримає документацію коректною.

## Що сказати на співбесіді

- `#if` прибирає код з компіляції; `[Conditional]` прибирає виклики, але код лишається скомпільованим.
- Символи фреймворку на кшталт `NET6_0_OR_GREATER` дозволяють писати код під кілька цілей.
- Коментарі `///` + `GenerateDocumentationFile` дають документацію для IntelliSense; `<inheritdoc/>` уникає дублювання.
