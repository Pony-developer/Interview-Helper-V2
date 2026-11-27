## The unit of deployment

An **assembly** is the unit .NET deploys, versions and loads: usually one `.dll` (a library) or the `.dll` behind an app host `.exe`. Every compiled project produces one.

It contains four kinds of things:

| Part | What it holds |
| --- | --- |
| **Manifest** | the assembly's identity (name, version, culture, public key), the list of files, the assemblies it references, assembly-level attributes |
| **Type metadata** | a complete description of every type and member: names, signatures, attributes, visibility |
| **IL code** | the compiled method bodies, which the JIT turns into machine code |
| **Resources** | embedded files: images, `.resx` string tables, JSON, SQL scripts |

Because metadata describes everything, assemblies are **self-describing**: you can reference a DLL with no header files, reflection can inspect it, and the runtime verifies type safety.

## Assembly-level attributes

```csharp
[assembly: InternalsVisibleTo("Shop.Core.Tests")]
[assembly: AssemblyMetadata("BuildCommit", "a1b2c3")]
```

In SDK-style projects most of these come from project properties instead of an `AssemblyInfo.cs`:

```xml
<PropertyGroup>
  <AssemblyName>Shop.Core</AssemblyName>
  <Version>2.1.0</Version>                     <!-- sets the versions below by default -->
  <AssemblyVersion>2.0.0.0</AssemblyVersion>
  <FileVersion>2.1.0.734</FileVersion>
  <InformationalVersion>2.1.0+a1b2c3</InformationalVersion>
</PropertyGroup>
```

## Inspecting assemblies at run time

```csharp
Assembly me = Assembly.GetExecutingAssembly();      // the assembly containing this code
Assembly entry = Assembly.GetEntryAssembly()!;      // the app's main assembly
Assembly ofType = typeof(Order).Assembly;

Console.WriteLine(me.GetName().Name);
Console.WriteLine(me.GetName().Version);
foreach (AssemblyName r in me.GetReferencedAssemblies()) Console.WriteLine(r.FullName);
string? info = me.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion;
```

## Multi-file and module notes

An assembly can technically be made of several modules, but in practice it's always one file. Tools like ILSpy or `ildasm` show the manifest, metadata tables and IL inside.

## Deployment shapes

- **Framework-dependent**: your assemblies + a `.deps.json` (dependency list) + `.runtimeconfig.json` (which runtime to use).
- **Self-contained**: plus the runtime itself.
- **Single-file** (`<PublishSingleFile>true</PublishSingleFile>`): everything bundled into one executable; some APIs like `Assembly.Location` return empty strings.
- **Trimmed** (`<PublishTrimmed>true</PublishTrimmed>`): unused code is removed; reflection-heavy code needs annotations to survive trimming.
- **ReadyToRun / Native AOT**: precompiled native code (see the platform module).

## Interview takeaways

- An assembly = manifest + metadata + IL + resources; it's self-describing.
- `Assembly.GetExecutingAssembly`, `GetEntryAssembly`, `typeof(T).Assembly` give you assembly objects.
- Deployment can be framework-dependent, self-contained, single-file, trimmed or AOT.
