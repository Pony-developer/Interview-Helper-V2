When you pass an array to a method, the method receives a **copy of the reference**. It sees the same array as the caller, and that has two consequences.

## 1. Changing the elements is visible to the caller

```csharp
static void Double(int[] numbers)
{
    for (int i = 0; i < numbers.Length; i++)
    {
        numbers[i] *= 2;
    }
}

static void Main()
{
    int[] data = { 1, 2, 3 };
    Double(data);
    Console.WriteLine(data[0] + " " + data[1] + " " + data[2]);   // 2 4 6
}
```

The method did not return anything, yet `data` changed, because `numbers` and `data` are two names for one array.

Compare this with an `int` parameter, which is a **copy of the value**: `static void AddOne(int x) { x++; }` never changes the caller's variable.

## 2. Reassigning the parameter is not visible

Making the parameter refer to a different array changes only the method's own copy of the reference:

```csharp
static void Replace(int[] numbers)
{
    numbers = new int[] { 99 };   // numbers now points to a new array
}

int[] data = { 1, 2, 3 };
Replace(data);
Console.WriteLine(data[0]);   // 1: the caller still has the old array
```

If you want the caller to get a new array, **return** it:

```csharp
static int[] Replace()
{
    return new int[] { 99 };
}

data = Replace();
```

(There is also the `ref` keyword, which passes the variable itself, but returning a value is usually clearer.)

## Two styles of method

| Style | Signature | Behaviour |
| --- | --- | --- |
| **Changes the array in place** | `static void Reverse(int[] a)` | fast, no extra memory, but the original is gone |
| **Builds a new array** | `static int[] Reversed(int[] a)` | the original is untouched, at the price of a new array |

Pick one deliberately, and let the name and a comment say which it is. A method called `Sorted` or `GetSquares` should not quietly modify its argument, and a method called `Sort` or `Fill` should.

An in-place example, reversing by swapping the two ends:

```csharp
static void Reverse(int[] a)
{
    for (int i = 0, j = a.Length - 1; i < j; i++, j--)
    {
        int temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}
```

And the version that builds a new array:

```csharp
static int[] Reversed(int[] a)
{
    int[] result = new int[a.Length];
    for (int i = 0; i < a.Length; i++)
    {
        result[i] = a[a.Length - 1 - i];
    }
    return result;
}
```

## Returning an array

A method can create an array of the size it needs and return it:

```csharp
static int[] Range(int count)
{
    int[] result = new int[count];
    for (int i = 0; i < count; i++) result[i] = i;
    return result;
}

int[] numbers = Range(4);   // 0 1 2 3
```

## params: any number of arguments

A parameter marked `params` lets the caller list the values instead of building an array:

```csharp
static int Sum(params int[] numbers)
{
    int total = 0;
    foreach (int n in numbers) total += n;
    return total;
}

Console.WriteLine(Sum(1, 2, 3));        // 6
Console.WriteLine(Sum());               // 0: an empty array
Console.WriteLine(Sum(new[] { 4, 5 })); // 9: an array works too
```

`params` must be the **last** parameter, and there can be only one.

## Be careful with the unexpected input

- The caller may pass `null`: `numbers.Length` will then throw a `NullReferenceException`. Decide whether your method should check, or document that the argument must not be null.
- The array may be empty. Does your method work for it?
- If you need to keep the array after the method returns, store a **copy**. Otherwise the caller can change your data behind your back.
