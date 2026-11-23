The abstract class `Shape` is ready: it declares the abstract properties `Area`, `Perimeter` and `Name`, and a ready method `Describe()` that uses them. **Write three derived classes:**

- `Rectangle(width, height)`: the name is `Rectangle`;
- `Circle(radius)`: the name is `Circle` (the perimeter is the circumference `2πr`);
- `Triangle(a, b, c)`: the name is `Triangle`, and the three arguments are the **sides**. The area comes from **Heron's formula**: with `s = (a + b + c) / 2`, the area is `√(s · (s − a) · (s − b) · (s − c))`. If the three sides **cannot** form a triangle (each side must be shorter than the sum of the other two), the constructor throws an `ArgumentException`.

All the numbers are `double`. Do not change `Shape` or `Main`. Expected output:

```text
Rectangle: area 12, perimeter 14
Circle: area 3.14, perimeter 6.28
Triangle: area 6, perimeter 12
Rectangle
not a triangle
```

The lines in order: `Describe()` of a 3 × 4 rectangle, a circle of the radius 1, and a triangle 3-4-5, which the program keeps in **one array** of the type `Shape[]`; the name of the shape with the biggest area (found by the ready method `Largest`, which knows only the type `Shape`); and the message from the attempt to create a triangle with the sides 1, 2 and 10.

Hint: every property is `public override double Area => ...;`. Note that `Describe()` is written **once**, in `Shape`, and it works for all three classes, even for those that did not exist when it was written. Keep the radius and the sides in `private readonly` fields.
