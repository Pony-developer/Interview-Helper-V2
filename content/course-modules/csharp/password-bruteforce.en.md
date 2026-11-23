To crack a password by brute force, a program tries **every possible string** of a given length over an alphabet, one after another. Generating all of them is a recursion: choose the first character, then generate all the endings.

Implement `GeneratePasswords(alphabet, length)`. It returns a `List<string>` with **all** the strings of exactly `length` characters, each character taken from `alphabet`, with repetition allowed. The strings must come in the order in which the characters are listed in the alphabet, as when counting: for the alphabet `"ab"` and the length 3, it is `aaa, aab, aba, abb, baa, bab, bba, bbb`.

A password of the length `0` is the single **empty string**, so the list has one element.

`Main` generates passwords of the length 3 over `ab`, and of the length 4 over `abc`, and prints some facts. The last number of the first group is how many attempts a brute-force program would need to reach the password `cbca`: its position in the list, counting from 1. Do not change `Main`. Expected output:

```text
8
aaa aab aba abb baa bab bba bbb
81
aaaa bbbb cccc
70
1
```

Lines in order: the number of passwords, and all of them; then, for `abc` with 4 characters, the number of passwords (3⁴ = 81), the first, the one in the middle (index 40) and the last one; the number of attempts for `cbca`; and the number of passwords of the length 0 over `xyz`.

Hint: write a helper that takes the string built so far. When its length reaches `length`, add it to the list. Otherwise, loop over the characters of the alphabet and call the helper with the string extended by that character.
