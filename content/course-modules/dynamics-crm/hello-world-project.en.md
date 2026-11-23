Time to build the first plug-in. Before any code, the project has to be set up the way the platform expects, or registration fails with confusing errors.

## What the platform needs

- A **class library** that targets **.NET Framework 4.6.2**. Not .NET 8, not .NET Standard: the sandbox loads .NET Framework assemblies.
- A reference to the SDK assemblies through the NuGet package **`Microsoft.CrmSdk.CoreAssemblies`** (it contains `Microsoft.Xrm.Sdk.dll`).
- A **strong-name signature**: the assembly is signed with a key file (`.snk`).
- Public classes that implement `Microsoft.Xrm.Sdk.IPlugin`.

## The quick way: the Power Platform CLI

```text
mkdir Contoso.Plugins
cd Contoso.Plugins
pac plugin init --author Contoso
```

`pac plugin init` creates an SDK-style project that targets `net462`, adds the NuGet references, generates a signing key, and adds a **`PluginBase`** class that unpacks the context and services for you, plus a sample plug-in. Build it with `dotnet build` or Visual Studio.

## The manual way: Visual Studio

1. **New project → Class Library (.NET Framework)**, framework **.NET Framework 4.6.2**, name `Contoso.Plugins`.
2. **Manage NuGet Packages → Browse → `Microsoft.CrmSdk.CoreAssemblies`**, install the latest version.
3. **Project → Properties → Signing → Sign the assembly → New…**, name the key `Contoso.Plugins.snk`. A key without a password is simplest for build servers. The signature gives the assembly a strong name; it is not a security secret.
4. Delete `Class1.cs`, add `HelloWorldPlugin.cs`.

## A sensible structure

```text
Contoso.Plugins/
  Contoso.Plugins.csproj
  Contoso.Plugins.snk
  PluginBase.cs                 # shared plumbing: context, services, tracing
  Accounts/
    HelloWorldPlugin.cs         # thin IPlugin classes
    FollowUpTaskPlugin.cs
  Logic/
    FollowUpTaskService.cs      # business rules, testable without IPlugin
Contoso.Plugins.Tests/          # xUnit tests with a fake IOrganizationService
```

One assembly per solution area is usual. Keep plug-in classes thin and the rules in separate classes, so the next module's testing techniques apply.

## Dependencies

The sandbox loads only your assembly and the platform's own. Two ways to use another library:

- **Plug-in packages**: build a NuGet package (`.nupkg`) that contains your assembly and its dependencies, and register the package instead of a single DLL. `pac plugin init` projects can produce one. This is the supported approach.
- **ILMerge / ILRepack**, which merges DLLs into one, is still seen in older projects but is **not supported** by Microsoft.

Prefer few dependencies: every library adds size, load time and upgrade risk.

## Versioning

The assembly version matters at registration: steps are tied to the assembly's name, culture, public key token and **major.minor** version. Changing the build or revision number (`1.0.0.1` → `1.0.0.2`) updates the assembly in place; changing major or minor (`1.0` → `1.1`) is treated as a new assembly and the old steps keep pointing at the old one. Most teams keep `1.0.0.x` and use solution versions for releases.

## In an interview

- Name the target framework, the NuGet package and why the assembly must be signed.
- Explain what `pac plugin init` gives you.
- Explain how to use a third-party library in a plug-in today.
- Explain which assembly version changes create a new assembly at registration.
