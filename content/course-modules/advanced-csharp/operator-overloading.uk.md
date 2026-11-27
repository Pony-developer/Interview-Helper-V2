## Щоб ваші типи відчувалися вбудованими

Перевантаження операторів дозволяє типу визначити, що для нього означають `+`, `==`, `<` та інші. Це пасує типам, що моделюють математичні поняття чи значення: гроші, вектори, матриці, дроби, проміжки часу.

```csharp
public readonly struct Money : IEquatable<Money>
{
    public decimal Amount { get; }
    public string Currency { get; }
    public Money(decimal amount, string currency) { Amount = amount; Currency = currency; }

    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency) throw new InvalidOperationException("Currency mismatch");
        return new Money(a.Amount + b.Amount, a.Currency);
    }

    public static Money operator *(Money m, decimal factor) => new(m.Amount * factor, m.Currency);
    public static Money operator -(Money m) => new(-m.Amount, m.Currency);   // унарний
}
```

## Правила

- Оператори — це `public static` методи з назвою `operator X`. Хоча б один параметр має бути типу, що їх містить.
- **Можна перевантажити**: унарні `+ - ! ~ ++ -- true false`, бінарні `+ - * / % & | ^ << >>`, порівняння `== != < > <= >=`.
- **Не можна**: `&& || ?: ?? = . new is as typeof` та індексатор `[]` (для нього є індексатори).
- Складені присвоєння (`+=`) отримуєте задарма з бінарного оператора.
- `&&` і `||` працюють автоматично, якщо перевантажено `&`, `|`, `true` і `false`.

## Оператори порівняння йдуть парами

Компілятор вимагає `==` разом з `!=`, `<` з `>`, `<=` з `>=`. А якщо перевантажено `==`, варто ще:

- перевизначити `Equals(object)` і `GetHashCode()` з тією самою логікою;
- реалізувати `IEquatable<T>` (уникає пакування для структур);
- для впорядкування — ще й `IComparable<T>`.

```csharp
public static bool operator ==(Money a, Money b) => a.Equals(b);
public static bool operator !=(Money a, Money b) => !a.Equals(b);
public bool Equals(Money other) => Amount == other.Amount && Currency == other.Currency;
public override bool Equals(object? obj) => obj is Money m && Equals(m);
public override int GetHashCode() => HashCode.Combine(Amount, Currency);
```

Для **класів** пам'ятайте, що `==` має обробляти null з будь-якого боку без рекурсії: усередині оператора використовуйте `ReferenceEquals(a, null)` або `a is null`.

## Власні перетворення

```csharp
public readonly struct Celsius
{
    public double Degrees { get; }
    public Celsius(double degrees) => Degrees = degrees;

    public static implicit operator Celsius(double d) => new(d);             // безпечне, без втрат
    public static explicit operator Fahrenheit(Celsius c) => new(c.Degrees * 9 / 5 + 32);   // справжнє перетворення
}

Celsius room = 21.5;                 // неявне
var f = (Fahrenheit)room;            // потрібне явне приведення
```

Робіть перетворення **неявним** лише якщо воно ніколи не кидає винятків і не втрачає інформацію; інакше — **явним**. `as` та `is` власні перетворення ігнорують.

## Checked-оператори (preview C# 11)

З C# 11 можна визначати `checked`-версії арифметичних операторів, що кидають виняток при переповненні. У C# 10 версія одна.

## Гарний смак

- Перевантажуйте оператори лише там, де зміст **очевидний** (`+` для додавання грошей зрозумілий; `+`, щоб «додати замовлення клієнту», — ні).
- Тримайте їх узгодженими між собою: `a - b == a + (-b)`, `a < b` тоді й лише тоді, коли `b > a`.
- Не змушуйте їх робити I/O чи мати побічні ефекти.

## Що сказати на співбесіді

- `public static T operator +(T a, T b)`; хоча б один операнд типу, що оголошує оператор.
- Оператори порівняння — парами; `==` тягне за собою перевизначення `Equals` і `GetHashCode`.
- Неявні перетворення мають бути без втрат і ніколи не кидати винятків.
