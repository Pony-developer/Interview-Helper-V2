## How the runtime finds assemblies

When code first touches a type from a referenced assembly, the runtime must **resolve** that reference:

1. It consults the app's `.deps.json`, which lists every dependency and where it lives (app folder, NuGet cache for `dotnet run`, runtime packs).
2. Framework assemblies come from the shared framework folder (or the app folder when self-contained).
3. If nothing matches, the `AssemblyLoadContext.Resolving` event gives your code a last chance; otherwise you get `FileNotFoundException: Could not load file or assembly`.

.NET Core has **no GAC** and no binding redirects; the deps file and probing paths replace them.

## AssemblyLoadContext (ALC)

An `AssemblyLoadContext` is a **scope** for loaded assemblies. Every assembly lives in exactly one ALC, and each ALC can have its own version of a dependency.

- `AssemblyLoadContext.Default`: where the app and its dependencies load. Assemblies here can never be unloaded.
- Custom ALCs: for plug-ins, scripting, hot reload of modules.

```csharp
class PluginLoadContext : AssemblyLoadContext
{
    private readonly AssemblyDependencyResolver _resolver;

    public PluginLoadContext(string pluginPath) : base(isCollectible: true)
        => _resolver = new AssemblyDependencyResolver(pluginPath);   // reads the plug-in's .deps.json

    protected override Assembly? Load(AssemblyName name)
    {
        string? path = _resolver.ResolveAssemblyToPath(name);
        return path != null ? LoadFromAssemblyPath(path) : null;     // null → fall back to Default (shared contracts)
    }
}

var ctx = new PluginLoadContext(@"plugins\Pricing\Pricing.dll");
Assembly asm = ctx.LoadFromAssemblyPath(Path.GetFullPath(@"plugins\Pricing\Pricing.dll"));
var plugin = (IPricingPlugin)Activator.CreateInstance(asm.GetType("Pricing.DiscountPlugin")!)!;
```

## Sharing types between host and plug-in

The host and plug-in must agree on the **same** `IPricingPlugin` type. If the plug-in's context loads its own copy of the contracts assembly, the types are different (same name, different ALC) and the cast fails with `InvalidCastException`. The `Load` override above returns `null` for assemblies the plug-in doesn't ship, so the shared contracts assembly resolves from the default context.

## Unloading

Create the ALC with `isCollectible: true` and call `Unload()`. The assemblies are actually freed only when nothing references any of their types, objects or delegates any more (a `WeakReference` to the context helps verify it in tests). Static caches, event subscriptions and threads in the plug-in prevent unloading.

## Other ways to load

```csharp
Assembly.Load(new AssemblyName("Shop.Pricing"));      // by name, through normal resolution
Assembly.LoadFrom(path);                              // by path into the default context
Assembly.Load(File.ReadAllBytes(path));               // from bytes: no file lock, no location
AssemblyLoadContext.Default.LoadFromAssemblyPath(path);
AppDomain.CurrentDomain.GetAssemblies();              // everything loaded so far
```

`AppDomain` creation isn't supported in .NET Core; ALCs (for isolation of code) and separate processes (for isolation of failures and security) replace it.

## Interview takeaways

- The runtime resolves references via `.deps.json`; no GAC in .NET Core.
- `AssemblyLoadContext` isolates plug-ins and their dependency versions; collectible contexts can be unloaded.
- Share contract types from the default context, or casts across contexts fail.
