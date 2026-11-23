The online runner has no files, so this task works with a **virtual** folder tree built from objects, in the same way that `DirectoryInfo` and `FileInfo` work. The classes `VFile` (a name and a size) and `VDirectory` (a name, a list of files and a list of sub-folders) are **already written**, and `Main` builds this tree:

```text
project
  readme.txt (120), app.exe (5000)
  docs
    guide.txt (800), logo.png (2400)
    old
      notes.txt (300)
  src
    main.cs (1500), util.cs (900)
  empty
```

Write the static methods that walk through the tree. All of them are naturally **recursive**: a folder holds files and sub-folders, which are folders again.

- `Print(dir, level)` prints the tree: the folder name with a `/` at the end, then its files as `name (size)`, then its sub-folders, each level indented by **two more spaces**. The files of a folder come **before** its sub-folders, in the order in which they are stored.
- `TotalSize(dir)`: the total size of all the files in the folder and in all the folders below it.
- `CountFiles(dir)`: the number of files in the whole tree.
- `FindByExtension(dir, extension)`: a `List<string>` with the **relative paths** of all the files with this extension, such as `docs/old/notes.txt`. A path is built from the names of the folders **below** the start folder, joined with `/`, then the file name. Files of a folder come before the files of its sub-folders.
- `Largest(dir)`: the `VFile` with the biggest size in the whole tree.

Do not change `Main`. Expected output:

```text
project/
  readme.txt (120)
  app.exe (5000)
  docs/
    guide.txt (800)
    logo.png (2400)
    old/
      notes.txt (300)
  src/
    main.cs (1500)
    util.cs (900)
  empty/
Total: 11020
Files: 7
.txt: readme.txt docs/guide.txt docs/old/notes.txt
.cs: src/main.cs src/util.cs
.zip:
Largest: app.exe (5000)
```

Hint: `FindByExtension` needs the **prefix** of the path as it goes deeper. Write a helper with an extra parameter for it: at the start it is empty, and for each sub-folder it becomes `prefix + sub.Name + "/"`. The method `name.EndsWith(extension)` checks the extension.
