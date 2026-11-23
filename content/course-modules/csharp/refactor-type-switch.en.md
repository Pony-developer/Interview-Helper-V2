The program below calculates the areas with a **chain of type checks**: the static class `Geometry` has the methods `Area(object)` and `Name(object)`, and each of them asks "is this a circle? a square? a rectangle?". `Main` already uses the **new** style, `shape.Area` and `shape.Name`, so the program does not compile.

**Refactor it to polymorphism:**

1. Create an abstract class `Shape` with an abstract `Area` property (a `double`) and an abstract `Name` property (a `string`);
2. make `Circle`, `Square` and `Rectangle` derive from `Shape`, and **move the code of each branch** into the class: `Circle` gets the formula for the circle, and so on. Their fields become **`private readonly`**;
3. **delete** the class `Geometry`;
4. add a new class `Triangle(baseLength, height)` with the area `baseLength * height / 2`: **without editing anything else**. This is the test of the design.

Do not change `Main`. Expected output:

```text
Circle: 12.57
Square: 9
Rectangle: 12
Triangle: 9
Total: 42.57
```

The lines in order: for each shape, its `Name` and its `Area` rounded to two decimals (a circle of the radius 2, a square with the side 3, a rectangle 3 × 4, a triangle with the base 6 and the height 3); and the total area of all four, which `Main` counts with the ready method `TotalArea`, which knows only the type `Shape`.

Hint: the names are `Circle`, `Square`, `Rectangle` and `Triangle`. Each `Area` is `public override double Area => ...;`, and each `Name` is `public override string Name => "...";`. If you did everything correctly, the new `Triangle` class is the **only** place where the triangle is mentioned, and `TotalArea` did not need any change.
