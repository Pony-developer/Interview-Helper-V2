**In plain words:** Template Method writes down **the steps of an algorithm once, in a base class**, and lets subclasses **fill in some of the steps**. The order of steps can't be broken; only the details change.

## A picture from life

A recipe for any soup: boil water, add the base, add vegetables, season, serve. Borscht and chicken soup follow the same plan; they differ in *what* goes in at "add the base" and "add vegetables".

## The problem

Three importers (CSV, Excel, JSON) each open a file, read rows, validate them, save them and write a report. Only "read rows" differs, but the code is copied three times, and a fix in validation must be made in three places.

## In C#

```csharp
abstract class Importer
{
    // The template method: the fixed order of steps. Not virtual, so nobody can reorder it
    public void Import(string path)
    {
        var rows = ReadRows(path);              // a step subclasses MUST provide
        var valid = rows.Where(IsValid).ToList();
        Save(valid);
        AfterImport(valid.Count);               // a "hook": optional to override
    }

    protected abstract List<string[]> ReadRows(string path);

    protected virtual bool IsValid(string[] row) { return row.Length > 0; }
    protected virtual void AfterImport(int count) { }

    private void Save(List<string[]> rows) { /* shared saving code */ }
}

class CsvImporter : Importer
{
    protected override List<string[]> ReadRows(string path)
    {
        return File.ReadAllLines(path).Select(line => line.Split(',')).ToList();
    }
}
```

## Template Method vs Strategy

| | Template Method | Strategy |
| --- | --- | --- |
| Built on | **inheritance** | **composition** |
| What varies | some **steps** of a fixed algorithm | the **whole** algorithm |
| When chosen | at compile time (which subclass) | at runtime (which object is passed in) |

## Where you already see it

- `Stream`: `CopyTo` and `ReadByte` are written once on top of the abstract `Read` that each stream implements.
- ASP.NET Core `BackgroundService`: you override `ExecuteAsync`; starting and stopping are handled by the base class.
- **Dynamics plug-ins:** a common `PluginBase` class implements `IPlugin.Execute` (get the context, create the services, catch and log errors) and calls an abstract `ExecuteCore` that each plug-in fills in.

## Remember

Template Method = "**the base class owns the plan, subclasses fill the blanks**". Make the template method non-virtual so the plan can't be broken.
