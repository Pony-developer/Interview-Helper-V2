Suppose that you need a method `IsPalindrome` for a `string`. You cannot add a method to the `string` class: it is not yours. You could write a static method `TextTools.IsPalindrome(s)`. But `s.IsPalindrome()` reads better, and it is what **extension methods** give you: a static method that is called as if it were an instance method of an existing type.

## The syntax

```csharp
static class StringExtensions                 // a static class...
{
    public static bool IsPalindrome(this string s)      // ...and "this" before the first parameter
    {
        string lower = s.ToLower();
        for (int i = 0; i < lower.Length / 2; i++)
        {
            if (lower[i] != lower[lower.Length - 1 - i]) return false;
        }
        return true;
    }
}

Console.WriteLine("Level".IsPalindrome());          // True
Console.WriteLine("hello".IsPalindrome());          // False
```

Three things make a method an extension method:

1. It is declared in a **static class** that is **not nested** in another class, and not generic.
2. The method itself is **static**.
3. Its **first parameter** has the modifier **`this`**. The type of that parameter is the type that is being extended.

The call `"Level".IsPalindrome()` is turned by the compiler into `StringExtensions.IsPalindrome("Level")`. It is only a **different syntax** for a static method call. The two forms are equivalent.

## More parameters

The rest of the parameters are ordinary:

```csharp
static class StringExtensions
{
    public static string Truncate(this string s, int maxLength)
    {
        if (s.Length <= maxLength) return s;
        return s.Substring(0, maxLength - 3) + "...";
    }

    public static int WordCount(this string s)
    {
        return s.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length;
    }
}

Console.WriteLine("Hello, World!".Truncate(8));     // Hello...
Console.WriteLine("a  b   c".WordCount());           // 3
```

## Extending any type

Not only `string`. You can extend arrays, numbers, collections, interfaces and your own classes:

```csharp
static class IntExtensions
{
    public static bool IsEven(this int n) => n % 2 == 0;
    public static int Squared(this int n) => n * n;
}

static class ArrayExtensions
{
    public static bool IsSorted(this int[] a)
    {
        for (int i = 1; i < a.Length; i++)
            if (a[i - 1] > a[i]) return false;
        return true;
    }
}

Console.WriteLine(7.IsEven());                       // False
Console.WriteLine(5.Squared());                      // 25
Console.WriteLine(new[] { 1, 2, 3 }.IsSorted());     // True
```

A **chain** reads left to right, like a sentence: `text.Trim().ToLower().Truncate(20)`.

## You already use them: LINQ

**LINQ**, the library for querying collections, is a set of extension methods on `IEnumerable<T>`:

```csharp
using System.Linq;

int[] numbers = { 5, 2, 8, 1 };
int total = numbers.Sum();                    // an extension method
int biggest = numbers.Max();
var sorted = numbers.OrderBy(n => n).ToArray();
```

These methods are not part of `int[]`. They live in the static class `System.Linq.Enumerable`, and the `using System.Linq;` line brings them into view.

## Visibility: namespaces

An extension method is available only where its **namespace is imported**. If it is in another namespace, add a `using` for it. If the method does not appear in the suggestions, a missing `using` is the first suspect.

## The rules and the limits

- **An instance method wins.** If the type already has a method with the same name and the same parameters, the call goes to the instance method, and your extension is silently ignored.
- **No access to private members.** An extension method is outside the type, so it sees only the **public** interface. It cannot break encapsulation.
- **It cannot be overridden**, and it is not part of the type's inheritance.
- **`this` may be `null`.** The call `nullString.IsPalindrome()` does not fail at the call itself: the method is called with `null` as the argument. Check for it, when it matters.

```csharp
public static bool IsNullOrBlank(this string s) => s == null || s.Trim().Length == 0;   // works on null
```

## When to write one

Write an extension method when:

- you want to add a useful operation to a type that you **cannot change** (the standard library, a third-party library);
- the operation can be expressed with the **public** members of the type;
- it reads naturally as an action on the object: `text.Truncate(20)`, `order.Total()`.

Do not write one when:

- you own the type: **add an ordinary method** to the class;
- the operation only makes sense in one place: a private helper method will do;
- the name is vague and **pollutes** the suggestions of a very common type (an extension `Do()` on `object` would appear everywhere).

## Good habits

- Put the extension methods of one theme in one static class named `<Type>Extensions` (`StringExtensions`, `EnumerableExtensions`).
- Name them as **natural verbs or questions**: `IsPalindrome`, `Truncate`, `ToTitleCase`.
- Keep them **small and pure**: no hidden state, no surprising side effects.
- Document what happens with `null` and with an empty input.

## The summary

- An extension method is a **static method** in a **static class**, with `this` before its first parameter.
- It is called like an instance method, and it is equivalent to a normal static call.
- It sees only the **public** part of the type, and cannot replace an existing instance method.
- LINQ is the best-known example.
