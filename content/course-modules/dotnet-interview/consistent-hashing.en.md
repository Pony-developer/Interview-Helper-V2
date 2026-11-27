## Task

From the observability lecture: partitioned systems (distributed caches, sharded databases, Kafka-like logs) must map keys to nodes so that adding or removing a node moves as few keys as possible. Implement a **consistent-hash ring** with virtual nodes.

`Hash` (FNV-1a with a final mixing step) is given — unlike `string.GetHashCode()`, it's the same in every process. Complete:

1. **`AddNode(node)`** — add `virtualNodes` points on the ring: `Hash(node + "#" + i)` for `i = 0 … virtualNodes - 1`; remember the owner of each point and keep `points` sorted (insert at `~BinarySearch(point)`; skip a point that already exists).
2. **`RemoveNode(node)`** — remove all of its points.
3. **`GetNode(key)`** — the owner of the first point **clockwise** from `Hash(key)`: the smallest point ≥ the hash, wrapping around to the first point when the hash is larger than all of them. `List.BinarySearch` returns the bitwise complement of the insertion index when the value isn't found.

The test distributes 3,000 keys over three nodes, adds a fourth one and counts how many keys moved — and compares it with plain `hash % N`, where going from 3 to 4 nodes moves most keys. With the ring, every moved key moves to the new node, and removing it restores the original mapping.

Expected output:

```
3 nodes: A=1042, B=1030, C=928
add D: moved 744 of 3000, all to D: True
modulo 3 -> 4: moved 2226
remove D: back to original True
```
