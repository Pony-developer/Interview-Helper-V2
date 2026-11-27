## Memory-mapped files

A memory-mapped file maps a file (or a block of shared memory) into the process's virtual address space. The OS pages data in and out on demand, so you can work with huge files as if they were in memory.

```csharp
using var mmf = MemoryMappedFile.CreateFromFile("prices.bin", FileMode.Open);
using var accessor = mmf.CreateViewAccessor(offset: 0, size: 0);   // 0 = to the end of the file

long recordOffset = 1_000_000 * 16L;          // jump straight to record #1,000,000
double price = accessor.ReadDouble(recordOffset);
accessor.Write(recordOffset, price * 1.1);     // writes go back to the file
```

When to use them:

- **Random access** to large files (indexes, databases, binary datasets): reading record N is a pointer calculation, no `Seek` + `Read` calls.
- **Sharing memory between processes**: two processes open a map with the same name.

```csharp
// process A
using var shared = MemoryMappedFile.CreateNew("Shop.Stats", 4096);    // named shared memory (Windows)
using var view = shared.CreateViewAccessor();
view.Write(0, 42);

// process B
using var existing = MemoryMappedFile.OpenExisting("Shop.Stats");
using var view2 = existing.CreateViewAccessor();
int value = view2.ReadInt32(0);
```

Named maps without a backing file are Windows-only; on Linux, map a file both processes can access. Coordinate concurrent writers with a named `Mutex` or `Semaphore`.

`CreateViewStream` gives you a `Stream` over the mapping, and `accessor.SafeMemoryMappedViewHandle` exposes a pointer for `unsafe` or `Span`-based access.

For sequential reading, ordinary buffered `FileStream`s are just as fast and simpler.

## OS security and file permissions

File operations run with the identity of the process, and the OS decides what's allowed:

- On **Windows**, files and folders have ACLs. `FileSystemAclExtensions.GetAccessControl` / `SetAccessControl` (Windows-only package) read and change them.
- On **Linux/macOS**, files have owner/group/other permission bits. .NET 7 added `File.GetUnixFileMode` / `SetUnixFileMode`; earlier, call `chmod`.
- Denied access throws `UnauthorizedAccessException`.

Practical advice:

- Run services with a dedicated low-privilege account, and grant only the folders they need.
- Don't require admin rights for normal operation; write to per-user or app-data folders.
- Check for elevation when needed: `new WindowsPrincipal(WindowsIdentity.GetCurrent()).IsInRole(WindowsBuiltInRole.Administrator)` on Windows, `Environment.UserName == "root"` style checks elsewhere.

## Interview takeaways

- Memory-mapped files give random access to huge files and shared memory between processes.
- For sequential I/O, regular streams are simpler and equally fast.
- File access is governed by OS permissions; expect `UnauthorizedAccessException` and run with least privilege.
