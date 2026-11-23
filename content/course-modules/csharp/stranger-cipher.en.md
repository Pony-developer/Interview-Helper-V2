A stranger leaves a note in a language you know, but the letters have been moved: every letter was replaced with the one that stands `shift` places later in the alphabet. This is the **Caesar cipher**, used two thousand years ago.

Implement two methods for the English alphabet (26 letters):

- `Encrypt(text, shift)` moves every letter forward by `shift` places, **wrapping around** at the end of the alphabet: `x` with a shift of 3 becomes `a`.
- `Decrypt(text, shift)` undoes `Encrypt` with the same shift.

The rules:

- the **case** of a letter is kept: `A` stays a capital and `a` stays lower case;
- everything that is not an English letter (spaces, digits, punctuation, other alphabets) is copied **unchanged**;
- the shift may be negative or larger than 26: a shift of 29 is the same as 3, and a shift of -1 moves letters back.

Examples: `Hello, World!` with the shift 3 gives `Khoor, Zruog!`. `Abc` with the shift -1 gives `Zab`.

Do not change `Main`. Expected output:

```text
Khoor, Zruog!
abc
Zab
Whvw
Hello, World!
Attack at dawn
```

Hint: the position of a letter in its alphabet is `c - 'a'` (or `c - 'A'` for capitals). Add the shift and take the remainder by 26. In C#, the remainder of a negative number is negative, so use `((x % 26) + 26) % 26`. Then convert back with `(char)('a' + position)`.
