The abstract class `Report` has a **template method** `Build()`. It fixes the order: the header, then every item formatted, then (if it is not empty) the footer. Only the steps are open for the derived classes:

- `Header()`: **abstract**, the first line;
- `FormatItem(number, item)`: **abstract**, one line for an item (the `number` starts from 1);
- `Footer()`: **virtual**, the text of the last line. By default, it is empty, and then no line is added;
- `Count`: a protected property with the number of the items.

`Report` is ready. **Write three derived classes**, each with a constructor `(string[] items)` that passes the array to the base class with `: base(items)`:

| Class | `Header()` | `FormatItem` for the number 2 and `pear` | `Footer()` |
|---|---|---|---|
| `TextReport` | `REPORT` | `2. pear` | `Total: N items` |
| `CsvReport` | `number,item` | `2,pear` | none (use the default) |
| `MarkdownReport` | `# Fruits` | `- pear` (no numbers) | `_N items_` |

`N` is the number of the items. Do not change `Report` or `Main`. Expected output:

```text
REPORT
1. apple
2. pear
3. plum
Total: 3 items
---
number,item
1,apple
2,pear
3,plum
---
# Fruits
- apple
- pear
- plum
_3 items_
---
REPORT
Total: 0 items
```

The lines in order: the text report, a separator, the CSV report, a separator, the Markdown report, a separator, and the text report of an **empty** array (the loop adds no lines, but the footer is still there).

Hint: all the three methods are `protected override`, because they are `protected` in the base class. In `Footer`, use the inherited property `Count`. Notice what you did **not** have to write: the loop, the newlines and the "no footer" rule. They live in `Build()` once.
