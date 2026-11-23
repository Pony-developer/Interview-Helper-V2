The **dragon curve** is a fractal that you get by folding a strip of paper in half again and again, and then unfolding it. Each crease turns to the left (`L`) or to the right (`R`). Reading the creases from one end gives a string of `L` and `R`.

The string for the step `n` is built from the string for the step `n − 1`:

1. `Dragon(1)` is `"R"`.
2. `Dragon(n)` is `Dragon(n − 1)`, then `"R"`, then the **reversed and flipped** copy of `Dragon(n − 1)`.

"Reversed" means that the characters go in the opposite order. "Flipped" means that every `L` becomes `R` and every `R` becomes `L`.

For example:

- `Dragon(1)` is `R`.
- Reversed `R` is `R`, flipped it is `L`. So `Dragon(2)` is `R` + `R` + `L` = `RRL`.
- `RRL` reversed is `LRR`, and flipped it is `RLL`. So `Dragon(3)` is `RRL` + `R` + `RLL` = `RRLRRLL`.

Implement `Dragon(n)` with loops: repeat the step `n − 1` times, and in each step build the new copy by going through the string **from the end** and appending the flipped character. Do not change `Main`, which also prints the length of `Dragon(10)`.

Expected output:

```text
R
RRL
RRLRRLL
RRLRRLLRRRLLRLL
RRLRRLLRRRLLRLLRRRLRRLLLRRLLRLL
1023
```

Hint: `Dragon(n)` has 2ⁿ − 1 characters, so the strings double in length at every step.
