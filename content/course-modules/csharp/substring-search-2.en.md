The **Rabin–Karp** algorithm uses a hash to compare the pattern with each window of the text quickly. Instead of comparing characters, it compares **hash values**. It needs one trick: a hash of each window must be updated in constant time as the window slides by one character. That is a **rolling hash**.

## The idea

1. Compute the hash of the pattern.
2. Compute the hash of the first window of the text (the first `m` characters).
3. For each window, if its hash equals the pattern's hash, **check the characters** directly, because two different strings may have the same hash.
4. Slide the window: update its hash using the character that leaves and the one that enters.

```csharp
static int RabinKarp(string text, string pattern)
{
    const int Base = 256;
    const int Mod = 1000000007;
    int m = pattern.Length;
    if (m == 0) return 0;
    if (m > text.Length) return -1;

    long patternHash = 0, windowHash = 0, highest = 1;
    for (int i = 0; i < m - 1; i++) highest = (highest * Base) % Mod;

    for (int i = 0; i < m; i++)
    {
        patternHash = (patternHash * Base + pattern[i]) % Mod;
        windowHash = (windowHash * Base + text[i]) % Mod;
    }

    for (int start = 0; start + m <= text.Length; start++)
    {
        if (windowHash == patternHash && text.Substring(start, m) == pattern)
        {
            return start;                              // the check rules out collisions
        }
        if (start + m < text.Length)
        {
            // remove the leaving character, add the entering one
            windowHash = (windowHash - text[start] * highest % Mod + Mod) % Mod;
            windowHash = (windowHash * Base + text[start + m]) % Mod;
        }
    }
    return -1;
}
```

## Why the update is fast

The hash of a window is a number built from its characters, with each character multiplied by a power of `Base`. When the window slides, the old first character's contribution is subtracted and the new last character is added. That is a constant amount of work, instead of recomputing the whole hash of `m` characters.

## Why the check is needed

Two windows with different text can have the same hash. Such a **false match** is rare, but it happens, and the direct comparison `text.Substring(start, m) == pattern` makes the answer correct. The hash only decides which positions to check.

## The cost

On average, the search takes about `n + m` steps. In the worst case, many false matches make it as slow as the naive search, but that is rare with a good hash.

The example to remember: the hash is a filter. A match of the hash means "maybe here", and only the characters decide "yes, here".
