**Abstraction** is the skill of **keeping what is important and ignoring the rest**. A map of a city does not show every tree, because for a driver the roads matter. A map for a hiker shows the trees and hides the traffic lights. The same city has two different abstractions, and each of them is good for its **purpose**.

## Abstraction in everyday code

You use abstractions all the time:

```csharp
Console.WriteLine("Hello");                 // you do not know how the pixels appear
list.Sort();                                // you do not know which algorithm runs
File.ReadAllText(path);                     // you do not know about disks, buffers and encodings
```

Each line says **what** is done, and hides **how**. If the "how" did not exist as a hidden detail, every program would have to deal with the screen drivers and the disk blocks.

Abstraction works on several levels:

| Level | What it hides | Example |
|---|---|---|
| A method | The steps of an operation | `Math.Sqrt(x)` |
| A class | The data and the code that serve one idea | `List<T>`, `StringBuilder` |
| An interface | Even **which class** is used | `IEnumerable<T>`, `IComparable<T>` |
| A layer or a library | A whole area of the system | A database access library |

## The model depends on the purpose

When you design a class, you build a **model** of a real thing. Include only what the **task** needs:

```csharp
// For a library program, a book is:
class Book
{
    public string Title { get; }
    public string Author { get; }
    public bool IsBorrowed { get; private set; }
}

// For a book shop, the same thing is something else: an ISBN, a price, a number in stock.
```

Neither of them is "the true book". Adding the weight, the colour of the cover and the smell of the paper to the library class would make it **harder to use**, not better. A good abstraction is **small**.

## The contract

An abstraction is useful because it gives a **contract**: what the operation needs, what it returns, and when it fails. The caller depends **only on the contract**:

```csharp
/// Returns the position of the value, or -1 if there is no such value.
/// The array must be sorted in ascending order.
static int BinarySearch(int[] sortedValues, int value) { ... }
```

The caller does not care whether the search is binary, linear or jumping, as long as the promise is kept. The author can replace the algorithm tomorrow and nobody notices. That freedom is the reason to create abstractions.

## Abstraction and encapsulation

The two ideas are neighbours, and they are often confused:

- **Abstraction** answers: **what** does the user of this thing see? It is about the **design of the interface**: a good name, a small set of operations, a clear contract.
- **Encapsulation** answers: **how** is the inside protected? It is about the **mechanisms**: `private`, properties and invariants.

Abstraction chooses what to show, and encapsulation makes sure that **only that** can be reached.

## What is a good abstraction?

- **One idea**: you can explain the class in a sentence without the word "and".
- **A clear name**: `OrderRepository`, not `DataManager`.
- **Complete for the purpose**: the user does not need to look inside.
- **Small**: every extra public member is a promise that must be kept for years.
- **Not leaky**: the user is not forced to know about the details. If you must know that a "list" is a linked list to use it right, the abstraction **leaks**.

## How C# helps

C# has special tools for building abstractions, and the module shows them:

- **abstract classes**: a base type that cannot be created, and that describes **a part** of the behaviour;
- **interfaces**: a pure contract with no code;
- **template methods**: a fixed algorithm with parts that the derived classes fill in.
