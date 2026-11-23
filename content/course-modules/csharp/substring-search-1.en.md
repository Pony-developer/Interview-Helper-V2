Finding a pattern inside a text is a basic task: is `"ell"` in `"hello"`, and where? The simplest method is the **naive search**: try every starting position, and compare the pattern with the text there:

```csharp
static int NaiveSearch(string text, string pattern)
{
    for (int start = 0; start + pattern.Length <= text.Length; start++)
    {
        int i = 0;
        while (i < pattern.Length && text[start + i] == pattern[i])
        {
            i++;
        }
        if (i == pattern.Length)
        {
            return start;                 // every character matched
        }
    }
    return -1;                            // not found
}

Console.WriteLine(NaiveSearch("hello world", "world"));   // 6
Console.WriteLine(NaiveSearch("hello world", "xyz"));     // -1
```

## How it works

The outer loop chooses a starting position. The inner loop compares characters one by one, and stops at the first mismatch. If every character matched, the start position is the answer.

## The cost

For a text of length `n` and a pattern of length `m`, the worst case is about `n · m` comparisons. An example: the text `"aaaaaaaaab"` and the pattern `"aaab"`. At each position, the search matches up to three `a` before it fails, and it repeats this at every position.

For everyday use with short patterns, the naive search is fast enough, and it is easy to get right. The next lecture shows a method that avoids repeating the same comparisons, using a hash.
