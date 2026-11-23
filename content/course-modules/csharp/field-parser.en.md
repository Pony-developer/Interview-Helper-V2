A program often receives records as text, and any record can be wrong. A parser must accept the good ones, and explain **what is wrong** with the bad ones, instead of crashing.

A record is a line of three fields separated by commas: `name,age,score`.

Implement `ParseRecord(line)`. It returns a text. The checks are made **in this order**, and the first problem found is the one reported:

1. The line must have **exactly three fields** when split by commas. Otherwise: `error: expected 3 fields`.
2. The **name** (with the spaces at the ends removed) must not be empty. Otherwise: `error: empty name`.
3. The **age** (spaces removed) must be a whole number from 0 to 150. Otherwise: `error: bad age`.
4. The **score** (spaces removed) must be a number from 0 to 100, with a dot as the decimal separator. Otherwise: `error: bad score`.

If everything is fine, the result is `OK: <name> (<age>) <score>`, where the score is written with **one decimal place**: `87.5` stays `87.5`, and `90` becomes `90.0`.

Use `int.TryParse` and `double.TryParse`, so that bad input never throws an exception. For the score, use `NumberStyles.Float` and `CultureInfo.InvariantCulture`, so that `87.5` is read the same way on every computer. The `using` lines are already there.

Do not change `Main`. Expected output:

```text
OK: Ann (31) 87.5
OK: Bo (25) 90.0
error: expected 3 fields
error: expected 3 fields
error: empty name
error: bad age
error: bad age
error: bad age
error: bad score
error: bad score
OK: Jo (0) 0.0
OK: Kim (150) 100.0
error: empty name
```

The lines in `Main`, in the order of the output: `Ann,31,87.5`, ` Bo , 25 , 90 `, `Cy,40`, `Dan,1,2,3`, `,20,50`, `Eve,abc,50`, `Fay,-1,50`, `Gus,151,50`, `Hal,30,100.5`, `Ian,30,x`, `Jo,0,0`, `Kim,150,100` and `  ,30,50`.

Hint: format the score with `score.ToString("F1", CultureInfo.InvariantCulture)`. Think about the **borders** of the ranges: both 0 and 150 are allowed for the age, and both 0 and 100 for the score.
