The tool of hiding is an **access modifier**: a keyword before a member that says who may use it.

| Modifier | Who can use the member |
|---|---|
| `public` | Everybody: any code that sees the class |
| `private` | Only the code **inside the same class** |
| `protected` | The class and its **derived** classes |
| `internal` | Any code of the same project (assembly) |

If you write **no modifier** on a member of a class, it is **`private`**. For the class itself (not nested), the default is `internal`.

## private in action

```csharp
class BankAccount
{
    private decimal balance;                     // hidden

    public void Deposit(decimal amount)          // public operation
    {
        if (amount <= 0) return;                 // the rule is kept here
        balance += amount;
    }

    public decimal GetBalance()                  // public way to read
    {
        return balance;
    }
}

var account = new BankAccount();
account.Deposit(100);
Console.WriteLine(account.GetBalance());         // 100
// account.balance = 1000000;                    // error CS0122: 'BankAccount.balance' is inaccessible due to its protection level
```

The compiler **forbids** the last line, so nobody can break the rule `amount > 0` by writing to `balance` directly. The only way in is `Deposit`, and it keeps the rule.

Inside the class, `private` members are fully available, even for **another object of the same class**:

```csharp
public bool HasMoreThan(BankAccount other)
{
    return balance > other.balance;              // fine: we are inside BankAccount
}
```

## What to make private

Make **private** everything that is **not needed outside**:

- **all fields** (almost always). The state of the object is its secret;
- the **helper methods** that only break a long method into parts;
- any detail that you may want to **change later**.

Make **public** only the small set of operations that make **the purpose** of the class. This set is called the **public interface** (or API) of the class. The smaller it is, the easier the class is to understand, to use and to change.

## The freedom to change

There is a second, quieter benefit. If the balance is private, the class can change **how** it keeps it (as `decimal`, or in cents as `long`) and nothing outside is affected. If the field was public, every line that used it would need an update. What is hidden can be changed freely, and what is public is a **promise** that must be kept.

```csharp
class Temperature
{
    private double celsius;                      // today: Celsius
    // tomorrow it can be Kelvin inside; the public methods keep working
    public double InFahrenheit() { return celsius * 9 / 5 + 32; }
}
```

## A typical mistake: a public field

```csharp
class Player
{
    public int Health;                           // anybody can write -100 or 1000000
}
```

Remember the rule of the first lecture: if a rule exists, **somebody** has to guard it, and a public field has nobody to do it. A rule of thumb: **fields are `private`, behaviour is `public`**.
