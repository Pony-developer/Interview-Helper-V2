## Розгортаємо record

Для `public record Point(int X, int Y);` компілятор генерує приблизно таке:

```csharp
public class Point : IEquatable<Point>
{
    public Point(int X, int Y) { this.X = X; this.Y = Y; }

    public int X { get; init; }
    public int Y { get; init; }

    // Equals використовує це, щоб переконатися, що обидва об'єкти мають той самий тип під час виконання
    protected virtual Type EqualityContract => typeof(Point);

    public virtual bool Equals(Point? other) =>
        (object)this == other ||
        (other is not null &&
         EqualityContract == other.EqualityContract &&
         EqualityComparer<int>.Default.Equals(X, other.X) &&
         EqualityComparer<int>.Default.Equals(Y, other.Y));

    public override bool Equals(object? obj) => Equals(obj as Point);
    public override int GetHashCode() => HashCode.Combine(EqualityContract, X, Y);
    public static bool operator ==(Point? a, Point? b) => (object?)a == b || (a?.Equals(b) ?? false);
    public static bool operator !=(Point? a, Point? b) => !(a == b);

    // підтримка with
    protected Point(Point original) { X = original.X; Y = original.Y; }
    public virtual Point <Clone>$() => new Point(this);

    public void Deconstruct(out int X, out int Y) { X = this.X; Y = this.Y; }

    public override string ToString() { /* "Point { X = 1, Y = 2 }" через PrintMembers */ }
    protected virtual bool PrintMembers(StringBuilder builder) { /* "X = 1, Y = 2" */ }
}
```

`p with { Y = 5 }` перетворюється на `var tmp = p.<Clone>$(); tmp.Y = 5;` (дозволено, бо `init`-аксесори можуть виконуватися під час такої ініціалізації).

## Правила рівності за значенням

Хоч від record, хоч написана власноруч, коректна реалізація рівності має бути:

- **рефлексивною**: `a.Equals(a)` — true;
- **симетричною**: `a.Equals(b) == b.Equals(a)`;
- **транзитивною**;
- **узгодженою з GetHashCode**: рівні об'єкти **мусять** мати рівні хеш-коди (нерівні зазвичай мають відрізнятися);
- **безпечною щодо null**: `a.Equals(null)` — false, ніколи не виняток.

`EqualityContract` зберігає симетричність при успадкуванні: `Person` і `Employee` з однаковим `Name` не рівні, бо їхні типи під час виконання різні.

## Налаштування record

Будь-який згенерований член можна замінити, написавши його самому:

```csharp
public record Email(string Address)
{
    public virtual bool Equals(Email? other) =>
        other is not null && string.Equals(Address, other.Address, StringComparison.OrdinalIgnoreCase);
    public override int GetHashCode() => StringComparer.OrdinalIgnoreCase.GetHashCode(Address);
}
```

Можна також додати перевірку у властивість:

```csharp
public record Percentage(decimal Value)
{
    public decimal Value { get; init; } =
        Value is >= 0 and <= 100 ? Value : throw new ArgumentOutOfRangeException(nameof(Value));
}
```

А `sealed override ToString()` не дає похідним record його замінити.

## Змінні члени ламають контракт

Якщо record містить змінну колекцію, два record можуть бути «рівні» зараз і «різні» згодом, а хеш-код змінюється, поки об'єкт лежить у `HashSet`. Усередині record використовуйте незмінні колекції (`ImmutableList<T>`, `IReadOnlyList<T>`, яку ніколи не змінюють) або виключайте їх з рівності.

Зауважте також, що колекції порівнюються **за посиланням**: два record, кожен з яких містить ідентичний, але окремий `List<string>`, **не** рівні.

## Що сказати на співбесіді

- Record — звичайний C#: компілятор пише Equals, GetHashCode, ==, ToString, Deconstruct і метод клонування.
- `EqualityContract` робить рівність чутливою до типу при успадкуванні.
- Рівні об'єкти мусять мати рівні хеш-коди; змінні поля всередині record це порушують.
