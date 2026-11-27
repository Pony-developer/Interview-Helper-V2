## Task

Question 89: "What is tree balancing?" A binary search tree is fast only while it is short. Insert 1, 2, …, 7 in order and you get a "tree" that is really a linked list of height 7. Complete `Bst`:

1. **`Insert(value)`** — smaller values go left, larger go right, duplicates are ignored.
2. **`Height()`** — 0 for an empty tree, 1 for a single node, otherwise 1 + the height of the taller subtree.
3. **`IsBalanced()`** — true when for **every** node the heights of its left and right subtrees differ by at most 1 (the AVL condition). Checking only the root is not enough. Efficient approach: one recursive function that returns the height of a balanced subtree, or −1 as soon as it finds an unbalanced node — O(n) instead of recomputing heights at every node.
4. **`InOrder()`** — the values in ascending order (left subtree, node, right subtree).
5. **`Rebalance()`** — rebuild a perfectly balanced tree from the sorted values: the middle element becomes the root, the left half builds the left subtree and the right half the right one, recursively.

Self-balancing trees (AVL, red-black — `SortedDictionary`, `SortedSet`) do small rotations after every insert instead of a full rebuild, keeping the height O(log n) at all times.

Expected output:

```
1 2 3 4 5 6 7
height 7, balanced False
height 3, balanced True, root 4
1 2 3 4 5 6 7
height 3, balanced True
height 5, balanced False
empty: height 0, balanced True
```
