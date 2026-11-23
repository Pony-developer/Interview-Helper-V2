NuGet decides whether a package fits your project by comparing target frameworks. Write that check: `Check(project, library)` gets the TFM of a project and the TFM of a library it wants to reference and returns `"yes"`, `"no"` or `"warning"`.

`Tfm.Parse` is already written. It gives each TFM a `Family` and a `Version`:

| TFM | `Family` | `Version` |
| --- | --- | --- |
| `net8.0`, `net10.0`, `netcoreapp3.1` | `"core"` | 8.0, 10.0, 3.1 |
| `net48`, `net472` | `"framework"` | 4.8, 4.7.2 |
| `netstandard2.0`, `netstandard2.1` | `"standard"` | 2.0, 2.1 |

`System.Version` supports `<`, `<=`, `>`, `>=`, and `new Version(4, 6, 1)` makes 4.6.1. The rules, by the library's family:

- **core library**: `"yes"` if the project is `core` and the library's version is not higher than the project's; otherwise `"no"`;
- **framework library**: `"warning"` if the project is `core` (NuGet's NU1701 fallback); `"yes"` if the project is `framework` with the same or a higher version; otherwise `"no"`;
- **standard library**:
  - `standard` project: `"yes"` if the library's version is not higher;
  - `core` project: needs version 2.0 or later for .NET Standard 2.0, and 3.0 or later for .NET Standard 2.1;
  - `framework` project: only .NET Standard 2.0, and only from version 4.6.1.

Do not change `Main` or `Tfm`. Expected output:

```text
net8.0 -> net6.0: yes
net6.0 -> net8.0: no
net10.0 -> netcoreapp3.1: yes
net8.0 -> netstandard2.0: yes
net8.0 -> netstandard2.1: yes
netcoreapp2.1 -> netstandard2.1: no
netcoreapp3.1 -> netstandard2.1: yes
net48 -> netstandard2.0: yes
net461 -> netstandard2.0: yes
net452 -> netstandard2.0: no
net472 -> netstandard2.1: no
net48 -> net472: yes
net472 -> net48: no
net48 -> net8.0: no
net8.0 -> net48: warning
netstandard2.1 -> netstandard2.0: yes
netstandard2.0 -> netstandard2.1: no
netstandard2.0 -> net8.0: no
netstandard2.0 -> net48: no
```

Hint: handle the two simple library families first and return early; then the three cases of a .NET Standard library.
