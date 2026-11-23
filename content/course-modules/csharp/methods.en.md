A **method** is a named block of code that you can run whenever you need it. You have already used methods that other people wrote (`Console.WriteLine`, `Math.Sqrt`, `ToUpper`) and one that you wrote yourself: `Main`. Writing your own methods lets you name a piece of logic, reuse it and test it separately.

## Anatomy of a method

```csharp
static int Add(int a, int b)
{
    return a + b;
}
```

- `static` for now, write it on every method; it will be explained in the object-oriented modules.
- `int` is the **return type**: the type of the value the method gives back.
- `Add` is the name. Methods use **PascalCase**, and the name is usually a verb or a question: `Add`, `PrintReport`, `IsEven`.
- `(int a, int b)` are the **parameters**: variables that receive the inputs.
- `return` ends the method and hands the value back to the caller.

## Calling a method

The values you pass in a call are **arguments**. They are matched to parameters by position:

```csharp
static void Main()
{
    int sum = Add(2, 3);                    // 5
    Console.WriteLine(Add(sum, 10));        // 15
    Console.WriteLine(Add(Add(1, 2), 4));   // 7, a call can be an argument
}
```

The compiler checks the call: the number of arguments must match, and each argument must fit its parameter's type. `Add("2", 3)` does not compile.

## void

A method that does something but returns nothing has the return type `void`:

```csharp
static void Greet(string name)
{
    Console.WriteLine("Hello, " + name + "!");
}

Greet("Ann");   // Hello, Ann!
```

You call a `void` method as a statement. You cannot store its result, because there is none.

## return

`return` stops the method at once, so any code below it does not run. A method with a non-void return type must return a value on **every** path through it, otherwise it does not compile:

```csharp
static int Twice(int x)
{
    int result = x * 2;
    // error CS0161: 'Twice(int)': not all code paths return a value
}
```

The fix is to finish with `return result;`.

## Short form

A method that is just one expression can be written with `=>`:

```csharp
static int Square(int x) => x * x;
```

## Arguments are copies

When you pass a variable, the method receives a **copy** of its value, so changing the parameter does not change the caller's variable:

```csharp
static void AddOne(int x)
{
    x = x + 1;
}

int n = 5;
AddOne(n);
Console.WriteLine(n);   // 5
```

If you want a result, return it and assign it: `n = AddOne(n);`.

## Optional parameters and overloads

A parameter can have a default value, and you can name arguments in a call:

```csharp
static string Greeting(string name, string word = "Hello")
{
    return word + ", " + name + "!";
}

Console.WriteLine(Greeting("Ann"));                 // Hello, Ann!
Console.WriteLine(Greeting("Ann", "Welcome"));      // Welcome, Ann!
Console.WriteLine(Greeting(word: "Hi", name: "Bo")); // Hi, Bo!
```

Several methods may share a name if their parameter lists differ. This is **overloading**, and it is how `Console.WriteLine` accepts so many kinds of values:

```csharp
static int Twice(int x) => x * 2;
static double Twice(double x) => x * 2;
static string Twice(string s) => s + s;
```

## Variables inside a method

Variables declared inside a method, including its parameters, exist only there. Two methods can both have a variable called `total` without any clash. Methods can call each other, and `Main` is only the one that the runtime calls first.

## Why bother

- A name explains the intent better than five lines of arithmetic.
- You fix a bug in one place instead of in every copy.
- Small methods are easy to test: you call them with known inputs and compare the output with what you expect.
