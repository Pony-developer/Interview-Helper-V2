**Inheritance** lets one class take everything that another class has, and then add to it. The class that gives is the **base class** (parent), and the class that receives is the **derived class** (child). A colon makes the link:

```csharp
class Person                                   // the base class
{
    public string Name;
    public int BirthYear;

    public string Introduce()
    {
        return "I am " + Name + ", born in " + BirthYear;
    }
}

class Student : Person                         // Student is derived from Person
{
    public int Course;
}

class Teacher : Person
{
    public string Subject;
}
```

A `Student` object now has `Name`, `BirthYear` and `Introduce()` **without** writing them again:

```csharp
var s = new Student { Name = "Ann", BirthYear = 2005, Course = 2 };
Console.WriteLine(s.Introduce());              // I am Ann, born in 2005
Console.WriteLine(s.Course);                   // 2
```

And the problem from the previous lecture disappears. A student **is a** person, so the program can treat it as one:

```csharp
static void Greet(Person person)               // written once
{
    Console.WriteLine(person.Introduce());
}

Greet(new Student { Name = "Ann", BirthYear = 2005 });
Greet(new Teacher { Name = "Bob", BirthYear = 1975 });

Person[] people = { new Student(), new Teacher() };    // one array for both
```

## Rules of inheritance

- A class has **exactly one** base class. C# has no multiple inheritance of classes (interfaces give a replacement, see later).
- If you write no base class, it is **`object`**. Every class in C# is derived from `object`, directly or through other classes.
- **Everything is inherited**, but a `private` member of the base class is not **accessible** in the derived class. It exists in the object, and the derived code cannot touch it.
- Constructors are **not** inherited. Each class has its own.

## `protected`: for the derived classes only

Between `public` (everybody) and `private` (the class only) there is **`protected`**: visible in the class and in its **derived classes**, hidden from the outside code.

```csharp
class Person
{
    protected int birthYear;                   // derived classes may use it, the outside code may not
}

class Student : Person
{
    public int AgeIn(int year) { return year - birthYear; }     // fine
}

// new Student().birthYear = 1;                 // error: it is protected
```

Use `protected` with care: every `protected` member is a promise to all future derived classes that it will not change. Often a `protected` or `public` **property** is a better way to share data.

## Constructors and `base`

A derived object **contains** a base object, and the base part must be built first. So **a base constructor always runs before the derived one**. If the base class has a constructor with parameters, the derived class must say how to call it, with `: base(...)`:

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
        : base(name, birthYear)                // call the base constructor first
    {
        Course = course;
        Console.WriteLine("Student constructor");
    }
}

var s = new Student("Ann", 2005, 2);
// Person constructor
// Student constructor
```

If you write no `: base(...)`, the compiler adds `: base()`, a call of the base constructor **without** parameters. If the base class has no such constructor, you get a compile error: *"There is no argument given that corresponds to the required formal parameter..."* The fix is to add the `: base(...)` call.

## Inheritance is "is a"

The test for inheritance is the phrase **"X is a Y"**: a student *is a* person, a circle *is a* shape, a cat *is an* animal. If the phrase sounds wrong ("a car *is an* engine"), inheritance is the wrong tool. A car **has an** engine: make the engine a **field**.

Also remember that the derived class **promises** everything the base class does. If `Person` can `Introduce`, every `Student` must be able to do it in a sensible way. Inheritance only to **reuse code**, without the "is a" relation, leads to confusing programs.
