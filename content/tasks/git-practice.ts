import { defineTasks } from "@/lib/content/schema";
import { practice, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const MERGE_STARTER = code`/** Commit id → ids of its parents. A root commit has no parents. */
export type Graph = Record<string, string[]>;

/** The best common ancestor of two commits, or null when their histories never meet. */
export function mergeBase(graph: Graph, a: string, b: string): string | null {
  // TODO: find the commits both histories share, then keep the closest ones
  return null;
}
`;

const MERGE_SOLUTION = code`export type Graph = Record<string, string[]>;

/** Every commit reachable from start, including start itself. */
function ancestors(graph: Graph, start: string): Set<string> {
  if (!Object.prototype.hasOwnProperty.call(graph, start)) throw new Error("Unknown commit: " + start);
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length > 0) {
    const commit = stack.pop()!;
    if (seen.has(commit)) continue;
    seen.add(commit);
    for (const parent of graph[commit]) stack.push(parent);
  }
  return seen;
}

export function mergeBase(graph: Graph, a: string, b: string): string | null {
  const fromA = ancestors(graph, a);
  const fromB = ancestors(graph, b);
  const common = [...fromA].filter((commit) => fromB.has(commit));
  // A "best" base is a common ancestor that no other common ancestor descends from.
  const best = common.filter((c) => !common.some((d) => d !== c && ancestors(graph, d).has(c)));
  // Criss-cross merges can leave several best bases: return the smallest id, so the answer is stable.
  return best.length > 0 ? best.sort()[0] : null;
}
`;

const MERGE_INDEX = code`import "./styles.css";
import { mergeBase } from "./src/merge-base";

const graph = { root: [], c1: ["root"], c2: ["c1"], main3: ["c2"], f1: ["c1"], f2: ["f1"], m: ["main3", "f2"] };
document.getElementById("app")!.innerHTML = '<h1>Merge base</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = "main3 and f2 branched at: " + mergeBase(graph, "main3", "f2");
`;

const MERGE_TESTS = code`import { describe, it, expect } from "./test-kit";
import { mergeBase } from "../src/merge-base";

// root ← c1 ← c2 ← main3 (main); c1 ← f1 ← f2 (feature); m merges main3 and f2
const graph = { root: [], c1: ["root"], c2: ["c1"], main3: ["c2"], f1: ["c1"], f2: ["f1"], m: ["main3", "f2"] };

describe("mergeBase", () => {
  it("finds the commit where two branches split", () => {
    expect(mergeBase(graph, "main3", "f2")).toBe("c1");
  });
  it("returns a commit itself when it's an ancestor of the other", () => {
    expect(mergeBase(graph, "c1", "f2")).toBe("c1");
    expect(mergeBase(graph, "f2", "f2")).toBe("f2");
  });
  it("works through merge commits", () => {
    expect(mergeBase(graph, "m", "root")).toBe("root");
    expect(mergeBase(graph, "m", "main3")).toBe("main3");
  });
  it("returns null for histories that never meet", () => {
    const split = { ...graph, x: [], y: [] };
    expect(mergeBase(split, "x", "y")).toBeNull();
  });
  it("picks the smallest id when there are two best bases", () => {
    const criss = { r1: [], r2: [], a1: ["r1", "r2"], b1: ["r1", "r2"] };
    expect(mergeBase(criss, "a1", "b1")).toBe("r1");
  });
  it("rejects unknown commits", () => {
    expect(() => mergeBase(graph, "nope", "f2")).toThrow("Unknown commit: nope");
  });
});
`;

export default defineTasks([
  practice({
    slug: "git-merge-base",
    skills: ["git", w("data-structures"), w("graphs")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Find the merge base of two branches", "Знайдіть спільного предка двох гілок"],
    prompt: [
      "`git merge-base` finds where two branches split. Implement `mergeBase(graph, a, b)` in `src/merge-base.ts`. The graph maps each commit to its parents (a root commit has none).\n\n- A commit counts as its own ancestor, so if `a` is an ancestor of `b` (or the reverse, or they're the same), the answer is that commit.\n- Otherwise, return the **best common ancestor**: a commit in both histories that no other common ancestor descends from. In a graph with merges, several can exist; return the smallest id, so the answer is stable.\n- Return `null` when the histories never meet, and throw `Unknown commit: <id>` for an id that isn't in the graph.",
      "`git merge-base` знаходить, де дві гілки розійшлися. Реалізуйте `mergeBase(graph, a, b)` у `src/merge-base.ts`. Граф зіставляє кожен коміт з його батьками (у кореневого коміту батьків немає).\n\n- Коміт є власним предком, тож якщо `a` є предком `b` (або навпаки, або це той самий коміт), відповідь — цей коміт.\n- Інакше поверніть **найкращого спільного предка**: коміт в обох історіях, якого не стосується жоден інший спільний предок. У графі з злиттями їх може бути кілька; поверніть найменший id, щоб відповідь була стабільною.\n- Поверніть `null`, коли історії ніколи не перетинаються, і кидайте `Unknown commit: <id>` для id, якого немає в графі.",
    ],
    files: {
      "/src/merge-base.ts": MERGE_STARTER,
      "/index.ts": MERGE_INDEX,
    },
    visibleFiles: ["/src/merge-base.ts"],
    activeFile: "/src/merge-base.ts",
    tests: MERGE_TESTS,
    solution: { "/src/merge-base.ts": MERGE_SOLUTION },
    explanation: [
      "Git's history is a directed acyclic graph, so the first step is the set of ancestors of each commit: a graph walk along parent links. The common ancestors are the intersection of those sets. Not all of them are useful: if one common ancestor descends from another, the older one is already implied, so the best base is the one nothing else in the intersection builds on. Real git uses a smarter walk ordered by commit date, but the definition is the same. Note that merge commits give a second parent, which is why a plain \"walk the first parent\" approach fails on histories with merges, and why this walk follows every parent.",
      "Історія Git є спрямованим ациклічним графом, тож перший крок — множина предків кожного коміту: обхід графа за посиланнями на батьків. Спільні предки — перетин цих множин. Не всі вони корисні: якщо один спільний предок є нащадком іншого, старший уже мається на увазі, тож найкраща база та, на яку ніщо інше в перетині не спирається. Справжній git використовує розумніший обхід за датою коміту, але визначення те саме. Зверніть увагу, що коміти злиття мають другого батька, тому простий обхід лише першого батька ламається на історіях зі злиттями, а цей обхід іде за всіма батьками.",
    ],
  }),
]);
