Sometimes the specification is not a sentence but a handful of examples, and you have to work out the rule yourself.

Implement two methods, `F(n)` and `G(n)`, for whole numbers. These are the results the program is known to produce:

| n | `F(n)` | n | `G(n)` |
| --- | --- | --- | --- |
| 0 | 3 | 7 | 2 |
| 1 | 5 | 10 | 0 |
| 2 | 7 | 25 | 0 |
| 10 | 23 | 13 | 3 |

`Main` also calls both methods with other values, including a negative one, and prints them all, so a rule that merely fits the table will not be enough: find the **real** formula.

Do not change `Main`.

Hint: look at how much `F` grows when `n` grows by one. For `G`, think about the remainder operator and which divisor fits all four rows.
