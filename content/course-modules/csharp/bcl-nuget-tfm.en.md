The runtime alone runs code; your code also needs **libraries**. Some come with .NET itself, the rest come from NuGet, and the **target framework** decides which ones you can use.

## The BCL

The **Base Class Library** is the standard library that ships with every .NET: `System.Object`, `string`, primitive types, collections (`System.Collections.Generic`), LINQ, files and streams (`System.IO`), threads and tasks, `HttpClient`, `System.Text.Json`, regular expressions, cryptography, and much more.

Its innermost part, **`System.Private.CoreLib`** (`mscorlib` in .NET Framework), is tied to the runtime: it defines `Object`, `String`, `Int32`, `Array`, `GC`, `Thread`. The rest is in ordinary assemblies such as `System.Collections.dll` and `System.Net.Http.dll`.

In .NET Framework, the BCL plus WinForms, WPF, ASP.NET, ADO.NET and the rest was called the **FCL** (Framework Class Library).

## Shared frameworks

Modern .NET installs the BCL as **shared frameworks**, folders of assemblies that apps load from the installed runtime:

| Shared framework | Contains | Used by |
| --- | --- | --- |
| `Microsoft.NETCore.App` | the runtime and the BCL | every app |
| `Microsoft.AspNetCore.App` | ASP.NET Core, Kestrel, logging, configuration, DI | web apps (`Sdk="Microsoft.NET.Sdk.Web"`) |
| `Microsoft.WindowsDesktop.App` | WinForms, WPF | desktop apps, Windows only |

`dotnet --list-runtimes` shows which ones (and which versions) a machine has.

## NuGet

Everything else comes as **NuGet packages** from nuget.org or a private feed. A package (`.nupkg`) is a zip file with assemblies in folders per target framework (`lib/net8.0/`, `lib/netstandard2.0/`) and a list of its own dependencies.

```xml
<ItemGroup>
  <PackageReference Include="Serilog" Version="4.2.0" />
</ItemGroup>
```

or `dotnet add package Serilog`. Things worth knowing:

- dependencies are **transitive**: you get the packages your packages depend on;
- `dotnet restore` downloads packages into a global cache (`~/.nuget/packages`), not into the project;
- **central package management** (`Directory.Packages.props`) keeps the versions of a whole solution in one file;
- restore warns about packages with known vulnerabilities (NuGet audit), and `dotnet list package --vulnerable` / `--outdated` lists them.

## Target framework monikers

The **TFM** in the project file says which framework the code is built for, and so which APIs it may use:

| TFM | Means |
| --- | --- |
| `net10.0`, `net8.0` | modern .NET |
| `net8.0-windows` | modern .NET plus Windows-only APIs |
| `netcoreapp3.1` | .NET Core 3.1 |
| `net48`, `net472` | .NET Framework 4.8, 4.7.2 |
| `netstandard2.0`, `netstandard2.1` | .NET Standard |

A library can build for several frameworks at once and use conditional compilation for the differences:

```xml
<TargetFrameworks>netstandard2.0;net10.0</TargetFrameworks>
```

```csharp
#if NET8_0_OR_GREATER
    return string.Create(length, state, Fill);   // the fast modern API
#else
    return BuildTheOldWay(length, state);
#endif
```

## .NET Standard

**.NET Standard** is not a runtime but a **specification**: a list of APIs that several implementations promise to have. A library built for `netstandard2.0` runs on all of them:

| | .NET Standard 2.0 | .NET Standard 2.1 |
| --- | --- | --- |
| .NET Framework | 4.6.1+ (4.7.2+ recommended) | **not supported** |
| .NET Core | 2.0+ | 3.0+ |
| .NET 5+ | yes | yes |
| Mono, Unity, Xamarin | yes | newer versions |

There will be no .NET Standard after 2.1: since .NET 5 there is one .NET, and its TFMs (`net8.0`, `net10.0`) play that role. The rule of thumb: target `net8.0` or later for new libraries, and add `netstandard2.0` only if .NET Framework or Unity code must use them.

## Who can reference whom

A project can reference a library when every API the library needs exists in the project's framework:

- **modern .NET → modern .NET or .NET Core**: when the library's version is the same or lower (`net10.0` can use a `net8.0` library, not the other way round);
- **any → .NET Standard**: when the framework implements that .NET Standard version (see the table);
- **.NET Framework → .NET Framework**: same or lower version;
- **modern .NET → .NET Framework**: NuGet allows it with warning **NU1701**; it works only if the library avoids Windows- and Framework-only APIs, so it is a stopgap during migration;
- **.NET Framework → modern .NET**: impossible.

## The answer for the interview

The BCL is the standard library that comes with .NET; in modern .NET it is installed as the `Microsoft.NETCore.App` shared framework, with ASP.NET Core and the Windows desktop stacks as separate shared frameworks. Third-party code comes from NuGet packages. The target framework moniker defines which APIs a project can use and so which libraries it can reference; .NET Standard 2.0 is the common ground between .NET Framework and modern .NET.
