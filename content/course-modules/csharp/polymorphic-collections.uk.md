Найбільша сила поліморфізму проявляється, коли об'єкти **різних класів живуть в одній колекції**. Колекція має тип **базового класу** чи **інтерфейсу**, а код, що її обходить, ставиться до всіх однаково.

```csharp
abstract class Animal
{
    public string Name { get; }
    protected Animal(string name) { Name = name; }
    public abstract string Sound();
}

class Dog : Animal { public Dog(string n) : base(n) { } public override string Sound() { return "Woof"; } }
class Cat : Animal { public Cat(string n) : base(n) { } public override string Sound() { return "Meow"; } }
class Cow : Animal { public Cow(string n) : base(n) { } public override string Sound() { return "Moo"; } }

var farm = new List<Animal> { new Dog("Rex"), new Cat("Tom"), new Cow("Bess"), new Dog("Fido") };

foreach (Animal a in farm)
{
    Console.WriteLine(a.Name + ": " + a.Sound());       // кожна тварина відповідає по-своєму
}
```

Список має **один** тип елементів, `Animal`, і тримає об'єкти трьох класів. `farm.Add(new Cat("Kit"))` працює, як і будь-який клас, похідний від `Animal`, який напишуть наступного року.

## Інші колекції

Те саме працює для будь-якої колекції базового типу чи інтерфейсу:

```csharp
IShape[] shapes = { new Circle(1), new Square(2) };

var byName = new Dictionary<string, Animal>
{
    { "dog", new Dog("Rex") },
    { "cat", new Cat("Tom") }
};
Console.WriteLine(byName["cat"].Sound());                // Meow: пошук і поліморфний виклик

var queue = new Queue<ICommand>();                       // черга різних команд
queue.Enqueue(new MoveCommand());
queue.Enqueue(new SaveCommand());
while (queue.Count > 0) queue.Dequeue().Execute();       // кожна виконує власну роботу
```

**Список команд**, де кожен елемент — об'єкт із методом `Execute()`, — дуже частий дизайн: стеки скасування, черги завдань, ігрові події, меню.

## Операції над усією колекцією

Алгоритм можна написати **один раз** у термінах базового типу:

```csharp
static double TotalArea(IEnumerable<IShape> shapes)
{
    double total = 0;
    foreach (IShape s in shapes) total += s.Area;
    return total;
}
```

Він додає кола, квадрати й фігури майбутнього. Якщо потрібні лише деякі елементи, фільтруйте за **властивістю** (`if (a.IsDangerous)`), а не за **типом** (`if (a is Dog)`).

## Який тип класти в список

| Потреба | Тип елемента |
|---|---|
| Спільна роль, без спільного коду | Інтерфейс |
| Спільна роль зі спільним кодом і даними | Абстрактний (або звичайний) базовий клас |
| «Будь-що» | `object`, і це крайній засіб: потрібне приведення |

## Приведення всередині колекції

Якщо список має тип `List<Animal>`, то `farm[0]` — це `Animal`, і його **оголошений** тип — `Animal`. Щоб скористатися тим, що має лише `Dog`, потрібне приведення:

```csharp
Dog dog = farm[0] as Dog;
if (dog != null) dog.Fetch();                  // можливо, але це тривожна ознака
```

Цикл із багатьма перевірками `is` та `as` означає, що в дизайні бракує **віртуального методу** в базовому типі. Наступна лекція показує, як прибрати такі перевірки.

## Варіантність колекцій

Чи можна вжити список собак як список тварин? Це тонке питання:

```csharp
List<Dog> dogs = new List<Dog> { new Dog("Rex") };

IEnumerable<Animal> animals = dogs;            // добре: IEnumerable<T> лише ВІДДАЄ об'єкти
// List<Animal> list = dogs;                   // помилка: List<Animal> мусить також ПРИЙМАТИ Cat,
                                               //          і список собак зламався б
```

`IEnumerable<T>` — **коваріантний**: послідовність собак **є** послідовністю тварин, бо з неї можна лише **читати**. У `List<T>` можна записувати, тому він **інваріантний**. Ось чому методи, що лише **читають**, мають приймати `IEnumerable<T>`, як `TotalArea` вище: він приймає `List<Circle>`, масив `Circle[]` і `List<IShape>`.

## Сортування змішаної колекції

Елементи базового типу можна сортувати, якщо базовий тип (або інтерфейс) визначає **порядок**: `IComparable<Animal>` в `Animal` або окремий `IComparer<Animal>`. Порівняння вживає **спільні** властивості, тож працює для будь-якої суміші похідних класів.
