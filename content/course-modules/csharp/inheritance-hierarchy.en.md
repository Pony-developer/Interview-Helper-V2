Derived classes can have their own derived classes. The classes form a **tree**, the **inheritance hierarchy**, and at its root there is always `object`:

```csharp
class Person { public string Name; }
class Student : Person { public int Course; }
class Graduate : Student { public string Thesis; }
```

```text
object
 └── Person
      └── Student
           └── Graduate
```

A `Graduate` **is a** `Student`, which **is a** `Person`, which **is an** `object`. Its ancestors are all the classes above it, and each of them is a type that the object can be used as.

## Two types: static and dynamic

A variable of a reference type has a **declared** type (the **static** type), and the object that it refers to has an **actual** type (the **dynamic** type). They may differ, as long as the actual type is the declared type **or derived from it**:

```csharp
Person p = new Graduate();                 // static type Person, dynamic type Graduate
object o = new Student();                  // static type object, dynamic type Student
```

The compiler checks the code by the **static** type. So only the members of `Person` can be used through `p`:

```csharp
p.Name = "Ann";                            // fine
// p.Thesis = "...";                       // error: Person has no member Thesis
```

The actual type can be asked for at run time:

```csharp
Console.WriteLine(p.GetType().Name);       // Graduate
```

## Casting up and down

**Upcast**: from a derived type to its ancestor. It is always safe, so it is **implicit** (no special syntax):

```csharp
Student s = new Graduate();
Person p = s;                              // fine
object o = p;                              // fine
```

**Downcast**: from an ancestor back to a more special type. It may be wrong, because the compiler cannot know the actual type. So you write it **explicitly**, and the check happens **at run time**:

```csharp
Person p = new Graduate();
Graduate g = (Graduate)p;                  // fine: p really is a Graduate

Person q = new Student();
Graduate bad = (Graduate)q;                // InvalidCastException at run time
```

An object is **never changed** by a cast. The cast only changes how the compiler looks at it. A `Student` object stays a `Student`, even if the variable is of the type `object`.

## Safe casts: `is` and `as`

To avoid the exception, **ask first**:

```csharp
if (p is Student)                          // true for Student and for Graduate
{
    Student s = (Student)p;
}

Student s2 = p as Student;                 // the same cast, but gives null instead of an exception
if (s2 != null)
{
    Console.WriteLine(s2.Course);
}
```

C# 7 combines the check and the cast in one step, with a **pattern**:

```csharp
if (p is Student st)                       // if p is a Student, then st is the Student variable
{
    Console.WriteLine(st.Course);
}
```

- `x is T` is `true` when the object **is** a `T` or **derived** from `T`. It is `false` for `null`.
- `x as T` returns the object as `T`, or **`null`**. It works only for reference types.
- `(T)x` returns the object as `T`, or throws **`InvalidCastException`**.

## What every object can do

Since all classes are derived from `object`, all objects have its members:

| Member | What it does |
|---|---|
| `ToString()` | A text for the object. By default, the name of its type. |
| `Equals(object)` | Equality. By default, for classes, the **same object** (the same reference). |
| `GetHashCode()` | A number used by `Dictionary` and `HashSet`. |
| `GetType()` | The actual type of the object. |

Two of them you can **redefine** in your own class, so that `ToString()` prints something useful. We do it at the end of the module, in the lecture about virtual methods.

## `object` as the universal type

A variable or a parameter of the type `object` accepts **anything**, even `int` (it is **boxed**: wrapped into an object). That is how `Console.WriteLine(object)` can print any value. The price: to use the value as a specific type again, you need a **downcast**, and you lose the compiler's help. In new code, prefer a specific base class or an interface instead of `object`.
