## Дві ролі: перелічуване та енумератор

- **Перелічуване** (enumerable) — те, що можна обійти: має `GetEnumerator()`.
- **Енумератор** — курсор по ньому: `MoveNext()` просуває, `Current` повертає елемент під курсором.

```csharp
public interface IEnumerable<out T> : IEnumerable
{
    IEnumerator<T> GetEnumerator();
}

public interface IEnumerator<out T> : IDisposable, IEnumerator
{
    T Current { get; }
    // з IEnumerator: bool MoveNext(); void Reset();
}
```

Розділення важливе: одну колекцію можуть одночасно обходити кілька циклів, кожен із власним енумератором.

## Що насправді робить foreach

```csharp
foreach (var item in list) Console.WriteLine(item);
```

компілюється (приблизно) в:

```csharp
using (var e = list.GetEnumerator())
{
    while (e.MoveNext())
    {
        var item = e.Current;
        Console.WriteLine(item);
    }
}
```

Примітки:

- `foreach` **базується на патерні**: підходить будь-який тип з відповідним `GetEnumerator()`, навіть без реалізації `IEnumerable`. З C# 9 цей метод може бути навіть методом розширення.
- `List<T>.GetEnumerator()` повертає енумератор-**структуру**, тож `foreach` по `List<T>` не алокує. По змінній типу `IEnumerable<T>` — алокує: структура пакується.
- Наприкінці енумератор **звільняється** (Dispose), що важливо для ітераторів із блоками `finally`.
- Зміна `List<T>` під час його перелічення кидає `InvalidOperationException` («Collection was modified»).

## Ініціалізатори колекцій

```csharp
var primes = new List<int> { 2, 3, 5, 7 };                 // чотири виклики Add
var ages = new Dictionary<string, int>
{
    ["Ann"] = 31,                                          // ініціалізатор індексу (C# 6)
    ["Bob"] = 27,
};
var map = new Dictionary<string, int> { { "x", 1 }, { "y", 2 } };   // Add(key, value)
```

Ініціалізатор колекції вимагає, щоб тип реалізовував `IEnumerable` і мав метод `Add`.

## Власна реалізація перелічення

Можна написати клас енумератора вручну: поля для позиції, `MoveNext`, що просуває, і `Current`. На практиці майже завжди це доручають компілятору через **ітератор** (`yield return`, наступна лекція) або повертають енумератор внутрішньої колекції:

```csharp
public class Playlist : IEnumerable<Song>
{
    private readonly List<Song> _songs = new();
    public IEnumerator<Song> GetEnumerator() => _songs.GetEnumerator();
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();   // неузагальнений
}
```

## IEnumerable, ICollection чи IList

`IEnumerable<T>` обіцяє лише прохід уперед. Він не знає кількості елементів і не індексується. Приймайте `IEnumerable<T>` як параметр, коли лише обходите вхідні дані; `IReadOnlyCollection<T>`/`IReadOnlyList<T>` — коли потрібні `Count` чи індексація; докладніше в модулі про колекції.

## Що сказати на співбесіді

- `foreach` = `GetEnumerator` + цикл `MoveNext`/`Current` + `Dispose`.
- Він базується на патерні; енумератор-структура `List<T>` уникає алокацій.
- Не змінюйте колекцію під час її перелічення.
