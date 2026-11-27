## Task

Build an **LRU (least recently used) cache** where both operations are O(1). It combines two collections:

- a `Dictionary` from key to the `LinkedListNode` holding that entry (O(1) lookup);
- a `LinkedList` that keeps entries in recency order, **most recent first** (O(1) move and remove when you hold the node).

Implement:

1. **`TryGet(key, out value)`**: if the key is present, move its node to the front of the list and return `true` with the value; otherwise return `false` and `default`.
2. **`Put(key, value)`**:
   - if the key already exists, remove its old node (it will be re-added at the front with the new value);
   - otherwise, if the cache is full, remove the **last** node of the list (the least recently used) and its dictionary entry;
   - add a new node at the front and store it in the dictionary.

Expected output:

```
True 1
False 0
c,d,a count=3
e,c,d
True 30
```
