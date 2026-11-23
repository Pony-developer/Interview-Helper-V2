Write three methods that analyse a sentence. Words are separated by single spaces:

- `Longest(string text)`: the longest word. If two words have the same length, the one that comes first in the text;
- `LongestLength(string text)`: the length of the longest word;
- `LongWords(string text, int min)`: the words whose length is at least `min`, in the original order.

Split the text into words with `text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)`. Do not change `Main`. Expected output:

```text
jumped
6
quick brown jumped
```

The lines in order: the longest word of the sentence (`jumped`, with 6 letters); its length; and the words of at least five letters, in order.

Hint: `OrderByDescending(w => w.Length).First()` gives the longest word. `OrderBy` and `OrderByDescending` are stable, so the first of the equal-length words stays first. `Max(w => w.Length)` gives the length directly.
