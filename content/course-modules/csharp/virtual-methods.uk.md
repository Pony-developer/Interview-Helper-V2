Базовий клас може дати методові **типову** поведінку й дозволити похідним класам її **замінити**. Це роблять два ключові слова:

- **`virtual`** у базовому класі: «цей метод можна замінити»;
- **`override`** у похідному класі: «це заміна».

```csharp
class Animal
{
    public string Name { get; }

    public Animal(string name) { Name = name; }

    public virtual string Sound()                  // типова поведінка
    {
        return "...";
    }

    public string Speak()
    {
        return Name + " says " + Sound();          // викликає версію, що пасує до об'єкта
    }
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }

    public override string Sound()                 // замінює типову поведінку
    {
        return "Woof";
    }
}

class Fish : Animal
{
    public Fish(string name) : base(name) { }      // без override: залишає типову поведінку
}
```

```csharp
Animal[] animals = { new Dog("Rex"), new Fish("Nemo"), new Animal("Thing") };
foreach (Animal a in animals)
{
    Console.WriteLine(a.Speak());
}
// Rex says Woof
// Nemo says ...
// Thing says ...
```

Погляньте на `Speak()`: його написано **один раз**, в `Animal`, і він викликає `Sound()`. Для об'єкта `Dog` виклик виконує `Dog.Sound()`, хоча код `Speak` лежить у базовому класі. Це **динамічна диспетчеризація**: версію вибирають за **справжнім типом** об'єкта.

## Правила

- Метод, не позначений `virtual`, **не можна** перевизначити.
- Метод `override` має мати точно таку саму **назву, параметри й тип значення, що повертається**, і той самий доступ.
- Похідний клас, що не перевизначає метод, **успадковує** базову версію.
- Властивості теж можуть бути `virtual` та `override`.

## Виклик базової версії: `base.`

Перевизначення може розширювати базову поведінку замість повної заміни:

```csharp
class Puppy : Dog
{
    public Puppy(string name) : base(name) { }

    public override string Sound()
    {
        return base.Sound() + "! (squeaky)";       // результат Dog.Sound() плюс щось ще
    }
}
```

## abstract: метод без типової поведінки

Іноді **розумної типової поведінки немає**: який звук видає «тварина»? Тоді метод **`abstract`**: він не має тіла, і кожен неабстрактний похідний клас **мусить** його перевизначити. Клас з абстрактним членом сам має бути `abstract`, а його об'єкти не можна створити через `new`:

```csharp
abstract class Shape
{
    public abstract double Area();                         // без тіла

    public string Describe()
    {
        return GetType().Name + " with the area " + Math.Round(Area(), 2);
    }
}

class Circle : Shape
{
    private readonly double radius;
    public Circle(double radius) { this.radius = radius; }

    public override double Area() { return Math.PI * radius * radius; }
}

// var s = new Shape();                        // помилка: не можна створити екземпляр абстрактного класу
Shape shape = new Circle(1);                   // добре: змінна абстрактного типу
Console.WriteLine(shape.Describe());           // Circle with the area 3.14
```

Абстрактний клас — добре місце для **спільного** коду (`Describe`), що залежить від **конкретних** частин (`Area`), які надає кожен похідний клас.

## `new` — не `override`

Якщо похідний клас оголошує метод з тією самою назвою **без** `override`, компілятор попереджає й вважає його **новим, непов'язаним** методом, що *ховає* старий. Результат залежить від **статичного** типу змінної, і це типове джерело плутанини:

```csharp
class A { public virtual string Who() { return "A"; } }
class B : A { public new string Who() { return "B"; } }     // ховає, а не перевизначає
class C : A { public override string Who() { return "C"; } }

A b = new B();
A c = new C();
Console.WriteLine(b.Who());                    // A   (вирішує статичний тип)
Console.WriteLine(c.Who());                    // C   (вирішує справжній тип)
```

Вживайте `override`, коли потрібен поліморфізм. Попередження компілятора *«hides inherited member, use the new keyword»* означає, що ви, імовірно, забули `override`.

## Зупинка успадкування: `sealed`

`sealed class Name { }` не може бути базовим класом. `sealed override` зупиняє подальше перевизначення одного методу. Вживайте це, коли клас не був розрахований на розширення.

## Кожен клас має віртуальні методи: ToString

Клас `object` має віртуальні методи `ToString()`, `Equals(object)` і `GetHashCode()`. Тож будь-який клас може їх **перевизначити**. Найкорисніший — `ToString()`:

```csharp
class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y) { X = x; Y = y; }

    public override string ToString()
    {
        return "(" + X + ", " + Y + ")";
    }
}

var p = new Point(3, 4);
Console.WriteLine(p);                          // (3, 4)
Console.WriteLine("The point is " + p);        // The point is (3, 4)
Console.WriteLine(string.Join("; ", new List<Point> { p, new Point(0, 0) }));   // (3, 4); (0, 0)
```

Без перевизначення `Console.WriteLine(p)` друкує назву типу, `Point`. `Console.WriteLine`, конкатенація рядків через `+`, `string.Join` і налагоджувач — усі викликають `ToString()` за вас. Це знову поліморфізм: вони працюють з `object`, і кожен об'єкт відповідає по-своєму.

## Застереження: віртуальні виклики в конструкторі

Уникайте виклику `virtual` методу з **конструктора**. Конструктор бази виконується **раніше** за похідний, тож перевизначений метод працював би з об'єктом, чия похідна частина **ще не збудована** (її поля досі нульові).
