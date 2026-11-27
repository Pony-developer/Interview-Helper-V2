## Два види рівності

- **Рівність за значенням**: дві речі рівні, якщо містять ті самі дані (`3 == 3`, два `DateTime` з тим самим тиком, два record з однаковими полями).
- **Рівність за посиланням**: два посилання рівні, якщо вказують на **той самий об'єкт**.

За замовчуванням типи значень використовують рівність за значенням, а типи посилань — за посиланням. Деякі типи посилань це змінюють: `string`, `Uri`, record, анонімні типи, кортежі.

## Протоколи рівності

| Механізм | Статичний чи віртуальний | Примітки |
| --- | --- | --- |
| `==` / `!=` | **статичний**: обирається під час компіляції за оголошеними типами | можна перевантажити |
| `object.Equals(object)` | **віртуальний**: використовує тип під час виконання | працює через `object` та інтерфейси |
| `object.Equals(a, b)` (статичний) | обробляє null, потім викликає віртуальний `Equals` | безпечний для невідомих типів |
| `ReferenceEquals(a, b)` | завжди за посиланням | не можна перевизначити |
| `IEquatable<T>.Equals(T)` | строго типізований, без пакування | використовують узагальнені колекції |

Різниця між статичним і віртуальним дає класичні сюрпризи:

```csharp
object a = 5, b = 5;
Console.WriteLine(a == b);        // False: == для object порівнює посилання (дві «коробки»)
Console.WriteLine(a.Equals(b));   // True: Int32.Equals порівнює значення

string s1 = "hi", s2 = new string(new[] { 'h', 'i' });
object o1 = s1, o2 = s2;
Console.WriteLine(s1 == s2);      // True: перевантажений == для string
Console.WriteLine(o1 == o2);      // False: тип під час компіляції — object, тож за посиланням
```

В узагальненому коді `==` навіть не дозволено на необмеженому `T`; використовуйте `EqualityComparer<T>.Default.Equals(a, b)`, що обирає `IEquatable<T>`, коли він є, і уникає пакування.

## Дивні випадки, які варто знати

```csharp
double nan = double.NaN;
Console.WriteLine(nan == nan);        // False (IEEE 754)
Console.WriteLine(nan.Equals(nan));   // True: Equals має бути рефлексивним, щоб працювали колекції

int[] x = { 1, 2 }, y = { 1, 2 };
Console.WriteLine(x.Equals(y));       // False: масиви порівнюються за посиланням
Console.WriteLine(x.SequenceEqual(y));// True (LINQ)
```

Щоб порівнювати масиви й кортежі поелементно, є `IStructuralEquatable` (`StructuralComparisons.StructuralEqualityComparer`).

## Реалізація рівності за значенням

```csharp
public sealed class Area : IEquatable<Area>
{
    public double Width { get; }
    public double Height { get; }
    public Area(double w, double h) { Width = w; Height = h; }

    public bool Equals(Area? other) =>
        other is not null && Width == other.Width && Height == other.Height;

    public override bool Equals(object? obj) => Equals(obj as Area);
    public override int GetHashCode() => HashCode.Combine(Width, Height);

    public static bool operator ==(Area? a, Area? b) => a is null ? b is null : a.Equals(b);
    public static bool operator !=(Area? a, Area? b) => !(a == b);
}
```

Чекліст:

1. Перевизначайте `Equals(object)` **і** `GetHashCode` разом.
2. Реалізуйте `IEquatable<T>` (для структур це обов'язково, щоб уникнути пакування).
3. Перевантажуйте `==`/`!=` узгоджено й безпечно щодо null.
4. Хешуйте лише незмінні поля; рівні об'єкти мусять давати рівні хеші.
5. Для структур перевизначайте завжди: стандартний `ValueType.Equals` використовує рефлексію і повільний.

Або доручіть це компілятору: `record` і `record struct`.

## Змінна рівність

`IEqualityComparer<T>` дозволяє *колекції* вирішувати, що означає «рівні», не змінюючи тип:

```csharp
var tags = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "CSharp", "csharp" };   // Count = 1
```

## Що сказати на співбесіді

- `==` розв'язується статично, `Equals` — віртуально: через `object` вони можуть не збігатися.
- Перевизначайте `Equals` і `GetHashCode` разом; реалізуйте `IEquatable<T>`.
- В узагальненнях використовуйте `EqualityComparer<T>.Default`.
