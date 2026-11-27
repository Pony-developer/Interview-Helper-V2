## Navigating

```csharp
XElement root = XElement.Load("shop.xml");

root.Element("customers");                 // first direct child with that name (or null)
root.Elements("order");                    // all direct children named "order"
root.Descendants("line");                  // all matching elements at any depth
root.Attribute("version");                 // an attribute (or null)
el.Parent; el.Ancestors(); el.ElementsAfterSelf(); el.NextNode;
root.Nodes();                              // all child nodes, including text and comments
```

Every method returns `IEnumerable<...>`, so you query with ordinary LINQ:

```csharp
var bigOrders =
    from o in root.Descendants("order")
    let total = (decimal)o.Element("total")
    where total > 100
    orderby total descending
    select new { Id = (int)o.Attribute("id"), Total = total };
```

`Element(...)` returning null is the main source of bugs: chaining `.Element("a").Element("b").Value` throws if `a` is missing. Prefer the explicit conversions to nullable types, or `?.`.

## Updating

```csharp
var order = root.Element("order");
order.SetElementValue("status", "shipped");      // update, add if missing, remove if value is null
order.SetAttributeValue("updated", DateTime.UtcNow);
order.Add(new XElement("note", "fragile"));
order.AddFirst(new XComment("checked"));
order.Element("legacy")?.Remove();
order.ReplaceNodes(new XElement("empty"));
root.Descendants("draft").Remove();              // remove every matching element (an extension on the sequence)
```

`el.Value` gets or sets the concatenated text of an element and all its descendants. Setting it replaces all child nodes with one text node.

## Working with values

- **Mixed content**: `<p>Hello <b>world</b>!</p>` has text, element, text nodes; `p.Value` is `"Hello world!"`.
- **Whitespace** is ignored on load unless you pass `LoadOptions.PreserveWhitespace`.
- Special characters are escaped automatically on output: you never write `&amp;` yourself.

## Names and namespaces

An XML name is a namespace plus a local name. In LINQ to XML, `XName` combines them:

```csharp
XNamespace ns = "urn:shop:v2";
var el = new XElement(ns + "order",
    new XAttribute(XNamespace.Xmlns + "s", ns),   // choose the prefix "s" on output
    new XElement(ns + "id", 42));
// <s:order xmlns:s="urn:shop:v2"><s:id>42</s:id></s:order>

var orders = doc.Descendants(ns + "order");      // queries must use the namespace too
```

A **default namespace** (`xmlns="..."`) applies to elements but **not** to attributes; unprefixed attributes have no namespace. Forgetting the namespace in a query is the classic "my query returns nothing" bug with SOAP, RSS/Atom, and Office XML.

## Annotations

`el.AddAnnotation(obj)` attaches private, non-serialized data to a node (e.g. a line number or a mapping to a domain object). Retrieve with `el.Annotation<T>()`.

## Interview takeaways

- `Elements` = direct children; `Descendants` = any depth; both return LINQ-queryable sequences.
- `SetElementValue`/`SetAttributeValue` update, add or remove in one call.
- Namespaced XML needs `XNamespace + "name"` in queries; default namespaces don't apply to attributes.
