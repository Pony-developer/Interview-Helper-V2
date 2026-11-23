Write a delegate type and three methods, so that the program runs the way `Main` expects.

- Declare the delegate type `Operation`: it takes two `int` parameters and returns an `int`. Put the declaration above `Program`.
- Write the static methods `Add` and `Multiply`, which return the sum and the product of their two parameters.
- Write the static method `Apply(Operation op, int x, int y)`, which calls the delegate with `x` and `y` and returns the result.

Do not change `Main`. Expected output:

```text
5
6
14
40
6
9
```

The lines in order: the delegate variable `op` set to `Add`, then called with `2` and `3`; the same variable set to `Multiply`, called again; `Apply(Add, 10, 4)`; `Apply(Multiply, 10, 4)`; and then the two methods called through an array of the delegate type, once with `3` and `3` for each.

Hint: the declaration `delegate int Operation(int a, int b);` goes outside any method, and it has no body. The method `Apply` simply returns `op(x, y)`.
