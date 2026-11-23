Implement `RemoveSpaces(text)`. It returns the same text without any space characters.

Build the answer yourself with a loop: go through the characters, and add each one that is not a space to a new string. Do not use `Replace`, `Split` or `Join`. Remember that strings are immutable: `RemoveSpaces` must return a **new** string.

`Main` prints each result between square brackets, so that spaces and empty results are visible. Do not change `Main`. Expected output:

```text
[abc]
[helloworld]
[]
[nospaces]
[]
[xy]
```

Hint: start with `string result = "";`, and for every character `c` for which `c != ' '` do `result += c;`.
