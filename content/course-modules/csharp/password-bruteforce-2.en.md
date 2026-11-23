A system has **password rules**, and an attacker who knows them does not try the invalid strings. Neither should you: generate only the passwords that satisfy the rules, and **cut the search** as soon as a partial password cannot be valid.

Implement `ValidPasswords(alphabet, length)`. It returns a `List<string>` with all the passwords of exactly `length` characters, drawn from the alphabet (repetition allowed), that satisfy **both** rules:

1. **No two equal characters next to each other.** `aab` is not allowed, and `aba` is.
2. **At least one digit** (`'0'` to `'9'`).

The passwords come in the order of the alphabet, as in the previous task.

For example, over the alphabet `ab1` with the length 5, the first valid passwords are `abab1`, `aba1a` and `aba1b`, and the last is `1b1b1`. There are **46** of them: 3 · 2⁴ = 48 strings have no equal neighbours, and 2 of those (`ababa` and `babab`) contain no digit.

`Main` checks several cases. Do not change `Main`. Expected output:

```text
46
abab1 aba1a aba1b ... 1b1b1
0
2: 121 212
```

The second case, `ab` with the length 3, has no digits at all, so no password is valid: the answer is 0. The third case, `12` with the length 3, gives `121` and `212`.

Hint: carry the **last character** and a flag "a digit has been used" through the recursion. Skip a character that equals the previous one **at once**, without building the rest: this prunes the search tree. Add the password to the result only when the length is reached **and** the flag is set. `char.IsDigit` tells you whether a character is a digit.
