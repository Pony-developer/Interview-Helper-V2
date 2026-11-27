## The X-DOM

LINQ to XML (`System.Xml.Linq`) is an in-memory object model for XML designed to be **built and queried with LINQ**. Its key types:

| Type | Represents |
| --- | --- |
| `XDocument` | a whole document: optional declaration, root element, comments, processing instructions |
| `XElement` | an element: name, attributes, child nodes |
| `XAttribute` | a name/value pair on an element (not a node) |
| `XText`, `XCData`, `XComment` | text, CDATA and comment nodes |
| `XName`, `XNamespace` | names, optionally namespace-qualified |

`XElement` is the workhorse: you rarely need an `XDocument` unless you care about the XML declaration or top-level comments.

## Loading and saving

```csharp
XElement config = XElement.Parse("<config><timeout>30</timeout></config>");
XDocument doc = XDocument.Load("orders.xml");        // file, stream, TextReader or XmlReader
doc.Save("copy.xml");
string text = config.ToString();                      // indented
string compact = config.ToString(SaveOptions.DisableFormatting);
```

## Functional construction

Build trees in a single expression by nesting constructors. Content arguments can be other elements, attributes, strings, numbers, `null` (ignored) or **sequences** of those, so LINQ queries plug right in:

```csharp
var xml = new XElement("orders",
    new XAttribute("generated", DateTime.UtcNow),
    from o in orders
    where o.Total > 0
    select new XElement("order",
        new XAttribute("id", o.Id),
        new XElement("customer", o.Customer),
        new XElement("total", o.Total),
        o.Note == null ? null : new XElement("note", o.Note)));   // optional element
```

Values are formatted the XML way (`XmlConvert`), so dates become ISO 8601 and decimals use a dot regardless of culture.

## Automatic deep cloning

A node can have only one parent. Adding a node that already has a parent to another tree **clones** it automatically:

```csharp
var a = new XElement("a", new XElement("child"));
var b = new XElement("b", a.Element("child"));   // b gets a copy; a keeps its child
```

## Projecting objects into XML and back

```csharp
// object → XML
XElement ToXml(Customer c) => new("customer", new XAttribute("id", c.Id), new XElement("name", c.Name));

// XML → object, with safe conversions
Customer FromXml(XElement e) => new Customer
{
    Id = (int)e.Attribute("id"),
    Name = (string)e.Element("name") ?? "",
    Discount = (decimal?)e.Element("discount") ?? 0m,   // missing element → null → 0
};
```

The explicit conversions (`(int)`, `(decimal?)`, `(DateTime)`, `(bool)`, `(string)`) on `XElement`/`XAttribute` parse with XML rules. The nullable ones return `null` when the node is missing instead of throwing.

## X-DOM vs the old XmlDocument

`System.Xml.XmlDocument` (the W3C DOM) still exists. LINQ to XML is simpler (no factory objects, no `XmlNamespaceManager` for queries), LINQ-friendly and lighter. Use `XmlDocument` only when an existing API requires it, or for XPath-heavy legacy code (though `System.Xml.XPath` extensions work on the X-DOM too).

## Interview takeaways

- `XElement`/`XAttribute`/`XDocument` form a LINQ-friendly XML DOM.
- Functional construction builds whole trees in one expression, with queries inside.
- Use the explicit conversions (`(decimal?)el`) to read values culture-safely.
