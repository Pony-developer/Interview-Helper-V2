So far you have made other people's tests pass. Now you write the tests, and the program checks **how good they are**.

`Clamp(value, min, max)` limits a number to a range: it returns `min` if the value is below it, `max` if the value is above it, and the value itself otherwise.

`Main` has **seven implementations** of `Clamp`. One is correct, and six have a typical bug:

| Name | The bug |
| --- | --- |
| `ClampCorrect` | none |
| `NoLowerBound` | forgets to raise a value that is too small |
| `NoUpperBound` | forgets to lower a value that is too large |
| `ExclusiveMax` | treats `max` as if it were not allowed: it returns `max - 1` |
| `SwappedBounds` | returns `max` for a small value and `min` for a large one |
| `ReturnsMinInside` | returns `min` when the value is inside the range |
| `WrongLowerValue` | returns `min + 1` for a value that is too small |

Your job is the method `TestsAccept(clamp)`. It receives an implementation, which you can call like an ordinary method, `clamp(5, 0, 10)`, and runs **your own tests** on it. It returns `true` if **all** your tests pass for that implementation, and `false` as soon as one fails.

A good set of tests:

- **accepts** the correct implementation, so that no test expects a wrong answer;
- **rejects** each of the six buggy ones.

`Main` prints a verdict for each implementation. Do not change `Main`. Expected output:

```text
ClampCorrect: accepted
NoLowerBound: rejected
NoUpperBound: rejected
ExclusiveMax: rejected
SwappedBounds: rejected
ReturnsMinInside: rejected
WrongLowerValue: rejected
```

The starter code accepts everything, because it has no tests. Add them:

```csharp
if (clamp(5, 0, 10) != 5) return false;     // a value inside the range stays unchanged
```

Think about which **kinds of input** reveal each bug: a value inside the range, below it, above it, and exactly at each border. This is the same thinking as in the lectures on more tests and on test coverage: a good test is one that fails when the code is wrong.
