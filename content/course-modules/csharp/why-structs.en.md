You already use structs every day: `int`, `double`, `decimal`, `bool`, `char`, `DateTime`, `Guid` and `KeyValuePair<K, V>` are all structs. So when is it right to write your own?

## Use a struct when

- the type is **small** (a few fields, roughly up to 16 bytes);
- it represents **a single value**, which behaves like a number: a point, a color, a money amount, a date;
- it is **immutable**: once created, it does not change;
- instances are **short-lived** and many of them are created, such as temporary results or elements of a large array.

```csharp
struct Money
{
    public decimal Amount;
    public string Currency;
}
```

A struct array of a million elements is one block of memory. A class array of a million elements holds a million references, each pointing to a separate object, which the garbage collector must track.

## Use a class when

- the object has an **identity**: two objects with the same data are still different things (an order, a user, a file);
- it is **big**, or it is **changed often**, because each copy costs time;
- you need **inheritance** or **polymorphism** (a struct cannot inherit from a class);
- it may be **null**. A struct needs `Nullable<T>` (written `int?`) to be null.

## A quick comparison

| | Struct | Class |
|---|---|---|
| Stored in a variable | The data itself | A reference |
| Assignment | Copies the data | Copies the reference |
| Can be `null` | Only with `?` | Yes |
| Inheritance | No | Yes |
| Good for | Small values | Objects with identity |
| Risk | Copies are expensive if big | Shared changes surprise you |

## The main rule

If you are not sure, **start with a class**. Switch to a struct only when you have a clear reason: small size, value meaning, and a real performance need. Classes are easier to get right, and the design mistakes with structs (copies that are thrown away, changes that disappear) are harder to see.
