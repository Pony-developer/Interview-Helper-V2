Build a small **text-cleaning pipeline** from interchangeable parts. The interface is ready:

```csharp
interface ITextFilter
{
    string Apply(string text);
}
```

**Write these classes, and all of them implement `ITextFilter`:**

- `TrimFilter`: removes the spaces at the start and at the end;
- `CollapseSpacesFilter`: replaces every run of several spaces with **one** space (do not use regular expressions: go through the characters);
- `UpperFilter`: turns the text into upper case;
- `RemoveDigitsFilter`: removes all the digits `0`-`9`;
- `ReplaceFilter(from, to)`: replaces every occurrence of the text `from` with the text `to`;
- `Pipeline`: a filter that **contains other filters**:
  - `Add(filter)` adds a filter at the end and **returns the pipeline itself**, so that the calls can be chained: `new Pipeline().Add(a).Add(b)`;
  - `Apply(text)` runs the filters **in the order of adding**, giving the result of each one to the next. An empty pipeline returns the text unchanged;
  - `Count` is the number of the filters that were added to it.

Since a `Pipeline` is itself an `ITextFilter`, it can be **added to another pipeline**. A nested pipeline counts as **one** filter. Do not change `Main`. Expected output:

```text
[hello big world]
[BYE BIG WORLD]
abc
unchanged
3
bonono
QUIET PLEASE
```

The lines in order: the pipeline `clean` (trim, collapse) applied to `"   hello    big   world  "`; a pipeline `shout` that contains `clean`, then `UpperFilter`, then a replacement of `HELLO` with `BYE`, applied to the same text; the digits removed from `a1b22c333`; an empty pipeline; `Count` of `shout` (3, because `clean` counts as one); a `ReplaceFilter` used through a variable of the interface type (`banana` with `a` replaced by `o`); and a pipeline that was built with chained `Add` calls.

Hint: keep the filters in a `List<ITextFilter>` (`using System.Collections.Generic;` is written for you). Every filter class is only a few lines. The point of the task is to see that **new behaviour is a new small class**, and that parts can be combined in any order without a change in the old code.
