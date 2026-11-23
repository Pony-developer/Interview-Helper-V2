A **static class** is a class that only has static members. You never create an object of it: it is a **container for functions** and constants that belong together.

```csharp
static class Geometry
{
    public const double Pi = 3.14159;

    public static double CircleArea(double radius) => Pi * radius * radius;
    public static double Hypotenuse(double a, double b) => Math.Sqrt(a * a + b * b);
}

Console.WriteLine(Geometry.CircleArea(2));      // 12.56636
```

## The rules

- The keyword `static` before `class`.
- **All** its members must be `static` (the compiler checks).
- You cannot create an object: `new Geometry()` is an error.
- It cannot be **inherited**, and it cannot inherit from another class (apart from `object`).
- It can have a **static constructor** to set up its static data.

Familiar static classes: `Math`, `Console`, `Convert`, `File`, `Directory`, `Path`, `Array`, `Enumerable` (LINQ).

## What they are for

**1. Pure functions.** Calculations that depend only on their arguments: no state, the same answer for the same input.

```csharp
static class MathTools
{
    public static int Gcd(int a, int b) => b == 0 ? a : Gcd(b, a % b);
    public static bool IsPrime(int n) { /* ... */ return true; }
}
```

**2. Constants** grouped under a name:

```csharp
static class Limits
{
    public const int MaxNameLength = 50;
    public const int MaxRetries = 3;
}
```

**3. Extension methods**, which **must** live in a static class (see the previous lectures).

**4. Factories and helpers** that create or convert objects:

```csharp
static class Converters
{
    public static Point FromText(string text) { /* parse "3,4" */ return null; }
}
```

## A word of caution: the cost of static

Static classes are easy to write and tempting to overuse. Three problems come with them.

**1. Hidden global state.** If a static class has **mutable static fields**, it is a global variable in disguise:

```csharp
static class Session
{
    public static string CurrentUser;       // anyone can change it, from anywhere
}
```

The behaviour of other code now depends on what **someone else** did earlier. Bugs of the type "it works alone and fails in the program" come from here.

**2. Hard to test.** A method that calls `File.ReadAllText`, `DateTime.Now` or `Console.ReadLine` **directly** cannot be tested without the real file, the real clock and a real person at the keyboard. With a static class, you cannot replace it with a fake.

**3. Hard to extend.** A static class cannot implement an interface, cannot be passed as an argument, and cannot be replaced by a different implementation.

## When a static class is the right tool

- The functions are **pure**, with no state and no dependencies: `Math`, `Gcd`, `Distance`.
- The data is **constant**.
- It is a set of **extension methods**.
- It is a **small** helper that cannot sensibly vary.

## When it is the wrong tool

When there is **state** that changes, **a dependency** on the outside world (a file, a database, the clock, the network), or **several implementations** are conceivable. Then use an **ordinary class**, which you create and pass around.

## Refactoring a static class into an ordinary class

A static class often grows by accumulating **state** that the methods pass around, or share through static fields. The typical symptoms:

- the same parameter is passed to **every** method (`Bank.Deposit(balance, amount)`, `Bank.Withdraw(balance, amount)`);
- several static methods work on a **shared** static variable;
- you wish you could have **two** of them, with separate data, and cannot.

The cure is to turn the repeated parameter and the shared data into the **fields of an object**, and the static methods into **instance methods**.

Before:

```csharp
static class Bank
{
    public static decimal Deposit(decimal balance, decimal amount) => balance + amount;
    public static decimal Withdraw(decimal balance, decimal amount) => balance - amount;
}

decimal balance = 100;
balance = Bank.Deposit(balance, 50);        // the caller has to carry the balance
balance = Bank.Withdraw(balance, 30);
```

After:

```csharp
class Account
{
    public decimal Balance { get; private set; }

    public Account(decimal balance) { Balance = balance; }

    public void Deposit(decimal amount) { Balance += amount; }
    public bool Withdraw(decimal amount)
    {
        if (amount > Balance) return false;
        Balance -= amount;
        return true;
    }
}

var account = new Account(100);
account.Deposit(50);                        // the object carries its own balance
account.Withdraw(30);
```

Benefits:

- the data and the rules for it are in **one place**;
- the **invariants** can be enforced (the balance cannot go below zero);
- you can have **many** accounts, each with its own data;
- the class is **easy to test**: create an object, call a method, check the property.

The steps of the refactoring:

1. Find the **data** that the methods share or repeatedly pass: that is the state of the new class.
2. Create the class, with this data in fields (properties), and a **constructor**.
3. Move the static methods in, remove the repeated parameter, and make them instance methods.
4. Update the callers: create an object, and call methods on it.
5. Keep the behaviour the same, and check it **after each step**.

## The singleton: a middle way

Sometimes there really should be **one** instance, such as a settings object. The **singleton** pattern gives you a single object of an ordinary class, with static access to it:

```csharp
class AppSettings
{
    public static AppSettings Instance { get; } = new AppSettings();
    private AppSettings() { }                 // nobody else can create one
    public string Theme { get; set; } = "light";
}

Console.WriteLine(AppSettings.Instance.Theme);
```

It is still global state, so use it very sparingly. Passing the object to those who need it (**dependency injection**) is cleaner, and that is what modern .NET applications do.

## The summary

- A static class is a **container of static members**, which cannot be instantiated.
- It is right for **pure functions, constants and extension methods**.
- It is wrong for **state** and for **dependencies**: use an ordinary class instead.
- To refactor, turn the repeated parameter into **fields**, and the static methods into **instance methods**.
