**In plain words:** Flyweight saves memory when you have **a huge number of similar objects**. The part they have in common is stored **once** and shared; each object keeps only what is unique to it.

## A picture from life

A library doesn't print a separate copy of the rules for every reader card. There is one rules book on the wall; each card holds only the reader's name and number.

## The problem

A map shows 1,000,000 trees. Each tree has a position (unique) and a species with a name, a color and a 2 MB texture (the same for all oaks). If every tree object stores its own texture, you need gigabytes of memory.

## In C#

```csharp
class TreeType                                   // the shared, unchanging ("intrinsic") part
{
    public string Species { get; private set; }
    public byte[] Texture { get; private set; }

    public TreeType(string species, byte[] texture) { Species = species; Texture = texture; }
}

class TreeTypeFactory                            // hands out one shared object per species
{
    private readonly Dictionary<string, TreeType> types = new Dictionary<string, TreeType>();

    public TreeType Get(string species)
    {
        TreeType type;
        if (!types.TryGetValue(species, out type))
        {
            type = new TreeType(species, LoadTexture(species));
            types[species] = type;
        }
        return type;
    }

    private static byte[] LoadTexture(string species) { return new byte[2000000]; }
}

class Tree                                       // the unique ("extrinsic") part is small
{
    public int X, Y;
    public TreeType Type;                        // a reference to the shared part
}
```

A million `Tree` objects now share a handful of `TreeType` objects.

## Where you already see it

- **String interning** in .NET: identical string literals point to one string object in memory.
- Cached boxed values and small objects reused by frameworks, glyphs in text rendering.

## When to use it, and when not to

- **Fits:** really many objects, measured memory pressure, and a clear shared, immutable part.
- **Overkill:** a few thousand objects. It's an optimization, so measure first. The shared part **must be immutable**, or changing one tree's type changes all of them.

## Remember

Flyweight = "share the common part, store the unique part". It's the one structural pattern that is purely about performance.
