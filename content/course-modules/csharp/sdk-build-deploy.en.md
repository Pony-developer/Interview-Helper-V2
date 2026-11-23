The last piece of the platform is the tooling: what you install on a developer machine, what you install on a server, what a build produces, and the ways to ship an app.

## SDK and runtime

- The **runtime** runs apps: the CLR plus shared frameworks. Servers and user machines need only this (for web apps, the **ASP.NET Core Runtime**; for IIS, the **Hosting Bundle**).
- The **SDK** builds apps: the `dotnet` CLI, the Roslyn compilers, MSBuild, NuGet, project templates, and a runtime to run what you build. Developer machines and CI need it.

Versions are separate: SDK 10.0.100 builds apps for .NET 10 (and older targets), and its feature band (`1xx`, `2xx`) moves a few times a year. A **`global.json`** file in the repository pins the SDK version, so every developer and the CI build the same way:

```json
{ "sdk": { "version": "10.0.100", "rollForward": "latestFeature" } }
```

## The dotnet CLI

| Command | Does |
| --- | --- |
| `dotnet new console -n MyApp` | creates a project from a template |
| `dotnet restore` | downloads NuGet packages (the other commands run it for you) |
| `dotnet build` | compiles into `bin/Debug/<tfm>/` |
| `dotnet run` | builds and runs |
| `dotnet test` | runs the tests |
| `dotnet publish` | prepares the app for deployment (Release by default since .NET 8) |
| `dotnet pack` | makes a NuGet package from a library |
| `dotnet add package X` | adds a `PackageReference` |
| `dotnet tool install -g dotnet-ef` | installs a .NET tool |

## The project file and MSBuild

Builds are run by **MSBuild**. An SDK-style project file is short, because the SDK supplies the defaults: every `.cs` file in the folder is compiled, and the C# version follows the target framework (`net10.0` means C# 14).

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
```

A `Directory.Build.props` file applies shared settings to every project below its folder.

## What a build produces

```text
bin/Release/net10.0/
  MyApp.dll                   IL and metadata: your code
  MyApp.exe                   the apphost: a native launcher (MyApp on Linux)
  MyApp.deps.json             the dependencies and where to find them
  MyApp.runtimeconfig.json    the shared framework and version to run on
  Serilog.dll                 the assemblies of NuGet packages
```

`runtimeconfig.json` tells the host to load, for example, `Microsoft.NETCore.App` 10.0. By default the app runs on the **newest installed patch** of that major version (10.0.x), so a monthly security update of the runtime reaches it without rebuilding. It does not move to a newer major version unless you allow it with `<RollForward>Major</RollForward>` or `LatestMajor`.

## Ways to deploy

| Mode | How | Result |
| --- | --- | --- |
| **Framework-dependent** | `dotnet publish` | small; needs the matching runtime on the machine; the same output runs on any OS |
| **Self-contained** | `dotnet publish -r linux-x64 --self-contained` | carries its own runtime (around 70 MB); no installation needed; one build per platform |
| **Single file** | `-p:PublishSingleFile=true` | one executable to copy |
| **Trimmed** | `-p:PublishTrimmed=true` | removes unused code from a self-contained app; can break reflection |
| **ReadyToRun** | `-p:PublishReadyToRun=true` | precompiled code for faster startup |
| **Native AOT** | `<PublishAot>true</PublishAot>` | one native executable, no JIT, fastest startup |
| **Container image** | `dotnet publish -t:PublishContainer` | an OCI image without writing a Dockerfile (.NET 8+) |

A **runtime identifier** (RID) names the platform: `win-x64`, `linux-x64`, `linux-musl-x64` (Alpine), `linux-arm64`, `osx-arm64`.

## The answer for the interview

The SDK is for building (CLI, compilers, MSBuild, NuGet) and the runtime is for running; a server needs only the runtime. A build produces the app's assembly plus `deps.json` and `runtimeconfig.json`, which tell the host which dependencies and which shared framework to load; the app rolls forward to the latest patch of its major version. A framework-dependent deployment is small but needs the runtime installed; a self-contained one carries the runtime for one platform; trimming, single-file, ReadyToRun and Native AOT trade build flexibility for size and startup speed.
