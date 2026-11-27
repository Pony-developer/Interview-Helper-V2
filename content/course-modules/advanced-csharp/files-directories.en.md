## Static helpers vs info objects

| Static class | Instance class | Use the instance class when |
| --- | --- | --- |
| `File` | `FileInfo` | you query several properties of the same file |
| `Directory` | `DirectoryInfo` | you enumerate and inspect many entries |

```csharp
File.Exists(path);
File.Copy(src, dest, overwrite: true);
File.Move(src, dest, overwrite: true);       // .NET Core 3.0+
File.Delete(path);                           // no error if it doesn't exist
File.WriteAllText(path, text); File.AppendAllLines(path, lines);
byte[] bytes = await File.ReadAllBytesAsync(path);
File.GetLastWriteTimeUtc(path);

var info = new FileInfo(path);
Console.WriteLine($"{info.Name} {info.Length} bytes, modified {info.LastWriteTimeUtc}");

Directory.CreateDirectory(@"out/reports/2024");   // creates every missing level; fine if it exists
foreach (string f in Directory.EnumerateFiles("logs", "*.log", SearchOption.AllDirectories)) { }
Directory.Delete("tmp", recursive: true);
```

Prefer `Enumerate*` (lazy) over `Get*` (builds an array) for big directories. `EnumerationOptions` (.NET Core 2.1) controls recursion, case sensitivity and skipping inaccessible folders.

## Paths

```csharp
string full = Path.Combine(baseDir, "data", "orders.csv");   // the right separator for the OS
string name = Path.GetFileName(full);                        // orders.csv
string noExt = Path.GetFileNameWithoutExtension(full);       // orders
string ext = Path.GetExtension(full);                        // .csv
string dir = Path.GetDirectoryName(full)!;
string abs = Path.GetFullPath("../config.json");             // resolves relative to the current directory
string temp = Path.GetTempFileName();                        // creates an empty temp file
Path.DirectorySeparatorChar;                                 // '\' on Windows, '/' elsewhere
```

- Never build paths by string concatenation with `"\\"`: it breaks on Linux.
- `Path.Combine("a", "/b")` returns `"/b"`: a rooted second argument wins. `Path.Join` (.NET Core 3.0) doesn't do that, which is safer with untrusted input.
- Relative paths resolve against the **current directory**, which may not be the app folder. Use `AppContext.BaseDirectory` for files shipped with the app.
- Windows file names are case-insensitive, Linux names are case-sensitive.

## Special folders

```csharp
Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);       // per-user app data
Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData); // all users
Path.GetTempPath();
```

Don't write to the application's install folder at run time: it's often read-only.

## Watching for changes

```csharp
using var watcher = new FileSystemWatcher(@"C:\inbox", "*.csv")
{
    NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite,
    IncludeSubdirectories = false,
    EnableRaisingEvents = true,
};
watcher.Created += (_, e) => Console.WriteLine($"new file {e.FullPath}");
watcher.Error += (_, e) => Console.WriteLine("buffer overflow: events were lost");
```

Caveats: a single save may raise several events; the event may fire while the writer still has the file open (retry when opening fails); the internal buffer can overflow under load (handle `Error` and rescan); network shares and containers can be unreliable. Many robust systems poll as a fallback.

## Concurrent access and locks

Opening a file locks it according to `FileShare`. A second process that wants to write while you read gets an `IOException` unless you allowed `FileShare.ReadWrite`. Catch `IOException` around file operations: files can disappear, be locked, or live on a disconnected drive at any moment.

## Interview takeaways

- `File`/`Directory` for one-off calls, `FileInfo`/`DirectoryInfo` for repeated queries; `Enumerate*` is lazy.
- Build paths with `Path.Combine`/`Path.Join`; use `AppContext.BaseDirectory` for app files.
- `FileSystemWatcher` events can be duplicated, early or lost.
