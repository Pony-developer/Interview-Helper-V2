---
skill: data-structures
title: "Data structures: choosing the right container"
summary: "Arrays, hash maps, sets, stacks, queues, linked lists, trees, heaps and graphs: what each is fast at and when to reach for it."
readingMinutes: 9
---

Choosing the right data structure usually decides the complexity before you write a line of code. Learn what each structure makes cheap.

## The cheat sheet

| Structure | Access | Search | Insert/delete | Typical use |
| --- | --- | --- | --- | --- |
| Array | O(1) by index | O(n) | O(n) in the middle, O(1) amortised at the end | ordered lists, stacks |
| Hash map / `Map` | — | O(1) avg | O(1) avg | lookups by key, counting, caching |
| Set | — | O(1) avg | O(1) avg | membership, de-duplication |
| Stack | top O(1) | — | push/pop O(1) | undo, parsing, DFS |
| Queue | front O(1) | — | enqueue/dequeue O(1)* | BFS, task scheduling |
| Linked list | O(n) | O(n) | O(1) with a node reference | LRU caches, frequent splicing |
| Binary search tree (balanced) | O(log n) | O(log n) | O(log n) | ordered data, ranges |
| Heap | min/max O(1) | — | O(log n) | priority queues, top-k |

*Using `array.shift()` is O(n). A real queue needs a head index or a linked list.

## Hash maps

JavaScript's `Map` preserves insertion order, accepts any key type and has `size`. Use it instead of plain objects for dynamic keys. Typical patterns:

- **Counting**: `count.set(x, (count.get(x) ?? 0) + 1)`.
- **Two-sum**: store `value → index` while scanning, so each lookup is O(1).
- **Grouping**: key → array of items.

## Stacks and queues

A stack is last-in, first-out. Use it to match brackets, evaluate expressions and drive DFS iteratively.

```ts
function balanced(s: string) {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const ch of s) {
    if ("([{".includes(ch)) stack.push(ch);
    else if (ch in pairs && stack.pop() !== pairs[ch]) return false;
  }
  return stack.length === 0;
}
```

A queue is first-in, first-out. Breadth-first search uses one to visit nodes level by level.

## Linked lists and the LRU cache

A doubly linked list lets you remove a known node in O(1). Combine it with a Map (key → node) and you get an **LRU cache** with O(1) `get` and `put`. In JavaScript you can cheat elegantly: a `Map` keeps insertion order, so delete and re-insert a key to mark it most recent, and evict `map.keys().next().value`.

## Trees

- A **binary search tree** keeps left < node < right. It's only fast when balanced (AVL, red-black).
- Traversals: in-order (sorted output for a BST), pre-order (copying), post-order (deleting), level-order (BFS).
- The DOM, JSON and file systems are trees. Recursion is the natural tool.

## Heaps

A binary heap stored in an array gives O(1) peek and O(log n) push/pop. Use it for "k largest", merging sorted lists and Dijkstra's algorithm. JavaScript has no built-in heap, so be ready to sketch one.

## Graphs

Represent a graph as an adjacency list (`Map<node, node[]>`). Use BFS for shortest paths in unweighted graphs and DFS for connectivity and cycle detection. Keep a `visited` Set to avoid infinite loops.

## Interview checklist

- State the operations you need and their frequency, then pick the structure.
- Reach for a Map/Set to remove nested loops.
- Know how to implement a queue without `shift`, an LRU cache and a bracket matcher.
- Mention balance for trees and the array-backed heap.
