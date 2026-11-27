## На яке питання відповідає варіантність

`string` походить від `object`. Чи робить це `List<string>` списком `List<object>`? **Ні**, і недарма:

```csharp
List<string> names = new List<string>();
List<object> objects = names;   // помилка, і ось що це дозволило б:
objects.Add(42);                // int усередині List<string>!
```

Але читати безпечно: усе, що ви *дістаєте* з послідовності рядків, — це object. Варіантність дозволяє виразити саме це.

## Коваріантність: `out T`

Параметр типу з позначкою `out` трапляється лише у **вихідних** позиціях (значення, що повертаються, властивості лише для читання). Тоді `Producer<Derived>` можна використати як `Producer<Base>`.

```csharp
IEnumerable<string> strings = new[] { "a", "b" };
IEnumerable<object> objects = strings;          // ок: IEnumerable<out T>

Func<string> makeName = () => "Ann";
Func<object> makeObject = makeName;             // ок: Func<out TResult>

IReadOnlyList<Cat> cats = new List<Cat>();
IReadOnlyList<Animal> animals = cats;           // ок
```

## Контраваріантність: `in T`

Параметр типу з позначкою `in` трапляється лише у **вхідних** позиціях (параметри методів). Тоді `Consumer<Base>` можна використати як `Consumer<Derived>`: те, що вміє обробити будь-яку тварину, точно впорається з котом.

```csharp
Action<object> print = o => Console.WriteLine(o);
Action<string> printString = print;             // ок: Action<in T>

IComparer<Animal> byWeight = new WeightComparer();
IComparer<Cat> catComparer = byWeight;          // ок: IComparer<in T>
```

## Оголошення варіантності

Оголосити варіантність можуть лише **інтерфейси та делегати**; класи на кшталт `List<T>` завжди інваріантні.

```csharp
public interface IProducer<out T> { T Produce(); }
public interface IConsumer<in T>  { void Consume(T item); }
public delegate TResult Converter<in TInput, out TResult>(TInput input);
```

Компілятор перевіряє, що `out`-параметр ніколи не використовується як вхід і навпаки.

## Обмеження

- Варіантність працює лише для **типів посилань**: `IEnumerable<int>` не є `IEnumerable<object>`, бо перетворення вимагало б пакування.
- Масиви коваріантні через історичне рішення, і це небезпечно:

```csharp
object[] arr = new string[2];
arr[0] = 42;   // компілюється, а під час виконання кидає ArrayTypeMismatchException
```

## Як запам'ятати

- **out** = речі виходять **назовні** = виробники = коваріантні (`IEnumerable`, результат `Func`, `IReadOnlyList`).
- **in** = речі заходять **всередину** = споживачі = контраваріантні (`Action`, `IComparer`, `IEqualityComparer`, параметри `Func`).

## Що сказати на співбесіді

- `List<Derived>` не є `List<Base>` (інваріантність захищає запис).
- `IEnumerable<Derived>` є `IEnumerable<Base>` (коваріантність, `out`).
- `Action<Base>` є `Action<Derived>` (контраваріантність, `in`).
- Лише інтерфейси й делегати, лише типи посилань.
