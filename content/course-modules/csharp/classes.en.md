So far, your data lived in separate variables and arrays, and your logic lived in separate methods. Real programs model things from the world: a book, a customer, a bank account, a point on a plane. **Object-oriented programming (OOP)** groups the **data** of such a thing and the **operations** on that data in one place. The blueprint is a **class**. A thing built from the blueprint is an **object** (also called an **instance**).

## A first class

```csharp
class Book
{
    public string Title;          // fields: the data of every book
    public string Author;
    public int Pages;

    public string Describe()      // a method: what a book can do
    {
        return Title + " by " + Author + " (" + Pages + " pages)";
    }
}
```

The class says what every `Book` **has** (fields) and what it can **do** (methods). It is a description. Nothing exists until you create an object:

```csharp
Book book = new Book();           // new creates an object
book.Title = "The Hobbit";
book.Author = "J.R.R. Tolkien";
book.Pages = 310;

Console.WriteLine(book.Describe());   // The Hobbit by J.R.R. Tolkien (310 pages)
```

`new Book()` builds an object, and the variable `book` refers to it. The dot reaches a member of **that** object. Another object has its own fields:

```csharp
Book other = new Book();
other.Title = "Poems";
Console.WriteLine(book.Title);    // The Hobbit: the two objects are independent
```

## The parts of a class

| Member | What it is | Example |
| --- | --- | --- |
| **Field** | a variable that belongs to an object | `public int Pages;` |
| **Method** | code that works with the object's data | `public string Describe()` |
| **Constructor** | code that runs when the object is created | `public Book(...)` |
| **Property** | a field with controlled access (next lecture) | `public int Pages { get; set; }` |

## Constructors

A **constructor** has the name of the class, **no return type**, and it prepares a new object. A class whose objects are useless without some data should ask for it:

```csharp
class Book
{
    public string Title;
    public string Author;
    public int Pages;

    public Book(string title, string author, int pages)
    {
        Title = title;
        Author = author;
        Pages = pages;
    }

    public string Describe() => Title + " by " + Author + " (" + Pages + " pages)";
}

var book = new Book("The Hobbit", "J.R.R. Tolkien", 310);   // an object that is ready to use at once
```

If you do not write a constructor, C# provides an empty one with no parameters. **As soon as you write your own**, the empty one is gone, and `new Book()` becomes an error: now every book must be created with the three values.

## this

Inside a method or a constructor, **`this`** is the object that the method is working on. It is needed when a parameter has the same name as a field:

```csharp
public Book(string title)
{
    this.Title = title;     // this.Title is the field, title is the parameter
}
```

In other cases `this.` can be left out: `Title` alone means `this.Title`.

## Access: public and private

`public` means "anyone can use this". `private` means "only the code **inside this class**":

```csharp
class Account
{
    private decimal balance;               // hidden from the outside

    public void Deposit(decimal amount)
    {
        if (amount > 0) balance += amount;
    }
    public decimal GetBalance() => balance;
}

var account = new Account();
account.Deposit(100);
// account.balance = 1000000;    // error: 'balance' is inaccessible
```

This is **encapsulation**: the class protects its own data and offers a few safe operations. Nobody can put the object into a nonsensical state, such as a negative balance, because the only way in is through code that you wrote. Members without a modifier are `private` by default, but write it out.

## Objects are references

A class is a **reference type**, as arrays are. The variable holds a **reference** to the object, not the object itself:

```csharp
Book a = new Book("The Hobbit", "Tolkien", 310);
Book b = a;                 // b refers to the SAME object
b.Pages = 400;
Console.WriteLine(a.Pages); // 400

Book none = null;           // refers to nothing
// none.Describe();         // NullReferenceException
```

Assigning copies the **reference**. Passing an object to a method does the same, so the method can change the object that the caller sees. Two separate `new` calls make two separate objects, even when their fields are equal.

## Classes and structs

A **struct** looks like a class, but it is a **value type**: assigning it copies the whole value, and it has no `null`. Small, simple, immutable data, such as a point or a color, is a typical struct. Everything else, and everything that has identity or changes over time, is a class. In this module, we will write classes.

## Making a good class

- **A noun**, in PascalCase: `Book`, `BankAccount`, `Vector`.
- **One idea** per class. A class that does everything is a warning sign.
- **Hide the data** (`private`), and publish **operations** (`public`).
- **Ask for what is needed** in the constructor, so that no object is half-ready.
- **Override `ToString()`** to say what the object is. `Console.WriteLine(book)` then prints something useful:

```csharp
public override string ToString() => Title + " (" + Pages + ")";
```

## Where to put classes

Classes are declared next to `Program`, or in their own files, at the top level of the file. By convention, **each class lives in a file with its name** (`Book.cs`). In the practice tasks of this module, you write the classes above `Program`.
