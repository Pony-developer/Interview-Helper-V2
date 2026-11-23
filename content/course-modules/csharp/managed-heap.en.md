Objects of classes live on the **managed heap**. You create them with `new`, but you never free them: the **garbage collector** (GC) does it for you. To reason about performance and leaks, you need to know how it decides what to free.

## Allocation is cheap

The runtime keeps a pointer to the free space at the end of the heap. `new` just moves this pointer forward by the size of the object and clears the memory. This is much faster than `malloc` in C, which has to search for a free block.

## What is garbage: reachability

An object is **alive** if the program can still get to it through a chain of references starting at a **root**. Roots are:

- local variables and parameters of the methods that are running now, on the stacks of all threads;
- static fields;
- a few special handles (for example, objects pinned for native code).

Everything that cannot be reached from a root is garbage, whatever references it still has. Two objects that point to each other, but that nobody else points to, are garbage too: cycles are not a problem for a tracing GC (unlike reference counting).

```csharp
var a = new Node();
var b = new Node();
a.Next = b;
b.Next = a;     // a cycle
a = null;
b = null;       // both nodes are now unreachable, and both will be collected
```

## How a collection works

1. **Mark**: the GC starts at the roots and marks every object it can reach.
2. **Sweep and compact**: the unmarked objects are dead. The GC moves the live objects together, closing the gaps, and updates every reference to the moved objects.

While the GC marks and moves objects, it has to **pause** the managed threads (much of the work on old objects is done in the background, but short pauses remain). That is why a program that allocates a lot has more and longer pauses.

## When it runs

A collection starts when the memory budget for new objects is used up, when the system is low on memory, or when someone calls `GC.Collect()`. You cannot predict the exact moment. So the GC is the wrong tool for releasing anything other than memory.

## What the GC does not manage

File handles, sockets, database connections, locks in other processes, memory allocated by native code: the GC does not know about them. It might destroy the object that holds them much later, or never. They need explicit release, which is the job of `IDisposable`.

## The rule

An object lives as long as it is reachable from a root. To free memory, stop referencing what you no longer need; to free other resources, call `Dispose`.
