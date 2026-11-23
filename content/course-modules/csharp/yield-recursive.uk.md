Рекурсивний метод теж може бути ітератором. Розгляньмо дерево папок, де в кожній папці можуть бути файли та інші папки. Перелік усіх файлів, на якій б глибині вони не були, — природна рекурсія:

```csharp
class Node
{
    public string Name;
    public List<Node> Children = new List<Node>();

    public Node(string name) { Name = name; }
}

static IEnumerable<string> ListNames(Node node)
{
    yield return node.Name;                        // спершу сам вузол
    foreach (Node child in node.Children)
    {
        foreach (string name in ListNames(child))  // рекурсивний виклик теж є ітератором
        {
            yield return name;                     // передаємо його елементи на рівень вище
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

## Подвійний цикл

У рекурсивному виклику внутрішній `foreach` отримує елементи дочірнього вузла, і кожен передається далі через `yield return`. У C# немає скороченого запису для цього (на відміну від `yield from` у Python), тому цикл передачі пишуть явно.

## Ціна

Кожен рівень дерева додає ще один ітератор у ланцюжок. Кожен елемент проходить усі рівні між собою і коренем. Для глибокого дерева це коштує часу, пропорційного глибині, на кожен елемент. Для неглибоких дерев вартість мала.

## Інше застосування: бінарне дерево в порядку обходу

```csharp
static IEnumerable<int> InOrder(TreeNode node)
{
    if (node == null) yield break;
    foreach (int x in InOrder(node.Left)) yield return x;
    yield return node.Value;
    foreach (int x in InOrder(node.Right)) yield return x;
}
```

Значення виходять відсортованими, без попереднього створення списку всіх елементів.
