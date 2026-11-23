**Refactoring** means improving the structure of code **without changing what it does**. The output stays the same, while the code becomes easier to read, to change and to test.

It is not the same as fixing a bug or adding a feature. Do those separately: mixing them makes it impossible to tell which change broke something.

## Rules of safe refactoring

1. **Have a way to check behaviour**: a test, or at least known input and output that you can compare.
2. **Take small steps**, and run the check after every one.
3. **Stop when the code is clear enough**, not when it is perfect.

## Common refactorings

**Rename**: replace `d` with `discount`, and `Calc` with `CalculateTotal`.

**Replace a magic number with a constant**:

```csharp
// before
int vat = price * 20 / 100;

// after
const int VatPercent = 20;
int vat = price * VatPercent / 100;
```

**Introduce an explaining variable**: split a dense expression into named pieces.

```csharp
// before
double result = (a * a + b * b) * 3.14159 / 2;

// after
double squares = a * a + b * b;
double half = squares / 2;
double result = half * Math.PI;
```

**Extract a method**: this is the most important one.

## Extracting a method

When the same lines appear in several places, or a block deserves a name, move it into a method. Here the same logic is written three times, and one copy has a typo:

```csharp
int vatA = priceA * 20 / 100;
Console.WriteLine("Laptop: " + priceA + " + VAT " + vatA);

int vatB = priceB * 20 / 100;
Console.WriteLine("Mouse: " + priceB + " + VAT " + vatB);

int vatC = priceC * 2 / 100;     // oops: 2 instead of 20
Console.WriteLine("Cable: " + priceC + " + VAT " + vatC);
```

After the extraction there is one copy of the logic, so there is only one place to get right:

```csharp
const int VatPercent = 20;

static void PrintWithVat(string name, int price)
{
    int vat = price * VatPercent / 100;
    Console.WriteLine(name + ": " + price + " + VAT " + vat);
}

PrintWithVat("Laptop", priceA);
PrintWithVat("Mouse", priceB);
PrintWithVat("Cable", priceC);
```

The steps are mechanical:

1. Select the repeated code and decide what **varies** between the copies: those are the parameters.
2. Give the method a name that says what it does.
3. Whatever the code calculates for the caller becomes the return value.
4. Replace every copy with a call.

The **rule of three** helps you decide when: copy once if you must, but the third time, extract.

## What makes a good method

- It does **one thing**, and its name says which.
- It is short enough to read at a glance.
- It has few parameters (up to three or four is comfortable).
- It **calculates or prints, not both.** A method that returns a value can be tested; one that prints directly cannot be checked without reading the screen. Calculate in one method, print in another.

```csharp
static int PriceWithVat(int price) => price + price * VatPercent / 100;   // calculates
static void PrintPrice(string name, int price) { /* ... */ }              // prints
```

## When not to refactor

- When the code has no way of being checked, and you cannot tell whether you broke it.
- When the code will be thrown away tomorrow.
- When you are tempted to "improve" everything at once. Pick the one thing that bothers you most today.
