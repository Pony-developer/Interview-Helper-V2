---
skill: graphs
title: "Graph algorithms: traversal, ordering and shortest paths"
summary: "Representing graphs, BFS and DFS, cycle detection, topological sorting for dependency graphs, connected components, Dijkstra's shortest paths with a priority queue, and the complexity of each, with examples from frontend tooling."
readingMinutes: 9
---

A graph is a set of **nodes** (vertices) connected by **edges**, which may be directed and may carry weights. Frontend developers meet graphs more often than they think: module dependency graphs in bundlers, task runners and monorepo build order, routing between pages, social or org charts, and the DOM itself (a tree is a graph without cycles).

## Representations

| Representation | Memory | Check edge (u, v) | Iterate neighbours |
| --- | --- | --- | --- |
| Adjacency list (`Map<node, node[]>`) | O(V + E) | O(degree) | O(degree) |
| Adjacency matrix (`boolean[V][V]`) | O(V²) | O(1) | O(V) |

Most real graphs are sparse, so adjacency lists are the default. Store an undirected edge in both directions.

## BFS and DFS

```js
function bfs(graph, start) {
  const seen = new Set([start]);
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    for (const next of graph[queue[i]] ?? []) {
      if (!seen.has(next)) { seen.add(next); queue.push(next); } // mark when enqueued
    }
  }
  return queue; // nodes in order of distance from start
}
```

- **BFS** explores level by level with a queue. In an unweighted graph it finds shortest paths by number of edges. Mark nodes as seen when you **enqueue** them, or the same node can enter the queue many times.
- **DFS** goes deep first (recursion or a stack). It's the basis for cycle detection, topological sorting and finding connected components.

Both run in O(V + E) with an adjacency list (O(V²) with a matrix).

## Cycles and topological order

A **topological order** lists the nodes of a directed graph so every edge points forward: dependencies before the things that need them. It exists only for a **DAG** (directed acyclic graph).

- **Kahn's algorithm**: count unmet dependencies per node, start with the nodes that have none, and keep releasing nodes whose count drops to zero. If some nodes are never released, there's a cycle.
- **DFS**: after visiting all of a node's dependencies, add the node to the output (post-order).

For cycle detection in a directed graph, a single "visited" set isn't enough: in a diamond (A→B→D, A→C→D) you reach D twice without any cycle. Track nodes **on the current path** ("visiting") separately from finished ones; meeting a "visiting" node means a back edge, which is a cycle.

## Connected components

In an undirected graph, start a BFS/DFS from every node not yet seen; each start discovers one component. Union-find answers "are these connected?" incrementally as edges arrive.

## Shortest paths with weights

**Dijkstra's algorithm** finds shortest paths when all weights are **non-negative**: repeatedly take the closest unfinished node from a **priority queue** (min-heap) and relax its edges (`dist[v] = min(dist[v], dist[u] + w)`). With a binary heap it runs in O((V + E) log V). Skip "stale" heap entries whose distance is larger than the best known. Remember the predecessor of each node to rebuild the path.

Negative weights break Dijkstra's assumption that a finished node can't get cheaper; use Bellman-Ford (O(V·E)), which also detects negative cycles. A* adds a heuristic to guide the search toward the goal (maps, games).

## Interview checklist

- Choose between adjacency list and matrix and state the complexities.
- Write BFS and DFS, and explain why BFS gives shortest unweighted paths.
- Produce a build order with Kahn's algorithm and report cycles.
- Explain the visiting/visited distinction in cycle detection.
- Explain Dijkstra, why it needs non-negative weights, and its complexity with a heap.
