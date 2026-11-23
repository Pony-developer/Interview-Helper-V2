A university program keeps students and teachers. Both are people, so both have a name and a year of birth, and both can introduce themselves. Without inheritance, you write two separate classes:

```csharp
class Student
{
    public string Name;
    public int BirthYear;
    public int Course;

    public string Introduce()
    {
        return "I am " + Name + ", born in " + BirthYear;
    }
}

class Teacher
{
    public string Name;
    public int BirthYear;
    public string Subject;

    public string Introduce()
    {
        return "I am " + Name + ", born in " + BirthYear;
    }
}
```

The fields `Name`, `BirthYear` and the method `Introduce` are **copied**. It works, and it is exactly the kind of code that causes trouble later.

## Problem 1: copies drift apart

Tomorrow the university wants the introduction to include the age. You change `Introduce` in `Student`, and forget `Teacher`. Now the same action behaves differently for two kinds of people, and nothing in the program warns you. With ten such classes, one change means ten edits, and sooner or later one of them is missed.

## Problem 2: the classes are strangers to each other

You want a method that prints the introduction of **anyone**:

```csharp
static void Greet(Student person) { Console.WriteLine(person.Introduce()); }
static void Greet(Teacher person) { Console.WriteLine(person.Introduce()); }   // the same, again
```

For the compiler, `Student` and `Teacher` have nothing in common, even though their code looks the same. You cannot keep them in one array, either:

```csharp
// Student[] people = { new Student(), new Teacher() };   // does not compile
```

Every new kind of person (a guest, a librarian) needs its own copy of the method, and its own array.

## What we want

We want to say it **once**:

- all the **common** parts (`Name`, `BirthYear`, `Introduce`) live in **one** place;
- `Student` and `Teacher` **reuse** them, and add only what is **theirs** (`Course`, `Subject`);
- the program can treat a student and a teacher as **"a person"** when only the common part matters.

This is what **inheritance** does. In the next lecture, the same example becomes shorter, and the method `Greet` needs to be written only once.

## Not the only tool

Inheritance is not the cure for every repetition. If the shared part is just a helper calculation, a **static method** or a separate class used by both (**composition**: "a student *has* a name card") is often better. Inheritance fits when one type really **is a kind of** another: a student *is a* person. We return to this question at the end of the module.
