A **slug** is the readable part of a web address made from a title: `"Hello, World!"` becomes `hello-world`. `Main` has seven tests for `Slugify`, written in the same style as in the previous task. Most of them are red.

Implement `Slugify(title)` so that every test turns **green**. Do not change the tests. The rules, which the tests express:

- all letters become **lower case**;
- letters and digits are kept;
- every run of **other** characters (spaces, punctuation, symbols) becomes a **single** hyphen `-`;
- there is **no** hyphen at the start or at the end.

When everything passes, the output is:

```text
ok: simple
ok: punctuation
ok: many spaces
ok: digits
ok: empty
ok: only symbols
ok: already a slug
```

Hint: go through the characters. Keep a flag "a separator is waiting". When you meet a letter or a digit, first add the hyphen if the flag is set and the result is not empty, then add the lower-case character. At the end, the pending separator is simply dropped. `char.IsLetterOrDigit` and `char.ToLower` will help.
