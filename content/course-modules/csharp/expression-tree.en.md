A calculator needs to keep an **expression** as an object, to print it, to calculate it and to measure it. This is a classical case for polymorphism: the expression is a **tree**, and each kind of node knows how to handle itself.

The abstract class `Expr` is ready. It declares:

- `Evaluate(Dictionary<string, int> variables)`: the value of the expression;
- `Depth`: the number of **levels** of the tree;
- `ToString()`: the text of the expression.

**Write five classes derived from `Expr`:**

| Class | Constructor | `ToString()` | `Evaluate` | `Depth` |
|---|---|---|---|---|
| `Number` | `(int value)` | the number: `5` | the value | 1 |
| `Variable` | `(string name)` | the name: `x` | the value from the dictionary; if the name is **not** in it, throw an `InvalidOperationException` | 1 |
| `Add` | `(Expr left, Expr right)` | `(left + right)`, with the **brackets** | the sum | `1 +` the bigger depth of the two |
| `Multiply` | `(Expr left, Expr right)` | `(left * right)`, with the brackets | the product | `1 +` the bigger depth of the two |
| `Negate` | `(Expr inner)` | `-inner`: a minus without a space | the opposite number | `1 +` the depth of `inner` |

The operands can be **any** `Expr`, including other `Add`, `Multiply` and `Negate`: this is why the structure is a tree. Do not change `Main`. Expected output:

```text
((2 + 3) * x)
20
3
-(x + 10) = -14
3
(((2 + 3) * x) + -(x + 10))
6
4
unknown variable
```

The lines in order, for `x = 4`: the expression `(2 + 3) * x` as text; its value; its depth; the expression `-(x + 10)` with its value; its depth; the sum of the two expressions as text; its value; its depth; and the message for a variable that is missing from the dictionary.

Hint: a binary node keeps two `Expr` fields, and calls `Evaluate`, `ToString` and `Depth` of **both**. It does not care what the operands are: a number, a variable or a whole subtree. The method that the node calls on its child is **chosen by the actual type of the child**. This is the polymorphism, and no `if (x is Number)` is needed anywhere. Use `Math.Max` for the depth. In a class derived from `Expr`, `ToString` is written as `public override string ToString()`.
