Статичні методи ви пишете ще з модуля про методи. У класі більшість методів — це методи **екземпляра**: вони працюють з даними об'єкта, на якому викликані. Ця лекція про те, що для них специфічне.

## Метод екземпляра

```csharp
class Rectangle
{
    public double Width { get; }
    public double Height { get; }

    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    public double Area() => Width * Height;
    public double Perimeter() => 2 * (Width + Height);
    public bool IsSquare() => Width == Height;
}

var r = new Rectangle(3, 4);
Console.WriteLine(r.Area());       // 12
Console.WriteLine(r.IsSquare());   // False
```

Методи не приймають `Width` та `Height` параметрами: вони читають їх із `this`, об'єкта, на якому викликано метод. У цьому перевага ООП: дані й код, що ними користується, подорожують разом, тож виклики короткі.

## Параметри — інші об'єкти

Метод часто працює з **іншим** об'єктом того самого класу:

```csharp
public bool IsBiggerThan(Rectangle other) => Area() > other.Area();

var small = new Rectangle(1, 2);
var large = new Rectangle(5, 5);
Console.WriteLine(large.IsBiggerThan(small));   // True
```

Усередині класу метод може читати навіть **приватні** члени іншого об'єкта того самого класу.

## Змінювати об'єкт чи повертати новий?

Метод може **змінювати** об'єкт (міняти його дані) або **повертати новий об'єкт**, лишаючи оригінал у спокої:

```csharp
class Vector
{
    public double X { get; private set; }
    public double Y { get; private set; }

    public Vector(double x, double y) { X = x; Y = y; }

    public void ScaleInPlace(double k)          // змінює цей об'єкт; нічого не повертає
    {
        X *= k;
        Y *= k;
    }

    public Vector Scaled(double k)              // повертає НОВИЙ об'єкт; цей не змінюється
    {
        return new Vector(X * k, Y * k);
    }
}
```

| Стиль | Назва | Ефект |
| --- | --- | --- |
| змінюючий | дієслово: `Add`, `Clear`, `ScaleInPlace` | змінює об'єкт, зазвичай повертає `void` |
| такий, що повертає нове значення | іменник чи прикметник: `Scaled`, `Normalized`, `Plus` | оригінал лишається тим самим |

Повернення нових об'єктів, як це робить `string` (`ToUpper` повертає новий рядок), полегшує розуміння коду й робить об'єкти безпечними для спільного використання. Це коштує трохи пам'яті.

## Перевантаження

Кілька методів можуть мати одну **назву**, якщо їхні **параметри відрізняються** кількістю чи типом:

```csharp
class Printer
{
    public void Print(int number) => Console.WriteLine("int: " + number);
    public void Print(string text) => Console.WriteLine("text: " + text);
    public void Print(string text, int times)
    {
        for (int i = 0; i < times; i++) Console.WriteLine(text);
    }
}
```

Компілятор обирає той, що підходить до аргументів. Лише тип значення, що повертається, перевантаження не створює.

## Перевантажені конструктори та ланцюжки

Клас може пропонувати кілька способів створення. Щоб не повторювати код, один конструктор може викликати інший через `: this(...)`:

```csharp
class Book
{
    public string Title { get; }
    public int Pages { get; }

    public Book(string title, int pages)
    {
        Title = title;
        Pages = pages;
    }

    public Book(string title) : this(title, 100)      // викликає конструктор вище
    {
    }
}
```

## Необов'язкові та іменовані параметри

```csharp
public string Describe(bool withPages = true) => withPages ? Title + " (" + Pages + ")" : Title;

book.Describe();                       // withPages дорівнює true
book.Describe(withPages: false);       // іменований аргумент
```

## Методи, які має кожен об'єкт

Кожен клас успадковує кілька методів від `object`, і їх можна **перевизначити**, щоб вони мали сенс.

**`ToString()`**: текст для об'єкта.

```csharp
public override string ToString() => Title + " (" + Pages + " pages)";

Console.WriteLine(book);               // викликає ToString: The Hobbit (310 pages)
string text = "Book: " + book;         // також його викликає
```

**`Equals()`** та **`GetHashCode()`**: за замовчуванням два об'єкти рівні лише тоді, коли це **той самий** об'єкт (те саме посилання). Для класу, об'єкти якого мають бути рівними, коли рівні їхні **дані**, перевизначте обидва:

```csharp
public override bool Equals(object obj)
{
    var other = obj as Point;
    return other != null && X == other.X && Y == other.Y;
}

public override int GetHashCode() => X.GetHashCode() ^ Y.GetHashCode();
```

Перевизначайте їх разом: рівні об'єкти повинні мати однаковий хеш-код, інакше `Dictionary` чи `HashSet` поводитимуться хибно.

## Оператори

Класові можна дати знайомі оператори. Оператор — це **статичний** метод зі спеціальною назвою:

```csharp
class Vector
{
    public double X { get; }
    public double Y { get; }
    public Vector(double x, double y) { X = x; Y = y; }

    public static Vector operator +(Vector a, Vector b) => new Vector(a.X + b.X, a.Y + b.Y);
    public static Vector operator -(Vector a, Vector b) => new Vector(a.X - b.X, a.Y - b.Y);
    public static Vector operator *(Vector v, double k) => new Vector(v.X * k, v.Y * k);

    public override string ToString() => "(" + X + ", " + Y + ")";
}

var v = new Vector(1, 2) + new Vector(3, 4);       // (4, 6)
var w = v * 2;                                      // (8, 12)
```

Використовуйте оператори лише тоді, коли сенс очевидний і математичний (вектори, дроби, гроші). Якщо доводиться пояснювати, що робить `a + b`, використайте метод із зрозумілою назвою.

## Проєктування методів

- **Одна робота** на метод і назва, що її називає: дієслово для дії (`Deposit`), питання для перевірки (`IsEmpty`, `Contains`).
- **Мало параметрів.** Більше трьох-чотирьох — ознака, що вони належать до власного об'єкта.
- **Перевіряйте** те, що надходить ззовні: від'ємну суму, null-посилання.
- **Не змішуйте обчислення й друк.** Метод, що повертає значення, можна тестувати, а той, що друкує, — ні.
- **Повертайте** значення й дозвольте тому, хто викликає, вирішити, що з ним робити. Метод `Withdraw` може повертати `bool` для успіху замість друку повідомлення.

## Методи й властивості

Коли щось читається як **значення** об'єкта (`Area`, `FullName`), природна обчислювана властивість. Коли воно читається як **дія** або потребує параметра (`Deposit(100)`, `ReadingDays(40)`), використайте метод. Геттер має бути дешевим і без несподіваних побічних ефектів.

## Підсумок

- Метод екземпляра працює з `this`: дані й поведінка подорожують разом.
- Вирішіть, чи він **змінює** об'єкт, чи **повертає** новий, і хай назва це каже.
- Перевантажуйте для зручності, ланцюжте конструктори, щоб не повторювати код.
- Перевизначайте `ToString`, а також `Equals` разом із `GetHashCode`, коли типова поведінка не підходить.
- Оператори — статичні методи, якими слід користуватися помірковано.
