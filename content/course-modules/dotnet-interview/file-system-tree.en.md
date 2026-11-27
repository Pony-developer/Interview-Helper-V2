## Task

"Organize a folder structure of a file system" — the Junior list's design task, turned into code. It is the **Composite** pattern: files and folders share one base type `Entry`, and a folder contains entries, which may be folders themselves. Every operation on a folder is naturally **recursive**.

`FileEntry` is ready. Complete `Folder`:

1. **`Size`** — the total size of everything inside, recursively (an empty folder is 0).
2. **`Print(lines, depth)`** — add the line `"<indent>Name/ (Size)"` (two spaces of indent per depth level), then print every child one level deeper, in the order they were added.
3. **`CountFiles()`** — the number of files (not folders) inside, recursively.
4. **`Find(path)`** — find an entry by a relative path such as `"src/Models/User.cs"`; return `null` if any part of the path doesn't exist. Hint: split off the first segment, find the child with that name, and call `Find` on it with the rest.

Expected output:

```
root/ (3448)
  readme.md (120)
  src/ (3328)
    Program.cs (2048)
    Models/ (1280)
      User.cs (512)
      Order.cs (768)
  empty/ (0)
total: 3448
files: 4
Order.cs 768
not found
Models 1280
```
