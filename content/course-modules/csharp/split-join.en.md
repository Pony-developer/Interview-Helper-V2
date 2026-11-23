`Split` cuts a string into an array of parts, and `string.Join` glues an array back into a string. Together they solve a large share of text tasks.

To split by spaces and **ignore empty pieces**, which appear when there are several spaces in a row, or at the ends, use this form:

```csharp
string[] words = text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
```

Implement three methods:

- `ReverseWords(text)` returns the words in the reverse order, separated by **single** spaces, with no spaces at the ends: `"the quick brown fox"` becomes `"fox brown quick the"`.
- `Acronym(phrase)` returns the first letters of the words, in capitals: `"portable network graphics"` becomes `"PNG"`.
- `CountWords(text)` returns the number of words, however many spaces separate them.

For a text with no words, `ReverseWords` returns an empty string, `Acronym` returns an empty string, and `CountWords` returns 0.

`Main` prints the results of `ReverseWords` inside square brackets, so that spaces at the ends would be visible. Do not change `Main`. Expected output:

```text
[fox brown quick the]
[world hello]
[]
PNG
ASAP
3
0
```

Hint: `Array.Reverse(words)` reverses the array in place, and `string.Join(" ", words)` glues it with single spaces. For the first letter, `char.ToUpper(word[0])`.
