Programs keep data between runs in **files**. The `System.IO` namespace has what you need, and it takes a `using System.IO;` at the top.

> **Note.** The online runner for the practice tasks has no access to files, so the examples below are meant for your own computer. The practice tasks use text in memory, with the same ideas (`StringReader` is the in-memory twin of reading a file).

## Paths

A path says where a file or a directory (a folder) is.

- An **absolute** path starts from the root: `C:\Users\ann\notes.txt` on Windows, `/home/ann/notes.txt` on Linux and macOS.
- A **relative** path starts from the **current directory** of the program: `data\notes.txt`.

The separator differs between systems (`\` on Windows, `/` elsewhere), so do not glue paths with `+`. Use `Path`:

```csharp
string path = Path.Combine("data", "reports", "2026.txt");   // data\reports\2026.txt on Windows

Path.GetFileName(path)                  // 2026.txt
Path.GetFileNameWithoutExtension(path)  // 2026
Path.GetExtension(path)                 // .txt
Path.GetDirectoryName(path)             // data\reports
Path.GetFullPath(path)                  // the absolute path
```

`Path` methods work on the **text** of a path. They do not check that the file exists.

A backslash in a C# string must be escaped, so write `"C:\\data\\a.txt"` or `@"C:\data\a.txt"`.

## Reading and writing a whole text file

The `File` class has one-call methods for small files:

```csharp
File.WriteAllText("notes.txt", "first line\nsecond line");   // creates or overwrites
File.AppendAllText("notes.txt", "\nthird line");             // adds to the end

string text = File.ReadAllText("notes.txt");                 // everything as one string
string[] lines = File.ReadAllLines("notes.txt");             // one array element per line

File.WriteAllLines("copy.txt", lines);                       // an array of lines to a file
```

For **huge** files, `File.ReadLines(path)` gives the lines one at a time, without loading all of them into memory:

```csharp
foreach (string line in File.ReadLines("big.log"))
{
    if (line.Contains("ERROR")) Console.WriteLine(line);
}
```

## Checking and managing

```csharp
File.Exists("notes.txt")            // True or False
File.Copy("notes.txt", "backup.txt", true);   // true allows overwriting
File.Move("backup.txt", "old.txt");
File.Delete("old.txt");

Directory.Exists("data")
Directory.CreateDirectory("data/reports");     // creates the whole chain, no error if it exists
string[] files = Directory.GetFiles("data");              // the files in a directory
string[] txt = Directory.GetFiles("data", "*.txt");       // with a pattern
string[] folders = Directory.GetDirectories("data");
Directory.Delete("data", true);                           // true: with everything inside. Careful!
```

`File.Delete` and `Directory.Delete` are **permanent**: nothing goes to the recycle bin.

Standard places:

```csharp
Directory.GetCurrentDirectory()      // where the program runs
Path.GetTempPath()                   // the folder for temporary files
Path.GetTempFileName()               // creates an empty temporary file and returns its path
```

## Streams: reading and writing step by step

For more control, or for big data, use `StreamReader` and `StreamWriter`. They must be **closed** when you are done, and `using` does that for you, even when an exception occurs:

```csharp
using (var writer = new StreamWriter("log.txt"))
{
    writer.WriteLine("Started");
    writer.WriteLine("Value: " + 42);
}                                      // the file is closed here

using (var reader = new StreamReader("log.txt"))
{
    string line;
    while ((line = reader.ReadLine()) != null)
    {
        Console.WriteLine(line);
    }
}
```

`ReadLine` returns `null` at the end of the file. The condition `(line = reader.ReadLine()) != null` assigns the line and checks it in one step: a common pattern.

An open file may be locked: another program, or another part of yours, cannot write to it until it is closed. That is the practical reason to always use `using`.

## What can go wrong

Files are outside your program's control, so operations on them fail more often than ordinary code:

| Exception | Typical reason |
| --- | --- |
| `FileNotFoundException` | the file does not exist |
| `DirectoryNotFoundException` | a folder in the path does not exist |
| `UnauthorizedAccessException` | no permission, or the path is a directory |
| `IOException` | the file is in use, the disk is full, ... |
| `ArgumentException` | the path is empty or contains forbidden characters |

```csharp
try
{
    string text = File.ReadAllText("settings.txt");
    Console.WriteLine(text.Length);
}
catch (FileNotFoundException)
{
    Console.WriteLine("No settings file; using defaults.");
}
catch (IOException e)
{
    Console.WriteLine("Cannot read: " + e.Message);
}
```

For a file that **may** be missing, it is cleaner to ask first, with `File.Exists`, than to catch the exception. Still, someone can delete the file between the check and the read, so important code handles both.

## In-memory twins

The `System.IO` classes also work on text and bytes held in memory, which is how you test file code without touching a disk:

```csharp
var reader = new StringReader("line 1\nline 2\nline 3");
string line;
while ((line = reader.ReadLine()) != null)
{
    Console.WriteLine(line.ToUpper());
}

var writer = new StringWriter();
writer.WriteLine("hello");
writer.Write(42);
Console.WriteLine(writer.ToString());
```

A method that takes a `TextReader` (the base class of `StreamReader` and `StringReader`) works for both a real file and a string.
