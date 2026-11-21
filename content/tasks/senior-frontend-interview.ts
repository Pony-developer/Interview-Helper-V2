import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. Avoid `${` inside (it would be interpolated). */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");
const lines = (...l: string[]) => l.join("\n");

// ── Practice 1: closure counter factory ──────────────────────────────────────

const COUNTER_STARTER = String.raw`export interface CounterOptions {
  start?: number;
  step?: number;
  min?: number;
  max?: number;
}

export interface Counter {
  increment(): number;
  decrement(): number;
  reset(): number;
  readonly value: number;
}

// BUG: this state is shared by every counter, and the options are ignored.
let count = 0;

export function createCounter(options: CounterOptions = {}): Counter {
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    reset() {
      count = 0;
      return count;
    },
    get value() {
      return count;
    },
  };
}
`;

const COUNTER_SOLUTION = String.raw`export interface CounterOptions {
  start?: number;
  step?: number;
  min?: number;
  max?: number;
}

export interface Counter {
  increment(): number;
  decrement(): number;
  reset(): number;
  readonly value: number;
}

export function createCounter({ start = 0, step = 1, min = -Infinity, max = Infinity }: CounterOptions = {}): Counter {
  if (!Number.isFinite(step) || step === 0) throw new RangeError("step must be a finite, non-zero number");
  if (min > max) throw new RangeError("min must not be greater than max");

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  // Private state: only the functions below can see or change it.
  let count = clamp(start);

  return {
    increment() {
      count = clamp(count + step);
      return count;
    },
    decrement() {
      count = clamp(count - step);
      return count;
    },
    reset() {
      count = clamp(start);
      return count;
    },
    get value() {
      return count;
    },
  };
}
`;

const COUNTER_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createCounter } from "../src/counter";

describe("createCounter", () => {
  it("counts from 0 by 1 by default", () => {
    const c = createCounter();
    expect(c.value).toBe(0);
    expect(c.increment()).toBe(1);
    expect(c.increment()).toBe(2);
    expect(c.decrement()).toBe(1);
    expect(c.value).toBe(1);
  });
  it("supports a custom start and step", () => {
    const c = createCounter({ start: 10, step: 5 });
    expect(c.value).toBe(10);
    expect(c.increment()).toBe(15);
    expect(c.decrement()).toBe(10);
    expect(c.decrement()).toBe(5);
  });
  it("gives every counter its own private state", () => {
    const a = createCounter();
    const b = createCounter({ start: 100 });
    a.increment();
    a.increment();
    expect(a.value).toBe(2);
    expect(b.value).toBe(100);
    b.decrement();
    expect(a.value).toBe(2);
  });
  it("reset goes back to the start value", () => {
    const c = createCounter({ start: 3, step: 2 });
    c.increment();
    c.increment();
    expect(c.reset()).toBe(3);
    expect(c.value).toBe(3);
  });
  it("clamps to min and max", () => {
    const c = createCounter({ start: 8, step: 3, min: 0, max: 10 });
    expect(c.increment()).toBe(10);
    expect(c.increment()).toBe(10);
    const low = createCounter({ start: 1, step: 3, min: 0 });
    expect(low.decrement()).toBe(0);
    expect(createCounter({ start: 50, max: 10 }).value).toBe(10);
  });
  it("keeps the count private: no extra properties and value is read-only", () => {
    const c = createCounter({ start: 5 });
    expect(Object.keys(c).sort()).toEqual(["decrement", "increment", "reset", "value"]);
    try {
      c.value = 99;
    } catch (e) {
      // strict mode throws for a getter without a setter; sloppy mode ignores the write
    }
    expect(c.value).toBe(5);
  });
  it("rejects invalid options", () => {
    expect(() => createCounter({ step: 0 })).toThrow();
    expect(() => createCounter({ step: NaN })).toThrow();
    expect(() => createCounter({ step: Infinity })).toThrow();
    expect(() => createCounter({ min: 5, max: 1 })).toThrow();
  });
});
`;

// ── Practice 2: cookies ──────────────────────────────────────────────────────

const COOKIE_STARTER = String.raw`export interface CookieOptions {
  /** Seconds. 0 deletes the cookie. */
  maxAge?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none" | "Strict" | "Lax" | "None";
}

/** Builds a Set-Cookie header value. */
export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  // TODO: encode the value, add the attributes (in the order listed in the task) and validate the input
  return name + "=" + value;
}

/** Parses a Cookie request header into a Map. */
export function parseCookies(header: string): Map<string, string> {
  // TODO
  return new Map();
}
`;

const COOKIE_SOLUTION = String.raw`export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none" | "Strict" | "Lax" | "None";
}

// RFC 6265 "token": no spaces, separators or control characters.
const TOKEN = /^[\w!#$%&'*+.^\x60|~-]+$/;
const SAME_SITE: Record<string, string> = { strict: "Strict", lax: "Lax", none: "None" };

function safeAttribute(label: string, value: string) {
  // A ";" or a newline would let a caller smuggle in extra attributes or headers.
  if (/[;\r\n]/.test(value)) throw new TypeError("Invalid " + label + ": " + value);
  return value;
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  if (!TOKEN.test(name)) throw new TypeError("Invalid cookie name: " + name);
  const { maxAge, expires, domain, path, httpOnly, secure, sameSite } = options;
  const parts = [name + "=" + encodeURIComponent(value)];

  if (maxAge !== undefined) {
    if (!Number.isInteger(maxAge)) throw new RangeError("maxAge must be an integer number of seconds");
    parts.push("Max-Age=" + maxAge);
  }
  if (expires) {
    if (Number.isNaN(expires.getTime())) throw new RangeError("Invalid expires date");
    parts.push("Expires=" + expires.toUTCString());
  }
  if (domain) parts.push("Domain=" + safeAttribute("domain", domain));
  if (path) parts.push("Path=" + safeAttribute("path", path));
  if (httpOnly) parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  if (sameSite !== undefined) {
    const normalised = SAME_SITE[String(sameSite).toLowerCase()];
    if (!normalised) throw new TypeError("Invalid SameSite value: " + sameSite);
    // Browsers reject SameSite=None cookies that are not Secure.
    if (normalised === "None" && !secure) throw new Error("SameSite=None requires the Secure attribute");
    parts.push("SameSite=" + normalised);
  }
  return parts.join("; ");
}

export function parseCookies(header: string): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const pair of header.split(";")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue; // no "=": not a cookie
    const name = pair.slice(0, eq).trim();
    if (!name || cookies.has(name)) continue; // the first occurrence wins
    let value = pair.slice(eq + 1).trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    try {
      value = decodeURIComponent(value);
    } catch (error) {
      // malformed percent-encoding: keep the raw value
    }
    cookies.set(name, value);
  }
  return cookies;
}
`;

const COOKIE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { parseCookies, serializeCookie } from "../src/cookies";

describe("serializeCookie", () => {
  it("builds a bare name=value pair", () => {
    expect(serializeCookie("sid", "abc")).toBe("sid=abc");
  });
  it("percent-encodes the value", () => {
    expect(serializeCookie("q", "a b;c=d")).toBe("q=a%20b%3Bc%3Dd");
  });
  it("adds attributes in a fixed order and normalises SameSite", () => {
    const header = serializeCookie("sid", "abc", {
      sameSite: "lax",
      secure: true,
      httpOnly: true,
      path: "/",
      domain: "example.com",
      maxAge: 3600,
    });
    expect(header).toBe("sid=abc; Max-Age=3600; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Lax");
  });
  it("supports Expires as a UTC date and Max-Age=0 to delete", () => {
    expect(serializeCookie("a", "1", { expires: new Date(Date.UTC(2030, 0, 1)) })).toBe("a=1; Expires=Tue, 01 Jan 2030 00:00:00 GMT");
    expect(serializeCookie("a", "", { maxAge: 0 })).toBe("a=; Max-Age=0");
  });
  it("rejects invalid names and non-integer lifetimes", () => {
    expect(() => serializeCookie("bad name", "x")).toThrow();
    expect(() => serializeCookie("a;b", "x")).toThrow();
    expect(() => serializeCookie("", "x")).toThrow();
    expect(() => serializeCookie("a", "x", { maxAge: 1.5 })).toThrow();
  });
  it("rejects attribute injection through domain or path", () => {
    expect(() => serializeCookie("a", "x", { path: "/; Secure" })).toThrow();
    expect(() => serializeCookie("a", "x", { domain: "example.com\r\nSet-Cookie: b=1" })).toThrow();
  });
  it("validates SameSite, and None requires Secure", () => {
    expect(() => serializeCookie("a", "x", { sameSite: "bogus" })).toThrow();
    expect(() => serializeCookie("a", "x", { sameSite: "none" })).toThrow();
    expect(serializeCookie("a", "x", { sameSite: "None", secure: true })).toBe("a=x; Secure; SameSite=None");
  });
});

describe("parseCookies", () => {
  it("splits pairs, trims and decodes values", () => {
    const c = parseCookies("a=1; b=hello%20world; c=");
    expect([...c]).toEqual([
      ["a", "1"],
      ["b", "hello world"],
      ["c", ""],
    ]);
  });
  it("keeps everything after the first = in the value", () => {
    expect(parseCookies("token=abc==; x=y").get("token")).toBe("abc==");
  });
  it("ignores pairs without a name or without =, and the first duplicate wins", () => {
    const c = parseCookies("junk; =orphan; a=1; a=2");
    expect([...c.keys()]).toEqual(["a"]);
    expect(c.get("a")).toBe("1");
  });
  it("strips surrounding quotes and tolerates malformed percent-encoding", () => {
    const c = parseCookies('q="x y"; bad=%E0%A4%A');
    expect(c.get("q")).toBe("x y");
    expect(c.get("bad")).toBe("%E0%A4%A");
  });
  it("is case-sensitive about names and handles an empty header", () => {
    const c = parseCookies("A=1; a=2");
    expect(c.get("A")).toBe("1");
    expect(c.get("a")).toBe("2");
    expect(parseCookies("").size).toBe(0);
  });
});
`;

// ── Practice 3: deepFreeze / lockProps ───────────────────────────────────────

const FREEZE_STARTER = String.raw`/**
 * Freezes value and everything reachable from it (nested objects and arrays), and returns the same value.
 * Object.freeze alone is shallow.
 */
export function deepFreeze<T>(value: T): Readonly<T> {
  // TODO: nested objects, cycles, and never call getters
  return Object.freeze(value);
}

/**
 * Makes the listed own properties read-only AND non-deletable, leaving the other properties alone.
 * Throws a TypeError for a key that isn't an own property. Returns the same object.
 */
export function lockProps<T extends object>(obj: T, ...keys: (keyof T)[]): T {
  // TODO
  return obj;
}
`;

const FREEZE_SOLUTION = String.raw`export function deepFreeze<T>(value: T): Readonly<T> {
  const seen = new WeakSet<object>(); // makes cycles and shared references safe

  const visit = (node: unknown): void => {
    if (node === null || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    Object.freeze(node);
    // Reflect.ownKeys includes symbols and non-enumerable keys.
    for (const key of Reflect.ownKeys(node)) {
      const descriptor = Object.getOwnPropertyDescriptor(node, key)!;
      // Read the descriptor, not node[key]: accessor properties must never be invoked.
      if ("value" in descriptor) visit(descriptor.value);
    }
  };

  visit(value);
  return value;
}

export function lockProps<T extends object>(obj: T, ...keys: (keyof T)[]): T {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      throw new TypeError("Cannot lock missing property: " + String(key));
    }
    Object.defineProperty(obj, key, { writable: false, configurable: false });
  }
  return obj;
}
`;

const FREEZE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { deepFreeze, lockProps } from "../src/freeze";

describe("deepFreeze", () => {
  it("freezes nested objects and arrays and returns the same reference", () => {
    const config = { api: { url: "/v1", retries: [1, 2, { delay: 5 }] }, name: "app" };
    const result = deepFreeze(config);
    expect(result).toBe(config);
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.api)).toBe(true);
    expect(Object.isFrozen(config.api.retries)).toBe(true);
    expect(Object.isFrozen(config.api.retries[2])).toBe(true);
  });
  it("passes primitives and null through", () => {
    expect(deepFreeze(5)).toBe(5);
    expect(deepFreeze("x")).toBe("x");
    expect(deepFreeze(null)).toBe(null);
    expect(deepFreeze(undefined)).toBe(undefined);
  });
  it("terminates on cycles and shared references", () => {
    const a = { name: "a", self: null, list: [] };
    a.self = a;
    a.list.push(a);
    const shared = { n: 1 };
    const root = { left: { shared }, right: { shared }, a };
    deepFreeze(root);
    expect(Object.isFrozen(a)).toBe(true);
    expect(Object.isFrozen(a.list)).toBe(true);
    expect(Object.isFrozen(shared)).toBe(true);
  });
  it("still descends into children of an already-frozen object", () => {
    const outer = Object.freeze({ inner: { deep: { x: 1 } } });
    deepFreeze(outer);
    expect(Object.isFrozen(outer.inner)).toBe(true);
    expect(Object.isFrozen(outer.inner.deep)).toBe(true);
  });
  it("freezes symbol-keyed and non-enumerable properties", () => {
    const sym = Symbol("meta");
    const o = { [sym]: { a: 1 } };
    Object.defineProperty(o, "hidden", { value: { b: 2 }, enumerable: false });
    deepFreeze(o);
    expect(Object.isFrozen(o[sym])).toBe(true);
    expect(Object.isFrozen(o.hidden)).toBe(true);
  });
  it("never invokes getters", () => {
    let calls = 0;
    const o = {
      get lazy() {
        calls++;
        return { v: 1 };
      },
    };
    deepFreeze(o);
    expect(calls).toBe(0);
  });
});

describe("lockProps", () => {
  it("makes only the listed properties read-only and non-configurable", () => {
    const cfg = { apiUrl: "/v1", debug: false };
    const result = lockProps(cfg, "apiUrl");
    expect(result).toBe(cfg);
    const locked = Object.getOwnPropertyDescriptor(cfg, "apiUrl");
    expect(locked.writable).toBe(false);
    expect(locked.configurable).toBe(false);
    const open = Object.getOwnPropertyDescriptor(cfg, "debug");
    expect(open.writable).toBe(true);
    expect(open.configurable).toBe(true);
  });
  it("keeps the value, and the object itself stays extensible", () => {
    const cfg = { a: 1, b: 2 };
    lockProps(cfg, "a", "b");
    expect(cfg.a).toBe(1);
    expect(cfg.b).toBe(2);
    expect(Object.isExtensible(cfg)).toBe(true);
    expect(Object.isFrozen(cfg)).toBe(false);
  });
  it("throws for a missing or inherited property", () => {
    expect(() => lockProps({ a: 1 }, "nope")).toThrow();
    expect(() => lockProps({ a: 1 }, "toString")).toThrow();
  });
});
`;

// ── Practice 4: refactor a React table ───────────────────────────────────────

const TABLE_ANALYTICS = code`/** Stand-in for a real analytics client: remembers every event it was given. */
export const events: string[] = [];

export function track(name: string) {
  events.push(name);
}
`;

const TABLE_DATA = code`export type RawRow = { id: number; name: string; status: string };

export const RAW_V1: RawRow[] = [
  { id: 1, name: "Auth", status: "ok" },
  { id: 2, name: "Billing", status: "warn" },
  { id: 3, name: "Search", status: "fail" },
  { id: 4, name: "API", status: "ok" },
];

// What the backend returns after "Reload data".
export const RAW_V2: RawRow[] = [
  { id: 1, name: "Auth", status: "ok" },
  { id: 2, name: "Billing", status: "ok" },
  { id: 3, name: "Search", status: "maintenance" },
  { id: 4, name: "API", status: "warn" },
  { id: 5, name: "Mail", status: "ok" },
];
`;

const TABLE_APP = code`import { useState } from "react";
import { RAW_V1, RAW_V2 } from "./data";
import { StatusTable } from "./StatusTable";

export default function App() {
  const [version, setVersion] = useState(1);
  return (
    <main>
      <h1>Service status</h1>
      <button type="button" onClick={() => setVersion((v) => (v === 1 ? 2 : 1))}>
        Reload data
      </button>
      <StatusTable rows={version === 1 ? RAW_V1 : RAW_V2} />
    </main>
  );
}
`;

const TABLE_STARTER = code`import { useState } from "react";
import { track } from "./analytics";
import type { RawRow } from "./data";

const STATUS: Record<string, string> = { ok: "Operational", warn: "Degraded", fail: "Down" };

export function StatusTable(props: { rows: RawRow[] }) {
  const [items] = useState(() => props.rows.map((r) => ({ ...r, label: STATUS[r.status] || "Unknown" })));
  const [query, setQuery] = useState("");

  track("table_opened");

  const Row = ({ item }: { item: RawRow & { label: string } }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <tr data-testid={"row-" + item.id}>
          <td>{item.name}</td>
          <td>{item.label}</td>
          <td>
            <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
              Details
            </button>
          </td>
        </tr>
        {open && (
          <tr>
            <td colSpan={3} data-testid={"details-" + item.id}>
              Details for {item.name}
            </td>
          </tr>
        )}
      </>
    );
  };

  const visible = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <section>
      <label htmlFor="q">Filter services</label>
      <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} />
      {visible.length === 0 ? (
        <p>No services match</p>
      ) : (
        <table>
          <tbody>
            {visible.map((item, index) => (
              <Row key={index} item={item} />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
`;

const TABLE_SOLUTION = code`import { useEffect, useMemo, useState } from "react";
import { track } from "./analytics";
import type { RawRow } from "./data";

const STATUS = { ok: "Operational", warn: "Degraded", fail: "Down" } as const;

const labelOf = (status: string) =>
  Object.prototype.hasOwnProperty.call(STATUS, status) ? STATUS[status as keyof typeof STATUS] : "Unknown";

// Declared at module level: one stable component type, so rows keep their state across renders.
function Row({ row }: { row: RawRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr data-testid={"row-" + row.id}>
        <td>{row.name}</td>
        <td>{labelOf(row.status)}</td>
        <td>
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            Details
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={3} data-testid={"details-" + row.id}>
            Details for {row.name}
          </td>
        </tr>
      )}
    </>
  );
}

export function StatusTable({ rows }: { rows: RawRow[] }) {
  const [query, setQuery] = useState("");

  // A side effect belongs in an effect, with [] so it runs once per mount, not once per render.
  useEffect(() => {
    track("table_opened");
  }, []);

  // Derived from props and state during render: no copy of props in state, so new rows show up.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <section>
      <label htmlFor="q">Filter services</label>
      <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} />
      {visible.length === 0 ? (
        <p>No services match</p>
      ) : (
        <table>
          <tbody>
            {visible.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
`;

const TABLE_TESTS = code`import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, within, user, flush } from "./test-kit";
import App from "../App";
import { events } from "../analytics";

// A fresh, non-StrictMode copy of <App/> per test, so effects run exactly as many times as in production.
async function mount() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(h(App));
  await flush();
  await flush();
  return {
    ui: within(el),
    unmount() {
      root.unmount();
      el.remove();
    },
  };
}
const opened = () => events.filter((e) => e === "table_opened").length;
const cell = (ui, id) => within(ui.getByTestId("row-" + id));

describe("StatusTable", () => {
  it("shows a readable label for each status, with a fallback for unknown ones", async () => {
    const app = await mount();
    expect(cell(app.ui, 1).getByText("Operational")).toBeInTheDocument();
    expect(cell(app.ui, 2).getByText("Degraded")).toBeInTheDocument();
    expect(cell(app.ui, 3).getByText("Down")).toBeInTheDocument();
    await user.click(app.ui.getByRole("button", { name: "Reload data" }));
    expect(cell(app.ui, 3).getByText("Unknown")).toBeInTheDocument();
    app.unmount();
  });
  it("sends table_opened exactly once, however often it re-renders", async () => {
    const before = opened();
    const app = await mount();
    await user.type(app.ui.getByLabelText("Filter services"), "bil");
    await user.click(app.ui.getByRole("button", { name: "Reload data" }));
    expect(opened() - before).toBe(1);
    app.unmount();
  });
  it("filters case-insensitively and shows an empty state", async () => {
    const app = await mount();
    const input = app.ui.getByLabelText("Filter services");
    await user.type(input, "BI");
    expect(app.ui.queryByTestId("row-2")).toBeInTheDocument();
    expect(app.ui.queryByTestId("row-1")).toBeNull();
    await user.clear(input);
    await user.type(input, "zzz");
    expect(app.ui.getByText("No services match")).toBeInTheDocument();
    expect(app.ui.queryByTestId("row-2")).toBeNull();
    app.unmount();
  });
  it("keeps a row's expanded state while the filter changes (stable component, keys by id)", async () => {
    const app = await mount();
    await user.click(within(app.ui.getByTestId("row-4")).getByRole("button", { name: "Details" }));
    expect(app.ui.getByTestId("details-4")).toBeInTheDocument();
    // "i" matches Billing and API: API moves from the 4th to the 2nd position.
    await user.type(app.ui.getByLabelText("Filter services"), "i");
    expect(app.ui.queryByTestId("row-1")).toBeNull();
    expect(app.ui.getByTestId("details-4")).toBeInTheDocument();
    expect(app.ui.queryByTestId("details-2")).toBeNull();
    app.unmount();
  });
  it("shows the new rows after Reload data", async () => {
    const app = await mount();
    expect(cell(app.ui, 2).getByText("Degraded")).toBeInTheDocument();
    expect(app.ui.queryByTestId("row-5")).toBeNull();
    await user.click(app.ui.getByRole("button", { name: "Reload data" }));
    expect(cell(app.ui, 2).getByText("Operational")).toBeInTheDocument();
    expect(cell(app.ui, 4).getByText("Degraded")).toBeInTheDocument();
    expect(app.ui.getByTestId("row-5")).toBeInTheDocument();
    app.unmount();
  });
});
`;

// ─────────────────────────────────────────────────────────────────────────────

export default defineTasks([
  // ── Quizzes ────────────────────────────────────────────────────────────────
  quiz(
    "http2-multiplexing",
    ["http-rest", w("networking", 0.6)],
    2,
    75,
    ["What HTTP/2 changed", "Що змінив HTTP/2"],
    ["What is the headline improvement of HTTP/2 over HTTP/1.1?", "Яке головне покращення HTTP/2 порівняно з HTTP/1.1?"],
    [
      [
        "Many requests and responses are interleaved as binary frames over one connection (multiplexing)",
        "Багато запитів і відповідей чергуються у вигляді бінарних фреймів в одному з'єднанні (мультиплексування)",
      ],
      ["It replaced TCP with UDP", "Він замінив TCP на UDP"],
      ["Headers became plain text so they are easier to debug", "Заголовки стали звичайним текстом, щоб їх було легше налагоджувати"],
      ["It added new methods such as MERGE and PUSH", "Він додав нові методи, як-от MERGE і PUSH"],
    ],
    "a",
    [
      "HTTP/2 keeps the same semantics (methods, status codes, headers) but changes the wire format: it is **binary**, uses **multiplexed streams** on a single connection, and compresses headers with **HPACK**. HTTP/1.1 could reuse a connection (keep-alive) but handled one request at a time on it, so browsers opened about six connections per host and developers resorted to bundling and domain sharding. Moving to UDP is HTTP/3's change.",
      "HTTP/2 зберігає ту саму семантику (методи, коди стану, заголовки), але змінює формат передачі: він **бінарний**, використовує **мультиплексовані потоки** в одному з'єднанні та стискає заголовки через **HPACK**. HTTP/1.1 міг повторно використовувати з'єднання (keep-alive), але обробляв у ньому один запит за раз, тому браузери відкривали близько шести з'єднань на хост, а розробники вдавалися до бандлінгу та domain sharding. Перехід на UDP це зміна HTTP/3.",
    ],
  ),
  quiz(
    "http3-quic",
    ["http-rest", w("networking", 0.7)],
    3,
    90,
    ["HTTP/3 and QUIC", "HTTP/3 і QUIC"],
    ["Which transport does HTTP/3 use, and what problem does it solve?", "Який транспорт використовує HTTP/3 і яку проблему він розв'язує?"],
    [
      [
        "QUIC over UDP: a lost packet stalls only its own stream, not every stream (no TCP-level head-of-line blocking)",
        "QUIC поверх UDP: втрачений пакет затримує лише свій потік, а не всі (без head-of-line blocking на рівні TCP)",
      ],
      ["TCP with larger windows, which makes each request faster", "TCP із більшими вікнами, що пришвидшує кожен запит"],
      ["WebSocket, so the server can push data any time", "WebSocket, щоб сервер міг надсилати дані будь-коли"],
      ["QUIC over TCP, to keep firewalls happy", "QUIC поверх TCP, щоб задовольнити брандмауери"],
    ],
    "a",
    [
      "In HTTP/2 all streams share one TCP connection, and TCP delivers bytes in order, so one lost packet blocks every stream behind it. HTTP/3 runs over **QUIC**, which is built on UDP, implements reliability **per stream**, has TLS 1.3 built in, and can resume or migrate connections faster (for example when switching from Wi-Fi to mobile data).",
      "У HTTP/2 усі потоки ділять одне TCP-з'єднання, а TCP доставляє байти по порядку, тож один втрачений пакет блокує всі потоки за ним. HTTP/3 працює поверх **QUIC**, який побудований на UDP, забезпечує надійність **для кожного потоку окремо**, має вбудований TLS 1.3 і швидше відновлює чи переносить з'єднання (наприклад, при переході з Wi-Fi на мобільний інтернет).",
    ],
  ),
  quiz(
    "https-tls-guarantees",
    ["http-rest", w("web-security", 0.5), w("networking", 0.3)],
    2,
    90,
    ["What HTTPS adds", "Що додає HTTPS"],
    ["What does HTTPS (HTTP over TLS) give you? Select all that apply.", "Що дає HTTPS (HTTP поверх TLS)? Оберіть усі правильні."],
    [
      ["Confidentiality: the traffic is encrypted in transit", "Конфіденційність: трафік шифрується під час передачі"],
      ["Integrity: tampering in transit is detected", "Цілісність: втручання під час передачі виявляється"],
      ["Authentication of the server through its certificate", "Автентифікацію сервера через його сертифікат"],
      ["Protection from XSS in the page", "Захист сторінки від XSS"],
      ["Hiding from the network which host you connect to", "Приховування від мережі того, до якого хоста ви підключаєтесь"],
    ],
    "abc",
    [
      "TLS provides encryption, integrity and server authentication (the certificate chain proves the server owns the domain), and HTTPS uses port 443 by default (HTTP uses 80). It does not make your own code safe: XSS and injection happen inside the encrypted channel. The hostname usually still leaks through DNS and the TLS SNI field, although Encrypted Client Hello and DoH reduce that.",
      "TLS забезпечує шифрування, цілісність і автентифікацію сервера (ланцюжок сертифікатів доводить, що сервер володіє доменом), а HTTPS за замовчуванням використовує порт 443 (HTTP використовує 80). Він не робить ваш код безпечним: XSS та ін'єкції відбуваються всередині зашифрованого каналу. Ім'я хоста зазвичай усе одно «витікає» через DNS і поле SNI в TLS, хоча Encrypted Client Hello та DoH це зменшують.",
    ],
  ),
  quiz(
    "cors-browser-enforced",
    ["http-rest", w("web-security", 0.4)],
    3,
    120,
    ["Fixing a CORS error", "Виправлення помилки CORS"],
    [
      "A SPA on `localhost:3000` gets a CORS error when calling an API on `localhost:5000`. Which fixes are legitimate? Select all that apply.",
      "SPA на `localhost:3000` отримує помилку CORS під час виклику API на `localhost:5000`. Які виправлення слушні? Оберіть усі правильні.",
    ],
    [
      [
        "The API answers with `Access-Control-Allow-Origin: http://localhost:3000` (and handles the `OPTIONS` preflight)",
        "API відповідає заголовком `Access-Control-Allow-Origin: http://localhost:3000` (і обробляє preflight `OPTIONS`)",
      ],
      [
        "Send the calls through the dev server or a reverse proxy so the browser sees a single origin",
        "Спрямувати виклики через dev-сервер чи зворотний проксі, щоб браузер бачив одне джерело",
      ],
      [
        "Call the API from your own server (a BFF), because CORS is enforced by browsers only",
        "Викликати API з власного сервера (BFF), адже CORS примусово застосовують лише браузери",
      ],
      [
        "Use `fetch(url, { mode: \"no-cors\" })` to get the response body",
        "Використати `fetch(url, { mode: \"no-cors\" })`, щоб отримати тіло відповіді",
      ],
      [
        "Add `Access-Control-Allow-Origin` to the request headers in the frontend",
        "Додати `Access-Control-Allow-Origin` до заголовків запиту у фронтенді",
      ],
    ],
    "abc",
    [
      "CORS is a **browser** policy: the server states, through response headers, which origins may read its responses, and the browser enforces it. So the real fixes are on the server (allow the origin), or by making the request same-origin (a proxy), or by not making it from a browser at all. `no-cors` just returns an opaque response you can't read, and `Access-Control-Allow-Origin` is a *response* header, so setting it on the request does nothing. Browser extensions that \"disable CORS\" only change your own machine.",
      "CORS це політика **браузера**: сервер через заголовки відповіді повідомляє, яким джерелам дозволено читати його відповіді, а браузер це примусово застосовує. Тож справжні виправлення на сервері (дозволити джерело), або перетворення запиту на same-origin (проксі), або взагалі не робити запит із браузера. `no-cors` лише повертає непрозору відповідь, яку не прочитати, а `Access-Control-Allow-Origin` це заголовок *відповіді*, тож його встановлення в запиті нічого не дає. Розширення браузера, що «вимикають CORS», змінюють лише вашу машину.",
    ],
  ),
  quiz(
    "fouc-late-css",
    ["css", w("web-performance", 0.6), w("html", 0.3)],
    2,
    75,
    ["Flash of unstyled content", "Мерехтіння нестилізованого вмісту"],
    [
      "A page briefly shows raw, unstyled HTML before the layout snaps into place (FOUC). What is a typical cause and fix?",
      "Сторінка ненадовго показує «голий» HTML без стилів, перш ніж верстка стає на місце (FOUC). Яка типова причина та виправлення?",
    ],
    [
      [
        "The stylesheet arrives after the content is painted (for example a link at the end of the body, or loaded async). Put it in `<head>` as a render-blocking stylesheet, or inline the critical CSS",
        "Таблиця стилів приходить після відмальовування вмісту (наприклад, link наприкінці body чи асинхронне завантаження). Розмістіть її в `<head>` як блокувальну для рендеру або вбудуйте критичний CSS",
      ],
      ["Too many images; lazy-load them", "Забагато зображень; завантажуйте їх ліниво"],
      ["The JavaScript bundle is minified; stop minifying", "JavaScript-бандл мінімізовано; припиніть мінімізацію"],
      ["`defer` on scripts; switch to `async`", "`defer` на скриптах; перейдіть на `async`"],
    ],
    "a",
    [
      "By default a stylesheet in `<head>` blocks rendering, so the browser won't paint until it has loaded. FOUC appears when styles arrive late: a `<link>` after the content, CSS injected by JavaScript after first paint, or a non-blocking pattern like `media=\"print\"` with a delayed swap. Fixes are to load the stylesheet in the head, inline the critical (above-the-fold) CSS and load the rest asynchronously, or, in CSS-in-JS apps, extract the styles during server rendering. For web fonts the similar effects are FOUT (fallback font shows first) and FOIT (invisible text), controlled by `font-display`.",
      "За замовчуванням таблиця стилів у `<head>` блокує рендер, тож браузер нічого не малює, доки вона не завантажиться. FOUC виникає, коли стилі приходять пізно: `<link>` після вмісту, CSS, вставлений JavaScript після першого малювання, або неблокувальні прийоми на кшталт `media=\"print\"` із відкладеною заміною. Виправлення: завантажувати таблицю в head, вбудувати критичний CSS (для першого екрана), а решту завантажити асинхронно, або в застосунках із CSS-in-JS витягувати стилі під час серверного рендеру. Для вебшрифтів схожі ефекти це FOUT (спершу показується запасний шрифт) і FOIT (невидимий текст), якими керує `font-display`.",
    ],
  ),
  quiz(
    "browser-storage-compare",
    ["browser-apis", w("web-security", 0.3)],
    2,
    120,
    ["Browser storage options", "Сховища в браузері"],
    ["Which statements about browser storage are true? Select all that apply.", "Які твердження про сховища в браузері правильні? Оберіть усі правильні."],
    [
      [
        "Cookies are sent automatically with every matching HTTP request and are limited to about 4 KB each",
        "Cookies автоматично надсилаються з кожним відповідним HTTP-запитом і мають обмеження близько 4 КБ кожен",
      ],
      [
        "`localStorage` survives restarts, holds about 5 MB per origin and has a synchronous API",
        "`localStorage` переживає перезапуски, вміщує близько 5 МБ на джерело та має синхронний API",
      ],
      ["`sessionStorage` is shared by all tabs of the same origin", "`sessionStorage` спільний для всіх вкладок того самого джерела"],
      [
        "IndexedDB is asynchronous, stores structured data and blobs, and has a much larger quota",
        "IndexedDB асинхронний, зберігає структуровані дані та blob-и й має значно більшу квоту",
      ],
      ["An `HttpOnly` cookie can still be read through `document.cookie`", "Cookie з `HttpOnly` усе одно можна прочитати через `document.cookie`"],
      ["`localStorage` is available inside Web Workers", "`localStorage` доступний усередині Web Workers"],
    ],
    "abd",
    [
      "`sessionStorage` is scoped to a single tab (or window) and cleared when it closes, `HttpOnly` cookies are hidden from JavaScript by design (which limits what XSS can steal), and `localStorage` isn't available in workers (IndexedDB is). Choose by need: cookies for server-visible session state (with `HttpOnly`, `Secure` and `SameSite`), `localStorage` for small preferences, IndexedDB for large or structured offline data. Never put secrets in `localStorage`: any XSS can read it.",
      "`sessionStorage` обмежений однією вкладкою (чи вікном) і очищується при її закритті, cookies з `HttpOnly` приховані від JavaScript за задумом (що обмежує, що може викрасти XSS), а `localStorage` недоступний у воркерах (IndexedDB доступний). Обирайте за потребою: cookies для стану сесії, видимого серверу (з `HttpOnly`, `Secure` і `SameSite`), `localStorage` для невеликих налаштувань, IndexedDB для великих чи структурованих офлайн-даних. Ніколи не зберігайте секрети в `localStorage`: будь-який XSS може їх прочитати.",
    ],
  ),
  quiz(
    "ts-type-vs-interface",
    ["typescript"],
    2,
    90,
    ["type or interface", "type чи interface"],
    ["Which statements about `type` aliases and `interface`s are true? Select all that apply.", "Які твердження про аліаси `type` та `interface` правильні? Оберіть усі правильні."],
    [
      ["Two `interface User` declarations in the same scope are merged into one", "Дві декларації `interface User` в одній області видимості об'єднуються в одну"],
      ["A `type` alias can name a union, like `type Id = string | number`", "Аліас `type` може іменувати об'єднання, як-от `type Id = string | number`"],
      ["An `interface` can directly name a union of types", "`interface` може напряму іменувати об'єднання типів"],
      ["Declaring `type User` twice merges the declarations", "Дворазове оголошення `type User` об'єднує декларації"],
      [
        "Interfaces are extended with `extends`; object types are combined with `&`",
        "Інтерфейси розширюють через `extends`; об'єктні типи комбінують через `&`",
      ],
    ],
    "abe",
    [
      "Interfaces describe object shapes, can be extended with `extends` and are open to **declaration merging** (useful for augmenting library types). A `type` alias can name anything: primitives, unions, tuples, mapped and conditional types, but it can't be re-opened, and a duplicate name is an error. For plain object shapes the two are largely interchangeable, so follow the project's convention; reach for `type` when you need unions or computed types.",
      "Інтерфейси описують форми об'єктів, розширюються через `extends` і відкриті для **злиття оголошень** (корисно для розширення типів бібліотек). Аліас `type` може іменувати що завгодно: примітиви, об'єднання, кортежі, mapped- і conditional-типи, але його не можна «перевідкрити», а дубль імені є помилкою. Для звичайних форм об'єктів вони здебільшого взаємозамінні, тож дотримуйтеся угод проєкту; `type` обирайте, коли потрібні об'єднання чи обчислювані типи.",
    ],
  ),
  quiz(
    "ts-as-const-vs-enum",
    ["typescript"],
    3,
    90,
    ["as const object or enum", "Об'єкт as const чи enum"],
    [
      "Why do many teams prefer the first form below over a TypeScript `enum`?",
      "Чому багато команд віддають перевагу першій формі нижче, а не TypeScript `enum`?",
    ],
    [
      [
        "It's plain JavaScript (an object plus an erased type), so it needs no special compiler output and works with type-stripping tools",
        "Це звичайний JavaScript (об'єкт плюс стертий тип), тож не потребує спеціального виводу компілятора й працює з інструментами, що лише видаляють типи",
      ],
      ["Enums can't hold string values", "Enum не можуть містити рядкові значення"],
      ["An `as const` object is checked at runtime, so invalid values throw", "Об'єкт `as const` перевіряється під час виконання, тож некоректні значення кидають помилку"],
      ["Enums can't be used as types", "Enum не можна використовувати як типи"],
    ],
    "a",
    [
      "A regular `enum` emits extra runtime code (an object with, for numeric enums, reverse mappings) and isn't just type syntax, so it conflicts with tools that only strip types (such as `erasableSyntaxOnly` or Node's type stripping). `const Status = { Ok: \"ok\", Fail: \"fail\" } as const; type Status = (typeof Status)[keyof typeof Status];` gives the same autocomplete and a union type, with plain string values you can send as JSON. Enums are not wrong, and string enums work fine; nothing is checked at runtime in either approach.",
      "Звичайний `enum` генерує додатковий код часу виконання (об'єкт, для числових enum ще й зворотні відображення) і не є лише синтаксисом типів, тож конфліктує з інструментами, що лише стирають типи (як-от `erasableSyntaxOnly` чи видалення типів у Node). `const Status = { Ok: \"ok\", Fail: \"fail\" } as const; type Status = (typeof Status)[keyof typeof Status];` дає ті самі підказки й тип-об'єднання, з простими рядковими значеннями, які можна надсилати як JSON. Enum не є помилкою, а рядкові enum працюють добре; жоден підхід нічого не перевіряє під час виконання.",
    ],
    {
      code: "// A\nexport const Status = { Ok: \"ok\", Fail: \"fail\" } as const;\nexport type Status = (typeof Status)[keyof typeof Status]; // \"ok\" | \"fail\"\n\n// B\nexport enum StatusEnum { Ok = \"ok\", Fail = \"fail\" }",
      codeLanguage: "ts",
    },
  ),
  quiz(
    "react-setstate-in-render",
    ["react", w("state-management", 0.3)],
    3,
    90,
    ["setState during render", "setState під час рендеру"],
    ["What happens when this component renders, and what is the right fix?", "Що станеться під час рендеру цього компонента й яке правильне виправлення?"],
    [
      [
        "An endless render loop (\"Too many re-renders\"); derive `rows` from `data` during render instead (with `useMemo` if it is expensive)",
        "Нескінченний цикл рендерів («Too many re-renders»); натомість обчислюйте `rows` з `data` під час рендеру (з `useMemo`, якщо це дорого)",
      ],
      ["It renders once, and `rows` is updated for the next render", "Він рендериться один раз, а `rows` оновлюється для наступного рендеру"],
      ["Nothing, because state updates are ignored during render", "Нічого, бо оновлення стану під час рендеру ігноруються"],
      ["It only loops in StrictMode; production is fine", "Цикл лише в StrictMode; у продакшені все гаразд"],
    ],
    "a",
    [
      "Calling a state setter unconditionally in the component body schedules another render, which calls it again, and so on until React throws \"Too many re-renders\". Rendering must be pure. `rows` is just a function of `data`, so compute it during render: `const rows = useMemo(() => data.map(parse), [data])` (or without `useMemo` when it's cheap). Don't mirror props into state, and don't reach for `useEffect` + `setState` either: that adds an extra render and a flash of stale data.",
      "Безумовний виклик сеттера стану в тілі компонента планує ще один рендер, який знову його викликає, і так далі, доки React не кине «Too many re-renders». Рендер має бути чистим. `rows` це просто функція від `data`, тож обчислюйте її під час рендеру: `const rows = useMemo(() => data.map(parse), [data])` (або без `useMemo`, коли це дешево). Не дублюйте пропси в стані й не вдавайтеся до `useEffect` + `setState`: це додає зайвий рендер і мерехтіння застарілих даних.",
    ],
    {
      code: "function Table({ data }: { data: string[] }) {\n  const [rows, setRows] = useState<Row[]>([]);\n  setRows(data.map(parse));\n  return (\n    <ul>\n      {rows.map((r) => (\n        <li key={r.id}>{r.name}</li>\n      ))}\n    </ul>\n  );\n}",
      codeLanguage: "tsx",
    },
  ),
  quiz(
    "react-effect-once-event",
    ["react"],
    2,
    90,
    ["Sending an event once", "Надіслати подію один раз"],
    [
      "A table must send the analytics event `table_opened` once when it appears, and not on every re-render. Where should the call go?",
      "Таблиця має надіслати подію аналітики `table_opened` один раз, коли з'являється, а не при кожному ререндері. Куди помістити виклик?",
    ],
    [
      ["In the component body, before the `return`", "У тілі компонента, перед `return`"],
      ["In `useEffect(() => { track(\"table_opened\"); }, [])`", "У `useEffect(() => { track(\"table_opened\"); }, [])`"],
      ["Inside `useMemo(() => track(\"table_opened\"), [])`", "Усередині `useMemo(() => track(\"table_opened\"), [])`"],
      ["In the JSX, as `{track(\"table_opened\")}`", "У JSX, як `{track(\"table_opened\")}`"],
    ],
    "b",
    [
      "Rendering has to be pure: React may render a component more than once (re-renders, StrictMode, concurrent features) and discard results, so sending a network event from the body fires it far too often. An effect runs after the commit, and an empty dependency array limits it to once per mount. In development StrictMode deliberately mounts, unmounts and re-mounts, so you may see the event twice there; that is expected and doesn't happen in production. If the event must be strictly once, dedupe it in the analytics layer. An event tied to a user action belongs in the event handler, not in an effect.",
      "Рендер має бути чистим: React може рендерити компонент більше одного разу (ререндери, StrictMode, конкурентні можливості) і відкидати результати, тож надсилання мережевої події з тіла спрацьовує занадто часто. Ефект виконується після коміту, а порожній масив залежностей обмежує його одним разом на монтування. У розробці StrictMode навмисно монтує, розмонтовує й монтує знову, тож ви можете бачити подію двічі; це очікувано і не стається в продакшені. Якщо подія має бути строго одна, дедублікуйте її в шарі аналітики. Подія, пов'язана з дією користувача, належить в обробник події, а не в ефект.",
    ],
  ),
  quiz(
    "mf-runtime-composition",
    ["webpack", w("micro-frontends", 0.7)],
    2,
    75,
    ["What Module Federation does", "Що робить Module Federation"],
    ["What is Webpack Module Federation primarily for?", "Для чого насамперед призначений Webpack Module Federation?"],
    [
      [
        "Letting separately built and deployed apps expose modules to each other and load them at runtime",
        "Дозволяє окремо зібраним і розгорнутим застосункам надавати модулі один одному й завантажувати їх під час виконання",
      ],
      ["Compiling many apps into one bundle at build time", "Компілювати багато застосунків в один бандл під час збірки"],
      ["Server-side rendering of React components", "Серверний рендер React-компонентів"],
      ["Replacing npm for installing dependencies", "Заміна npm для встановлення залежностей"],
    ],
    "a",
    [
      "With Module Federation, a **host** application loads code from **remotes**: other builds, deployed independently, that declare what they `expose`. The host resolves them at runtime (usually from a `remoteEntry.js` URL), which is what makes it a popular way to build micro-frontends: each team ships on its own schedule, and a remote can itself consume other remotes (chains of federated modules). The trade-offs are version and dependency management between teams, and runtime failures when a remote is down.",
      "У Module Federation **хост**-застосунок завантажує код із **remote**-ів: інших збірок, розгорнутих незалежно, що оголошують, що вони `expose`. Хост розв'язує їх під час виконання (зазвичай за URL `remoteEntry.js`), тому це популярний спосіб будувати мікрофронтенди: кожна команда випускає у власному темпі, а remote сам може споживати інші remote-и (ланцюжки федеративних модулів). Компроміси: керування версіями й залежностями між командами та збої під час виконання, коли remote недоступний.",
    ],
  ),
  quiz(
    "mf-shared-singleton",
    ["webpack", w("micro-frontends", 0.5), w("react", 0.4)],
    3,
    120,
    ["One copy of React across microfrontends", "Одна копія React у мікрофронтендах"],
    [
      "A host and its remote both use React. After a remote loads, hooks throw \"Invalid hook call\" because two copies of React are on the page. Which part of the Module Federation config addresses this?",
      "Хост і його remote обидва використовують React. Після завантаження remote хуки кидають «Invalid hook call», бо на сторінці дві копії React. Яка частина конфігурації Module Federation це розв'язує?",
    ],
    [
      ["`shared: { react: { singleton: true }, \"react-dom\": { singleton: true } }` in every app", "`shared: { react: { singleton: true }, \"react-dom\": { singleton: true } }` в кожному застосунку"],
      ["`exposes: { react: \"react\" }` in the host", "`exposes: { react: \"react\" }` у хості"],
      ["`remotes: { react: \"react@1.0.0\" }` in the remote", "`remotes: { react: \"react@1.0.0\" }` у remote"],
      ["Nothing is needed; Webpack deduplicates React automatically across builds", "Нічого не потрібно; Webpack автоматично дедуплікує React між збірками"],
    ],
    "a",
    [
      "Each federated build bundles its own dependencies unless told otherwise, and hooks rely on a single React instance (a second copy has its own internal dispatcher, so hooks fail). Listing packages under `shared` makes the apps negotiate at runtime and use **one** copy; `singleton: true` forbids loading a second one, and `requiredVersion` states which versions are acceptable. Libraries with global state (React, a router, a design-system context) are the usual candidates, and mismatched major versions are the typical source of trouble.",
      "Кожна федеративна збірка пакує власні залежності, якщо не вказано інакше, а хуки покладаються на єдиний екземпляр React (друга копія має власний внутрішній dispatcher, тож хуки ламаються). Перелік пакетів у `shared` змушує застосунки домовлятися під час виконання й використовувати **одну** копію; `singleton: true` забороняє завантажувати другу, а `requiredVersion` визначає прийнятні версії. Типові кандидати: бібліотеки з глобальним станом (React, роутер, контекст дизайн-системи), а джерелом проблем зазвичай є різні мажорні версії.",
    ],
    {
      code: "new ModuleFederationPlugin({\n  name: \"host\",\n  remotes: { cash: \"cash@https://cdn.example.com/cash/remoteEntry.js\" },\n  // ???\n});",
      codeLanguage: "js",
    },
  ),

  // ── Practice ───────────────────────────────────────────────────────────────
  practice({
    slug: "closure-counter-factory",
    skills: ["closures-scope", w("javascript", 0.3), w("typescript", 0.2)],
    complexity: 2,
    estSeconds: 780,
    framework: "vanilla-ts",
    title: ["A configurable counter with private state", "Налаштовуваний лічильник із приватним станом"],
    prompt: [
      lines(
        "The counter in `src/counter.ts` keeps its count in a **module-level variable**, so every counter shares it, and its options are ignored. Rewrite `createCounter` as a closure factory:",
        "",
        "- `createCounter({ start = 0, step = 1, min = -Infinity, max = Infinity })` returns `{ increment, decrement, reset, value }`.",
        "- `increment()` / `decrement()` move by `step`, clamp the result to `[min, max]`, and **return the new value**. `reset()` goes back to `start` (clamped) and returns it.",
        "- `value` is a read-only getter. The count itself lives in a `let` inside the factory, so nothing else can touch it, and each counter has its own.",
        "- Throw a `RangeError` for a `step` that is `0` or not finite, and for `min > max`.",
      ),
      lines(
        "Лічильник у `src/counter.ts` зберігає значення в **змінній рівня модуля**, тож усі лічильники його ділять, а параметри ігноруються. Перепишіть `createCounter` як замикання-фабрику:",
        "",
        "- `createCounter({ start = 0, step = 1, min = -Infinity, max = Infinity })` повертає `{ increment, decrement, reset, value }`.",
        "- `increment()` / `decrement()` рухаються на `step`, обмежують результат діапазоном `[min, max]` і **повертають нове значення**. `reset()` повертає до `start` (з обмеженням) і повертає його.",
        "- `value` це getter лише для читання. Саме значення живе в `let` усередині фабрики, тож більше ніхто не може його чіпати, і в кожного лічильника воно своє.",
        "- Кидайте `RangeError` для `step`, що дорівнює `0` або не є скінченним, і для `min > max`.",
      ),
    ],
    files: { "/src/counter.ts": COUNTER_STARTER },
    activeFile: "/src/counter.ts",
    tests: COUNTER_TESTS,
    solution: { "/src/counter.ts": COUNTER_SOLUTION },
    explanation: [
      "A closure is a function that keeps access to the variables of the scope it was created in. Each call of `createCounter` creates a new scope with its own `count`, and the returned methods close over it, so counters are independent and the variable is unreachable from outside (unlike a module-level `let`, which every counter would share, or a public `this.count` property that anyone could assign). `count` is declared with `let` because it is reassigned (a `const` couldn't change); `value` is exposed through a getter so callers can read but not write it. Parameters can be defaulted with destructuring, and validating up front means a bad configuration fails at creation, not on the first click.",
      "Замикання це функція, що зберігає доступ до змінних області, у якій її створено. Кожен виклик `createCounter` створює нову область зі своїм `count`, а повернені методи замикаються на неї, тож лічильники незалежні, а змінна недосяжна ззовні (на відміну від `let` рівня модуля, яку ділили б усі лічильники, чи публічної властивості `this.count`, яку будь-хто міг би присвоїти). `count` оголошено через `let`, бо його перепризначають (`const` не змінити); `value` відкрито через getter, щоб викликач міг читати, але не записувати. Параметри можна задавати за замовчуванням через деструктуризацію, а перевірка наперед означає, що погана конфігурація падає при створенні, а не при першому кліку.",
    ],
  }),
  practice({
    slug: "cookie-serialize-parse",
    skills: ["browser-apis", w("http-rest", 0.5), w("web-security", 0.5)],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Write a Set-Cookie serializer and Cookie parser", "Серіалізатор Set-Cookie та парсер Cookie"],
    prompt: [
      lines(
        "Implement both halves of cookie handling in `src/cookies.ts`.",
        "",
        "**`serializeCookie(name, value, options)`** returns a `Set-Cookie` value: `name=<encodeURIComponent(value)>`, then the attributes **in this order**, joined with `; `: `Max-Age`, `Expires` (`toUTCString()`), `Domain`, `Path`, `HttpOnly`, `Secure`, `SameSite`.",
        "",
        "- `name` must be a valid cookie token (no spaces, `;`, `=`, or empty), else throw `TypeError`.",
        "- `maxAge` must be an integer (`0` is allowed and deletes the cookie), else throw `RangeError`.",
        "- `sameSite` accepts `strict`/`lax`/`none` in any case and is written as `Strict`/`Lax`/`None`. Anything else throws, and `None` without `secure` throws.",
        "- `domain` or `path` containing `;`, `\\r` or `\\n` would let a caller **inject attributes**: throw `TypeError`.",
        "",
        "**`parseCookies(header)`** turns a `Cookie` header into a `Map`: split on `;`, trim, split at the **first** `=`; ignore pairs without `=` or with an empty name; the **first** duplicate wins; strip surrounding double quotes; `decodeURIComponent` the value, but keep the raw text if it is malformed.",
      ),
      lines(
        "Реалізуйте обидві половини роботи з cookie в `src/cookies.ts`.",
        "",
        "**`serializeCookie(name, value, options)`** повертає значення `Set-Cookie`: `name=<encodeURIComponent(value)>`, далі атрибути **в такому порядку**, з'єднані через `; `: `Max-Age`, `Expires` (`toUTCString()`), `Domain`, `Path`, `HttpOnly`, `Secure`, `SameSite`.",
        "",
        "- `name` має бути коректним токеном cookie (без пробілів, `;`, `=` і не порожнім), інакше кидайте `TypeError`.",
        "- `maxAge` має бути цілим (`0` дозволено й він видаляє cookie), інакше кидайте `RangeError`.",
        "- `sameSite` приймає `strict`/`lax`/`none` у будь-якому регістрі й записується як `Strict`/`Lax`/`None`. Усе інше кидає помилку, і `None` без `secure` теж.",
        "- `domain` чи `path` із `;`, `\\r` або `\\n` дозволили б викликачу **ін'єктувати атрибути**: кидайте `TypeError`.",
        "",
        "**`parseCookies(header)`** перетворює заголовок `Cookie` на `Map`: поділіть за `;`, обріжте пробіли, розділіть за **першим** `=`; ігноруйте пари без `=` чи з порожнім іменем; перемагає **перший** дублікат; приберіть обрамлювальні подвійні лапки; застосуйте `decodeURIComponent` до значення, але залиште сирий текст, якщо він пошкоджений.",
      ),
    ],
    files: { "/src/cookies.ts": COOKIE_STARTER },
    activeFile: "/src/cookies.ts",
    tests: COOKIE_TESTS,
    solution: { "/src/cookies.ts": COOKIE_SOLUTION },
    explanation: [
      "A cookie travels in two directions: the server sets it with a `Set-Cookie` response header (one cookie plus attributes), and the browser returns only the `name=value` pairs in the `Cookie` request header, which is why the two functions look so different. The attributes are the security model: `HttpOnly` hides the cookie from `document.cookie` (limiting what XSS can steal), `Secure` restricts it to HTTPS, `SameSite` controls cross-site sending (and browsers require `Secure` with `SameSite=None`), while `Max-Age`/`Expires` set the lifetime and `Max-Age=0` deletes it. Values are percent-encoded because `;`, `,` and spaces would otherwise end the pair, and anything user-controlled that is placed into a header (`domain`, `path`) has to be checked for separators, or an attacker can add their own attributes or even whole headers (header injection). When parsing, split at the first `=` only, since values such as base64 tokens end with `=` signs.",
      "Cookie подорожує в двох напрямках: сервер встановлює її заголовком відповіді `Set-Cookie` (одна cookie з атрибутами), а браузер повертає лише пари `name=value` у заголовку запиту `Cookie`, тому ці дві функції так відрізняються. Атрибути це модель безпеки: `HttpOnly` ховає cookie від `document.cookie` (обмежуючи, що може викрасти XSS), `Secure` обмежує її HTTPS, `SameSite` керує міжсайтовим надсиланням (і браузери вимагають `Secure` разом із `SameSite=None`), а `Max-Age`/`Expires` задають час життя, і `Max-Age=0` її видаляє. Значення кодуються у відсотковому форматі, бо `;`, `,` і пробіли інакше обірвали б пару, а все, що контролює користувач і потрапляє в заголовок (`domain`, `path`), треба перевіряти на роздільники, інакше зловмисник додасть власні атрибути чи навіть цілі заголовки (header injection). Під час розбору ділите лише за першим `=`, бо значення на кшталт base64-токенів закінчуються знаками `=`.",
    ],
  }),
  practice({
    slug: "deep-freeze-lock-props",
    skills: ["js-metaprogramming", w("immutability-copying", 0.7), w("javascript", 0.2)],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["deepFreeze and read-only properties", "deepFreeze і властивості лише для читання"],
    prompt: [
      lines(
        "`const` stops *reassigning* a variable, and `Object.freeze` stops changes to an object, but only **one level deep**. Implement two helpers in `src/freeze.ts`:",
        "",
        "- `deepFreeze(value)` freezes `value` and everything reachable from it, and returns the **same** reference. Primitives and `null` are returned as they are. It must terminate on **cycles** and shared references, must still descend into the children of an **already-frozen** object, must handle **symbol-keyed** and **non-enumerable** properties, and must **never call getters**.",
        "- `lockProps(obj, ...keys)` makes just the listed own properties **non-writable and non-configurable** with `Object.defineProperty`, leaving every other property (and the object's extensibility) alone. It throws a `TypeError` for a key that isn't an **own** property, and returns the same object.",
      ),
      lines(
        "`const` забороняє *перепризначення* змінної, а `Object.freeze` забороняє зміни об'єкта, але лише на **одному рівні**. Реалізуйте два помічники в `src/freeze.ts`:",
        "",
        "- `deepFreeze(value)` заморожує `value` і все, що з нього досяжне, та повертає **те саме** посилання. Примітиви й `null` повертаються як є. Функція має завершуватися на **циклах** і спільних посиланнях, має все одно заходити в дочірні елементи **уже замороженого** об'єкта, обробляти властивості з **символьними ключами** та **неперелічувані** і **ніколи не викликати getter-и**.",
        "- `lockProps(obj, ...keys)` робить лише перелічені власні властивості **незаписуваними й неконфігурованими** через `Object.defineProperty`, не чіпаючи решту властивостей (та розширюваність об'єкта). Вона кидає `TypeError` для ключа, що не є **власною** властивістю, і повертає той самий об'єкт.",
      ),
    ],
    files: { "/src/freeze.ts": FREEZE_STARTER },
    activeFile: "/src/freeze.ts",
    tests: FREEZE_TESTS,
    solution: { "/src/freeze.ts": FREEZE_SOLUTION },
    explanation: [
      "`Object.freeze` makes an object's own properties non-writable and non-configurable and stops new ones being added, but a nested object is just a value, so it stays mutable. A deep version has to walk the graph, and three details matter: a `WeakSet` of visited objects (so cycles and shared children are processed once and don't loop forever; checking `Object.isFrozen` instead would wrongly skip the children of an object frozen earlier), `Reflect.ownKeys` (to include symbols and non-enumerable keys, which `Object.keys` misses), and reading property **descriptors** rather than `node[key]`, so accessors aren't executed. `lockProps` shows the finer-grained tool: `writable: false` stops value changes, and `configurable: false` stops deleting or redefining the property, so you need both for a truly fixed field (setting only `configurable: false` still lets a writable value change). In strict mode, writes to such properties throw a `TypeError`; in sloppy mode they fail silently. Note that `Map`, `Set` and `Date` keep their data in internal slots, which freezing cannot protect.",
      "`Object.freeze` робить власні властивості об'єкта незаписуваними й неконфігурованими та забороняє додавати нові, але вкладений об'єкт це лише значення, тож він залишається змінюваним. Глибока версія мусить обходити граф, і важливі три деталі: `WeakSet` відвіданих об'єктів (щоб цикли та спільні дочірні об'єкти оброблялися раз і не зациклювалися; перевірка `Object.isFrozen` натомість помилково пропустила б нащадків раніше замороженого об'єкта), `Reflect.ownKeys` (щоб охопити символи й неперелічувані ключі, яких `Object.keys` не бачить) і читання **дескрипторів** властивостей замість `node[key]`, щоб аксесори не виконувалися. `lockProps` показує тонший інструмент: `writable: false` зупиняє зміну значення, а `configurable: false` зупиняє видалення чи перевизначення властивості, тож для справді незмінного поля потрібні обидва (одного `configurable: false` замало, записуване значення все одно можна змінити). У строгому режимі запис у такі властивості кидає `TypeError`, у нестрогому мовчки не діє. Зауважте, що `Map`, `Set` і `Date` тримають дані у внутрішніх слотах, яких заморозка не захищає.",
    ],
  }),
  practice({
    slug: "react-refactor-status-table",
    skills: ["react", w("state-management", 0.3), w("typescript", 0.2)],
    complexity: 4,
    estSeconds: 1500,
    framework: "react-ts",
    title: ["Refactor a messy React table", "Рефакторинг безладної React-таблиці"],
    prompt: [
      lines(
        "`StatusTable.tsx` works on the first render, but it hides several classic mistakes. Refactor it (keep the markup, test ids and texts) so that:",
        "",
        "1. **No props copied into state.** The table must show the new rows after `Reload data`. Compute what's displayed from `rows` and `query` during render.",
        "2. **The analytics event is a side effect.** `track(\"table_opened\")` must be sent **exactly once per mount**, not on every render.",
        "3. **No component defined inside a component.** `Row` is re-created on each render, so React remounts every row and its \"Details\" state is lost when you type in the filter. Move it to module level.",
        "4. **Stable keys.** Use the row `id`, not the index, so state stays with the right row when the filter changes the order.",
        "5. **A status lookup, not a chain of ifs.** `ok`, `warn` and `fail` map to `Operational`, `Degraded` and `Down`; anything else shows `Unknown`. Use a `const` object and make sure inherited keys like `\"constructor\"` don't match.",
      ),
      lines(
        "`StatusTable.tsx` працює при першому рендері, але приховує кілька класичних помилок. Відрефакторіть його (збережіть розмітку, test id і тексти), щоб:",
        "",
        "1. **Пропси не копіювалися в стан.** Таблиця має показати нові рядки після `Reload data`. Обчислюйте те, що відображається, з `rows` і `query` під час рендеру.",
        "2. **Подія аналітики була побічним ефектом.** `track(\"table_opened\")` має надсилатися **рівно один раз на монтування**, а не при кожному рендері.",
        "3. **Жодного компонента всередині компонента.** `Row` створюється наново на кожному рендері, тож React перемонтовує кожен рядок і його стан «Details» губиться, коли ви друкуєте у фільтрі. Винесіть його на рівень модуля.",
        "4. **Стабільні ключі.** Використовуйте `id` рядка, а не індекс, щоб стан лишався біля правильного рядка, коли фільтр змінює порядок.",
        "5. **Пошук статусу, а не ланцюжок if.** `ok`, `warn` і `fail` відповідають `Operational`, `Degraded` і `Down`; усе інше показує `Unknown`. Використайте `const`-об'єкт і подбайте, щоб успадковані ключі на кшталт `\"constructor\"` не збігалися.",
      ),
    ],
    files: {
      "/StatusTable.tsx": TABLE_STARTER,
      "/App.tsx": TABLE_APP,
      "/data.ts": TABLE_DATA,
      "/analytics.ts": TABLE_ANALYTICS,
    },
    visibleFiles: ["/StatusTable.tsx", "/App.tsx", "/data.ts", "/analytics.ts"],
    activeFile: "/StatusTable.tsx",
    tests: TABLE_TESTS,
    solution: { "/StatusTable.tsx": TABLE_SOLUTION },
    explanation: [
      "This is the shape of a typical \"find what's wrong\" review. (1) `useState(props.rows.map(...))` only uses the prop on the first render, so later changes are ignored: derive values from props and state while rendering (add `useMemo` only if it is measurably expensive), and don't copy props into state. (2) Calling `track()` in the body is a side effect in render, which React may run many times; it belongs in `useEffect(..., [])` (and in StrictMode development you will see it twice, by design). (3) A component declared inside another is a *new type* on every render, so React unmounts and remounts it, destroying state and DOM, and the lookup tables or helpers are also rebuilt each time; declare components at module level and pass data as props. (4) With `key={index}`, when the list is filtered React matches rows by position, so a row's local state can jump to a different item; a stable `id` identifies each row. (5) A `const` object (or a small function) beats a chain of conditions, and the `hasOwnProperty` check prevents `STATUS[\"constructor\"]` returning a function. An `enum` would be overkill here since the values are only used for display.",
      "Так виглядає типове рев'ю «знайди, що не так». (1) `useState(props.rows.map(...))` використовує проп лише на першому рендері, тож пізніші зміни ігноруються: обчислюйте значення з пропсів і стану під час рендеру (`useMemo` додавайте лише коли це помітно дорого) і не копіюйте пропси в стан. (2) Виклик `track()` у тілі це побічний ефект у рендері, який React може виконати багато разів; йому місце в `useEffect(..., [])` (а в розробці зі StrictMode ви побачите його двічі, і це задумано). (3) Компонент, оголошений усередині іншого, є *новим типом* на кожному рендері, тож React розмонтовує й монтує його знову, знищуючи стан і DOM, а таблиці пошуку чи помічники теж перебудовуються щоразу; оголошуйте компоненти на рівні модуля й передавайте дані пропсами. (4) З `key={index}` при фільтрації React зіставляє рядки за позицією, тож локальний стан рядка може «перестрибнути» на інший елемент; стабільний `id` ідентифікує кожен рядок. (5) `const`-об'єкт (або невелика функція) кращий за ланцюжок умов, а перевірка `hasOwnProperty` не дає `STATUS[\"constructor\"]` повернути функцію. `enum` тут був би надмірним, бо значення потрібні лише для показу.",
    ],
  }),
]);
