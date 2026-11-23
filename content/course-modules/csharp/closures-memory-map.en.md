How does the compiler make a closure work? A variable that is captured cannot live only on the stack, because it must survive the method that created it. So the compiler moves it to the heap, inside a small hidden object that holds all the captured variables.

## The source

```csharp
static Func<int> MakeCounter()
{
    int count = 0;
    return () => ++count;
}
```

## What the compiler produces (simplified)

```csharp
class HiddenClosure
{
    public int count;                    // the captured variable became a field

    public int Lambda()
    {
        return ++count;
    }
}

static Func<int> MakeCounter()
{
    var closure = new HiddenClosure();   // one object for the variables of this call
    closure.count = 0;
    return closure.Lambda;               // the delegate remembers the object
}
```

## The picture

```text
stack                             heap
-----                             ----
next  ------------------------>   [delegate: method = Lambda, target = closure]
                                          |
                                          v
                                  [HiddenClosure: count = 2]
```

The variable `count` no longer lives on the stack. It is a field of the object on the heap, and the delegate keeps that object alive.

## Shared variables

Two lambdas that capture the same variable share one object. Both see the same `count`:

```csharp
static void MakePair(out Func<int> get, out Action increment)
{
    int value = 0;
    get = () => value;
    increment = () => value++;
}

Func<int> read;
Action add;
MakePair(out read, out add);
add();
add();
Console.WriteLine(read());               // 2: both lambdas use the same variable
```

## Cost

Capturing a variable adds an allocation on the heap. Capturing nothing is cheaper: the compiler then creates the delegate once and reuses it. This is an optimisation the compiler does for you, and it does not change the behaviour.
