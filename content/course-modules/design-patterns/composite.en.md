**In plain words:** Composite lets you treat **a single item and a group of items the same way**. A group can contain items *and other groups*, so you get a tree, and one method call works on the whole tree.

## A picture from life

A box can hold products and smaller boxes. To find the total price of a shipment, you ask the big box, it asks everything inside, and the smaller boxes ask their contents. Nobody needs to know how deep the boxes go.

## The problem

Folders contain files and other folders. Code that computes the size of a folder ends up full of `if (item is Folder) ... else if (item is File) ...` and recursion written by hand in every place.

## In C#

```csharp
interface IFileSystemItem
{
    string Name { get; }
    long GetSize();
}

class FileItem : IFileSystemItem                     // a leaf
{
    public string Name { get; private set; }
    private readonly long size;

    public FileItem(string name, long size) { Name = name; this.size = size; }

    public long GetSize() { return size; }
}

class Folder : IFileSystemItem                       // a composite: holds other items
{
    public string Name { get; private set; }
    private readonly List<IFileSystemItem> children = new List<IFileSystemItem>();

    public Folder(string name) { Name = name; }

    public void Add(IFileSystemItem item) { children.Add(item); }

    public long GetSize() { return children.Sum(c => c.GetSize()); }   // the call goes down the tree
}

var root = new Folder("project");
var src = new Folder("src");
src.Add(new FileItem("Program.cs", 1200));
root.Add(src);
root.Add(new FileItem("README.md", 300));

Console.WriteLine(root.GetSize());   // 1500: the caller doesn't care what's file and what's folder
```

## Where you already see it

- UI trees: a panel contains buttons and other panels; rendering or resizing goes through the whole tree.
- Menus with submenus, organization charts, business unit hierarchies.
- Expression trees: `(a + b) * c` is a node containing nodes.
- Filters in `QueryExpression`: a `FilterExpression` holds conditions and nested filters.

## When to use it, and when not to

- **Fits:** the data is naturally a tree, and you want to run the same operation over parts and wholes.
- **Careful:** a shared interface can force leaves to have meaningless methods (`File.Add(...)`?). Keep `Add` on the composite only, as above.

## Remember

Composite = "a group looks like a single item". It's the pattern for trees.
