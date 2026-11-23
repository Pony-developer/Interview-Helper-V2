A phone book is the classic dictionary: a name is the key, and a phone number is the value.

Implement three methods:

- `BuildBook(names, phones)` creates a `Dictionary<string, string>` from two arrays of the same length: `phones[i]` belongs to `names[i]`. If a name appears **more than once**, the **last** phone wins.
- `Lookup(book, name)` returns the phone of the name, or the text `unknown` if there is no such name.
- `Rename(book, oldName, newName)` moves an entry to a new name, keeping its phone. It returns `true` when it did that. It returns `false`, and changes nothing, if `oldName` is not in the book, or if `newName` is **already taken**.

`Main` builds the book from `{ "Ann", "Bo", "Cy", "Ann" }` and `{ "111", "222", "333", "444" }`, so `Ann` ends up with `444`, and then runs several checks. Do not change `Main`. Expected output:

```text
444
unknown
True
unknown
222
False
False
3
```

Hint: use `TryGetValue` to look up, and `ContainsKey` to check a name. A rename is a `Remove` of the old key plus an assignment under the new one.
