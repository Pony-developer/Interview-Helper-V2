Коли два об'єкти «однакові»? Для чисел усе ясно: `3 == 3`. Для об'єктів є **два різні питання**:

- **Рівність посилань**: чи ці дві змінні є **одним і тим самим об'єктом** у пам'яті?
- **Рівність значень**: чи ці два об'єкти **мають однаковий вміст**, так що для програми означають те саме?

```csharp
class Point
{
    public int X { get; }
    public int Y { get; }
    public Point(int x, int y) { X = x; Y = y; }
}

var a = new Point(1, 2);
var b = new Point(1, 2);
var c = a;

Console.WriteLine(a == b);                  // False: два різні об'єкти
Console.WriteLine(a.Equals(b));             // False: типовий Equals — теж рівність посилань
Console.WriteLine(a == c);                  // True: той самий об'єкт
```

Для класу і `==`, і `Equals` за замовчуванням порівнюють **посилання**. Рядки — виняток: `string` перевизначає обидва, щоб порівнювати **вміст**, тому `"ab" == "a" + "b"` дорівнює `true`.

## Перевизначення Equals

`Equals(object)` — **віртуальний метод** `object`, тож для нього працює поліморфізм: `HashSet`, `List.Contains`, `Dictionary` та багато інших викликають його й отримують **вашу** версію:

```csharp
public override bool Equals(object obj)
{
    Point other = obj as Point;                       // null, якщо obj не Point або дорівнює null
    if (ReferenceEquals(other, null)) return false;
    return X == other.X && Y == other.Y;              // рівність значень
}
```

Тепер `a.Equals(b)` дорівнює `true`. Правила коректного `Equals`:

- **рефлексивність**: `a.Equals(a)` дорівнює `true`;
- **симетричність**: `a.Equals(b)` те саме, що `b.Equals(a)`;
- **транзитивність**: якщо `a` дорівнює `b`, а `b` дорівнює `c`, то `a` дорівнює `c`;
- **узгодженість**: відповідь не змінюється, поки не змінюються об'єкти;
- **`x.Equals(null)` дорівнює `false`** і ніколи не повинен кидати виняток.

## GetHashCode: завжди разом з Equals

`HashSet<T>` та `Dictionary<K, V>` швидкі, бо вживають **хеш-код** — число, зроблене з об'єкта. Вони спершу порівнюють хеш-коди й викликають `Equals` лише для об'єктів з однаковим кодом. **Контракт**:

> Якщо `a.Equals(b)` дорівнює `true`, то `a.GetHashCode()` **мусить дорівнювати** `b.GetHashCode()`.

Зворотне не вимагається: різні об'єкти можуть мати однаковий хеш-код («колізія»), але хороший хеш розподіляє об'єкти рівномірно.

```csharp
public override int GetHashCode()
{
    unchecked                                         // переповнення для хеша — це нормально
    {
        return X * 31 + Y;                            // поєднайте поля, які вживає Equals
    }
}
```

Якщо ви перевизначили `Equals` і забули `GetHashCode` (компілятор попереджає), то дві рівні точки потрапляють у **різні** комірки хеш-таблиці, а `HashSet` охоче тримає обидві.

```csharp
var set = new HashSet<Point> { new Point(1, 2), new Point(1, 2), new Point(2, 1) };
Console.WriteLine(set.Count);                         // 2 з обома перевизначеннями; 3 без GetHashCode
```

Для хеша вживайте **рівно ті поля, які порівнює `Equals`**, і жодних інших.

## Оператори == та !=

Якщо ви хочете, щоб `a == b` теж порівнювало значення, перевантажте оператори (**парою**) і обробіть `null` **без** рекурсії:

```csharp
public static bool operator ==(Point a, Point b)
{
    if (ReferenceEquals(a, b)) return true;           // той самий об'єкт або обидва null
    if (ReferenceEquals(a, null) || ReferenceEquals(b, null)) return false;
    return a.X == b.X && a.Y == b.Y;
}

public static bool operator !=(Point a, Point b)
{
    return !(a == b);
}
```

Усередині `Equals` та `==` порівнюйте з `null` через **`ReferenceEquals`**: `a == null` знову викликало б ваш власний оператор і привело б до нескінченної рекурсії.

## Змінні об'єкти як ключі: небезпека

Хеш-код обчислюється **у момент, коли об'єкт кладуть** у хеш-таблицю. Якщо після цього змінити поле, хеш змінюється, і таблиця **більше не може знайти об'єкт**:

```csharp
var p = new MutablePoint { X = 1 };
set.Add(p);
p.X = 5;                                              // тепер хеш інший
Console.WriteLine(set.Contains(p));                   // False, хоча об'єкт усередині
```

Це ще одна вагома причина робити об'єкти, що вживаються для **рівності значень** і як **ключі**, **незмінними** (лекція про `readonly`).

## `IEquatable<T>`

Метод `Equals(Point other)` із **типізованим** параметром, з інтерфейсу `IEquatable<Point>`, уникає приведення й трохи швидший. Повний клас реалізує і `Equals(object)`, і `Equals(Point)`. Для задач цього курсу досить `Equals(object)` із `GetHashCode`.

## Що ще вживає Equals

`List<T>.Contains`, `IndexOf`, `Remove` та `Array.IndexOf` вживають `Equals`. `Dictionary` і `HashSet` вживають `GetHashCode` та `Equals`. `Array.Sort` їх **не** вживає: йому потрібен порядок (`IComparable`), а не рівність.
