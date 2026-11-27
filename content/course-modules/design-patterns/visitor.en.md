**In plain words:** Visitor lets you **add new operations to a group of classes without editing those classes**. The operation lives in a separate "visitor" class that has one method per kind of object.

## A picture from life

A tax inspector visits different businesses: a shop, a restaurant, a factory. The businesses don't change; the inspector knows how to check each kind. Next month a fire inspector visits the same businesses with different checks, and the businesses still don't change.

## The problem

A document consists of `Paragraph`, `Image` and `Table`. Today you need "export to HTML", tomorrow "export to PDF", then "count words". Adding a method to every class each time spreads one feature over many files and fills the classes with unrelated code.

## In C#

```csharp
interface IVisitor
{
    void Visit(Paragraph p);
    void Visit(Image i);
}

abstract class Element
{
    public abstract void Accept(IVisitor visitor);
}

class Paragraph : Element
{
    public string Text;
    public override void Accept(IVisitor visitor) { visitor.Visit(this); }   // "this" picks the right overload
}

class Image : Element
{
    public string Url;
    public override void Accept(IVisitor visitor) { visitor.Visit(this); }
}

// A new operation = a new visitor. The element classes don't change
class HtmlExporter : IVisitor
{
    public readonly StringBuilder Html = new StringBuilder();
    public void Visit(Paragraph p) { Html.Append("<p>" + p.Text + "</p>"); }
    public void Visit(Image i) { Html.Append("<img src=\"" + i.Url + "\">"); }
}

var exporter = new HtmlExporter();
foreach (var element in document) element.Accept(exporter);
```

The trick is **double dispatch**: `Accept` is chosen by the element's type, and inside it `visitor.Visit(this)` is chosen by the visitor's type.

## The trade-off

| Adding... | With Visitor |
| --- | --- |
| a new **operation** | easy: one new visitor class |
| a new **kind of element** | hard: every visitor needs a new method |

So Visitor fits when the set of types is **stable** and the operations keep growing.

## Where you already see it

- Roslyn's `CSharpSyntaxVisitor` and `ExpressionVisitor` for LINQ expression trees: compilers and analyzers walk syntax trees with visitors.
- In modern C#, `switch` with type patterns (`case Paragraph p:`) is often a lighter alternative.

## Remember

Visitor = "**new operations without touching the classes**", paid for by making new classes expensive. It is the least common GoF pattern in everyday code; knowing when *not* to use it is part of the answer.
