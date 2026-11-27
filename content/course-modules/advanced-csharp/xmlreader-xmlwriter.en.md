## Why stream XML

`XDocument.Load` builds the whole tree in memory: fine for megabytes, painful for gigabytes. `XmlReader` and `XmlWriter` are **forward-only, non-cached** APIs: constant memory, very fast, but you see one node at a time.

## XmlReader

```csharp
var settings = new XmlReaderSettings
{
    IgnoreWhitespace = true,
    IgnoreComments = true,
    DtdProcessing = DtdProcessing.Prohibit,   // the default: protects against XXE and entity-expansion attacks
    Async = true,
};

using XmlReader r = XmlReader.Create("orders.xml", settings);
while (r.Read())
{
    if (r.NodeType == XmlNodeType.Element && r.Name == "order")
    {
        int id = int.Parse(r.GetAttribute("id")!);
        Console.WriteLine($"order {id}");
    }
}
```

A reader is a cursor: `Read()` advances to the next node, and `NodeType`, `Name`, `Value`, `Depth`, `IsEmptyElement` describe the current one.

Helper methods make typical code shorter:

```csharp
r.ReadToFollowing("customer");            // skip to the next <customer>
r.ReadStartElement("order");              // assert and consume a start tag
string name = r.ReadElementContentAsString("name", "");
decimal total = r.ReadElementContentAsDecimal();
r.ReadToDescendant("line"); r.ReadToNextSibling("line");
r.Skip();                                  // skip the current element and its children
```

## The hybrid pattern

The most practical approach for large files: stream with `XmlReader`, but load **each record** as a small `XElement`:

```csharp
using var r = XmlReader.Create(path);
r.MoveToContent();
while (r.ReadToFollowing("order"))
{
    var order = (XElement)XNode.ReadFrom(r);   // just this <order> subtree
    Process((int)order.Attribute("id"), (decimal)order.Element("total"));
}
```

You get LINQ to XML convenience per record and constant memory overall.

## XmlWriter

```csharp
var settings = new XmlWriterSettings { Indent = true, Encoding = new UTF8Encoding(false) };
using XmlWriter w = XmlWriter.Create("export.xml", settings);
w.WriteStartDocument();
w.WriteStartElement("orders");
foreach (var o in orders)
{
    w.WriteStartElement("order");
    w.WriteAttributeString("id", o.Id.ToString(CultureInfo.InvariantCulture));
    w.WriteElementString("customer", o.Customer);           // escaping is automatic
    w.WriteStartElement("total");
    w.WriteValue(o.Total);                                   // XML-standard formatting
    w.WriteEndElement();
    w.WriteEndElement();
}
w.WriteEndElement();
```

Again, the hybrid trick works for output: `xelement.WriteTo(writer)` writes a small subtree built with functional construction.

## Security notes

- Keep `DtdProcessing.Prohibit` (or `Ignore`) for untrusted input: DTDs enable **XXE** (reading local files via external entities) and **billion laughs** (exponential entity expansion).
- `XmlResolver = null` stops the reader from fetching external resources.
- .NET Core's defaults are safe; old .NET Framework code using `XmlDocument.Load` with default settings may not be.

## Interview takeaways

- `XmlReader`/`XmlWriter`: forward-only, low memory, fast; X-DOM: convenient, in-memory.
- Hybrid: stream with `XmlReader`, materialize each record with `XNode.ReadFrom`.
- Don't enable DTD processing for untrusted XML.
