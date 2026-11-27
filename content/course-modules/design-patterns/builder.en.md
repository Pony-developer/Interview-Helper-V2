**In plain words:** a builder lets you **assemble a complicated object step by step**, setting only the parts you need, and get the finished object at the end.

## A picture from life

Ordering a burger in a place where you build your own: bun, then patty, then cheese (or not), sauce, extra pickles. You add pieces one at a time, and at the end you say "that's it" and get the burger.

## The problem

```csharp
var report = new Report("Sales", null, null, true, false, 50, "Date", true, null);
```

What does `true, false, 50` mean? Which `null` is which? Constructors with many optional parameters are hard to read and easy to get wrong ("telescoping constructor").

## In C#

```csharp
class ReportBuilder
{
    private readonly Report report = new Report();

    public ReportBuilder Title(string title) { report.Title = title; return this; }
    public ReportBuilder AddColumn(string name) { report.Columns.Add(name); return this; }
    public ReportBuilder SortBy(string column) { report.SortColumn = column; return this; }
    public ReportBuilder Top(int rows) { report.MaxRows = rows; return this; }

    public Report Build()
    {
        if (report.Columns.Count == 0) throw new InvalidOperationException("A report needs columns");
        return report;
    }
}

var report = new ReportBuilder()
    .Title("Sales")
    .AddColumn("Customer").AddColumn("Amount")
    .SortBy("Amount")
    .Top(50)
    .Build();
```

Each method returns `this`, so calls chain into a readable sentence (a **fluent interface**). `Build()` is the place to check that the object is complete.

## Where you already see it

- `StringBuilder`: append pieces, then `ToString()`.
- `WebApplication.CreateBuilder(args)` in ASP.NET Core: configure services, then `builder.Build()`.
- Test data builders: `new AccountBuilder().WithName("Acme").Inactive().Build()` keeps tests short.
- Query builders: `QueryExpression` in Dynamics, LINQ chains.

## When to use it, and when not to

- **Fits:** many optional parts, a strict build order, or validation before the object is ready.
- **Overkill:** an object with two or three fields. C# object initializers (`new Report { Title = "Sales" }`) or named arguments are enough.

## Remember

Builder = "construct step by step, finish with `Build()`". It fights unreadable constructors and half-made objects.
