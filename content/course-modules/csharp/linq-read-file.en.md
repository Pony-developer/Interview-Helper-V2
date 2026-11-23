A file is a sequence of lines. This practice reads a "file" written as an array of lines (the checker has no file system, so the lines are given in `Main`). The format is one record per line, `name;value`, with these rules:

- empty lines and lines that start with `#` are comments and are skipped;
- a line must have exactly two parts separated by `;`, otherwise it is skipped;
- the spaces around the name and the value are removed;
- the value must be a whole number, otherwise the line is skipped.

Write three methods. The class `Record` is ready:

- `ParseRecords(IEnumerable<string> lines)`: an iterator (use `yield return`) that gives a `Record` for each valid line, in the file order;
- `Total(IEnumerable<Record> records)`: the sum of the values;
- `NamesOver(IEnumerable<Record> records, int limit)`: the names of the records whose value is greater than `limit`, in file order.

Do not change `Main`. Expected output:

```text
4
82
plum kiwi
apple
```

The lines in order: the number of valid records (`apple`, `plum`, `fig`, `kiwi`; the line `pear;x` is skipped); their total, `10 + 25 + 7 + 40`; the names over `20`; and the name of the first record.

Hint: in `ParseRecords`, call `line.Trim()` first, skip the empty and comment lines, split with `Split(';')`, and use `int.TryParse(..., out value)` for the number. `Sum(r => r.Value)` and `Where(...).Select(...)` finish the other two methods.
