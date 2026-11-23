`Select` gives one result for each input item. But what if each item contains **several** results, such as a list of lists? `SelectMany` gives all the results in one flat sequence.

```csharp
var sentences = new[] { "the cat", "a big dog" };

var words = sentences.Select(s => s.Split(' '));          // 2 arrays inside: { {the,cat}, {a,big,dog} }
var allWords = sentences.SelectMany(s => s.Split(' '));   // one flat sequence: the, cat, a, big, dog
```

`Select` keeps the nesting: the result is a sequence of sequences. `SelectMany` removes one level: the lambda returns a sequence for each item, and all the sequences are joined end to end.

## A common pattern

Take every item of every group:

```csharp
var orders = new[]
{
    new { Customer = "Ann", Items = new[] { "pen", "ink" } },
    new { Customer = "Bob", Items = new[] { "pad" } }
};

var lines = orders.SelectMany(o => o.Items.Select(item => o.Customer + " bought " + item));
// Ann bought pen, Ann bought ink, Bob bought pad
```

The inner `Select` builds the lines for one order, and the outer `SelectMany` joins them all.

## The index form

`SelectMany` also has an overload with the item's index, the same as `Select`:

```csharp
var numbered = sentences.SelectMany((s, i) => s.Split(' ').Select(w => i + ":" + w));
```

## When to use it

Whenever the answer to "for each item, give me several things" is needed: all the words of all the lines, all the tags of all the posts, all the rows of all the tables. If you find yourself writing two nested `foreach` loops that build a list, `SelectMany` is the usual replacement.
