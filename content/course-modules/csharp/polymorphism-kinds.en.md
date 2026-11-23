"Polymorphism" means "many forms", and in C# the word covers **three different mechanisms**. They are often mixed up, so it is worth to separate them.

## 1. Overloading: the choice at compile time

Several methods with the **same name** and **different parameters**. The compiler chooses one **while it compiles**, by the **declared types** of the arguments:

```csharp
static string Show(int n) { return "int:" + n; }
static string Show(double d) { return "double:" + d; }
static string Show(string s) { return "string:" + s; }
static string Show(object o) { return "object:" + o; }

Console.WriteLine(Show(5));            // int:5
Console.WriteLine(Show(5.5));          // double:5.5
Console.WriteLine(Show("hi"));         // string:hi

object o = "hi";
Console.WriteLine(Show(o));            // object:hi    <- the declared type is object, though the object is a string
```

The last line is the important one: **the actual type of the object does not matter** for an overload. The compiler knows only that `o` is declared as `object`, and it chooses `Show(object)`.

How the compiler decides:

1. It takes all the methods with this name whose parameters **accept** the arguments (the types match, or there is an implicit conversion).
2. Among them, it chooses the **best** one: the one that needs the "smaller" conversion. An exact match is the best. If `int` can be converted to `double`, but `double` cannot be converted to `int`, then `int` is the better target for an `int` value.
3. If there is **no single best** method, it is a compile error ("The call is ambiguous").

```csharp
Show('x');        // char: converts to int (and to double, and to object); int is the best -> "int:120"
Show(5L);         // long: converts to double and object, not to int; double is better -> "double:5"
```

The return type and parameter **names** do not take part in the choice. Two methods may not differ **only** in the return type.

## 2. Overriding: the choice at run time

The method is `virtual` in a base class, and **derived classes replace it**. The choice is made **while the program runs**, by the **actual type** of the object:

```csharp
Animal a = new Dog();
Console.WriteLine(a.Sound());          // the version of Dog, though the declared type is Animal
```

It is the opposite of overloading: here the **declared type does not matter**, and the **actual** one does. This is what people usually mean by "polymorphism" in object-oriented programming. It is also called **subtype polymorphism**: you can use a derived object wherever a base object is expected.

| | Overloading | Overriding |
|---|---|---|
| The choice is made | By the compiler, before the run | By the runtime, during the run |
| Depends on | The **declared** types of the arguments | The **actual** type of the object |
| Needs | Same name, different parameters | `virtual` / `abstract` and `override`, or an interface |
| Also called | Static or "ad hoc" polymorphism | Dynamic or subtype polymorphism |

## 3. Generics: one code for many types

The third kind is **parametric polymorphism**. The code is written once, **for any type**, which is a parameter:

```csharp
List<int> numbers = new List<int>();
List<string> words = new List<string>();      // the same class List<T>, with different T

static T Larger<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) >= 0 ? a : b;
}
Console.WriteLine(Larger(3, 7));              // 7
Console.WriteLine(Larger("pear", "apple"));   // pear
```

You use generics every day in collections. Writing your own generic methods and classes is a topic for later, but remember that `List<T>` and `Dictionary<K, V>` are polymorphism too.

## A trap: overloading mixed with inheritance

```csharp
class Animal { }
class Dog : Animal { }

static string Describe(Animal a) { return "animal"; }
static string Describe(Dog d) { return "dog"; }

Animal pet = new Dog();
Console.WriteLine(Describe(pet));              // animal! The declared type is Animal
Console.WriteLine(Describe(new Dog()));        // dog
```

A programmer who expects "dog" is thinking about **overriding**, but wrote an **overload**. If the behaviour depends on the object, make it a **virtual method** of the object (`pet.Describe()`), and do not rely on overloads of an outside function.

## Optional parameters and overloads

C# also has **default values** of parameters: `static void Print(string text, int times = 1)`. They are an alternative to a pair of overloads (`Print(text)` and `Print(text, times)`), and are shorter when the second form only fills in a default. Use overloads when the **behaviour** differs, and defaults when only a **value** is missing.

## Operators are overloads too

`a + b` for numbers and `a + b` for strings are two different methods that the compiler selects by the types. You can define operators for your own types (`public static Vector operator +(Vector a, Vector b)`), as in the practice task about vectors. It is again a **compile-time** choice.
