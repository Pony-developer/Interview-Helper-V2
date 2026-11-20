import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const ORDER_STARTER = String.raw`export class CycleError extends Error {
  constructor(readonly cycle: string[]) {
    super("Dependency cycle: " + cycle.join(" -> "));
    this.name = "CycleError";
  }
}

/**
 * deps[pkg] lists the packages pkg depends on. Returns an install order with
 * every dependency before the packages that need it.
 */
export function buildOrder(deps: Record<string, string[]>): string[] {
  // TODO
  return Object.keys(deps);
}
`;

const ORDER_SOLUTION = String.raw`export class CycleError extends Error {
  constructor(readonly cycle: string[]) {
    super("Dependency cycle: " + cycle.join(" -> "));
    this.name = "CycleError";
  }
}

export function buildOrder(deps: Record<string, string[]>): string[] {
  // Every package, including ones that only appear as dependencies.
  const nodes = new Set<string>();
  for (const [pkg, list] of Object.entries(deps)) {
    nodes.add(pkg);
    list.forEach((d) => nodes.add(d));
  }

  // Kahn's algorithm: count unmet dependencies, release packages when they reach zero.
  const unmet = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const n of nodes) {
    unmet.set(n, 0);
    dependents.set(n, []);
  }
  for (const [pkg, list] of Object.entries(deps)) {
    for (const d of new Set(list)) {
      unmet.set(pkg, unmet.get(pkg)! + 1);
      dependents.get(d)!.push(pkg);
    }
  }

  const ready = [...nodes].filter((n) => unmet.get(n) === 0);
  const order: string[] = [];
  while (ready.length) {
    ready.sort(); // deterministic: alphabetical among packages that are ready
    const next = ready.shift()!;
    order.push(next);
    for (const dependent of dependents.get(next)!) {
      const left = unmet.get(dependent)! - 1;
      unmet.set(dependent, left);
      if (left === 0) ready.push(dependent);
    }
  }

  if (order.length < nodes.size) throw new CycleError(findCycle(deps, new Set(order)));
  return order;
}

/** DFS that tracks the current path: reaching a node already on the path closes a cycle. */
function findCycle(deps: Record<string, string[]>, done: Set<string>): string[] {
  const state = new Map<string, "visiting" | "visited">();
  const path: string[] = [];
  const visit = (node: string): string[] | null => {
    if (state.get(node) === "visiting") return [...path.slice(path.indexOf(node)), node];
    if (state.get(node) === "visited" || done.has(node)) return null;
    state.set(node, "visiting");
    path.push(node);
    for (const d of deps[node] ?? []) {
      const cycle = visit(d);
      if (cycle) return cycle;
    }
    path.pop();
    state.set(node, "visited");
    return null;
  };
  for (const node of Object.keys(deps).sort()) {
    const cycle = visit(node);
    if (cycle) return cycle;
  }
  return [];
}
`;

const ORDER_INDEX = String.raw`import "./styles.css";
import { buildOrder } from "./src/order";

const workspace = {
  web: ["ui", "api-client"],
  ui: ["tokens", "utils"],
  "api-client": ["utils"],
  docs: ["ui"],
};
let text: string;
try {
  text = buildOrder(workspace).join(" → ");
} catch (e) {
  text = String(e);
}
document.getElementById("app")!.innerHTML = '<h1>Build order</h1><p><output id="order">' + text + "</output></p>";
`;

const ORDER_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { CycleError, buildOrder } from "../src/order";

describe("buildOrder", () => {
  it("puts dependencies first", () => {
    expect(buildOrder({ app: ["lib"], lib: ["core"], core: [] })).toEqual(["core", "lib", "app"]);
  });
  it("includes packages that only appear as dependencies", () => {
    expect(buildOrder({ app: ["react"] })).toEqual(["react", "app"]);
  });
  it("breaks ties alphabetically", () => {
    expect(buildOrder({ app: ["ui", "api"], ui: ["utils"], api: ["utils", "db"] })).toEqual(["db", "utils", "api", "ui", "app"]);
  });
  it("ignores duplicate dependencies", () => {
    expect(buildOrder({ a: ["b", "b"] })).toEqual(["b", "a"]);
  });
  it("orders a larger graph correctly", () => {
    const deps = {};
    for (let i = 0; i < 60; i++) deps["p" + i] = [i - 1, i - 7, Math.floor(i / 2) - 1].filter((j) => j >= 0 && j < i).map((j) => "p" + j);
    const order = buildOrder(deps);
    expect(order).toHaveLength(60);
    const pos = new Map(order.map((p, i) => [p, i]));
    const bad = Object.entries(deps).flatMap(([p, ds]) => ds.filter((d) => pos.get(d) > pos.get(p)).map((d) => d + " after " + p));
    expect(bad).toEqual([]);
  });
  it("reports a cycle with its path", () => {
    let error = null;
    try {
      buildOrder({ a: ["b"], b: ["c"], c: ["a"], d: [] });
    } catch (e) {
      error = e;
    }
    expect(error instanceof CycleError).toBe(true);
    const cycle = error.cycle;
    expect(cycle.length >= 3).toBe(true);
    expect(cycle[0]).toBe(cycle[cycle.length - 1]);
    const deps = { a: ["b"], b: ["c"], c: ["a"] };
    for (let i = 0; i < cycle.length - 1; i++) expect(deps[cycle[i]]).toContain(cycle[i + 1]);
    expect(error.message).toContain("->");
  });
  it("reports a self-dependency", () => {
    let error = null;
    try {
      buildOrder({ a: ["a"] });
    } catch (e) {
      error = e;
    }
    expect(error && error.cycle).toEqual(["a", "a"]);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("tokens → utils → api-client → ui → docs → web")).id).toBe("order");
  });
});
`;

const ROUTE_STARTER = String.raw`export type Edge = [from: string, to: string, weight: number];
export type Route = { distance: number; path: string[] };

/**
 * Cheapest route from start to end. Edges are undirected unless options.directed is true.
 */
export function shortestPath(edges: Edge[], start: string, end: string, options: { directed?: boolean } = {}): Route | null {
  // TODO: this finds the route with the fewest edges and ignores weights
  const graph = new Map<string, [string, number][]>();
  const link = (a: string, b: string, w: number) => {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a)!.push([b, w]);
  };
  for (const [a, b, w] of edges) {
    link(a, b, w);
    if (!options.directed) link(b, a, w);
  }
  const queue: [string, string[], number][] = [[start, [start], 0]];
  const seen = new Set([start]);
  while (queue.length) {
    const [node, path, distance] = queue.shift()!;
    if (node === end) return { distance, path };
    for (const [next, w] of graph.get(node) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push([next, [...path, next], distance + w]);
      }
    }
  }
  return null;
}
`;

const ROUTE_SOLUTION = String.raw`export type Edge = [from: string, to: string, weight: number];
export type Route = { distance: number; path: string[] };

class MinHeap<T> {
  private items: { key: number; value: T }[] = [];
  get size() {
    return this.items.length;
  }
  push(key: number, value: T) {
    const a = this.items;
    a.push({ key, value });
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (a[parent].key <= a[i].key) break;
      [a[parent], a[i]] = [a[i], a[parent]];
      i = parent;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l].key < a[m].key) m = l;
        if (r < a.length && a[r].key < a[m].key) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

export function shortestPath(edges: Edge[], start: string, end: string, options: { directed?: boolean } = {}): Route | null {
  const graph = new Map<string, [string, number][]>();
  const link = (a: string, b: string, w: number) => {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a)!.push([b, w]);
  };
  for (const [a, b, w] of edges) {
    if (!(w >= 0)) throw new RangeError("Dijkstra needs non-negative weights: " + a + " - " + b + " = " + w);
    link(a, b, w);
    if (!options.directed) link(b, a, w);
  }
  if (start === end) return { distance: 0, path: [start] };

  const dist = new Map<string, number>([[start, 0]]);
  const prev = new Map<string, string>();
  const heap = new MinHeap<string>();
  heap.push(0, start);
  while (heap.size) {
    const { key: d, value: node } = heap.pop();
    if (d > (dist.get(node) ?? Infinity)) continue; // stale entry: a shorter route was found later
    if (node === end) break;
    for (const [next, w] of graph.get(node) ?? []) {
      const candidate = d + w;
      if (candidate < (dist.get(next) ?? Infinity)) {
        dist.set(next, candidate);
        prev.set(next, node);
        heap.push(candidate, next);
      }
    }
  }

  if (!dist.has(end)) return null;
  const path = [end];
  while (path[0] !== start) path.unshift(prev.get(path[0])!);
  return { distance: dist.get(end)!, path };
}
`;

const ROUTE_INDEX = String.raw`import "./styles.css";
import { shortestPath, type Edge } from "./src/route";

const roads: Edge[] = [
  ["Home", "Park", 4],
  ["Home", "Cafe", 2],
  ["Cafe", "Park", 1],
  ["Park", "Office", 5],
  ["Cafe", "Office", 8],
  ["Office", "Gym", 3],
];
const route = shortestPath(roads, "Home", "Gym");
document.getElementById("app")!.innerHTML =
  "<h1>Route</h1><p>" + (route ? route.path.join(" → ") + ' (<output id="distance">' + route.distance + "</output> min)" : "No route") + "</p>";
`;

const ROUTE_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { shortestPath } from "../src/route";

const roads = [
  ["A", "B", 4],
  ["A", "C", 2],
  ["C", "B", 1],
  ["B", "D", 5],
  ["C", "D", 8],
  ["D", "E", 3],
];

describe("shortestPath", () => {
  it("finds the cheapest route, even with more hops", () => {
    expect(shortestPath(roads, "A", "E")).toEqual({ distance: 11, path: ["A", "C", "B", "D", "E"] });
  });
  it("treats edges as undirected by default", () => {
    expect(shortestPath(roads, "E", "A")).toEqual({ distance: 11, path: ["E", "D", "B", "C", "A"] });
  });
  it("respects directed edges", () => {
    const loop = [["A", "B", 1], ["B", "C", 1], ["C", "A", 1]];
    expect(shortestPath(loop, "C", "B", { directed: true })).toEqual({ distance: 2, path: ["C", "A", "B"] });
    expect(shortestPath(loop, "C", "B")).toEqual({ distance: 1, path: ["C", "B"] });
  });
  it("handles unreachable, unknown and identical endpoints", () => {
    expect(shortestPath([["A", "B", 1], ["X", "Y", 1]], "A", "Y")).toBe(null);
    expect(shortestPath(roads, "A", "Z")).toBe(null);
    expect(shortestPath(roads, "B", "B")).toEqual({ distance: 0, path: ["B"] });
  });
  it("rejects negative weights", () => {
    expect(() => shortestPath([["A", "B", -1]], "A", "B")).toThrow();
  });
  it("is fast on a 60 x 60 grid", () => {
    const edges = [];
    const id = (r, c) => r + ":" + c;
    for (let r = 0; r < 60; r++) {
      for (let c = 0; c < 60; c++) {
        if (c < 59) edges.push([id(r, c), id(r, c + 1), 1 + ((r * 7 + c) % 3)]);
        if (r < 59) edges.push([id(r, c), id(r + 1, c), 1 + ((r + c * 5) % 3)]);
      }
    }
    const started = Date.now();
    const route = shortestPath(edges, id(0, 0), id(59, 59));
    expect(route.path[0]).toBe("0:0");
    expect(route.path[route.path.length - 1]).toBe("59:59");
    expect(route.distance <= 118 * 3).toBe(true);
    expect(Date.now() - started < 2000).toBe(true);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("11")).id).toBe("distance");
  });
});
`;

export default defineTasks([
  quiz(
    "graph-representation",
    ["graphs"],
    1,
    45,
    ["Storing a sparse graph", "Зберігання розрідженого графа"],
    ["A social network has 1,000,000 users with about 200 friends each. Which representation fits?", "Соцмережа має 1 000 000 користувачів, у кожного приблизно 200 друзів. Яке представлення підходить?"],
    [
      ["An adjacency list: memory grows with V + E", "Список суміжності: пам'ять росте як V + E"],
      ["An adjacency matrix: memory grows with V²", "Матриця суміжності: пам'ять росте як V²"],
      ["A single sorted array of all user ids", "Один відсортований масив id усіх користувачів"],
      ["A linked list of users", "Зв'язний список користувачів"],
    ],
    "a",
    [
      "With V = 10⁶, a matrix needs 10¹² cells, almost all empty. An adjacency list stores only existing edges (about 2 × 10⁸ entries) and iterates a user's friends in O(degree). Matrices only make sense for small or dense graphs, or when O(1) edge lookups dominate.",
      "За V = 10⁶ матриця потребує 10¹² клітинок, майже всі порожні. Список суміжності зберігає лише наявні ребра (близько 2 × 10⁸ записів) і перебирає друзів користувача за O(степінь). Матриці мають сенс лише для малих чи щільних графів або коли домінують перевірки ребра за O(1).",
    ],
  ),
  quiz(
    "graph-dfs-bfs-order",
    ["graphs", w("recursion")],
    2,
    90,
    ["DFS vs BFS order", "Порядок DFS і BFS"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`DFS A B D C` and `BFS A B C D`", "`DFS A B D C` і `BFS A B C D`"],
      ["`DFS A B C D` and `BFS A B D C`", "`DFS A B C D` і `BFS A B D C`"],
      ["`DFS A B D C D` and `BFS A B C D`", "`DFS A B D C D` і `BFS A B C D`"],
      ["Both print `A B C D`", "Обидва виводять `A B C D`"],
    ],
    "a",
    [
      "DFS follows one branch to the end before backtracking: A → B → D, then back to C (D is already seen). BFS visits all neighbours of A (B, C) before moving one level further (D). The shared `seen` set stops D from being visited twice.",
      "DFS проходить одну гілку до кінця, перш ніж повернутися: A → B → D, потім назад до C (D уже побачено). BFS відвідує всіх сусідів A (B, C), перш ніж перейти на рівень далі (D). Спільна множина `seen` не дає відвідати D двічі.",
    ],
    {
      code: 'const graph = { A: ["B", "C"], B: ["D"], C: ["D"], D: [] };\n\nfunction dfs(node, seen = new Set(), out = []) {\n  if (seen.has(node)) return out;\n  seen.add(node);\n  out.push(node);\n  for (const next of graph[node]) dfs(next, seen, out);\n  return out;\n}\n\nfunction bfs(start) {\n  const seen = new Set([start]);\n  const queue = [start];\n  for (let i = 0; i < queue.length; i++) {\n    for (const next of graph[queue[i]]) {\n      if (!seen.has(next)) { seen.add(next); queue.push(next); }\n    }\n  }\n  return queue;\n}\n\nconsole.log("DFS", ...dfs("A"));\nconsole.log("BFS", ...bfs("A"));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "graph-topological-use",
    ["graphs", w("algorithms")],
    2,
    60,
    ["Build order", "Порядок збирання"],
    ["A monorepo tool must build packages so every package's dependencies are built first. Which algorithm does that, and what must be true of the graph?", "Інструмент монорепозиторію має збирати пакети так, щоб залежності кожного пакета збиралися першими. Який алгоритм це робить і якою має бути структура графа?"],
    [
      ["Topological sort; the dependency graph must have no cycles (a DAG)", "Топологічне сортування; граф залежностей не повинен мати циклів (DAG)"],
      ["Dijkstra; all weights must be positive", "Дейкстра; усі ваги мають бути додатними"],
      ["Binary search; packages must be sorted by name", "Бінарний пошук; пакети мають бути відсортовані за назвою"],
      ["BFS; the graph must be undirected", "BFS; граф має бути ненапрямленим"],
    ],
    "a",
    [
      "A topological order lists nodes so every edge points forward, which is exactly \"dependencies first\". It exists only when there's no cycle: if A needs B and B needs A, neither can go first. Bundlers, `tsc --build`, Nx and Turborepo all order work this way and report cycles as errors.",
      "Топологічний порядок перелічує вершини так, що кожне ребро веде вперед, а це й означає «спершу залежності». Він існує лише за відсутності циклів: якщо A потребує B, а B потребує A, жоден не може бути першим. Бандлери, `tsc --build`, Nx і Turborepo впорядковують роботу саме так і повідомляють про цикли як про помилки.",
    ],
  ),
  quiz(
    "graph-cycle-false-positive",
    ["graphs"],
    3,
    120,
    ["A cycle detector with a bug", "Детектор циклів із багом"],
    ["What does this print, and is it right?", "Що виведе цей код і чи правильно це?"],
    [
      ["`true`, which is wrong: the diamond A→B→D, A→C→D has no cycle; track nodes on the current path separately from finished ones", "`true`, і це хибно: ромб A→B→D, A→C→D не має циклу; відстежуйте вершини на поточному шляху окремо від завершених"],
      ["`false`, which is right", "`false`, і це правильно"],
      ["`true`, which is right: D is reachable twice", "`true`, і це правильно: до D можна дійти двічі"],
      ["It overflows the stack", "Переповнює стек"],
    ],
    "a",
    [
      "Reaching an already visited node is only a cycle if that node is still **on the current DFS path** (a back edge). Here D was fully explored via B, so reaching it again via C is just a second route. Use two sets (or colours): \"visiting\" for the current path and \"done\" for finished nodes.",
      "Досягнення вже відвіданої вершини є циклом, лише якщо ця вершина досі **на поточному шляху DFS** (зворотне ребро). Тут D повністю оброблено через B, тож повторне досягнення через C є просто другим маршрутом. Використовуйте дві множини (або кольори): «відвідується» для поточного шляху й «завершено» для оброблених вершин.",
    ],
    {
      code: 'function hasCycle(graph) {\n  const visited = new Set();\n  const visit = (n) => {\n    if (visited.has(n)) return true;\n    visited.add(n);\n    return (graph[n] || []).some(visit);\n  };\n  return Object.keys(graph).some((n) => !visited.has(n) && visit(n));\n}\nconsole.log(hasCycle({ A: ["B", "C"], B: ["D"], C: ["D"], D: [] }));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "graph-components",
    ["graphs"],
    3,
    90,
    ["Counting components", "Підрахунок компонент"],
    ["An undirected graph has nodes 1–8 and edges 1–2, 2–3, 4–5, 6–7. How many connected components does it have?", "Ненапрямлений граф має вершини 1–8 і ребра 1–2, 2–3, 4–5, 6–7. Скільки в ньому компонент зв'язності?"],
    [
      ["4", "4"],
      ["3", "3"],
      ["8", "8"],
      ["5", "5"],
    ],
    "a",
    [
      "The components are {1, 2, 3}, {4, 5}, {6, 7} and {8}: an isolated node is a component on its own. To count them, start a BFS/DFS from every node that hasn't been seen yet and count the starts (O(V + E)), or merge edges with union-find.",
      "Компоненти: {1, 2, 3}, {4, 5}, {6, 7} і {8}: ізольована вершина сама є компонентою. Щоб їх порахувати, запускайте BFS/DFS із кожної ще не побаченої вершини й рахуйте запуски (O(V + E)) або об'єднуйте ребра через union-find.",
    ],
  ),
  quiz(
    "graph-dijkstra-negative",
    ["graphs", w("algorithms")],
    3,
    90,
    ["Negative weights", "Від'ємні ваги"],
    ["Why can Dijkstra's algorithm return wrong answers when some edge weights are negative?", "Чому алгоритм Дейкстри може повертати хибні відповіді, коли деякі ваги ребер від'ємні?"],
    [
      ["It finalises the closest node assuming no later path can be cheaper, which a negative edge can violate; use Bellman-Ford", "Він фіксує найближчу вершину, вважаючи, що жоден пізніший шлях не буде дешевшим, а від'ємне ребро може це порушити; використовуйте Беллмана-Форда"],
      ["The priority queue can't store negative numbers", "Черга з пріоритетом не може зберігати від'ємні числа"],
      ["Negative weights make the graph undirected", "Від'ємні ваги роблять граф ненапрямленим"],
      ["It only works on trees", "Він працює лише на деревах"],
    ],
    "a",
    [
      "Dijkstra's correctness relies on paths only getting longer as you add edges. With a negative edge, a node already taken from the queue could be reached more cheaply later. Bellman-Ford relaxes every edge V − 1 times (O(V·E)) and can also detect negative cycles, where no shortest path exists.",
      "Коректність Дейкстри спирається на те, що шляхи лише довшають із додаванням ребер. З від'ємним ребром до вершини, вже взятої з черги, згодом можна дістатися дешевше. Беллман-Форд релаксує кожне ребро V − 1 разів (O(V·E)) і також виявляє від'ємні цикли, коли найкоротшого шляху не існує.",
    ],
  ),
  quiz(
    "graph-bfs-mark-when",
    ["graphs"],
    4,
    120,
    ["When to mark nodes in BFS", "Коли позначати вершини в BFS"],
    ["This BFS marks nodes as seen when they're **dequeued**, not when they're enqueued. What goes wrong on a dense graph?", "Цей BFS позначає вершини як побачені, коли їх **виймають** із черги, а не коли додають. Що піде не так на щільному графі?"],
    [
      ["The same node can be enqueued many times before it's processed, wasting time and memory", "Ту саму вершину можуть додати в чергу багато разів до обробки, що марнує час і пам'ять"],
      ["It returns wrong distances", "Він повертає неправильні відстані"],
      ["It turns into DFS", "Він перетворюється на DFS"],
      ["Nothing; both are equivalent", "Нічого; обидва варіанти рівнозначні"],
    ],
    "a",
    [
      "Between being discovered and being dequeued, a node can be discovered again by every other neighbour, so the queue may hold up to O(E) entries instead of O(V). Distances stay correct (the first copy dequeued has the smallest level), but the work and memory blow up. Mark nodes as seen at the moment you enqueue them.",
      "Між виявленням і вийманням із черги вершину можуть знову виявити всі інші сусіди, тож черга може містити до O(E) записів замість O(V). Відстані лишаються правильними (перша вийнята копія має найменший рівень), але робота й пам'ять різко зростають. Позначайте вершини як побачені в момент додавання в чергу.",
    ],
    {
      code: "function bfs(graph, start) {\n  const seen = new Set();\n  const queue = [start];\n  while (queue.length) {\n    const node = queue.shift();\n    if (seen.has(node)) continue;\n    seen.add(node); // marked on dequeue\n    for (const next of graph[node]) if (!seen.has(next)) queue.push(next);\n  }\n  return seen;\n}",
      codeLanguage: "js",
    },
  ),
  quiz(
    "graph-kahn-order",
    ["graphs", w("algorithms")],
    4,
    150,
    ["Kahn's algorithm by hand", "Алгоритм Кана вручну"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'db', 'utils', 'api', 'ui', 'app' ]`", "`[ 'db', 'utils', 'api', 'ui', 'app' ]`"],
      ["`[ 'app', 'api', 'ui', 'db', 'utils' ]`", "`[ 'app', 'api', 'ui', 'db', 'utils' ]`"],
      ["`[ 'db', 'utils', 'ui', 'api', 'app' ]`", "`[ 'db', 'utils', 'ui', 'api', 'app' ]`"],
      ["`[ 'utils', 'db', 'api', 'ui', 'app' ]`", "`[ 'utils', 'db', 'api', 'ui', 'app' ]`"],
    ],
    "a",
    [
      "Initially only `db` and `utils` have no dependencies; alphabetically `db` goes first. It releases nothing yet (`api` still needs `utils`). Then `utils` releases both `ui` and `api`; alphabetically `api` comes first, then `ui`, and finally `app`, whose dependencies are now all done.",
      "Спочатку лише `db` і `utils` не мають залежностей; за алфавітом першим іде `db`. Він ще нічого не вивільняє (`api` досі потребує `utils`). Потім `utils` вивільняє і `ui`, і `api`; за алфавітом спершу `api`, потім `ui`, і нарешті `app`, усі залежності якого вже готові.",
    ],
    {
      code: 'const deps = { app: ["ui", "api"], ui: ["utils"], api: ["utils", "db"], db: [], utils: [] };\nconst unmet = Object.fromEntries(Object.entries(deps).map(([k, v]) => [k, v.length]));\nconst ready = Object.keys(deps).filter((k) => unmet[k] === 0);\nconst order = [];\nwhile (ready.length) {\n  ready.sort();\n  const next = ready.shift();\n  order.push(next);\n  for (const [pkg, list] of Object.entries(deps)) {\n    if (list.includes(next) && --unmet[pkg] === 0) ready.push(pkg);\n  }\n}\nconsole.log(order);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "graph-dfs-postorder",
    ["graphs", w("recursion")],
    5,
    150,
    ["Topological order with DFS", "Топологічний порядок через DFS"],
    [
      "`deps[pkg]` lists what `pkg` depends on. A DFS-based install order visits a package's dependencies recursively. When should the package itself be appended to the output?",
      "`deps[pkg]` перелічує, від чого залежить `pkg`. Порядок встановлення на основі DFS рекурсивно відвідує залежності пакета. Коли треба додати сам пакет до результату?",
    ],
    [
      ["After all its dependencies have been visited (post-order); the output is then already in install order", "Після відвідування всіх його залежностей (post-order); тоді результат уже в порядку встановлення"],
      ["Before visiting its dependencies (pre-order)", "Перед відвідуванням залежностей (pre-order)"],
      ["When it's first seen, then reverse the output at the end", "Коли його вперше побачено, а наприкінці розвернути результат"],
      ["Order doesn't matter as long as every package is listed once", "Порядок не важливий, аби кожен пакет був один раз"],
    ],
    "a",
    [
      "Post-order guarantees that by the time a package is appended, every package it depends on has already been appended. Pre-order would list `app` before `react`. (If edges point the other way, from a dependency to its dependents, you'd reverse the post-order instead.) Add a \"visiting\" set to report cycles.",
      "Post-order гарантує, що на момент додавання пакета кожен пакет, від якого він залежить, уже додано. Pre-order вивів би `app` раніше за `react`. (Якщо ребра напрямлені навпаки, від залежності до залежних, post-order треба розвернути.) Додайте множину «відвідується», щоб повідомляти про цикли.",
    ],
  ),
  practice({
    slug: "graph-build-order",
    skills: ["graphs", w("algorithms"), w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Workspace build order", "Порядок збирання робочого простору"],
    prompt: [
      "Implement `buildOrder(deps)` in `src/order.ts`, where `deps[pkg]` lists the packages `pkg` depends on (a topological sort):\n\n- Return **every** package, including ones that only appear as dependencies, with each dependency before the packages that need it.\n- When several packages are ready at the same time, take them in **alphabetical** order, so the result is deterministic.\n- Ignore duplicate entries in a dependency list.\n- If there's a cycle, throw a `CycleError` whose `cycle` is a closed path following dependency edges, like `[\"a\", \"b\", \"c\", \"a\"]` (a self-dependency gives `[\"a\", \"a\"]`).",
      "Реалізуйте `buildOrder(deps)` у `src/order.ts`, де `deps[pkg]` перелічує пакети, від яких залежить `pkg` (топологічне сортування):\n\n- Поверніть **кожен** пакет, зокрема ті, що трапляються лише як залежності, так, щоб кожна залежність ішла раніше за пакети, яким вона потрібна.\n- Коли кілька пакетів готові одночасно, беріть їх в **алфавітному** порядку, щоб результат був детермінованим.\n- Ігноруйте повтори в списку залежностей.\n- Якщо є цикл, киньте `CycleError`, чий `cycle` є замкненим шляхом уздовж ребер залежностей, наприклад `[\"a\", \"b\", \"c\", \"a\"]` (залежність від себе дає `[\"a\", \"a\"]`).",
    ],
    files: { "/src/order.ts": ORDER_STARTER, "/index.ts": ORDER_INDEX },
    visibleFiles: ["/src/order.ts", "/index.ts"],
    activeFile: "/src/order.ts",
    tests: ORDER_TESTS,
    solution: { "/src/order.ts": ORDER_SOLUTION },
    explanation: [
      "Kahn's algorithm counts unmet dependencies, starts from packages with none, and releases dependents as their counts reach zero; sorting the ready list makes ties deterministic. Packages that are never released are exactly those on or behind a cycle, so a DFS that tracks the current path over the remaining packages finds and reports one. Total cost is O(V + E) plus the sorting of ready packages.",
      "Алгоритм Кана рахує незадоволені залежності, починає з пакетів без них і вивільняє залежні пакети, коли їхні лічильники доходять до нуля; сортування списку готових робить нічиї детермінованими. Пакети, які так і не вивільнилися, лежать на циклі або за ним, тож DFS із відстеженням поточного шляху по решті пакетів знаходить і повідомляє цикл. Загальна вартість O(V + E) плюс сортування готових пакетів.",
    ],
  }),
  practice({
    slug: "graph-shortest-route",
    skills: ["graphs", w("data-structures"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Shortest route with Dijkstra", "Найкоротший маршрут за Дейкстрою"],
    prompt: [
      "`shortestPath(edges, start, end, options)` in `src/route.ts` currently returns the route with the **fewest edges**, ignoring travel times. Implement **Dijkstra's algorithm**:\n\n- Return `{ distance, path }` for the cheapest route (`path` from `start` to `end`, inclusive), or `null` if `end` can't be reached (including unknown nodes).\n- Edges are undirected unless `options.directed` is `true`.\n- `start === end` returns `{ distance: 0, path: [start] }`.\n- Throw a `RangeError` if any weight is negative (Dijkstra's assumption).\n- It must handle a 60 × 60 grid (3,600 nodes) quickly. A binary-heap priority queue is ideal; skip stale entries.",
      "`shortestPath(edges, start, end, options)` у `src/route.ts` зараз повертає маршрут із **найменшою кількістю ребер**, ігноруючи час у дорозі. Реалізуйте **алгоритм Дейкстри**:\n\n- Поверніть `{ distance, path }` для найдешевшого маршруту (`path` від `start` до `end` включно) або `null`, якщо до `end` не дістатися (зокрема для невідомих вершин).\n- Ребра ненапрямлені, якщо `options.directed` не дорівнює `true`.\n- `start === end` повертає `{ distance: 0, path: [start] }`.\n- Киньте `RangeError`, якщо будь-яка вага від'ємна (припущення Дейкстри).\n- Функція має швидко обробляти сітку 60 × 60 (3600 вершин). Ідеальна черга з пріоритетом на бінарній купі; пропускайте застарілі записи.",
    ],
    files: { "/src/route.ts": ROUTE_STARTER, "/index.ts": ROUTE_INDEX },
    visibleFiles: ["/src/route.ts", "/index.ts"],
    activeFile: "/src/route.ts",
    tests: ROUTE_TESTS,
    solution: { "/src/route.ts": ROUTE_SOLUTION },
    explanation: [
      "Dijkstra always expands the closest unfinished node, taken from a min-heap, and relaxes its edges; with non-negative weights the first time a node is popped its distance is final. Instead of a decrease-key operation, it pushes duplicates and skips entries whose key is larger than the best known distance. Predecessors recorded during relaxation rebuild the path. Cost: O((V + E) log V).",
      "Дейкстра завжди розширює найближчу незавершену вершину, взяту з мін-купи, і релаксує її ребра; з невід'ємними вагами відстань вершини стає остаточною, щойно її вперше вийнято. Замість операції зменшення ключа алгоритм додає дублікати й пропускає записи, чий ключ більший за найкращу відому відстань. Попередники, записані під час релаксації, відновлюють шлях. Вартість: O((V + E) log V).",
    ],
  }),
]);
