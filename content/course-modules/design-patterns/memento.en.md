**In plain words:** Memento **saves a snapshot of an object's state** so you can **restore it later**, without exposing the object's private details to whoever keeps the snapshot.

## A picture from life

Saving a game before a boss fight. If things go badly, you load the save and you're back exactly where you were. The save file is a sealed box: you keep it, but you don't edit what's inside.

## The problem

A user edits a long form and presses "Cancel changes". Or an editor needs Undo. To restore the old state, someone has to remember it. If outside code copies the object's fields one by one, it must know all of them, including private ones, and breaks every time a field is added.

## In C#

```csharp
class Document
{
    private string text = "";
    private int cursor;

    public void Type(string words) { text += words; cursor = text.Length; }

    // The object itself makes and reads its snapshots, so private fields stay private
    public Snapshot Save() { return new Snapshot(text, cursor); }
    public void Restore(Snapshot s) { text = s.Text; cursor = s.Cursor; }

    public class Snapshot                      // the memento: immutable, nothing to edit
    {
        internal string Text { get; private set; }
        internal int Cursor { get; private set; }
        internal Snapshot(string text, int cursor) { Text = text; Cursor = cursor; }
    }
}

var doc = new Document();
var history = new Stack<Document.Snapshot>();   // the "caretaker" just stores snapshots

history.Push(doc.Save());
doc.Type("Hello");
history.Push(doc.Save());
doc.Type(", world");

doc.Restore(history.Pop());                     // back to "Hello"
```

## Memento vs Command for undo

- **Command** undo: each command knows how to *reverse itself* ("rename back to the old name"). Small, but every command needs its own undo logic.
- **Memento** undo: save the *whole state* before a change and put it back. Simple and reliable, but costs memory for big objects.

## Where you already see it

- "Discard changes" in forms, drafts, transactions that roll back.
- Saving an entity's original values before an update to compare or restore them (like the **PreImage** in a Dynamics plug-in, which is a snapshot of the record before the operation).

## Remember

Memento = "**save a sealed snapshot, restore it later**". The object makes and reads its own snapshots; others only store them.
