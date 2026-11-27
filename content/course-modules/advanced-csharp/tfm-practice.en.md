## Task

Implement `Tfm.Describe(string tfm)`, which turns a target framework moniker into a readable name:

| Input | Output |
| --- | --- |
| `net6.0` | `.NET 6.0` (a version with a dot is modern .NET) |
| `netstandard2.0` | `.NET Standard 2.0` |
| `netcoreapp3.1` | `.NET Core 3.1` |
| `net48` | `.NET Framework 4.8` (digits without dots: put a dot between each digit) |
| `net472` | `.NET Framework 4.7.2` |
| `net6.0-windows` | `.NET 6.0 (windows)` (an OS suffix after `-` goes in brackets) |
| anything else | `unknown` |

Check the longer prefixes (`netstandard`, `netcoreapp`) before the plain `net`.

Expected output:

```
net6.0 => .NET 6.0
netstandard2.0 => .NET Standard 2.0
netcoreapp3.1 => .NET Core 3.1
net48 => .NET Framework 4.8
net472 => .NET Framework 4.7.2
net6.0-windows => .NET 6.0 (windows)
java8 => unknown
```
