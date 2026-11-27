## The problem .NET Standard solved

Before .NET 5 there were several runtimes side by side: .NET Framework, .NET Core, Xamarin, UWP. A library author wanted to write code once and have it work on all of them. **.NET Standard** is a *specification*: a list of APIs that every runtime implementing that version promises to provide.

| Target | Usable from |
| --- | --- |
| `netstandard1.x` | Very old runtimes; a small API surface. Avoid today. |
| `netstandard2.0` | .NET Framework 4.6.1+, .NET Core 2.0+, .NET 5+, Mono, Xamarin, Unity |
| `netstandard2.1` | .NET Core 3.0+, .NET 5+ (**not** .NET Framework) |

Rule of thumb: a reusable library that must also work on .NET Framework targets `netstandard2.0`. A library for modern apps only targets `net6.0` (or later), where the full API is available.

## Target framework monikers (TFMs)

The `TargetFramework` element of a `.csproj` names what you build for:

```xml
<PropertyGroup>
  <TargetFramework>net6.0</TargetFramework>
</PropertyGroup>

<!-- or several at once: one output per target -->
<PropertyGroup>
  <TargetFrameworks>net6.0;netstandard2.0;net48</TargetFrameworks>
</PropertyGroup>
```

| TFM | Meaning |
| --- | --- |
| `net6.0`, `net8.0` | Modern .NET |
| `net6.0-windows` | Modern .NET plus Windows-only APIs (WPF, WinForms) |
| `netcoreapp3.1` | .NET Core 3.1 |
| `netstandard2.0` | The .NET Standard 2.0 contract |
| `net48`, `net472` | .NET Framework 4.8, 4.7.2 (digits without dots) |

With multi-targeting you can use `#if NET6_0_OR_GREATER` to call a newer API where it exists and a fallback elsewhere.

## Reference assemblies

When you compile against `netstandard2.0`, the compiler doesn't see the real implementation of the BCL. It sees **reference assemblies**: assemblies that contain only public signatures, no code. At run time the actual runtime supplies the implementation. That is what lets one compiled DLL run on several runtimes.

## Language version vs runtime version

The C# compiler picks a default language version from the target:

| Target | Default C# version |
| --- | --- |
| .NET 6 | C# 10 |
| .NET 5 | C# 9 |
| .NET Core 3.x, .NET Standard 2.1 | C# 8 |
| .NET Framework, .NET Standard 2.0 | C# 7.3 |

You *can* raise it with `<LangVersion>`, and many features (records, `init`, switch expressions) then work on older targets because they are pure compiler tricks. Others need runtime support and won't work: default interface members, for example, need a runtime that understands them.

## Interview takeaways

- .NET Standard is a contract, not a runtime. `netstandard2.0` is the widest-reaching useful target.
- The TFM in the project file decides which APIs you can call and the default C# version.
- Some language features are compiler-only; others require a newer runtime.
