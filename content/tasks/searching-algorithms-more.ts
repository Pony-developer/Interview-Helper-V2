import { defineTasks } from "@/lib/content/schema";
import { quiz } from "./_helpers";

const ALGO = { slug: "algorithms", weight: 0.5 };

export default defineTasks([
  quiz(
    "search-bfs-shortest",
    ["searching-algorithms", ALGO],
    2,
    60,
    ["Fewest steps in a grid", "Найменше кроків у сітці"],
    ["You need the fewest moves from the start to the exit of a maze, where every move costs the same. Which search guarantees that?", "Потрібно знайти найменшу кількість ходів від старту до виходу з лабіринту, де кожен хід коштує однаково. Який пошук це гарантує?"],
    [
      ["Depth-first search", "Пошук у глибину"],
      ["Breadth-first search", "Пошук у ширину"],
      ["Binary search", "Бінарний пошук"],
      ["Linear search over the cells", "Лінійний пошук по клітинках"],
    ],
    "b",
    [
      "BFS explores cells in order of distance from the start (all cells 1 move away, then 2, …), so the first time it reaches the exit is via a shortest path. DFS finds a path, not necessarily the shortest. With different move costs, use Dijkstra's algorithm instead.",
      "BFS обходить клітинки в порядку віддаленості від старту (усі на відстані 1 хід, потім 2, …), тож уперше він досягає виходу найкоротшим шляхом. DFS знаходить якийсь шлях, не обов'язково найкоротший. Якщо ходи мають різну вартість, використовуйте алгоритм Дейкстри.",
    ],
  ),
  quiz(
    "search-galloping",
    ["searching-algorithms", ALGO],
    5,
    120,
    ["Searching without a known length", "Пошук без відомої довжини"],
    ["A sorted, effectively unbounded sequence only offers `get(i)` (out of range returns `Infinity`). The target is at an unknown index `p`. Which strategy finds it in O(log p)?", "Відсортована, фактично нескінченна послідовність надає лише `get(i)` (поза межами повертає `Infinity`). Ціль на невідомому індексі `p`. Яка стратегія знайде її за O(log p)?"],
    [
      ["Linear scan from 0", "Лінійний перегляд від 0"],
      ["Exponential (galloping) search: check indexes 1, 2, 4, 8… until `get(i)` ≥ target, then binary search in the last range", "Експоненційний (галопуючий) пошук: перевіряти індекси 1, 2, 4, 8…, доки `get(i)` ≥ цілі, потім бінарний пошук в останньому діапазоні"],
      ["Binary search between 0 and `Number.MAX_SAFE_INTEGER`", "Бінарний пошук між 0 і `Number.MAX_SAFE_INTEGER`"],
      ["Jump search with steps of √n", "Стрибковий пошук із кроком √n"],
    ],
    "b",
    [
      "Doubling the probe index takes about log p steps to overshoot the target, and the final range [i/2, i] has size O(p), so the binary search adds another O(log p). Searching up to `MAX_SAFE_INTEGER` costs a constant ~53 steps, but it's O(log max), not proportional to where the target is, and jump search needs a known n. TimSort uses galloping when merging runs.",
      "Подвоєння індексу перевірки потребує близько log p кроків, щоб перескочити ціль, а останній діапазон [i/2, i] має розмір O(p), тож бінарний пошук додає ще O(log p). Пошук до `MAX_SAFE_INTEGER` коштує сталі ~53 кроки, але це O(log max), а не пропорційно положенню цілі, а стрибковому пошуку потрібне відоме n. TimSort використовує галопування під час злиття серій.",
    ],
  ),
]);
