## Два складники

LINQ (Language-Integrated Query) працює з **послідовностями** за допомогою **операторів запитів**.

- **Послідовність** — усе, що реалізує `IEnumerable<T>` (локальні дані в пам'яті) або `IQueryable<T>` (віддалене джерело, як-от база даних).
- **Оператор запиту** — метод, що перетворює послідовність: `Where`, `Select`, `OrderBy`, `GroupBy`, ... Близько 50 з них живуть як методи розширення в `System.Linq.Enumerable` і `System.Linq.Queryable`.

```csharp
string[] names = { "Tom", "Dick", "Harry", "Mary", "Jay" };
IEnumerable<string> query = names.Where(n => n.Length >= 4);   // Dick, Harry, Mary
```

Вхідна послідовність ніколи не змінюється; оператори повертають нові послідовності.

## Fluent-синтаксис: ланцюжки операторів

```csharp
var query = names
    .Where(n => n.Contains('a'))
    .OrderBy(n => n.Length)
    .Select(n => n.ToUpper());
// JAY, MARY, HARRY
```

Кожен оператор обгортає попередню послідовність, утворюючи конвеєр. Лямбди — це частини-«плагіни»: `Where` приймає `Func<T, bool>`, `Select` — `Func<T, TResult>`, `OrderBy` — селектор ключа `Func<T, TKey>`.

## Query-вирази

Той самий запит у query-синтаксисі C#:

```csharp
var query =
    from n in names
    where n.Contains('a')
    orderby n.Length
    select n.ToUpper();
```

Компілятор **перекладає query-синтаксис у виклики методів** суто синтаксично: `where` → `.Where(...)`, `orderby` → `.OrderBy(...)`, `select` → `.Select(...)`. Query-вираз має починатися з `from` і закінчуватися `select` або `group`.

| Fluent-синтаксис краще для | Query-синтаксис краще для |
| --- | --- |
| одного оператора чи короткого ланцюжка | запитів з `let`, кількома `from` (SelectMany) чи `join` |
| операторів без ключового слова в query (`Take`, `Distinct`, `Count`, `First`, `ToList`) | складних запитів, де змінні діапазону мають лишатися в області видимості |

Їх можна змішувати: `(from n in names where n.Length > 3 select n).Count()`.

## Змінні діапазону

У `from n in names` `n` — **змінна діапазону**: вона подає кожен елемент, що проходить запитом. У fluent-синтаксисі кожна лямбда оголошує власний параметр, тож змінні не переходять між операторами; у query-синтаксисі — переходять, тому `let` і `join` там читаються природніше.

## Поширені оператори одним поглядом

| Категорія | Оператори |
| --- | --- |
| Фільтрація | `Where`, `Take`, `Skip`, `TakeWhile`, `SkipWhile`, `Distinct` |
| Проєкція | `Select`, `SelectMany` |
| З'єднання | `Join`, `GroupJoin`, `Zip` |
| Впорядкування | `OrderBy`, `ThenBy`, `Reverse` |
| Групування | `GroupBy`, `ToLookup` |
| Множини | `Union`, `Intersect`, `Except`, `Concat` |
| Елементи | `First`, `Last`, `Single`, `ElementAt` (+ `OrDefault`) |
| Агрегація | `Count`, `Sum`, `Min`, `Max`, `Average`, `Aggregate` |
| Квантифікатори | `Any`, `All`, `Contains`, `SequenceEqual` |
| Перетворення | `ToList`, `ToArray`, `ToDictionary`, `ToHashSet`, `Cast`, `OfType` |

## Що сказати на співбесіді

- LINQ = послідовності + оператори (методи розширення на `IEnumerable<T>`/`IQueryable<T>`).
- Query-синтаксис компілюється у виклики методів; обидві форми рівнозначні.
- Оператори ніколи не змінюють вхід; вони повертають нові послідовності.
