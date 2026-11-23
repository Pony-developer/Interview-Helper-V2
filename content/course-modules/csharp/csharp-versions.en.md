C# gets a new version every year, together with a new .NET. Interviewers like to ask "what is new in C#", and real projects are written in recent versions. This module is a map of what appeared after C# 7.

## The versions

| C# | .NET | Year | The most important additions |
|---|---|---|---|
| 7.0–7.3 | .NET Framework 4.7, .NET Core 2 | 2017–2018 | tuples, `is` and `switch` type patterns, `out var`, local functions, `in` parameters, `Span<T>` |
| 8 | .NET Core 3 | 2019 | **nullable reference types**, switch expressions, property patterns, **async streams**, ranges `^1` and `..`, default interface methods, `using var`, `??=` |
| 9 | .NET 5 | 2020 | **records**, `init`, top-level statements, relational and logical patterns (`>= 18 and < 65`, `not null`), target-typed `new()` |
| 10 | .NET 6 (LTS) | 2021 | record structs, `global using`, file-scoped namespaces |
| 11 | .NET 7 | 2022 | `required` members, raw string literals `"""`, list patterns `[1, ..]`, static abstract interface members (generic math) |
| 12 | .NET 8 (LTS) | 2023 | **primary constructors** for classes, collection expressions `[1, 2, 3]` |
| 13 | .NET 9 | 2024 | `params` for any collection, the `System.Threading.Lock` type |
| 14 | .NET 10 (LTS) | 2025 | extension members, the `field` keyword in properties, null-conditional assignment `a?.B = x` |

New versions keep coming every November. LTS releases (even numbers of .NET) are supported for three years, the others for two, so most companies move from one LTS to the next.

## .NET, .NET Framework, .NET Core, Mono

- **.NET Framework** (up to 4.8): the old Windows-only platform. It receives only fixes, and its default language version is C# 7.3.
- **.NET Core** (1.0–3.1): the cross-platform rewrite.
- **.NET 5 and later**: .NET Core renamed; this is "modern .NET".
- **Mono**: an older cross-platform implementation, now mostly part of the history of Xamarin and Unity.

The language version follows the target platform: a project for `net8.0` uses C# 12 by default. You can change it with `<LangVersion>` in the project file, but features that need runtime support (such as generic math) still require the newer runtime.

## About the practices

The practice tasks of this course run on a public compiler with Mono. It implements only part of C# 7: `is` type patterns (`item is Circle c`), `out var`, tuples and deconstruction work, but type patterns in `switch`, `when` and local functions do not. So the lectures of this module show modern syntax, and the practices use the parts the compiler supports. To try the rest, create a console project with `dotnet new console` on .NET 8 or later.

## The rule

Know the big features by name and by version: nullable reference types and switch expressions (8), records and `init` (9), `required` and raw strings (11), primary constructors and collection expressions (12). These come up in every interview about modern C#.
