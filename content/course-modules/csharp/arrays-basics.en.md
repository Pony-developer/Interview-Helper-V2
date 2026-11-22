An array is a fixed-size sequence of values of one type.

```csharp
int[] scores = new int[3];          // { 0, 0, 0 }: new arrays hold default values
int[] primes = { 2, 3, 5, 7 };      // initialised with values
var names = new[] { "Ann", "Bo" };  // type inferred: string[]
```

## Indexes and length

Indexes start at **0**, so the last element is at `Length - 1`:

```csharp
Console.WriteLine(primes[0]);                 // 2
Console.WriteLine(primes[primes.Length - 1]); // 7
primes[1] = 13;                               // arrays are mutable
```

Reading `primes[4]` throws an `IndexOutOfRangeException`: C# always checks array bounds.

## Going through an array

```csharp
for (var i = 0; i < primes.Length; i++)
    Console.WriteLine(i + ": " + primes[i]);

foreach (var p in primes)
    Console.WriteLine(p);
```

Use `for` when you need the index or want to change elements; `foreach` when you only read the values.

## Arrays are references

```csharp
int[] a = { 1, 2, 3 };
int[] b = a;      // b points to the same array
b[0] = 100;
Console.WriteLine(a[0]); // 100
```

Assigning an array copies the **reference**, not the elements. The same happens when you pass an array to a method: the method can change your array.

## Empty arrays

`new int[0]` is a valid array with `Length == 0`. Code that reads `numbers[0]` without checking the length first will crash on it, so think about the empty case.
