Often several algorithms have **the same skeleton** and differ only in some **steps**. Preparing tea and coffee: boil water, brew, pour, add something. Writing a report in text, CSV or Markdown: a header, the lines, a footer. The **template method** pattern keeps the skeleton in **one** place and lets the derived classes fill in the steps.

## Without a pattern: copies

```csharp
class TextReport
{
    public string Build(string[] items)
    {
        string text = "REPORT\n";
        for (int i = 0; i < items.Length; i++) text += (i + 1) + ". " + items[i] + "\n";
        return text + "Total: " + items.Length + "\n";
    }
}

class CsvReport
{
    public string Build(string[] items)
    {
        string text = "number,item\n";                              // the same loop, again
        for (int i = 0; i < items.Length; i++) text += (i + 1) + "," + items[i] + "\n";
        return text;
    }
}
```

The loop is copied. If tomorrow the report must skip empty items, you change it in every class, and miss one.

## With the template method

The base class has a method `Build` that **fixes the order of the steps**, and the steps are `abstract` or `virtual`:

```csharp
abstract class Report
{
    private readonly string[] items;

    protected Report(string[] items) { this.items = items; }

    protected int Count => items.Length;

    protected abstract string Header();                              // a step: must be written
    protected abstract string FormatItem(int number, string item);   // a step: must be written
    protected virtual string Footer() { return ""; }                 // a step with a default: a "hook"

    public string Build()                                            // the TEMPLATE METHOD
    {
        string text = Header() + "\n";
        for (int i = 0; i < items.Length; i++)
        {
            text += FormatItem(i + 1, items[i]) + "\n";
        }
        string footer = Footer();
        if (footer != "")
        {
            text += footer + "\n";
        }
        return text;
    }
}
```

```csharp
class CsvReport : Report
{
    public CsvReport(string[] items) : base(items) { }

    protected override string Header() { return "number,item"; }
    protected override string FormatItem(int number, string item) { return number + "," + item; }
    // the Footer is not overridden: no footer
}

class TextReport : Report
{
    public TextReport(string[] items) : base(items) { }

    protected override string Header() { return "REPORT"; }
    protected override string FormatItem(int number, string item) { return number + ". " + item; }
    protected override string Footer() { return "Total: " + Count + " items"; }
}

Console.Write(new CsvReport(new[] { "apple", "pear" }).Build());
// number,item
// 1,apple
// 2,pear
```

The skeleton (the header, the loop, the empty-footer rule) is written **once**. A new format is a new small class with two or three short methods.

## The principle: do not call us, we will call you

In ordinary code, **your** code calls a library. In a template method, it is **reversed**: the base class (the "framework") controls the flow and **calls the code of the derived classes** at the right moments. The derived class does not run the algorithm. It only answers the questions "what is the header?" and "how is a line formatted?". This is sometimes called the **Hollywood principle**: "do not call us, we will call you".

## Hooks

A step with a **default** behaviour (`virtual`) is a **hook**: a place where a derived class **may** change something, but does not have to. The `Footer` above is a hook. The mandatory steps are `abstract`.

## Details of the design

- Make the steps **`protected`**: they are for the derived classes only, and the outside code calls just `Build()`.
- Make the template method itself **non-virtual** (not `virtual`), so that the skeleton cannot be broken by a derived class.
- Keep the number of steps **small**. A template with twenty abstract steps is hard to implement.

## Template method or an interface?

The other way to vary an algorithm is **composition**: pass an object with an interface (such as `IFormatter`) to the class, and let it call the object. This is often more flexible, because the object can be **changed at run time**, and there is no inheritance. The template method fits when the steps are **tightly tied** to the skeleton and share data in the base class. Both are used in real code, and you should be able to choose.
