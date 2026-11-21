import { defineTasks } from "@/lib/content/schema";
import { practice, w } from "./_helpers";

/** Code strings: write ~ for a backtick. Avoid `${` inside (it would be interpolated). */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const lines = (...l: string[]) => l.join("\n");

/** Derives a solution from a starter; fails loudly if the replacement silently did nothing. */
const replaced = (source: string, pattern: RegExp, replacement: string) => {
  const out = source.replace(pattern, () => replacement);
  if (out === source) throw new Error("Solution replacement did not match: " + pattern);
  return out;
};

// ── 1. Props, children, conditional rendering, lists ─────────────────────────

const CARDS_STARTER = code`import type { ReactNode } from "react";

export type Person = { id: number; name: string; role: string; online: boolean; skills: string[] };

export const PEOPLE: Person[] = [
  { id: 1, name: "Ada Lovelace", role: "Engineer", online: true, skills: ["Math", "Algorithms"] },
  { id: 2, name: "Grace Hopper", role: "Rear admiral", online: false, skills: ["COBOL", "Compilers", "Leadership"] },
  { id: 3, name: "Linus Torvalds", role: "Maintainer", online: true, skills: [] },
];

// TODO: a reusable section: an <h2> with the title, then whatever is nested inside it
function Card({ title, children }: { title: string; children: ReactNode }) {
  return null;
}

// TODO: <article data-testid={"person-" + id}> with the name, role, status and skills
function PersonCard({ person }: { person: Person }) {
  return null;
}

export default function App() {
  // TODO: the "N online" line and a Card titled "Team" with one PersonCard per person
  return <main />;
}
`;

const CARDS_SOLUTION = code`import type { ReactNode } from "react";

export type Person = { id: number; name: string; role: string; online: boolean; skills: string[] };

export const PEOPLE: Person[] = [
  { id: 1, name: "Ada Lovelace", role: "Engineer", online: true, skills: ["Math", "Algorithms"] },
  { id: 2, name: "Grace Hopper", role: "Rear admiral", online: false, skills: ["COBOL", "Compilers", "Leadership"] },
  { id: 3, name: "Linus Torvalds", role: "Maintainer", online: true, skills: [] },
];

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function PersonCard({ person }: { person: Person }) {
  return (
    <article data-testid={"person-" + person.id}>
      <h3>{person.name}</h3>
      <p>{person.role}</p>
      <span data-testid={"status-" + person.id}>{person.online ? "Online" : "Offline"}</span>
      {person.skills.length > 0 ? (
        <ul>
          {person.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      ) : (
        <p>No skills listed</p>
      )}
    </article>
  );
}

export default function App() {
  const onlineCount = PEOPLE.filter((p) => p.online).length;
  return (
    <main>
      <p data-testid="online-count">{onlineCount} online</p>
      <Card title="Team">
        {PEOPLE.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </Card>
    </main>
  );
}
`;

const CARDS_TESTS = code`import { describe, it, expect, screen, within } from "./test-kit";

describe("profile cards", () => {
  it("Card renders its title and the nested children", async () => {
    const title = await screen.findByRole("heading", { name: "Team", level: 2 });
    const section = title.closest("section");
    expect(section).toBeDefined();
    expect(section.contains(screen.getByTestId("person-1"))).toBe(true);
    expect(section.contains(screen.getByTestId("person-3"))).toBe(true);
  });
  it("renders one card per person with the name in an h3 and the role", async () => {
    const names = (await screen.findAllByRole("heading", { level: 3 })).map((h) => h.textContent);
    expect(names).toEqual(["Ada Lovelace", "Grace Hopper", "Linus Torvalds"]);
    expect(within(screen.getByTestId("person-2")).getByText("Rear admiral")).toBeInTheDocument();
  });
  it("shows the online status and the number of people online", async () => {
    expect(await screen.findByTestId("status-1")).toHaveTextContent("Online");
    expect(screen.getByTestId("status-2")).toHaveTextContent("Offline");
    expect(screen.getByTestId("status-3")).toHaveTextContent("Online");
    expect(screen.getByTestId("online-count")).toHaveTextContent("2 online");
  });
  it("lists skills, or says there are none instead of an empty list", async () => {
    const grace = within(await screen.findByTestId("person-2"));
    expect(grace.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["COBOL", "Compilers", "Leadership"]);
    const linus = within(screen.getByTestId("person-3"));
    expect(linus.queryAllByRole("list")).toHaveLength(0);
    expect(linus.getByText("No skills listed")).toBeInTheDocument();
  });
});
`;

// ── 2. Updating state immutably ──────────────────────────────────────────────

const TODO_STARTER = code`import { useState } from "react";

type Todo = { id: number; title: string; done: boolean };

// Frozen on purpose: mutating this data throws, just as mutating state is a bug in React.
const INITIAL: readonly Todo[] = Object.freeze([
  Object.freeze({ id: 1, title: "Learn React", done: true }),
  Object.freeze({ id: 2, title: "Build a project", done: false }),
  Object.freeze({ id: 3, title: "Read the docs", done: false }),
]);

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL as Todo[]);
  const [text, setText] = useState("");

  // BUG: these handlers mutate the array/objects in state. Replace them with immutable updates.
  function add() {
    const title = text.trim();
    if (!title) return;
    todos.push({ id: todos.length + 1, title, done: false });
    setTodos(todos);
    setText("");
  }
  function toggle(id: number) {
    const todo = todos.find((t) => t.id === id)!;
    todo.done = !todo.done;
    setTodos(todos);
  }
  function remove(id: number) {
    todos.splice(
      todos.findIndex((t) => t.id === id),
      1,
    );
    setTodos(todos);
  }
  function clearCompleted() {
    // TODO
  }

  const left = todos.filter((t) => !t.done).length;

  return (
    <main>
      <h1>Todos</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label htmlFor="new-todo">New todo</label>
        <input id="new-todo" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} /> {t.title}
            </label>{" "}
            <button type="button" aria-label={"Remove " + t.title} onClick={() => remove(t.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <p data-testid="left">{left} left</p>
      <button type="button" onClick={clearCompleted} disabled={!todos.some((t) => t.done)}>
        Clear completed
      </button>
    </main>
  );
}
`;

const TODO_SOLUTION = replaced(
  TODO_STARTER,
  /  \/\/ BUG[\s\S]*?  function clearCompleted\(\) \{\n    \/\/ TODO\n  \}\n/,
  code`  function add() {
    const title = text.trim();
    if (!title) return;
    const id = Math.max(0, ...todos.map((t) => t.id)) + 1;
    setTodos([...todos, { id, title, done: false }]);
    setText("");
  }
  function toggle(id: number) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }
  function remove(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
  }
  function clearCompleted() {
    setTodos(todos.filter((t) => !t.done));
  }
`,
);

const TODO_TESTS = code`import { describe, it, expect, screen, user } from "./test-kit";

const checkbox = (name) => screen.getByLabelText(name);
const left = () => screen.getByTestId("left").textContent;

describe("todo list", () => {
  it("starts with the three initial todos", async () => {
    const boxes = await screen.findAllByRole("checkbox");
    expect(boxes.map((b) => b.checked)).toEqual([true, false, false]);
    expect(left()).toBe("2 left");
  });
  it("adds a todo, clears the input and ignores blank titles", async () => {
    const input = await screen.findByLabelText("New todo");
    await user.type(input, "  Write tests  ");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(checkbox("Write tests").checked).toBe(false);
    expect(input).toHaveValue("");
    expect(left()).toBe("3 left");
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(4);
  });
  it("toggles a todo without touching the others", async () => {
    await user.click(checkbox("Build a project"));
    expect(checkbox("Build a project").checked).toBe(true);
    expect(checkbox("Read the docs").checked).toBe(false);
    expect(left()).toBe("2 left");
    await user.click(checkbox("Build a project"));
    expect(checkbox("Build a project").checked).toBe(false);
    expect(left()).toBe("3 left");
  });
  it("removes a todo", async () => {
    await user.click(screen.getByRole("button", { name: "Remove Read the docs" }));
    expect(screen.queryByLabelText("Read the docs")).toBeNull();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(left()).toBe("2 left");
  });
  it("clears completed todos and disables the button when there are none", async () => {
    await user.click(screen.getByRole("button", { name: "Clear completed" }));
    expect(screen.queryByLabelText("Learn React")).toBeNull();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Clear completed" })).toBeDisabled();
  });
});
`;

// ── 3. Lifting state up (accordion) ──────────────────────────────────────────

const ACCORDION_STARTER = code`import { useState, type ReactNode } from "react";

// Each panel keeps its own state, so any number of panels can be open at once.
// TODO: make Panel controlled, and let App decide which single panel is open.
function Panel({ title, children }: { title: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section>
      <h3>
        <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
          {title}
        </button>
      </h3>
      {isOpen && <p>{children}</p>}
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>FAQ</h1>
      <Panel title="About">About body</Panel>
      <Panel title="Details">Details body</Panel>
      <Panel title="Contact">Contact body</Panel>
    </main>
  );
}
`;

const ACCORDION_SOLUTION = code`import { useState, type ReactNode } from "react";

function Panel({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section>
      <h3>
        <button type="button" aria-expanded={isOpen} onClick={onToggle}>
          {title}
        </button>
      </h3>
      {isOpen && <p>{children}</p>}
    </section>
  );
}

const PANELS = [
  { title: "About", body: "About body" },
  { title: "Details", body: "Details body" },
  { title: "Contact", body: "Contact body" },
];

export default function App() {
  // The parent owns the state: at most one open panel, identified by its index.
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <main>
      <h1>FAQ</h1>
      {PANELS.map((panel, index) => (
        <Panel
          key={panel.title}
          title={panel.title}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        >
          {panel.body}
        </Panel>
      ))}
    </main>
  );
}
`;

const ACCORDION_TESTS = code`import { describe, it, expect, screen, user } from "./test-kit";

const header = (name) => screen.getByRole("button", { name });
const expanded = (name) => header(name).getAttribute("aria-expanded");

describe("accordion", () => {
  it("starts with only the first panel open", async () => {
    await screen.findByRole("button", { name: "About" });
    expect(expanded("About")).toBe("true");
    expect(expanded("Details")).toBe("false");
    expect(expanded("Contact")).toBe("false");
    expect(screen.getByText("About body")).toBeInTheDocument();
    expect(screen.queryByText("Details body")).toBeNull();
  });
  it("opening a panel closes the previous one", async () => {
    await user.click(header("Details"));
    expect(expanded("Details")).toBe("true");
    expect(expanded("About")).toBe("false");
    expect(screen.getByText("Details body")).toBeInTheDocument();
    expect(screen.queryByText("About body")).toBeNull();
    await user.click(header("Contact"));
    expect(expanded("Contact")).toBe("true");
    expect(expanded("Details")).toBe("false");
  });
  it("clicking the open panel collapses it", async () => {
    await user.click(header("Contact"));
    expect(expanded("Contact")).toBe("false");
    expect(screen.queryByText("Contact body")).toBeNull();
    for (const name of ["About", "Details", "Contact"]) expect(expanded(name)).toBe("false");
  });
});
`;

// ── 4. Controlled form with validation ───────────────────────────────────────

const SIGNUP_STARTER = code`export default function App() {
  // TODO: controlled inputs, validation and a success state

  return (
    <main>
      <h1>Sign up</h1>
      <form noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" />

        <label htmlFor="confirm">Confirm password</label>
        <input id="confirm" type="password" />

        <button type="submit">Create account</button>
      </form>
    </main>
  );
}
`;

const SIGNUP_SOLUTION = code`import { useState, type FormEvent } from "react";

function validate(email: string, password: string, confirm: string) {
  const errors: { email?: string; password?: string; confirm?: string } = {};
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
  if (password.length < 8) errors.password = "Password must be at least 8 characters";
  if (confirm !== password) errors.confirm = "Passwords do not match";
  return errors;
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false); // has the user tried to submit yet?
  const [done, setDone] = useState(false);

  // Derived during render, so the messages always match the current values.
  const errors = validate(email, password, confirm);
  const show = submitted ? errors : {};

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length === 0) setDone(true);
  }

  if (done) {
    return (
      <main>
        <p data-testid="success">Welcome, {email}!</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Sign up</h1>
      <form noValidate onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {show.email && <p role="alert">{show.email}</p>}

        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {show.password && <p role="alert">{show.password}</p>}

        <label htmlFor="confirm">Confirm password</label>
        <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {show.confirm && <p role="alert">{show.confirm}</p>}

        <button type="submit">Create account</button>
      </form>
    </main>
  );
}
`;

const SIGNUP_TESTS = code`import { describe, it, expect, screen, user } from "./test-kit";

const submit = () => user.click(screen.getByRole("button", { name: "Create account" }));
const alerts = () => screen.queryAllByRole("alert").map((a) => a.textContent);
const fill = async (label, value) => {
  const el = screen.getByLabelText(label);
  await user.clear(el);
  if (value) await user.type(el, value);
  return el;
};

describe("signup form", () => {
  it("shows no errors before the first submit attempt", async () => {
    await user.type(await screen.findByLabelText("Email"), "nope");
    expect(screen.getByLabelText("Email")).toHaveValue("nope");
    expect(alerts()).toEqual([]);
  });
  it("shows every error when submitting an invalid form", async () => {
    await fill("Email", "");
    await submit();
    expect(alerts()).toEqual(["Enter a valid email", "Password must be at least 8 characters"]);
    expect(screen.queryByTestId("success")).toBeNull();
  });
  it("updates the messages live once a submit was attempted", async () => {
    await fill("Email", "ada@example.com");
    expect(alerts()).toEqual(["Password must be at least 8 characters"]);
    await fill("Password", "secret123");
    expect(alerts()).toEqual(["Passwords do not match"]);
    await fill("Confirm password", "secret123");
    expect(alerts()).toEqual([]);
  });
  it("replaces the form with a welcome message on success", async () => {
    await submit();
    expect(screen.getByTestId("success")).toHaveTextContent("Welcome, ada@example.com!");
    expect(screen.queryByLabelText("Email")).toBeNull();
  });
});
`;

// ── 5. Preserving and resetting state with key ───────────────────────────────

const CHAT_STARTER = code`import { useState } from "react";

type Contact = { id: number; name: string };

const CONTACTS: Contact[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

function Chat({ contact }: { contact: Contact }) {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  function send() {
    const message = draft.trim();
    if (!message) return;
    setSent([...sent, message]);
    setDraft("");
  }

  return (
    <section>
      <h2>Chat with {contact.name}</h2>
      <ul aria-label="Sent messages">
        {sent.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
      <label htmlFor="draft">Message to {contact.name}</label>
      <textarea id="draft" value={draft} onChange={(e) => setDraft(e.target.value)} />
      <button type="button" onClick={send}>
        Send
      </button>
    </section>
  );
}

export default function App() {
  const [selected, setSelected] = useState(CONTACTS[0]);
  return (
    <main>
      <nav>
        {CONTACTS.map((c) => (
          <button key={c.id} type="button" onClick={() => setSelected(c)}>
            {c.name}
          </button>
        ))}
      </nav>
      {/* BUG: switching contacts keeps the previous contact's draft and sent messages. */}
      <Chat contact={selected} />
    </main>
  );
}
`;

const CHAT_SOLUTION = replaced(
  CHAT_STARTER,
  /      \{\/\* BUG[^\n]*\n      <Chat contact=\{selected\} \/>/,
  `      {/* A different key tells React this is a different Chat: its state starts from scratch. */}\n      <Chat key={selected.id} contact={selected} />`,
);

const CHAT_TESTS = code`import { describe, it, expect, screen, user } from "./test-kit";

describe("chat", () => {
  it("sends a message to the current contact", async () => {
    await user.type(await screen.findByLabelText("Message to Alice"), "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["hello"]);
    expect(screen.getByLabelText("Message to Alice")).toHaveValue("");
  });
  it("starts a fresh conversation when switching contacts", async () => {
    await user.type(screen.getByLabelText("Message to Alice"), "unsent draft");
    await user.click(screen.getByRole("button", { name: "Bob" }));
    expect(await screen.findByRole("heading", { name: "Chat with Bob" })).toBeInTheDocument();
    expect(screen.getByLabelText("Message to Bob")).toHaveValue("");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
  it("does not bring the old state back when switching again", async () => {
    await user.click(screen.getByRole("button", { name: "Alice" }));
    expect(await screen.findByRole("heading", { name: "Chat with Alice" })).toBeInTheDocument();
    expect(screen.getByLabelText("Message to Alice")).toHaveValue("");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
`;

// ── 6. Refs and cleanup (stopwatch) ──────────────────────────────────────────

const STOPWATCH_STARTER = code`import { useEffect, useRef, useState } from "react";

export default function App() {
  const [elapsed, setElapsed] = useState(0); // milliseconds, shown on screen
  const [running, setRunning] = useState(false);
  // Values that must survive renders but must NOT cause one belong in refs.
  const startRef = useRef(0);
  const intervalRef = useRef<number | undefined>(undefined);

  function start() {
    // TODO: remember the start time, tick every ~50 ms and update elapsed
  }
  function stop() {
    // TODO
  }
  function reset() {
    // TODO
  }

  useEffect(() => {
    // TODO: don't leave an interval behind when the component unmounts
  }, []);

  return (
    <main>
      <h1>Stopwatch</h1>
      <p data-testid="time">{(elapsed / 1000).toFixed(1)}</p>
      <button type="button" onClick={running ? stop : start}>
        {running ? "Stop" : "Start"}
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </main>
  );
}
`;

const STOPWATCH_SOLUTION = code`import { useEffect, useRef, useState } from "react";

export default function App() {
  const [elapsed, setElapsed] = useState(0); // milliseconds, shown on screen
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  const intervalRef = useRef<number | undefined>(undefined);

  function start() {
    if (intervalRef.current !== undefined) return;
    // Pretend we started "elapsed" ms ago, so resuming continues where we stopped.
    startRef.current = Date.now() - elapsed;
    intervalRef.current = window.setInterval(() => setElapsed(Date.now() - startRef.current), 50);
    setRunning(true);
  }
  function stop() {
    window.clearInterval(intervalRef.current);
    intervalRef.current = undefined;
    setRunning(false);
  }
  function reset() {
    stop();
    setElapsed(0);
  }

  useEffect(() => {
    return () => window.clearInterval(intervalRef.current);
  }, []);

  return (
    <main>
      <h1>Stopwatch</h1>
      <p data-testid="time">{(elapsed / 1000).toFixed(1)}</p>
      <button type="button" onClick={running ? stop : start}>
        {running ? "Stop" : "Start"}
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </main>
  );
}
`;

const STOPWATCH_TESTS = code`import { describe, it, expect, screen, user, waitFor, sleep } from "./test-kit";

const time = () => parseFloat(screen.getByTestId("time").textContent);
const button = (name) => screen.getByRole("button", { name });

describe("stopwatch", () => {
  it("counts up while running", async () => {
    await screen.findByTestId("time");
    expect(screen.getByTestId("time")).toHaveTextContent("0.0");
    await user.click(button("Start"));
    expect(button("Stop")).toBeInTheDocument();
    await waitFor(() => expect(time()).toBeGreaterThanOrEqual(0.2));
  });
  it("stops counting when stopped", async () => {
    await user.click(button("Stop"));
    const frozen = screen.getByTestId("time").textContent;
    await sleep(300);
    expect(screen.getByTestId("time").textContent).toBe(frozen);
    expect(button("Start")).toBeInTheDocument();
  });
  it("resumes from where it stopped", async () => {
    const before = time();
    await user.click(button("Start"));
    await waitFor(() => expect(time()).toBeGreaterThan(before + 0.1));
    await user.click(button("Stop"));
  });
  it("resets to zero and stops, even while running", async () => {
    await user.click(button("Start"));
    await sleep(150);
    await user.click(button("Reset"));
    expect(screen.getByTestId("time")).toHaveTextContent("0.0");
    await sleep(250);
    expect(screen.getByTestId("time")).toHaveTextContent("0.0");
    expect(button("Start")).toBeInTheDocument();
  });
  it("never leaves an interval running after Stop", async () => {
    const active = new Set();
    const realSet = window.setInterval;
    const realClear = window.clearInterval;
    window.setInterval = (...args) => {
      const id = realSet.apply(window, args);
      active.add(id);
      return id;
    };
    window.clearInterval = (id) => {
      active.delete(id);
      return realClear.call(window, id);
    };
    try {
      for (let i = 0; i < 3; i++) {
        await user.click(button("Start"));
        await user.click(button("Stop"));
      }
      expect(active.size).toBe(0);
    } finally {
      window.setInterval = realSet;
      window.clearInterval = realClear;
    }
  });
});
`;

// ── 7. Data fetching in an effect (race conditions) ──────────────────────────

const USER_API = code`export type User = { id: number; name: string; email: string };

const USERS: Record<number, User> = {
  1: { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
  2: { id: 2, name: "Grace Hopper", email: "grace@example.com" },
  3: { id: 3, name: "Linus Torvalds", email: "linus@example.com" },
};

// User 1 is deliberately the slowest, so its response can arrive after a newer request's.
const DELAYS: Record<number, number> = { 1: 300, 2: 30, 3: 100 };

/** A fake network call. Rejects for unknown ids (e.g. 4). */
export function fetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = USERS[id];
      if (user) resolve(user);
      else reject(new Error("User not found"));
    }, DELAYS[id] ?? 50);
  });
}
`;

const PROFILE_STARTER = code`import { useEffect, useState } from "react";
import { fetchUser, type User } from "./api";

function UserProfile({ id }: { id: number }) {
  const [user, setUser] = useState<User | null>(null);

  // BUG: no loading state, no error handling, and a slow earlier response
  // can overwrite the result of a newer request.
  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);

  if (!user) return null;
  return (
    <article>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </article>
  );
}

export default function App() {
  const [id, setId] = useState(3);
  return (
    <main>
      <h1>Users</h1>
      {[1, 2, 3, 4].map((n) => (
        <button key={n} type="button" onClick={() => setId(n)}>
          User {n}
        </button>
      ))}
      <UserProfile id={id} />
    </main>
  );
}
`;

const PROFILE_SOLUTION = code`import { useEffect, useState } from "react";
import { fetchUser, type User } from "./api";

type State = { status: "loading" } | { status: "success"; user: User } | { status: "error"; message: string };

function UserProfile({ id }: { id: number }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let ignore = false; // set by the cleanup when this effect is superseded
    setState({ status: "loading" });
    fetchUser(id).then(
      (user) => {
        if (!ignore) setState({ status: "success", user });
      },
      (error: Error) => {
        if (!ignore) setState({ status: "error", message: error.message });
      },
    );
    return () => {
      ignore = true;
    };
  }, [id]);

  if (state.status === "loading") return <p data-testid="loading">Loading…</p>;
  if (state.status === "error") return <p role="alert">Error: {state.message}</p>;
  return (
    <article>
      <h2>{state.user.name}</h2>
      <p>{state.user.email}</p>
    </article>
  );
}

export default function App() {
  const [id, setId] = useState(3);
  return (
    <main>
      <h1>Users</h1>
      {[1, 2, 3, 4].map((n) => (
        <button key={n} type="button" onClick={() => setId(n)}>
          User {n}
        </button>
      ))}
      <UserProfile id={id} />
    </main>
  );
}
`;

const PROFILE_TESTS = code`import { describe, it, expect, screen, user, sleep } from "./test-kit";

const pick = (n) => user.click(screen.getByRole("button", { name: "User " + n }));
const profileHeadings = () => screen.queryAllByRole("heading", { level: 2 }).map((h) => h.textContent);

describe("user profile", () => {
  it("shows the loaded user", async () => {
    expect(await screen.findByRole("heading", { name: "Linus Torvalds", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("linus@example.com")).toBeInTheDocument();
  });
  it("ignores a slow stale response that arrives after a newer one", async () => {
    await pick(1); // 300 ms
    await pick(2); // 30 ms
    expect(await screen.findByRole("heading", { name: "Grace Hopper", level: 2 })).toBeInTheDocument();
    await sleep(450); // user 1's response lands now and must be ignored
    expect(profileHeadings()).toEqual(["Grace Hopper"]);
    expect(screen.getByText("grace@example.com")).toBeInTheDocument();
  });
  it("shows a loading state and hides the previous user while loading", async () => {
    await pick(3);
    expect(screen.getByTestId("loading")).toHaveTextContent("Loading");
    expect(profileHeadings()).toEqual([]);
    expect(await screen.findByRole("heading", { name: "Linus Torvalds", level: 2 })).toBeInTheDocument();
    expect(screen.queryByTestId("loading")).toBeNull();
  });
  it("shows an error when the request fails", async () => {
    await pick(4);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("User not found");
    expect(profileHeadings()).toEqual([]);
  });
});
`;

// ── 8. Custom hook ───────────────────────────────────────────────────────────

const LS_HOOK_STARTER = code`import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Like useState, but the value also lives in localStorage (as JSON) under \`key\`.
 * - The initial value comes from storage when present and valid, otherwise \`initialValue\`.
 * - Every change is written back.
 * - Corrupted JSON or a throwing localStorage must not crash the app.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // TODO: read from and write to localStorage
  const [value, setValue] = useState<T>(initialValue);
  return [value, setValue];
}
`.replace(/\\`/g, "`");

const LS_HOOK_SOLUTION = code`import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // Lazy initialiser: storage is read once, not on every render.
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // quota exceeded or storage disabled: keep working in memory
    }
  }, [key, value]);

  return [value, setValue];
}
`;

const LS_APP = code`import { useLocalStorage } from "./useLocalStorage";

export default function App() {
  const [name, setName] = useLocalStorage("demo:name", "");
  const [count, setCount] = useLocalStorage("demo:count", 0);

  return (
    <main>
      <label htmlFor="name">Name</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      <p>Hello, {name || "stranger"}!</p>

      <p data-testid="count">{count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </main>
  );
}
`;

const LS_TESTS = code`import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, within, user, flush } from "./test-kit";
import App from "../App";

// Each test mounts its own copy of <App/>, so the tests don't depend on what the live preview stored.
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
const reset = () => {
  localStorage.removeItem("demo:name");
  localStorage.removeItem("demo:count");
};

describe("useLocalStorage", () => {
  it("starts from the stored JSON values", async () => {
    reset();
    localStorage.setItem("demo:name", JSON.stringify("Seeded"));
    localStorage.setItem("demo:count", "5");
    const app = await mount();
    expect(app.ui.getByLabelText("Name")).toHaveValue("Seeded");
    expect(app.ui.getByTestId("count")).toHaveTextContent("5");
    app.unmount();
  });
  it("falls back to the initial value for missing or corrupted data", async () => {
    reset();
    localStorage.setItem("demo:name", "{oops");
    const app = await mount();
    expect(app.ui.getByLabelText("Name")).toHaveValue("");
    expect(app.ui.getByTestId("count")).toHaveTextContent("0");
    app.unmount();
  });
  it("writes every change to localStorage as JSON, including functional updates", async () => {
    reset();
    const app = await mount();
    await user.type(app.ui.getByLabelText("Name"), "Ada");
    expect(localStorage.getItem("demo:name")).toBe('"Ada"');
    await user.click(app.ui.getByRole("button", { name: "Increment" }));
    await user.click(app.ui.getByRole("button", { name: "Increment" }));
    expect(app.ui.getByTestId("count")).toHaveTextContent("2");
    expect(localStorage.getItem("demo:count")).toBe("2");
    app.unmount();
  });
  it("restores the values after the component is remounted", async () => {
    const app = await mount();
    expect(app.ui.getByLabelText("Name")).toHaveValue("Ada");
    expect(app.ui.getByTestId("count")).toHaveTextContent("2");
    app.unmount();
    reset();
  });
});
`;

// ── 9. Context ───────────────────────────────────────────────────────────────

const THEME_STARTER = code`import { createContext, useContext, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

type ThemeValue = { theme: Theme; toggleTheme: () => void };

// TODO: create a context, provide { theme, toggleTheme } from ThemeProvider
// (theme state starts as "light"), and read it in useTheme.
// useTheme must throw an Error mentioning "ThemeProvider" when used outside the provider.
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useTheme(): ThemeValue {
  return { theme: "light", toggleTheme: () => {} };
}
`;

const THEME_SOLUTION = code`import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

type ThemeValue = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);
  // Memoised so consumers don't re-render just because the provider did.
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside a <ThemeProvider>");
  return value;
}
`;

const THEME_APP = code`import { ThemeProvider, useTheme } from "./ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      Switch to {theme === "light" ? "dark" : "light"} theme
    </button>
  );
}

function Toolbar() {
  // Note: no theme prop is passed down through Toolbar or Page.
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}

function Status() {
  const { theme } = useTheme();
  return <p data-testid="status">Current theme: {theme}</p>;
}

function Page() {
  return (
    <section>
      <Toolbar />
      <Status />
    </section>
  );
}

function Shell() {
  const { theme } = useTheme();
  return (
    <div data-testid="shell" data-theme={theme}>
      <Page />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
`;

const THEME_TESTS = code`import { describe, it, expect, screen, user } from "./test-kit";

const shell = () => screen.getByTestId("shell");

describe("theme context", () => {
  it("starts with the light theme everywhere", async () => {
    expect(await screen.findByTestId("shell")).toHaveAttribute("data-theme", "light");
    expect(screen.getByTestId("status")).toHaveTextContent("Current theme: light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });
  it("toggling updates every consumer", async () => {
    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(shell()).toHaveAttribute("data-theme", "dark");
    expect(screen.getByTestId("status")).toHaveTextContent("Current theme: dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });
  it("toggles back", async () => {
    await user.click(screen.getByRole("button", { name: "Switch to light theme" }));
    expect(shell()).toHaveAttribute("data-theme", "light");
    expect(screen.getByTestId("status")).toHaveTextContent("Current theme: light");
  });
});
`;

// ── 10. Reducer ──────────────────────────────────────────────────────────────

const CART_STARTER = code`export type CartItem = { id: string; name: string; price: number; qty: number }; // price in cents
export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: "add"; product: { id: string; name: string; price: number } }
  | { type: "increment"; id: string }
  | { type: "decrement"; id: string } // removes the item when its quantity would reach 0
  | { type: "remove"; id: string }
  | { type: "clear" };

export const initialCart: CartState = { items: [] };

/** Pure: returns a new state, never mutates the old one. */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    // TODO: handle every action. "add" puts a new line in with qty 1, or bumps qty if it's already there.
    default:
      return state;
  }
}

/** Total price in cents. */
export function cartTotal(state: CartState): number {
  // TODO
  return 0;
}
`;

const CART_SOLUTION = code`export type CartItem = { id: string; name: string; price: number; qty: number };
export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: "add"; product: { id: string; name: string; price: number } }
  | { type: "increment"; id: string }
  | { type: "decrement"; id: string }
  | { type: "remove"; id: string }
  | { type: "clear" };

export const initialCart: CartState = { items: [] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const exists = state.items.some((i) => i.id === action.product.id);
      return {
        items: exists
          ? state.items.map((i) => (i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i))
          : [...state.items, { ...action.product, qty: 1 }],
      };
    }
    case "increment":
      return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i)) };
    case "decrement":
      return {
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
          .filter((i) => i.qty > 0),
      };
    case "remove":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "clear":
      return initialCart;
    default:
      return state;
  }
}

export function cartTotal(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
`;

const CART_APP = code`import { useReducer } from "react";
import { cartReducer, cartTotal, initialCart } from "./cartReducer";

const PRODUCTS = [
  { id: "coffee", name: "Coffee", price: 350 },
  { id: "tea", name: "Tea", price: 300 },
  { id: "cake", name: "Cake", price: 450 },
];

const money = (cents: number) => "$" + (cents / 100).toFixed(2);

export default function App() {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  return (
    <main>
      <h1>Shop</h1>
      {PRODUCTS.map((p) => (
        <button key={p.id} type="button" onClick={() => dispatch({ type: "add", product: p })}>
          Add {p.name}
        </button>
      ))}

      <h2>Cart</h2>
      {cart.items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cart.items.map((i) => (
            <li key={i.id} data-testid={"line-" + i.id}>
              {i.name} ({money(i.price)}) × <span data-testid={"qty-" + i.id}>{i.qty}</span>
              <button type="button" aria-label={"Increase " + i.name} onClick={() => dispatch({ type: "increment", id: i.id })}>
                +
              </button>
              <button type="button" aria-label={"Decrease " + i.name} onClick={() => dispatch({ type: "decrement", id: i.id })}>
                −
              </button>
              <button type="button" aria-label={"Remove " + i.name} onClick={() => dispatch({ type: "remove", id: i.id })}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <p data-testid="total">{money(cartTotal(cart))}</p>
      <button type="button" onClick={() => dispatch({ type: "clear" })}>
        Clear cart
      </button>
    </main>
  );
}
`;

const CART_TESTS = code`import { describe, it, expect, screen, user } from "./test-kit";
import { cartReducer, cartTotal, initialCart } from "../cartReducer";

const deepFreeze = (o) => {
  Object.values(o).forEach((v) => typeof v === "object" && v !== null && deepFreeze(v));
  return Object.freeze(o);
};
const coffee = { id: "coffee", name: "Coffee", price: 350 };
const tea = { id: "tea", name: "Tea", price: 300 };
const add = (state, product) => cartReducer(deepFreeze(state), { type: "add", product });

describe("cartReducer (pure)", () => {
  it("adds a new product with quantity 1 and bumps an existing one", () => {
    const one = add(initialCart, coffee);
    expect(one.items).toEqual([{ ...coffee, qty: 1 }]);
    const two = add(add(one, tea), coffee);
    expect(two.items).toEqual([
      { ...coffee, qty: 2 },
      { ...tea, qty: 1 },
    ]);
  });
  it("increments, decrements and removes the item when the quantity reaches 0", () => {
    let s = add(add(initialCart, coffee), tea);
    s = cartReducer(deepFreeze(s), { type: "increment", id: "tea" });
    expect(s.items.find((i) => i.id === "tea").qty).toBe(2);
    s = cartReducer(deepFreeze(s), { type: "decrement", id: "tea" });
    expect(s.items.find((i) => i.id === "tea").qty).toBe(1);
    s = cartReducer(deepFreeze(s), { type: "decrement", id: "tea" });
    expect(s.items.map((i) => i.id)).toEqual(["coffee"]);
  });
  it("removes a line and clears the cart", () => {
    const s = add(add(initialCart, coffee), tea);
    expect(cartReducer(deepFreeze(s), { type: "remove", id: "coffee" }).items.map((i) => i.id)).toEqual(["tea"]);
    expect(cartReducer(deepFreeze(s), { type: "clear" }).items).toEqual([]);
  });
  it("computes the total in cents", () => {
    const s = add(add(add(initialCart, coffee), coffee), tea);
    expect(cartTotal(s)).toBe(1000);
    expect(cartTotal(initialCart)).toBe(0);
  });
});

describe("cart UI", () => {
  it("starts empty", async () => {
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByTestId("total")).toHaveTextContent("$0.00");
  });
  it("adds products and updates quantities and the total", async () => {
    await user.click(screen.getByRole("button", { name: "Add Coffee" }));
    await user.click(screen.getByRole("button", { name: "Add Coffee" }));
    await user.click(screen.getByRole("button", { name: "Add Tea" }));
    expect(screen.getByTestId("qty-coffee")).toHaveTextContent("2");
    expect(screen.getByTestId("qty-tea")).toHaveTextContent("1");
    expect(screen.getByTestId("total")).toHaveTextContent("$10.00");
  });
  it("decreases, removes and clears", async () => {
    await user.click(screen.getByRole("button", { name: "Decrease Tea" }));
    expect(screen.queryByTestId("line-tea")).toBeNull();
    expect(screen.getByTestId("total")).toHaveTextContent("$7.00");
    await user.click(screen.getByRole("button", { name: "Increase Coffee" }));
    expect(screen.getByTestId("total")).toHaveTextContent("$10.50");
    await user.click(screen.getByRole("button", { name: "Remove Coffee" }));
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add Cake" }));
    await user.click(screen.getByRole("button", { name: "Clear cart" }));
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByTestId("total")).toHaveTextContent("$0.00");
  });
});
`;

// ── 11. memo / useCallback ───────────────────────────────────────────────────

const ROW_STARTER = code`export type Item = { id: number; label: string; done: boolean };

/** Counts how many times a Row function body ran. The tests read this. */
export const renders = { count: 0 };

export function Row({ item, onToggle }: { item: Item; onToggle: (id: number) => void }) {
  renders.count++;
  return (
    <li>
      <label>
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} /> {item.label}
      </label>
    </li>
  );
}
`;

const ROW_SOLUTION = code`import { memo } from "react";

export type Item = { id: number; label: string; done: boolean };

export const renders = { count: 0 };

// memo skips re-rendering when every prop is shallowly equal to the last render's.
export const Row = memo(function Row({ item, onToggle }: { item: Item; onToggle: (id: number) => void }) {
  renders.count++;
  return (
    <li>
      <label>
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} /> {item.label}
      </label>
    </li>
  );
});
`;

const ROW_APP_STARTER = code`import { useState } from "react";
import { Row, type Item } from "./Row";

const INITIAL: Item[] = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, label: "Task " + (i + 1), done: false }));

export default function App() {
  const [items, setItems] = useState(INITIAL);
  const [note, setNote] = useState("");

  // New function on every render: even a memoised Row would see a "changed" prop.
  const toggle = (id: number) => setItems(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));

  return (
    <main>
      <label htmlFor="note">Note</label>
      <input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
      <ul>
        {items.map((item) => (
          <Row key={item.id} item={item} onToggle={toggle} />
        ))}
      </ul>
    </main>
  );
}
`;

const ROW_APP_SOLUTION = code`import { useCallback, useState } from "react";
import { Row, type Item } from "./Row";

const INITIAL: Item[] = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, label: "Task " + (i + 1), done: false }));

export default function App() {
  const [items, setItems] = useState(INITIAL);
  const [note, setNote] = useState("");

  // Stable identity (no dependencies): the updater form reads the latest items itself.
  const toggle = useCallback((id: number) => {
    setItems((current) => current.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  }, []);

  return (
    <main>
      <label htmlFor="note">Note</label>
      <input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
      <ul>
        {items.map((item) => (
          <Row key={item.id} item={item} onToggle={toggle} />
        ))}
      </ul>
    </main>
  );
}
`;

const ROW_TESTS = code`import { describe, it, expect, screen, user } from "./test-kit";
import { renders } from "../Row";

describe("memoised rows", () => {
  it("still toggles tasks correctly", async () => {
    const box = await screen.findByLabelText("Task 3");
    expect(box.checked).toBe(false);
    await user.click(box);
    expect(screen.getByLabelText("Task 3").checked).toBe(true);
    expect(screen.getByLabelText("Task 4").checked).toBe(false);
    await user.click(screen.getByLabelText("Task 3"));
    expect(screen.getByLabelText("Task 3").checked).toBe(false);
  });
  it("does not re-render any row when an unrelated input changes", async () => {
    const input = await screen.findByLabelText("Note");
    const before = renders.count;
    await user.type(input, "hello");
    expect(input).toHaveValue("hello");
    expect(renders.count - before).toBe(0);
  });
  it("re-renders only the toggled row", async () => {
    const before = renders.count;
    await user.click(screen.getByLabelText("Task 7"));
    expect(screen.getByLabelText("Task 7").checked).toBe(true);
    const rerendered = renders.count - before;
    expect(rerendered).toBeGreaterThan(0);
    // StrictMode may run a render twice in development; 20 rows must not all re-render.
    expect(rerendered).toBeLessThanOrEqual(2);
  });
});
`;

// ── 12. Effect subscription and cleanup ──────────────────────────────────────

const ONLINE_STARTER = code`import { useState } from "react";

/** true while the browser is online. */
export function useOnlineStatus(): boolean {
  // TODO: subscribe to the window "online" and "offline" events and unsubscribe on cleanup
  const [online] = useState(() => navigator.onLine);
  return online;
}
`;

const ONLINE_SOLUTION = code`import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    // Cleanup: runs on unmount (and before the effect re-runs), so no listener leaks.
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
`;

const ONLINE_APP = code`import { useOnlineStatus } from "./useOnlineStatus";

export default function App() {
  const online = useOnlineStatus();
  return (
    <main>
      <h1>Network</h1>
      <p data-testid="status">{online ? "✅ Online" : "❌ Disconnected"}</p>
      <button type="button" disabled={!online}>
        Save progress
      </button>
    </main>
  );
}
`;

const ONLINE_TESTS = code`import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, screen, waitFor, flush } from "./test-kit";
import App from "../App";

const fire = (type) => window.dispatchEvent(new Event(type));

describe("useOnlineStatus", () => {
  it("reacts to the offline and online events", async () => {
    await screen.findByTestId("status");
    fire("offline");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("Disconnected"));
    expect(screen.getByRole("button", { name: "Save progress" })).toBeDisabled();
    fire("online");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("Online"));
    expect(screen.getByRole("button", { name: "Save progress" }).disabled).toBe(false);
  });
  it("removes every listener it added when the component unmounts", async () => {
    const added = [];
    const removed = [];
    const realAdd = window.addEventListener;
    const realRemove = window.removeEventListener;
    window.addEventListener = function (type, listener, options) {
      if (type === "online" || type === "offline") added.push([type, listener]);
      return realAdd.call(this, type, listener, options);
    };
    window.removeEventListener = function (type, listener, options) {
      if (type === "online" || type === "offline") removed.push([type, listener]);
      return realRemove.call(this, type, listener, options);
    };
    try {
      const el = document.createElement("div");
      document.body.appendChild(el);
      const root = createRoot(el);
      root.render(h(App));
      await flush();
      await flush();
      expect(added.length).toBeGreaterThan(0);
      root.unmount();
      await flush();
      el.remove();
      const leaked = added.filter(([type, listener]) => !removed.some(([t, l]) => t === type && l === listener));
      expect(leaked).toHaveLength(0);
    } finally {
      window.addEventListener = realAdd;
      window.removeEventListener = realRemove;
    }
  });
});
`;

// ─────────────────────────────────────────────────────────────────────────────

export default defineTasks([
  practice({
    slug: "react-profile-cards",
    skills: ["react", w("html", 0.3)],
    complexity: 1,
    estSeconds: 600,
    framework: "react-ts",
    title: ["Props, children and lists: profile cards", "Пропси, children і списки: картки профілів"],
    prompt: [
      lines(
        "Build a small team directory from the `PEOPLE` data in `App.tsx`:",
        "",
        "1. `Card({ title, children })` renders a `<section>` with an `<h2>` containing `title`, followed by whatever is nested inside it.",
        "2. `PersonCard({ person })` renders an `<article data-testid=\"person-<id>\">` with the name in an `<h3>`, the role in a `<p>`, a `<span data-testid=\"status-<id>\">` saying `Online` or `Offline`, and the skills as a `<ul>` of `<li>`. When the person has no skills, render the text `No skills listed` instead, with no empty `<ul>`.",
        "3. `App` shows `<p data-testid=\"online-count\">2 online</p>` (computed from the data) and a `Card` titled `Team` containing one `PersonCard` per person, each with a stable `key`.",
      ),
      lines(
        "Створіть невеликий довідник команди з даних `PEOPLE` у `App.tsx`:",
        "",
        "1. `Card({ title, children })` рендерить `<section>` з `<h2>` із `title`, а далі все, що вкладено всередину.",
        "2. `PersonCard({ person })` рендерить `<article data-testid=\"person-<id>\">` з іменем у `<h3>`, роллю в `<p>`, `<span data-testid=\"status-<id>\">` з текстом `Online` або `Offline` та навичками як `<ul>` з `<li>`. Якщо навичок немає, відрендеріть текст `No skills listed` замість порожнього `<ul>`.",
        "3. `App` показує `<p data-testid=\"online-count\">2 online</p>` (обчислено з даних) і `Card` із заголовком `Team`, у якому по одному `PersonCard` на людину, кожен зі стабільним `key`.",
      ),
    ],
    files: { "/App.tsx": CARDS_STARTER },
    activeFile: "/App.tsx",
    tests: CARDS_TESTS,
    solution: { "/App.tsx": CARDS_SOLUTION },
    explanation: [
      "Components are functions of their props. `children` is just another prop: whatever you nest between a component's tags arrives there, which is how a `Card` can wrap any content without knowing it. Lists come from `map` over data, and each item needs a `key` that is stable and unique among siblings (an id, not the array index) so React can match old and new items when the list changes. Conditional rendering is plain JavaScript: a ternary chooses between the list and the fallback, and derived values like the online count are computed during render instead of being stored in state.",
      "Компоненти є функціями від пропсів. `children` це просто ще один проп: усе, що вкладено між тегами компонента, потрапляє туди, тому `Card` може обгортати будь-який вміст, не знаючи його. Списки утворюються через `map` по даних, і кожному елементу потрібен `key`, стабільний та унікальний серед сусідів (id, а не індекс масиву), щоб React міг зіставити старі й нові елементи при зміні списку. Умовний рендер це звичайний JavaScript: тернарний оператор обирає між списком і запасним варіантом, а похідні значення, як-от кількість онлайн, обчислюються під час рендеру, а не зберігаються в стані.",
    ],
  }),
  practice({
    slug: "react-todo-immutable-state",
    skills: ["react", w("immutability-copying", 0.6), w("state-management", 0.3)],
    complexity: 2,
    estSeconds: 780,
    framework: "react-ts",
    title: ["Update state without mutating it: todo list", "Оновлення стану без мутацій: список завдань"],
    prompt: [
      lines(
        "This todo list mutates its state in place, which React can't detect (and the data here is frozen, so the handlers throw). Fix `add`, `toggle` and `remove` with **immutable** updates and implement `clearCompleted`:",
        "",
        "- `add` appends a todo with a **unique** id (not `length + 1`) from the trimmed text, ignores blank text and clears the input.",
        "- `toggle` flips `done` for one todo and leaves every other object untouched.",
        "- `remove` deletes one todo.",
        "- `clearCompleted` removes all done todos.",
        "",
        "Use spread, `map` and `filter`; never `push`, `splice` or assign to a property of something already in state.",
      ),
      lines(
        "Цей список завдань мутує свій стан на місці, чого React не помічає (а дані тут заморожені, тож обробники кидають помилку). Виправте `add`, `toggle` і `remove` **незмінними** оновленнями та реалізуйте `clearCompleted`:",
        "",
        "- `add` додає завдання з **унікальним** id (не `length + 1`) з обрізаного тексту, ігнорує порожній текст і очищає поле.",
        "- `toggle` перемикає `done` в одного завдання й не чіпає інші об'єкти.",
        "- `remove` видаляє одне завдання.",
        "- `clearCompleted` видаляє всі виконані завдання.",
        "",
        "Використовуйте spread, `map` і `filter`; ніколи `push`, `splice` чи присвоєння властивості того, що вже є в стані.",
      ),
    ],
    files: { "/App.tsx": TODO_STARTER },
    activeFile: "/App.tsx",
    tests: TODO_TESTS,
    solution: { "/App.tsx": TODO_SOLUTION },
    explanation: [
      "React decides whether to re-render by comparing the new state with the old one by reference. `todos.push(x); setTodos(todos)` hands React the same array, so it bails out (and with frozen data it throws before that). Treat state as read-only and always produce new values: `[...todos, newTodo]` to add, `todos.map(t => t.id === id ? { ...t, done: !t.done } : t)` to change one item (only the changed object is copied, the rest keep their identity, which also helps memoisation), and `todos.filter(...)` to remove. The new id comes from the current maximum, because `length + 1` collides after a removal.",
      "React вирішує, чи ререндерити, порівнюючи новий стан зі старим за посиланням. `todos.push(x); setTodos(todos)` віддає React той самий масив, тож він пропускає оновлення (а із замороженими даними помилка виникає ще раніше). Ставтеся до стану як до лише для читання й завжди створюйте нові значення: `[...todos, newTodo]` для додавання, `todos.map(t => t.id === id ? { ...t, done: !t.done } : t)` для зміни одного елемента (копіюється лише змінений об'єкт, решта зберігають ідентичність, що допомагає й мемоізації) та `todos.filter(...)` для видалення. Новий id береться з поточного максимуму, бо `length + 1` дає колізію після видалення.",
    ],
  }),
  practice({
    slug: "react-accordion-lift-state",
    skills: ["react", w("state-management", 0.5), w("web-accessibility", 0.3)],
    complexity: 2,
    estSeconds: 660,
    framework: "react-ts",
    title: ["Lift state up: a one-at-a-time accordion", "Підняття стану: акордеон з однією відкритою панеллю"],
    prompt: [
      lines(
        "Each `Panel` owns its open/closed state, so several panels can be open at once. Make the parent own it:",
        "",
        "- `Panel` becomes **controlled**: it receives `isOpen` and `onToggle` props and has no state of its own.",
        "- `App` keeps the index of the open panel (or `null`) and passes it down.",
        "- Only one panel can be open at a time. **About** is open initially.",
        "- Clicking the header of the open panel collapses it; clicking another header opens that one and closes the previous.",
        "",
        "Keep `aria-expanded` on the header buttons in sync.",
      ),
      lines(
        "Кожна `Panel` володіє власним станом відкрита/закрита, тож відкритими можуть бути кілька панелей. Зробіть так, щоб станом володів батьківський компонент:",
        "",
        "- `Panel` стає **контрольованою**: отримує пропси `isOpen` і `onToggle` та не має власного стану.",
        "- `App` зберігає індекс відкритої панелі (або `null`) і передає його вниз.",
        "- Одночасно може бути відкрита лише одна панель. **About** відкрита спочатку.",
        "- Клік по заголовку відкритої панелі згортає її; клік по іншому заголовку відкриває його й закриває попередню.",
        "",
        "Тримайте `aria-expanded` на кнопках заголовків синхронізованим.",
      ),
    ],
    files: { "/App.tsx": ACCORDION_STARTER },
    activeFile: "/App.tsx",
    tests: ACCORDION_TESTS,
    solution: { "/App.tsx": ACCORDION_SOLUTION },
    explanation: [
      "When two components need to coordinate, move the state to their closest common parent and pass it down as props, with callbacks to change it. The parent is now the single source of truth for \"which panel is open\", which makes the rule \"only one\" trivial: a single `openIndex` can't describe two open panels, whereas separate booleans in each child could. Storing an index (or id) rather than a boolean per panel is the same principle as avoiding impossible states. `Panel` turned into a plain, reusable, controlled component.",
      "Коли двом компонентам треба узгоджувати стан, перенесіть його до найближчого спільного батька й передавайте вниз як пропси разом із колбеками для зміни. Тепер батько є єдиним джерелом правди про те, яка панель відкрита, і правило \"лише одна\" стає тривіальним: один `openIndex` не може описати дві відкриті панелі, тоді як окремі булеві значення в дітях могли б. Зберігання індексу (чи id) замість булевого значення на кожну панель відповідає тому самому принципу уникнення неможливих станів. `Panel` перетворилася на звичайний багаторазовий контрольований компонент.",
    ],
  }),
  practice({
    slug: "react-signup-form-validation",
    skills: ["react", w("html", 0.4), w("web-accessibility", 0.3)],
    complexity: 3,
    estSeconds: 1020,
    framework: "react-ts",
    title: ["A controlled form with validation", "Контрольована форма з валідацією"],
    prompt: [
      lines(
        "Turn the sign-up form into a **controlled** form (each input's value lives in state):",
        "",
        "- Email must look like `name@host.tld`: error `Enter a valid email`.",
        "- Password needs at least 8 characters: error `Password must be at least 8 characters`.",
        "- Confirmation must equal the password: error `Passwords do not match`.",
        "- Show **no errors** until the first submit attempt. After that, show the current errors **live** while the user edits. Render each in a `<p role=\"alert\">` right after its field.",
        "- Submitting an invalid form shows the errors. A valid one replaces the form with `<p data-testid=\"success\">Welcome, <email>!</p>`.",
        "",
        "Derive the errors during render rather than storing them in state.",
      ),
      lines(
        "Перетворіть форму реєстрації на **контрольовану** (значення кожного поля живе в стані):",
        "",
        "- Email має виглядати як `name@host.tld`: помилка `Enter a valid email`.",
        "- Пароль має містити щонайменше 8 символів: помилка `Password must be at least 8 characters`.",
        "- Підтвердження має збігатися з паролем: помилка `Passwords do not match`.",
        "- **Не показуйте помилок** до першої спроби надсилання. Після неї показуйте поточні помилки **наживо**, поки користувач редагує. Кожну рендеріть у `<p role=\"alert\">` одразу після її поля.",
        "- Надсилання некоректної форми показує помилки. Коректна замінює форму на `<p data-testid=\"success\">Welcome, <email>!</p>`.",
        "",
        "Обчислюйте помилки під час рендеру, а не зберігайте їх у стані.",
      ),
    ],
    files: { "/App.tsx": SIGNUP_STARTER },
    activeFile: "/App.tsx",
    tests: SIGNUP_TESTS,
    solution: { "/App.tsx": SIGNUP_SOLUTION },
    explanation: [
      "In a controlled input React is the source of truth: `value` comes from state and `onChange` writes back to it. That makes validation a pure function of the current values, so `errors` is computed on every render and can never go stale; only a `submitted` flag is real state, and it decides when to reveal them. `onSubmit` calls `preventDefault`, and `noValidate` turns off the browser's own bubbles so the app's messages are the ones the user sees. Linking each message to its field (a `<label htmlFor>` for the input, `role=\"alert\"` for the error) keeps the form usable with a screen reader; in production you would also set `aria-describedby` and `aria-invalid`.",
      "У контрольованому полі джерелом правди є React: `value` береться зі стану, а `onChange` записує назад. Тому валідація стає чистою функцією від поточних значень: `errors` обчислюється на кожному рендері й ніколи не застаріває; справжнім станом є лише прапорець `submitted`, що вирішує, коли їх показати. `onSubmit` викликає `preventDefault`, а `noValidate` вимикає власні підказки браузера, щоб користувач бачив повідомлення застосунку. Прив'язка кожного повідомлення до поля (`<label htmlFor>` для поля, `role=\"alert\"` для помилки) залишає форму придатною для читачів екрана; у продакшені варто додати й `aria-describedby` та `aria-invalid`.",
    ],
  }),
  practice({
    slug: "react-reset-state-with-key",
    skills: ["react", w("state-management", 0.3)],
    complexity: 2,
    estSeconds: 480,
    framework: "react-ts",
    title: ["Reset state with key: a chat draft", "Скидання стану через key: чернетка чату"],
    prompt: [
      lines(
        "In this chat, the draft text and the sent messages belong to the `Chat` component's state. When you switch from Alice to Bob, React sees the **same component at the same position** and keeps that state, so Bob inherits Alice's draft and messages.",
        "",
        "Fix it so that switching contacts always starts a fresh conversation: an empty draft and no sent messages, including when you switch back. Don't add `useEffect` and don't lift the state.",
      ),
      lines(
        "У цьому чаті текст чернетки й надіслані повідомлення належать стану компонента `Chat`. Коли ви перемикаєтеся з Alice на Bob, React бачить **той самий компонент на тій самій позиції** і зберігає стан, тож Bob успадковує чернетку й повідомлення Alice.",
        "",
        "Виправте так, щоб перемикання контактів завжди починало нову розмову: порожня чернетка й жодних надісланих повідомлень, зокрема й при поверненні назад. Не додавайте `useEffect` і не піднімайте стан.",
      ),
    ],
    files: { "/App.tsx": CHAT_STARTER },
    activeFile: "/App.tsx",
    tests: CHAT_TESTS,
    solution: { "/App.tsx": CHAT_SOLUTION },
    explanation: [
      "React keeps a component's state as long as it renders the same component type at the same position in the tree. Changing a prop doesn't change that identity. Giving the component a different `key` does: when the key changes React discards the old instance (state and DOM) and mounts a new one. That's usually better than a `useEffect` that resets state after the render, which would paint the stale draft first. The flip side, which the react.dev guide stresses, is that you don't need a key to *keep* state: just render the same thing in the same place.",
      "React зберігає стан компонента, доки той самий тип компонента рендериться на тій самій позиції в дереві. Зміна пропса цієї ідентичності не змінює. Інший `key` змінює: коли ключ змінюється, React відкидає старий екземпляр (стан і DOM) і монтує новий. Це зазвичай краще, ніж `useEffect`, що скидає стан після рендеру, бо тоді спершу б відмалювалася застаріла чернетка. Зворотний бік, на якому наголошує посібник react.dev: щоб *зберегти* стан, ключ не потрібен, просто рендеріть те саме на тому самому місці.",
    ],
  }),
  practice({
    slug: "react-stopwatch-refs",
    skills: ["react", w("dom-events", 0.3), w("async-javascript", 0.3)],
    complexity: 3,
    estSeconds: 900,
    framework: "react-ts",
    title: ["Refs and timers: a stopwatch", "Refs і таймери: секундомір"],
    prompt: [
      lines(
        "Implement the stopwatch in `App.tsx`:",
        "",
        "- **Start** begins counting; the display (`data-testid=\"time\"`) shows seconds with one decimal and updates about every 50 ms. The button then reads **Stop**.",
        "- **Stop** freezes the time. **Start** again **resumes** from the frozen time.",
        "- **Reset** stops and sets the time back to `0.0`, even while running.",
        "- Keep the interval id and the start timestamp in `useRef`s (they must survive renders without causing one), never leave two intervals running, and clear the interval when the component unmounts.",
      ),
      lines(
        "Реалізуйте секундомір у `App.tsx`:",
        "",
        "- **Start** починає відлік; дисплей (`data-testid=\"time\"`) показує секунди з одним знаком після коми й оновлюється приблизно кожні 50 мс. Кнопка потім має текст **Stop**.",
        "- **Stop** зупиняє час. Повторний **Start** **продовжує** із зупиненого часу.",
        "- **Reset** зупиняє й повертає час до `0.0`, навіть під час відліку.",
        "- Зберігайте id інтервалу й мітку початку в `useRef` (вони мають переживати рендери, не спричиняючи їх), ніколи не залишайте два інтервали одночасно та очищайте інтервал, коли компонент розмонтовується.",
      ),
    ],
    files: { "/App.tsx": STOPWATCH_STARTER },
    activeFile: "/App.tsx",
    tests: STOPWATCH_TESTS,
    solution: { "/App.tsx": STOPWATCH_SOLUTION },
    explanation: [
      "State is for what the screen shows; a ref is for values React doesn't need to render but that must persist between renders, like a timer id. Changing `ref.current` doesn't re-render, which is exactly right for the interval id and the start timestamp, while `elapsed` is state because it is displayed. Resuming works by recomputing the start time as `Date.now() - elapsed`. Subtracting from the clock instead of adding 50 ms per tick keeps the time accurate even when ticks are delayed. A timer started in a handler must also be cleared when the component goes away, which is what the effect's cleanup function is for. You could equally put the interval in an effect keyed on `running`; the ref version is what react.dev uses to show refs.",
      "Стан призначений для того, що показує екран; ref потрібен для значень, які React не потрібно рендерити, але які мають зберігатися між рендерами, як-от id таймера. Зміна `ref.current` не спричиняє ререндеру, що саме те, що потрібно для id інтервалу й мітки початку, тоді як `elapsed` є станом, бо його показують. Продовження працює через перерахунок часу старту як `Date.now() - elapsed`. Віднімання від годинника замість додавання 50 мс на кожен тік зберігає точність, навіть коли тіки запізнюються. Таймер, запущений в обробнику, також треба очистити, коли компонент зникає, і саме для цього існує функція очищення ефекту. Можна й помістити інтервал в ефект із залежністю від `running`; версія з ref це те, що react.dev використовує, щоб показати refs.",
    ],
  }),
  practice({
    slug: "react-fetch-effect-race",
    skills: ["react", w("async-javascript", 0.6), w("typescript", 0.2)],
    complexity: 4,
    estSeconds: 1200,
    framework: "react-ts",
    title: ["Fetching in an effect: loading, errors and races", "Завантаження в ефекті: стани, помилки й гонки"],
    prompt: [
      lines(
        "`UserProfile` loads a user with `fetchUser(id)` (from `api.ts`, a fake network call; don't edit it). The current effect has three bugs. Fix them:",
        "",
        "1. **Loading:** show `<p data-testid=\"loading\">Loading…</p>` while a request is in flight, and don't show the previous user while the next one loads.",
        "2. **Errors:** when the request rejects (`User 4`), show `<p role=\"alert\">Error: <message></p>`.",
        "3. **Race:** user 1's response takes 300 ms and user 2's takes 30 ms. If you click User 1 then User 2, the late response from user 1 must **not** replace user 2.",
        "",
        "Use the effect's cleanup function to ignore results from a superseded effect.",
      ),
      lines(
        "`UserProfile` завантажує користувача через `fetchUser(id)` (з `api.ts`, імітація мережевого виклику; не редагуйте його). У поточному ефекті три помилки. Виправте їх:",
        "",
        "1. **Завантаження:** показуйте `<p data-testid=\"loading\">Loading…</p>`, поки запит у дорозі, і не показуйте попереднього користувача, поки завантажується наступний.",
        "2. **Помилки:** коли запит відхиляється (`User 4`), показуйте `<p role=\"alert\">Error: <message></p>`.",
        "3. **Гонка:** відповідь для користувача 1 іде 300 мс, а для користувача 2 лише 30 мс. Якщо натиснути User 1, а потім User 2, пізня відповідь для користувача 1 **не** має замінити користувача 2.",
        "",
        "Використайте функцію очищення ефекту, щоб ігнорувати результати витісненого ефекту.",
      ),
    ],
    files: { "/App.tsx": PROFILE_STARTER, "/api.ts": USER_API },
    visibleFiles: ["/App.tsx", "/api.ts"],
    activeFile: "/App.tsx",
    tests: PROFILE_TESTS,
    solution: { "/App.tsx": PROFILE_SOLUTION },
    explanation: [
      "An effect that fetches synchronises the component with an external system, and each run of the effect has its own closure. When `id` changes, React runs the previous effect's cleanup before the next effect. Setting `ignore = true` in that cleanup turns the stale request's `.then` into a no-op, so responses can arrive in any order and only the latest one is applied. Modelling the result as one discriminated union (`loading | success | error`) rules out impossible combinations (an error together with old data) and makes the three UI branches explicit. Resetting to `loading` at the start of the effect is what removes the previous user. With `AbortController` you can also cancel the request itself when the API supports it, and in real apps a data library (TanStack Query, SWR, a framework loader) handles all this for you.",
      "Ефект, що завантажує дані, синхронізує компонент із зовнішньою системою, і кожен запуск ефекту має власне замикання. Коли `id` змінюється, React викликає очищення попереднього ефекту перед наступним. Встановлення `ignore = true` у цьому очищенні перетворює `.then` застарілого запиту на порожню дію, тож відповіді можуть приходити в будь-якому порядку, а застосовується лише остання. Моделювання результату одним дискримінованим об'єднанням (`loading | success | error`) виключає неможливі комбінації (помилка разом зі старими даними) і робить три гілки UI явними. Скидання до `loading` на початку ефекту прибирає попереднього користувача. З `AbortController` можна скасувати й сам запит, якщо API це підтримує, а в реальних застосунках усе це бере на себе бібліотека даних (TanStack Query, SWR, завантажувач фреймворку).",
    ],
  }),
  practice({
    slug: "react-use-local-storage-hook",
    skills: ["react", w("browser-apis", 0.5), w("typescript", 0.3)],
    complexity: 3,
    estSeconds: 840,
    framework: "react-ts",
    title: ["A custom hook: useLocalStorage", "Власний хук: useLocalStorage"],
    prompt: [
      lines(
        "Implement `useLocalStorage<T>(key, initialValue)` in `useLocalStorage.ts` so it works like `useState` but persists:",
        "",
        "- The initial value is parsed (`JSON.parse`) from `localStorage[key]` if it exists. Otherwise, or if the stored JSON is **corrupted**, or `localStorage` throws, use `initialValue`.",
        "- Every change is saved back as JSON, including **functional updates** like `setCount(c => c + 1)`.",
        "- Return `[value, setValue]` with the same type as `useState`, and read storage lazily (not on every render).",
        "",
        "`App.tsx` already uses the hook for a name and a counter.",
      ),
      lines(
        "Реалізуйте `useLocalStorage<T>(key, initialValue)` у `useLocalStorage.ts`, щоб він працював як `useState`, але зберігав значення:",
        "",
        "- Початкове значення розбирається (`JSON.parse`) з `localStorage[key]`, якщо воно є. Інакше, або якщо збережений JSON **пошкоджений**, або `localStorage` кидає помилку, використовуйте `initialValue`.",
        "- Кожна зміна зберігається назад як JSON, зокрема й **функціональні оновлення** на кшталт `setCount(c => c + 1)`.",
        "- Повертайте `[value, setValue]` того самого типу, що й `useState`, і читайте сховище ліниво (не на кожному рендері).",
        "",
        "`App.tsx` уже використовує хук для імені й лічильника.",
      ),
    ],
    files: { "/useLocalStorage.ts": LS_HOOK_STARTER, "/App.tsx": LS_APP },
    visibleFiles: ["/useLocalStorage.ts", "/App.tsx"],
    activeFile: "/useLocalStorage.ts",
    tests: LS_TESTS,
    solution: { "/useLocalStorage.ts": LS_HOOK_SOLUTION },
    explanation: [
      "A custom hook is a function whose name starts with `use` that calls other hooks; it shares **logic**, not state (each component calling it gets its own). Here it wraps `useState` and keeps it in sync with an external store. Reading in a lazy initialiser (`useState(() => ...)`) runs the parse only on the first render, and an effect keyed on `[key, value]` writes after each change. Returning `useState`'s own setter means functional updates work for free. Storage is an untrusted boundary: it can hold garbage or be unavailable (private mode, quota), so both sides are wrapped in `try/catch` and fall back to the in-memory state. Server rendering has no `window`, so a production version would guard for that, or use `useSyncExternalStore` to also react to the `storage` event from other tabs.",
      "Власний хук це функція, чия назва починається з `use` і яка викликає інші хуки; він ділить **логіку**, а не стан (кожен компонент, що його викликає, має свій). Тут він обгортає `useState` і синхронізує його із зовнішнім сховищем. Читання в лінивому ініціалізаторі (`useState(() => ...)`) виконує розбір лише на першому рендері, а ефект із залежностями `[key, value]` записує після кожної зміни. Повернення власного сеттера `useState` означає, що функціональні оновлення працюють безкоштовно. Сховище це недовірена межа: воно може містити сміття або бути недоступним (приватний режим, квота), тож обидві сторони обгорнуто в `try/catch` з поверненням до стану в пам'яті. На сервері немає `window`, тому продакшен-версія додала б перевірку або використала б `useSyncExternalStore`, щоб ще й реагувати на подію `storage` з інших вкладок.",
    ],
  }),
  practice({
    slug: "react-theme-context",
    skills: ["react", w("state-management", 0.5), w("typescript", 0.2)],
    complexity: 2,
    estSeconds: 780,
    framework: "react-ts",
    title: ["Context instead of prop drilling: theme", "Контекст замість prop drilling: тема"],
    prompt: [
      lines(
        "The UI in `App.tsx` already consumes a theme through `useTheme()`, but `ThemeContext.tsx` is a stub. Implement it:",
        "",
        "- `ThemeProvider` holds the theme (`\"light\"` or `\"dark\"`, initially `\"light\"`) in state and provides `{ theme, toggleTheme }` through **context**.",
        "- `useTheme()` reads that context. Outside a provider it must throw an `Error` whose message mentions `ThemeProvider`.",
        "- Memoise the provided value (`useMemo`, with a stable `toggleTheme` from `useCallback`) so consumers don't re-render needlessly.",
        "",
        "Don't pass the theme down as a prop through `Toolbar` or `Page`.",
      ),
      lines(
        "UI в `App.tsx` уже споживає тему через `useTheme()`, але `ThemeContext.tsx` це заглушка. Реалізуйте його:",
        "",
        "- `ThemeProvider` тримає тему (`\"light\"` або `\"dark\"`, спочатку `\"light\"`) у стані й надає `{ theme, toggleTheme }` через **контекст**.",
        "- `useTheme()` читає цей контекст. Поза провайдером він має кинути `Error`, повідомлення якого згадує `ThemeProvider`.",
        "- Мемоізуйте надане значення (`useMemo`, зі стабільним `toggleTheme` із `useCallback`), щоб споживачі не ререндерилися без потреби.",
        "",
        "Не передавайте тему вниз пропсом через `Toolbar` чи `Page`.",
      ),
    ],
    files: { "/ThemeContext.tsx": THEME_STARTER, "/App.tsx": THEME_APP },
    visibleFiles: ["/ThemeContext.tsx", "/App.tsx"],
    activeFile: "/ThemeContext.tsx",
    tests: THEME_TESTS,
    solution: { "/ThemeContext.tsx": THEME_SOLUTION },
    explanation: [
      "Context lets a component deep in the tree read a value from a distant ancestor without passing it through every layer in between. `createContext` makes the channel, the provider's `value` prop fills it, and `useContext` reads the nearest provider's value. Wrapping that in a custom `useTheme` hook hides the context object, gives a single place to type it, and lets you fail loudly when the provider is missing (using `null` as the default and throwing is clearer than a silent wrong default). Every consumer re-renders when the provided value changes by reference, so the value is memoised; otherwise a new object on each provider render would re-render all consumers. For state that changes often or is needed by many unrelated parts, pair context with `useReducer` or use a dedicated store.",
      "Контекст дозволяє компоненту глибоко в дереві прочитати значення від далекого предка, не передаючи його крізь кожен проміжний рівень. `createContext` створює канал, проп `value` провайдера його наповнює, а `useContext` читає значення найближчого провайдера. Обгортання в власний хук `useTheme` ховає об'єкт контексту, дає єдине місце для типізації й дозволяє гучно впасти, коли провайдера немає (`null` за замовчуванням із викиданням помилки зрозуміліший за мовчазне хибне значення). Кожен споживач ререндериться, коли надане значення змінюється за посиланням, тому значення мемоізоване; інакше новий об'єкт на кожному рендері провайдера ререндерив би всіх споживачів. Для стану, що змінюється часто або потрібен багатьом непов'язаним частинам, поєднуйте контекст з `useReducer` або беріть окреме сховище.",
    ],
  }),
  practice({
    slug: "react-cart-reducer",
    skills: ["react", w("state-management", 0.6), w("redux", 0.3), w("typescript", 0.3)],
    complexity: 3,
    estSeconds: 1080,
    framework: "react-ts",
    title: ["Move logic into a reducer: shopping cart", "Логіка в редюсері: кошик покупок"],
    prompt: [
      lines(
        "`App.tsx` already drives a cart with `useReducer(cartReducer, initialCart)`. Implement the pure logic in `cartReducer.ts`:",
        "",
        "- `add`: append the product with `qty: 1`, or increase `qty` if that id is already in the cart.",
        "- `increment` / `decrement`: change one line's `qty` by 1; **decrementing to 0 removes the line**.",
        "- `remove`: delete a line. `clear`: empty the cart.",
        "- `cartTotal(state)`: the sum of `price * qty`, in cents.",
        "",
        "The reducer must be **pure**: it never mutates `state` (the tests pass frozen objects) and returns a new state.",
      ),
      lines(
        "`App.tsx` уже керує кошиком через `useReducer(cartReducer, initialCart)`. Реалізуйте чисту логіку в `cartReducer.ts`:",
        "",
        "- `add`: додайте товар з `qty: 1` або збільште `qty`, якщо такий id уже є в кошику.",
        "- `increment` / `decrement`: змінюють `qty` одного рядка на 1; **зменшення до 0 видаляє рядок**.",
        "- `remove`: видаляє рядок. `clear`: очищає кошик.",
        "- `cartTotal(state)`: сума `price * qty` у центах.",
        "",
        "Редюсер має бути **чистим**: ніколи не мутує `state` (тести передають заморожені об'єкти) і повертає новий стан.",
      ),
    ],
    files: { "/cartReducer.ts": CART_STARTER, "/App.tsx": CART_APP },
    visibleFiles: ["/cartReducer.ts", "/App.tsx"],
    activeFile: "/cartReducer.ts",
    tests: CART_TESTS,
    solution: { "/cartReducer.ts": CART_SOLUTION },
    explanation: [
      "A reducer gathers every way the state can change into one pure function `(state, action) => newState`, so the logic lives outside the component, is easy to read as a list of cases, and can be unit-tested without rendering anything (the first four tests don't touch the DOM). Components only describe *what happened* by dispatching actions such as `{ type: \"add\", product }`. As with `useState`, never mutate: `map` for per-line changes, `filter` to remove (this also implements \"decrement to zero removes the line\"), and spreads for new objects. Money is kept as integer cents and formatted only for display, which avoids floating-point surprises like `0.1 + 0.2`. When many distant components need the dispatch or state, the same reducer pairs naturally with context.",
      "Редюсер збирає всі способи зміни стану в одну чисту функцію `(state, action) => newState`, тож логіка живе поза компонентом, добре читається як список випадків і тестується без рендеру (перші чотири тести не торкаються DOM). Компоненти лише описують, *що сталося*, відправляючи дії на кшталт `{ type: \"add\", product }`. Як і з `useState`, ніколи не мутуйте: `map` для змін окремого рядка, `filter` для видалення (він же реалізує \"зменшення до нуля видаляє рядок\") та spread для нових об'єктів. Гроші зберігаються як цілі центи й форматуються лише для показу, що уникає сюрпризів з плаваючою комою на кшталт `0.1 + 0.2`. Коли dispatch або стан потрібні багатьом віддаленим компонентам, той самий редюсер природно поєднується з контекстом.",
    ],
  }),
  practice({
    slug: "react-memo-callback-rows",
    skills: ["react", w("web-performance", 0.6), w("immutability-copying", 0.2)],
    complexity: 4,
    estSeconds: 960,
    framework: "react-ts",
    title: ["Skip needless re-renders: memo and useCallback", "Без зайвих ререндерів: memo і useCallback"],
    prompt: [
      lines(
        "Typing in the **Note** field re-renders every one of the 20 `Row`s, although nothing about them changed. `Row` increments `renders.count` each time its body runs, and the tests watch that counter.",
        "",
        "Make it so that:",
        "",
        "- Typing in the note input re-renders **no** rows.",
        "- Toggling one task re-renders **only that row** (a StrictMode double render is fine, but not all 20).",
        "- Everything still works: a task's checkbox toggles, and others are untouched.",
        "",
        "Hint: `memo` compares props by reference, so every prop of `Row` must keep its identity between renders. Don't mutate state.",
      ),
      lines(
        "Введення в полі **Note** ререндерить усі 20 `Row`, хоча нічого в них не змінилося. `Row` збільшує `renders.count` щоразу, коли виконується його тіло, і тести стежать за цим лічильником.",
        "",
        "Зробіть так, щоб:",
        "",
        "- Введення в полі нотатки **не** ререндерило жодного рядка.",
        "- Перемикання одного завдання ререндерило **лише цей рядок** (подвійний рендер StrictMode припустимий, але не всі 20).",
        "- Усе й далі працювало: чекбокс завдання перемикається, а інші лишаються недоторканими.",
        "",
        "Підказка: `memo` порівнює пропси за посиланням, тож кожен проп `Row` має зберігати ідентичність між рендерами. Не мутуйте стан.",
      ),
    ],
    files: { "/Row.tsx": ROW_STARTER, "/App.tsx": ROW_APP_STARTER },
    visibleFiles: ["/Row.tsx", "/App.tsx"],
    activeFile: "/App.tsx",
    tests: ROW_TESTS,
    solution: { "/Row.tsx": ROW_SOLUTION, "/App.tsx": ROW_APP_SOLUTION },
    explanation: [
      "By default a component re-renders whenever its parent does, even with identical props. `memo` makes React skip a component when all its props are shallowly equal to the previous render's. That only works if the props are stable: `item` objects keep their identity because updates copy only the changed one, but an inline `toggle` function is a new object every render, so the check fails. `useCallback` keeps the same function between renders; reading the latest list via the updater form `setItems(current => ...)` lets it have an empty dependency array, so it never changes. Use this when profiling shows a real cost; memoisation isn't free, and the React Compiler can add it automatically. Often the better fix is to move state down (the `note` input into its own component) so the expensive tree isn't re-rendered at all.",
      "За замовчуванням компонент ререндериться щоразу, коли ререндериться його батько, навіть з однаковими пропсами. `memo` змушує React пропустити компонент, коли всі його пропси поверхнево дорівнюють пропсам попереднього рендеру. Це працює лише зі стабільними пропсами: об'єкти `item` зберігають ідентичність, бо оновлення копіює лише змінений, але вбудована функція `toggle` щоразу новий об'єкт, і перевірка не проходить. `useCallback` зберігає ту саму функцію між рендерами; читання актуального списку через форму-оновлювач `setItems(current => ...)` дозволяє мати порожній масив залежностей, тож вона ніколи не змінюється. Застосовуйте це, коли профілювання показує реальну вартість; мемоізація не безкоштовна, а React Compiler може додавати її автоматично. Часто кращим виправленням є опустити стан нижче (поле `note` в окремий компонент), щоб дороге дерево взагалі не ререндерилося.",
    ],
  }),
  practice({
    slug: "react-online-status-effect",
    skills: ["react", w("browser-apis", 0.5), w("dom-events", 0.4)],
    complexity: 2,
    estSeconds: 720,
    framework: "react-ts",
    title: ["Subscribe in an effect: useOnlineStatus", "Підписка в ефекті: useOnlineStatus"],
    prompt: [
      lines(
        "Implement `useOnlineStatus()` in `useOnlineStatus.ts`. It returns `true` while the browser is online:",
        "",
        "- Start from `navigator.onLine`.",
        "- Update when the `window` fires `online` or `offline` events.",
        "- Subscribe in `useEffect` and **unsubscribe in its cleanup**, so unmounting leaves no listeners behind.",
        "",
        "`App.tsx` shows the status and disables a button while offline.",
      ),
      lines(
        "Реалізуйте `useOnlineStatus()` у `useOnlineStatus.ts`. Він повертає `true`, поки браузер онлайн:",
        "",
        "- Починайте з `navigator.onLine`.",
        "- Оновлюйтеся, коли `window` генерує події `online` або `offline`.",
        "- Підписуйтеся в `useEffect` і **відписуйтеся в його очищенні**, щоб після розмонтування не лишилося слухачів.",
        "",
        "`App.tsx` показує статус і вимикає кнопку, поки офлайн.",
      ),
    ],
    files: { "/useOnlineStatus.ts": ONLINE_STARTER, "/App.tsx": ONLINE_APP },
    visibleFiles: ["/useOnlineStatus.ts", "/App.tsx"],
    activeFile: "/useOnlineStatus.ts",
    tests: ONLINE_TESTS,
    solution: { "/useOnlineStatus.ts": ONLINE_SOLUTION },
    explanation: [
      "Effects synchronise a component with something outside React, here the browser's connectivity events. The effect sets the subscription up and returns a cleanup function that tears it down; React calls the cleanup on unmount and before re-running the effect. Without it every mount would add another listener that keeps calling `setOnline` on a component that no longer exists. The cleanup must remove the very same function references that were added, which is why the handlers are named constants rather than inline arrows created twice. In development, StrictMode deliberately mounts, cleans up and mounts again to expose missing cleanups. For subscribing to an external store, React also offers `useSyncExternalStore`, which handles tearing and server rendering for you.",
      "Ефекти синхронізують компонент із чимось поза React, тут із подіями з'єднання браузера. Ефект налаштовує підписку й повертає функцію очищення, що її знімає; React викликає очищення при розмонтуванні та перед повторним запуском ефекту. Без цього кожне монтування додавало б ще одного слухача, який і далі викликав би `setOnline` на неіснуючому компоненті. Очищення має зняти саме ті самі посилання на функції, що були додані, тому обробники є іменованими константами, а не вбудованими стрілками, створеними двічі. У розробці StrictMode навмисно монтує, очищає й монтує знову, щоб виявити відсутні очищення. Для підписки на зовнішнє сховище React пропонує також `useSyncExternalStore`, що сам дбає про tearing і серверний рендеринг.",
    ],
  }),
]);
