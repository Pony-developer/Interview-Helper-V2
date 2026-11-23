Code is read many more times than it is written, and often by you, six months later. A **style error** is not a bug: the program works. But unreadable code hides real bugs and makes every change slower.

Compare:

```csharp
static double f(double a,double b){double c=a*b*0.2;return a*b+c;}
```

```csharp
static double PriceWithVat(double unitPrice, int quantity)
{
    const double VatRate = 0.2;

    double net = unitPrice * quantity;
    double vat = net * VatRate;
    return net + vat;
}
```

Both compute the same thing. Only one of them can be understood in five seconds.

## Names

- Types, methods and constants use **PascalCase**: `Program`, `PriceWithVat`, `VatRate`.
- Local variables and parameters use **camelCase**: `unitPrice`, `quantity`.
- A name should say **what** the thing is or does. Methods are verbs or questions (`PrintReport`, `IsEven`), and variables are nouns (`totalPrice`).
- Names of `bool` variables read like statements: `isReady`, `hasDiscount`.
- Avoid one-letter names (apart from a short loop counter or a maths formula), cryptic abbreviations such as `tmp2` or `cnt`, and numbered names such as `value1`, `value2`.
- Do not mix languages or styles within one project.

## Layout

- One statement per line.
- Indent every block by four spaces. In C# the opening `{` traditionally goes on its own line, aligned with the code that owns the block.
- Put a blank line between logical groups of statements, and spaces around operators: `a * b + c`.
- Keep lines short enough to read without scrolling sideways.
- Let the editor format the code for you: in Visual Studio press `Ctrl+K, Ctrl+D`.

## Magic numbers

A **magic number** is a literal whose meaning is not obvious:

```csharp
double total = price * 1.2;      // what is 1.2?
if (age >= 18) { /* ... */ }     // why 18?
```

Give it a name:

```csharp
const double VatMultiplier = 1.2;
const int AdultAge = 18;
```

## Comments

- Comment **why**, not **what**. `// add one to i` is noise, while `// the API counts pages from 1` is useful.
- If you need a comment to explain what a block does, consider a method with a good name instead.
- Delete commented-out code. Version control remembers it for you.
- Out-of-date comments are worse than none: update them with the code.

## Conventions are shared

A team agrees on one style and lets tools enforce it (`.editorconfig`, analysers, formatters). Which style is less important than that everyone uses the same one. Microsoft publishes its C# coding conventions, and following them is a safe default.
