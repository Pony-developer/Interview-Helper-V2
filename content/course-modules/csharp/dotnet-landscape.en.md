"What is the difference between .NET Framework and .NET Core?" is one of the most common interview openers. To answer it well, you need the short history of the platform and a clear picture of what each name means today.

## .NET Framework (2002–2019)

The first .NET. It runs **only on Windows** and is **part of Windows**: there is one machine-wide installation, and a new 4.x version replaces the previous one in place. So upgrading the framework for one app upgrades it for every app on the machine.

The last version is **4.8.1**. It is still supported as a component of Windows and gets security fixes, but no new features. You meet it in older enterprise code: ASP.NET Web Forms, WCF services, Windows Workflow, classic ASP.NET MVC.

## Mono and Xamarin

**Mono** is an open-source, cross-platform reimplementation of .NET Framework that started outside Microsoft. It powered Xamarin (iOS and Android apps) and is the scripting runtime of Unity. Today its runtime lives on inside modern .NET for mobile and WebAssembly (Blazor).

## .NET Core (2016–2019)

A rewrite for the cloud era:

- **cross-platform**: Windows, Linux, macOS; x64 and ARM;
- **open source** on GitHub, developed in public;
- **side-by-side**: several versions on one machine, or the runtime shipped inside the app; upgrading one app never breaks another;
- **fast**: a big focus on performance (`Span<T>`, a new JIT, Kestrel);
- **modular**: the libraries come as packages and shared frameworks, not one monolith.

Versions 1.0, 1.1, 2.0, 2.1, 2.2, 3.0 and 3.1. Some Windows-only parts of .NET Framework were never ported (Web Forms, the WCF server side, AppDomains, Code Access Security).

## .NET 5 and later: one .NET

In 2020 the word "Core" was dropped: **.NET 5** is the next version of .NET Core. Version 4 was skipped to avoid confusion with .NET Framework 4.x. Since then there is a single line: .NET 5, 6, 7, 8, 9, 10…

When people say ".NET" today, they mean this line. ".NET Core" is often still used informally for it, and you will see it in names such as "ASP.NET Core" and "EF Core".

## The release rhythm

A new major version ships **every November**:

| Version | Kind | Support |
| --- | --- | --- |
| Even (.NET 8, .NET 10) | **LTS**, long-term support | 3 years |
| Odd (.NET 9, .NET 11) | **STS**, standard-term support | 2 years |

Every month, each supported version gets a **patch** release (for example 10.0.3) with security and bug fixes. A production app should stay on a supported version and take the patches. Many teams move from LTS to LTS.

## Side by side

| | .NET Framework | .NET (Core, 5+) |
| --- | --- | --- |
| Operating systems | Windows only | Windows, Linux, macOS |
| Installation | one per machine, in-place updates | many versions side by side, or inside the app |
| Source | reference source only | open source |
| New features | none | every year |
| Web | ASP.NET (System.Web) | ASP.NET Core |
| Desktop | WinForms, WPF | WinForms, WPF (Windows only), MAUI |
| Containers, cloud | heavy Windows images | small Linux images |

## What to choose

- **New code**: the latest LTS (or the latest release if you can upgrade yearly).
- **Existing .NET Framework code**: keep it running, and migrate when there is a reason (cross-platform hosting, performance, end of support of a dependency). The .NET Upgrade Assistant helps with the mechanical part.
- **Code shared by both worlds**: a library that targets .NET Standard 2.0 (see the lesson on the BCL and NuGet).

## The answer for the interview

.NET Framework is the original, Windows-only implementation, installed once per machine and now only maintained. .NET Core, renamed to just .NET from version 5, is its cross-platform, open-source successor: it installs side by side, is much faster, ships a new version every year, and is what all new development uses.
