In the module on files you used the static classes `File`, `Directory` and `Path`. The namespace `System.IO` has an **object-oriented** alternative: `FileInfo` and `DirectoryInfo`. Instead of passing the path to a static method every time, you **create an object for one file or folder**, and ask it questions.

> **Note.** The online runner has no access to files, so these examples are for your own computer. The practice task of this lecture uses a **virtual** folder tree, built from your own classes, with the same ideas.

## File versus FileInfo

```csharp
// static: the path is an argument every time
bool exists = File.Exists(@"C:\data\report.txt");
long size = new FileInfo(@"C:\data\report.txt").Length;

// object: create it once, then use its members
var file = new FileInfo(@"C:\data\report.txt");
Console.WriteLine(file.Exists);
Console.WriteLine(file.Length);
```

| Static `File` | Object `FileInfo` |
| --- | --- |
| `File.Exists(path)` | `file.Exists` |
| `File.Delete(path)` | `file.Delete()` |
| `File.Copy(from, to)` | `file.CopyTo(to)` |
| `File.Move(from, to)` | `file.MoveTo(to)` |
| `new FileInfo(path).Length` | `file.Length` |

The static methods are shorter for a **single** operation. The objects are better when you **ask many questions** about the same file, and when you pass the file around as one thing.

## What a FileInfo knows

```csharp
var file = new FileInfo(@"C:\data\reports\2026.final.txt");

file.Name               // "2026.final.txt"
file.Extension          // ".txt"
file.FullName           // "C:\data\reports\2026.final.txt"
file.DirectoryName      // "C:\data\reports"
file.Directory          // a DirectoryInfo for the folder
file.Exists             // does it exist now?
file.Length             // the size in bytes (throws if the file does not exist)
file.CreationTime       // when it was created
file.LastWriteTime      // when it was last changed
file.IsReadOnly         // the read-only attribute
```

A `FileInfo` created for a path **does not check** that the file exists. `Exists` tells, and the properties of a missing file (such as `Length`) throw `FileNotFoundException`.

## What a DirectoryInfo knows

```csharp
var dir = new DirectoryInfo(@"C:\data");

dir.Name                          // "data"
dir.FullName                      // "C:\data"
dir.Parent                        // a DirectoryInfo for "C:\"
dir.Exists
dir.GetFiles()                    // FileInfo[]: the files directly inside
dir.GetFiles("*.txt")             // with a pattern
dir.GetDirectories()              // DirectoryInfo[]: the sub-folders
dir.CreateSubdirectory("backup")  // creates a folder, returns its DirectoryInfo
dir.Delete(true);                 // deletes it, with everything inside (careful!)
```

The `GetFiles` and `GetDirectories` methods return **objects**, not strings, so you can immediately ask each one for its `Name`, `Length` or `Extension`.

## A listing of a folder

```csharp
var dir = new DirectoryInfo(@"C:\data");
foreach (FileInfo file in dir.GetFiles())
{
    Console.WriteLine(file.Name + "  " + file.Length + " bytes");
}
foreach (DirectoryInfo sub in dir.GetDirectories())
{
    Console.WriteLine(sub.Name + "/");
}
```

## Walking a tree: recursion

A folder contains files and **folders**, which contain files and folders: a nested structure, which is a natural fit for **recursion**. The total size of a folder is the sizes of its files, plus the total sizes of its sub-folders:

```csharp
static long TotalSize(DirectoryInfo dir)
{
    long total = 0;
    foreach (FileInfo file in dir.GetFiles())
        total += file.Length;                       // the files here
    foreach (DirectoryInfo sub in dir.GetDirectories())
        total += TotalSize(sub);                    // the sub-folders: the same problem, smaller
    return total;
}
```

The base case is hidden: a folder with no sub-folders makes no recursive calls.

A printout with the indentation by depth:

```csharp
static void Print(DirectoryInfo dir, int level)
{
    string pad = new string(' ', level * 2);
    Console.WriteLine(pad + dir.Name + "/");
    foreach (FileInfo file in dir.GetFiles())
        Console.WriteLine(pad + "  " + file.Name + " (" + file.Length + ")");
    foreach (DirectoryInfo sub in dir.GetDirectories())
        Print(sub, level + 1);
}
```

## A shortcut: search options

For a search through **all** the levels, you do not need to write the recursion:

```csharp
FileInfo[] all = dir.GetFiles("*.cs", SearchOption.AllDirectories);
```

## Big folders: Enumerate

`GetFiles` builds the **whole** array first. For a folder with a million files, that is slow and uses a lot of memory. `EnumerateFiles` yields the files **one by one**, and you can stop early:

```csharp
foreach (FileInfo file in dir.EnumerateFiles("*", SearchOption.AllDirectories))
{
    if (file.Length > 100_000_000) Console.WriteLine(file.FullName);
}
```

## What can go wrong

- `UnauthorizedAccessException`: you may not read a system folder, or a folder of another user. A walk over the whole disk must be ready for this.
- `DirectoryNotFoundException` and `FileNotFoundException`: the item has disappeared since you looked.
- **Stale information.** A `FileInfo` caches some of its data. `file.Refresh()` re-reads it.
- A long path or a forbidden character: `PathTooLongException`, `ArgumentException`.

## Formatting a size

Bytes are hard to read. A small helper makes sizes human:

```csharp
static string FormatSize(long bytes)
{
    string[] units = { "B", "KB", "MB", "GB", "TB" };
    double size = bytes;
    int unit = 0;
    while (size >= 1024 && unit < units.Length - 1)
    {
        size /= 1024;
        unit++;
    }
    return Math.Round(size, 1) + " " + units[unit];
}
```

## Static or object?

- **One quick check or action**: the static `File` and `Directory`.
- **Several questions about one item**, or when you pass it around: `FileInfo` and `DirectoryInfo`.
- **Work with paths as text**: `Path`.
- **Recursion over a tree**: objects are natural, because each folder is itself an object with its sub-folders.

This is also a good model to learn from: `DirectoryInfo` has an **identity** (this folder), **data** (its name, its time) and **behaviour** (list, create, delete). That is exactly what a class is.
