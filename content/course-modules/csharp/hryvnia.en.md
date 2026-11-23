In Ukrainian the word for the currency changes with the number: *1 гривня*, *2 гривні*, *5 гривень*. A price tag that says "2 гривня" looks sloppy, so a program has to choose the right form. Here the forms are written in Latin letters:

| Form | Used for |
| --- | --- |
| `hryvnia` | numbers that end in 1, except 11: 1, 21, 101, 1001, … |
| `hryvni` | numbers that end in 2, 3 or 4, except 12, 13 and 14: 2, 3, 24, 102, 1002, … |
| `hryven` | everything else: 0, 5–20, 25–30, 100, 111, 112, … |

Implement `Hryvnias(n)`. It returns the number, a space, and the correct form: `21 hryvnia`, `4 hryvni`, `11 hryven`.

Note the teens (11–14): their last digit is 1, 2, 3 or 4, but they follow the `hryven` rule. Look at the last **two** digits first, then at the last one.

Do not change `Main`. Expected output:

```text
0 hryven
1 hryvnia
2 hryvni
4 hryvni
5 hryven
11 hryven
12 hryven
14 hryven
21 hryvnia
22 hryvni
25 hryven
100 hryven
101 hryvnia
111 hryven
112 hryven
1002 hryvni
```

Hint: `n % 10` is the last digit and `n % 100` is the last two digits.
