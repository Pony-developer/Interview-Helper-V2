## Природний порядок: IComparable<T>

Тип, що має очевидний порядок, реалізує `IComparable<T>`:

```csharp
public interface IComparable<in T> { int CompareTo(T? other); }
```

`a.CompareTo(b)` повертає **від'ємне** число, якщо `a` йде першим, **нуль**, якщо вони рівні за порядком, **додатне**, якщо `a` йде після. Викликачі мають перевіряти знак, а не `== -1`.

```csharp
public sealed class Version3 : IComparable<Version3>
{
    public int Major { get; } public int Minor { get; }
    public Version3(int major, int minor) { Major = major; Minor = minor; }

    public int CompareTo(Version3? other)
    {
        if (other is null) return 1;                       // за домовленістю null іде першим
        int c = Major.CompareTo(other.Major);
        return c != 0 ? c : Minor.CompareTo(other.Minor);
    }

    public static bool operator <(Version3 a, Version3 b) => a.CompareTo(b) < 0;
    public static bool operator >(Version3 a, Version3 b) => a.CompareTo(b) > 0;
}
```

Тоді працюють `list.Sort()`, `Array.Sort`, `SortedSet<T>`, `Max()` і `OrderBy(x => x)` з LINQ.

Реалізуйте також неузагальнений `IComparable`, якщо старі API (як-от `ArrayList.Sort`) мають сортувати ваш тип.

### Узгоджуйте порядок і рівність

Якщо `a.CompareTo(b) == 0`, в ідеалі `a.Equals(b)` теж true. Коли вони розходяться (наприклад, рядки порівнюються без урахування регістру, а рівність — ординальна), сортовані й хеш-колекції поводяться по-різному: `SortedSet` збереже один елемент, `HashSet` — два.

## Альтернативні порядки: IComparer<T>

```csharp
public interface IComparer<in T> { int Compare(T? x, T? y); }
```

Використовуйте, щоб сортувати тип, який вам не належить, або за чимось іншим, ніж природний порядок.

```csharp
var byLength = Comparer<string>.Create((a, b) => a.Length.CompareTo(b.Length));
words.Sort(byLength);

var desc = Comparer<int>.Create((a, b) => b.CompareTo(a));   // зворотний порядок
var dict = new SortedDictionary<string, int>(StringComparer.OrdinalIgnoreCase);
```

Готові компаратори: `Comparer<T>.Default` (природний порядок), `StringComparer.Ordinal`, `StringComparer.CurrentCultureIgnoreCase` тощо.

## Впорядкування за кількома ключами

У LINQ:

```csharp
var sorted = people.OrderBy(p => p.LastName).ThenBy(p => p.FirstName).ThenByDescending(p => p.Age);
```

У компараторі порівнюйте ключ за ключем і повертайте перший ненульовий результат, як у `Version3.CompareTo`.

## Пастки порівняння

- **Переповнення при відніманні**: `return a.Value - b.Value;` ламається для далеких значень (`int.MinValue - 1` перекочується). Використовуйте `a.Value.CompareTo(b.Value)`.
- **Неузгоджені компаратори** (не транзитивні, або `Compare(a, a) != 0`) можуть змусити `List.Sort` кинути `InvalidOperationException` або погано зациклитися.
- `List<T>.Sort` / `Array.Sort` **нестабільні** (introsort): рівні елементи можуть змінити порядок. `OrderBy` в LINQ **стабільний**.
- Порядок рядків з урахуванням культури різниться між машинами; для всього, що зберігається чи є ключем, беріть ординальне порівняння.

## Оператори <, >

`<` і `>` підтримують лише числові типи, enum, `DateTime` і типи, що їх перевантажують. `string` — ні (використовуйте `string.Compare` чи `CompareTo`), бо «в якому порядку?» залежить від культури.

## Що сказати на співбесіді

- `IComparable<T>` = природний порядок; `IComparer<T>` = зовнішній чи альтернативний порядок.
- Повертайте від'ємне/нуль/додатне; ніколи не обчислюйте це відніманням.
- `List.Sort` нестабільний; `OrderBy` стабільний.
