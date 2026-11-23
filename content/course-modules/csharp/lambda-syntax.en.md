Write the lambda expressions that `Main` needs. Each variable is declared as a `Func` or an `Action`, and it is set to `null` at the moment. Replace every `null` with a lambda:

- `square`: takes `x` and returns `x * x`;
- `add`: takes `a` and `b` and returns their sum;
- `isEven`: takes `n` and returns `true` if it is even. Write it as a block lambda with `return`;
- `answer`: takes no parameters and returns `42`;
- `shout`: takes a text and writes it in upper case (use `ToUpper()`).

Do not change `Main`. Expected output:

```text
49
7
True
False
42
HI
```

The lines in order: `square(7)`; `add(2, 5)`; `isEven(10)`; `isEven(7)`; `answer()`; and `shout("hi")`, which writes `HI`.

Hint: `() => 42` is a lambda with no parameters. For the block lambda, write `n => { ... return n % 2 == 0; }`.
