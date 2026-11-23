A recursive method can also be an iterator. Consider a tree of folders, where each folder may contain files and other folders. Listing all files, however deep, is a natural recursion:

```csharp
class Node
{
    public string Name;
    public List<Node> Children = new List<Node>();

    public Node(string name) { Name = name; }
}

static IEnumerable<string> ListNames(Node node)
{
    yield return node.Name;                        // the node itself first
    foreach (Node child in node.Children)
    {
        foreach (string name in ListNames(child))  // the recursive call is an iterator too
        {
            yield return name;                     // pass its items up one level
        }
    }
}
```

```csharp
var root = new Node("root");
var docs = new Node("docs");
docs.Children.Add(new Node("guide.txt"));
root.Children.Add(docs);
root.Children.Add(new Node("app.exe"));

foreach (string name in ListNames(root))
{
    Console.WriteLine(name);
}
// root
// docs
// guide.txt
// app.exe
```

## The double loop

In the recursive call, the inner `foreach` receives the items of the child, and each one is passed up with `yield return`. C# has no shorthand for this (unlike Python's `yield from`), so the forwarding loop is written out.

## The cost

Each level of the tree adds one more iterator in the chain. Every item passes through all the levels between it and the root. For a deep tree this costs time proportional to depth per item. For shallow trees, the cost is small.

## Another use: a binary tree in order

```csharp
static IEnumerable<int> InOrder(TreeNode node)
{
    if (node == null) yield break;
    foreach (int x in InOrder(node.Left)) yield return x;
    yield return node.Value;
    foreach (int x in InOrder(node.Right)) yield return x;
}
```

The values come out sorted, without building a list of all of them first.
