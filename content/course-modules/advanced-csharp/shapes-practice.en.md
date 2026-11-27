## Task

Finish the shape hierarchy.

- **`Circle(double radius)`** stores the radius; its `Area` is π·r².
- **`Rectangle(double width, double height)`** stores both sides and passes the name `"Rectangle"` to the base; its `Area` is width × height.
- **`Square(double side)`** is a `Rectangle` with equal sides, but its `Name` must be `"Square"`.

The tricky part: `Square` can't pass its own name through the public `Rectangle(width, height)` constructor. Add a **`protected`** `Rectangle(string name, double width, double height)` constructor, make the public one chain to it with `: this(...)`, and call it from `Square` with `: base(...)`.

`Describe()` and `ToString()` are already written in `Shape`; don't change them.

Expected output:

```
Circle with area 3.14
Rectangle with area 7.00
Square with area 16.00
Total: 26.14
Square 3x3 is Rectangle: True
```
