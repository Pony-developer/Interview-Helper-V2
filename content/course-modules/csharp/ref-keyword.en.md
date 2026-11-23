The keyword `ref` in front of a parameter means: the method receives **a reference to the caller's variable itself**, not a copy. Changes made in the method are visible to the caller.

```csharp
static void Double(ref int x)
{
    x = x * 2;                 // changes the caller's variable
}

int n = 5;
Double(ref n);                 // the call also needs the keyword
Console.WriteLine(n);          // 10
```

Two rules:

- **The declaration and the call both write `ref`.** The compiler does not guess.
- **The variable must be assigned before the call**, because the method may read it.

```csharp
int m;
// Double(ref m);              // error CS0165: use of unassigned local variable
m = 4;
Double(ref m);
```

## ref with a struct

`ref` is most useful for structs: it lets a method change the struct without making a copy:

```csharp
struct Counter
{
    public int Value;
}

static void Reset(ref Counter c)
{
    c.Value = 0;               // changes the caller's struct
}

Counter counter = new Counter { Value = 9 };
Reset(ref counter);
Console.WriteLine(counter.Value);     // 0
```

## out: a cousin of ref

`out` is similar, with one difference: the variable does **not** need a value before the call, but the method **must assign** it before it returns. It is used for "give back more than one result":

```csharp
static bool TryDivide(int a, int b, out int result)
{
    if (b == 0)
    {
        result = 0;
        return false;
    }
    result = a / b;
    return true;
}

int q;
if (TryDivide(10, 2, out q)) Console.WriteLine(q);     // 5
```

## When to use ref

- when a method must **change** the caller's variable (`Swap`, `Double` above);
- when a struct is large, and copying it on each call is wasteful. Use `in` (C# 7.2) or plain `ref` in that case.

Do not use `ref` just to make a method look clever. A method that returns a new value is usually clearer.
