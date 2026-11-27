Interviewers often show a short snippet and ask: "What does it do, and how would you improve it?" Talk about correctness first (nulls, edge cases), then readability.

## Snippet 1

```csharp
public bool IsArrayEmpty(string[] array)
{
    if (array.Length > 0)
        return false;
    else
        return true;
}
```

- `if (cond) return false; else return true;` is just `return !cond;`, so the body becomes `return array.Length == 0;`.
- What if `array` is `null`? Decide on the contract: either treat it as empty (`return array == null || array.Length == 0;`) or throw `ArgumentNullException`. Say which you choose and why.
- The method uses no instance state, so it can be `static`. For any sequence, `!items.Any()` works too.

## Snippet 2

```csharp
protected string GetClass(object url)
{
    if (SiteMap.CurrentNode.Url == url.ToString())
        return "class=\"active\"";
    return "";
}
```

- `url.ToString()` throws `NullReferenceException` when `url` is null, and `SiteMap.CurrentNode` is null for pages outside the site map.
- The parameter is `object` for no reason: take a `string`.
- URL comparison should probably ignore case: `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)`.
- Returning a raw HTML attribute mixes logic and markup: return a `bool` and let the view decide.

```csharp
protected bool IsCurrent(string url) =>
    SiteMap.CurrentNode != null &&
    string.Equals(SiteMap.CurrentNode.Url, url, StringComparison.OrdinalIgnoreCase);
```

## Design tasks without code

- **Calculator**: separate parsing (a tokenizer), evaluation (operator precedence with the shunting-yard algorithm or a recursive-descent parser) and formatting. Roman numerals then only add a new number parser and formatter behind an interface; the evaluator stays the same (the open/closed principle). You build exactly that in the second practice.
- **Folder structure**: the Composite pattern. An abstract `FileSystemEntry` has `Name` and `Size`; `File` knows its own size; `Folder` holds a `List<FileSystemEntry>` and computes its size recursively. You build it in the practice "A folder tree".

The next two practices cover primes (trial division, the sieve and factorization) and the Roman calculator.
