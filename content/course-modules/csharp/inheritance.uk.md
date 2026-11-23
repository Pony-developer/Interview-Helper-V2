**Успадкування** дозволяє одному класові взяти все, що має інший клас, а потім додати до цього своє. Клас, що дає, — **базовий клас** (батьківський), а клас, що отримує, — **похідний клас** (дочірній). Зв'язок задає двокрапка:

```csharp
class Person                                   // базовий клас
{
    public string Name;
    public int BirthYear;

    public string Introduce()
    {
        return "I am " + Name + ", born in " + BirthYear;
    }
}

class Student : Person                         // Student походить від Person
{
    public int Course;
}

class Teacher : Person
{
    public string Subject;
}
```

Об'єкт `Student` тепер має `Name`, `BirthYear` і `Introduce()` **без** повторного написання:

```csharp
var s = new Student { Name = "Ann", BirthYear = 2005, Course = 2 };
Console.WriteLine(s.Introduce());              // I am Ann, born in 2005
Console.WriteLine(s.Course);                   // 2
```

І проблема з попередньої лекції зникає. Студент **є** людиною, тож програма може розглядати його як людину:

```csharp
static void Greet(Person person)               // написано один раз
{
    Console.WriteLine(person.Introduce());
}

Greet(new Student { Name = "Ann", BirthYear = 2005 });
Greet(new Teacher { Name = "Bob", BirthYear = 1975 });

Person[] people = { new Student(), new Teacher() };    // один масив для обох
```

## Правила успадкування

- Клас має **рівно один** базовий клас. У C# немає множинного успадкування класів (заміну дають інтерфейси, про них далі).
- Якщо базового класу не вказано, ним є **`object`**. Кожен клас у C# походить від `object`, безпосередньо або через інші класи.
- **Успадковується все**, але `private` член базового класу не **доступний** у похідному. Він є в об'єкті, а код похідного класу не може до нього торкнутися.
- Конструктори **не** успадковуються. Кожен клас має власні.

## `protected`: лише для похідних класів

Між `public` (для всіх) і `private` (лише для класу) є **`protected`**: видно в класі та в його **похідних класах**, а зовнішньому коду — ні.

```csharp
class Person
{
    protected int birthYear;                   // похідні класи можуть його вживати, зовнішній код — ні
}

class Student : Person
{
    public int AgeIn(int year) { return year - birthYear; }     // добре
}

// new Student().birthYear = 1;                 // помилка: він protected
```

Користуйтеся `protected` обережно: кожен `protected` член — це обіцянка всім майбутнім похідним класам, що він не зміниться. Часто кращий спосіб поділитися даними — `protected` або `public` **властивість**.

## Конструктори та `base`

Похідний об'єкт **містить** базовий об'єкт, і базову частину треба збудувати першою. Тому **конструктор бази завжди виконується раніше за похідний**. Якщо базовий клас має конструктор із параметрами, похідний мусить сказати, як його викликати, через `: base(...)`:

```csharp
class Person
{
    public string Name { get; }
    public int BirthYear { get; }

    public Person(string name, int birthYear)
    {
        Name = name;
        BirthYear = birthYear;
        Console.WriteLine("Person constructor");
    }
}

class Student : Person
{
    public int Course { get; }

    public Student(string name, int birthYear, int course)
        : base(name, birthYear)                // спершу викликаємо конструктор бази
    {
        Course = course;
        Console.WriteLine("Student constructor");
    }
}

var s = new Student("Ann", 2005, 2);
// Person constructor
// Student constructor
```

Якщо `: base(...)` не написано, компілятор додає `: base()`, тобто виклик конструктора бази **без** параметрів. Якщо в базового класу такого конструктора немає, буде помилка компіляції: *«There is no argument given that corresponds to the required formal parameter...»*. Виправлення — додати виклик `: base(...)`.

## Успадкування — це «є»

Перевірка для успадкування — фраза **«X є Y»**: студент *є* людиною, коло *є* фігурою, кіт *є* твариною. Якщо фраза звучить хибно («автомобіль *є* двигуном»), успадкування — не той інструмент. Автомобіль **має** двигун: зробіть двигун **полем**.

Пам'ятайте й те, що похідний клас **обіцяє** все, що вміє базовий. Якщо `Person` уміє `Introduce`, то кожен `Student` має вміти це робити змістовно. Успадкування лише заради **повторного використання коду**, без зв'язку «є», приводить до плутаних програм.
