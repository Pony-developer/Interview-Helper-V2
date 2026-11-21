import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const APP_STARTER = code`export type Req = { method: string; path: string; params: Record<string, string>; body?: unknown; [key: string]: unknown };
export type Res = { status: number; body: unknown };
export type Next = (error?: unknown) => void;
export type Handler = (req: Req, res: Res, next: Next) => void;
export type ErrorHandler = (error: unknown, req: Req, res: Res, next: Next) => void;

/** A tiny Express-style app: middleware and routes run in order; handle() runs one request through them. */
export function createApp() {
  return {
    use(handler: Handler | ErrorHandler): void {
      // TODO: a middleware for every request
    },
    get(path: string, handler: Handler): void {
      // TODO: a GET route; ":name" segments become req.params
    },
    handle(method: string, path: string, body?: unknown): Res {
      // TODO: run the layers in order, handle next(error), error handlers (four parameters),
      // thrown errors, and the defaults: 404 "Not found" or 500 "Internal error"
      return { status: 0, body: undefined };
    },
  };
}
`;

const APP_SOLUTION = code`export type Req = { method: string; path: string; params: Record<string, string>; body?: unknown; [key: string]: unknown };
export type Res = { status: number; body: unknown };
export type Next = (error?: unknown) => void;
export type Handler = (req: Req, res: Res, next: Next) => void;
export type ErrorHandler = (error: unknown, req: Req, res: Res, next: Next) => void;

type Layer = { method?: string; path?: string; handler: Handler | ErrorHandler };

/** Matches "/users/:id" against "/users/42"; returns the named params, or null when the path doesn't match. */
function matchPath(pattern: string, path: string): Record<string, string> | null {
  const want = pattern.split("/");
  const got = path.split("/");
  if (want.length !== got.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(":")) params[want[i].slice(1)] = got[i];
    else if (want[i] !== got[i]) return null;
  }
  return params;
}

export function createApp() {
  const layers: Layer[] = [];

  return {
    use(handler: Handler | ErrorHandler): void {
      layers.push({ handler });
    },
    get(path: string, handler: Handler): void {
      layers.push({ method: "GET", path, handler });
    },
    handle(method: string, path: string, body?: unknown): Res {
      const req: Req = { method, path, params: {}, body };
      const res: Res = { status: 0, body: undefined };
      let failed = false;
      let error: unknown;
      let index = 0;

      const step = (): void => {
        while (index < layers.length) {
          const layer = layers[index++];
          if (layer.method !== undefined && layer.method !== method) continue;
          if (layer.path !== undefined) {
            const params = matchPath(layer.path, path);
            if (params === null) continue;
            req.params = params;
          }
          // Express tells error handlers apart by their arity: four parameters.
          const takesError = layer.handler.length === 4;
          // Error handlers run only while there is an error, and normal handlers only without one.
          if (takesError !== failed) continue;
          try {
            if (takesError) (layer.handler as ErrorHandler)(error, req, res, next);
            else (layer.handler as Handler)(req, res, next);
          } catch (thrown) {
            failed = true;
            error = thrown;
            continue;
          }
          return; // the handler either answered or called next(), which resumes the loop
        }
      };

      const next: Next = (err?: unknown) => {
        failed = err !== undefined;
        if (failed) error = err;
        step();
      };

      step();
      if (res.status === 0) {
        res.status = failed ? 500 : 404;
        res.body = failed ? "Internal error" : "Not found";
      }
      return res;
    },
  };
}
`;

const APP_INDEX = code`import "./styles.css";
import { createApp } from "./src/app";

const app = createApp();
app.get("/users/:id", (req, res) => {
  res.status = 200;
  res.body = { id: req.params.id };
});
document.getElementById("app")!.innerHTML = '<h1>Mini Express</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = JSON.stringify(app.handle("GET", "/users/42"));
`;

const APP_TESTS = code`import { describe, it, expect } from "./test-kit";
import { createApp } from "../src/app";

describe("createApp", () => {
  it("runs middleware and routes in registration order", () => {
    const app = createApp();
    const log = [];
    app.use((req, res, next) => {
      log.push("middleware");
      next();
    });
    app.get("/hi", (req, res) => {
      log.push("route");
      res.status = 200;
      res.body = "hi";
    });
    expect(app.handle("GET", "/hi")).toEqual({ status: 200, body: "hi" });
    expect(log).toEqual(["middleware", "route"]);
  });
  it("fills route parameters", () => {
    const app = createApp();
    app.get("/users/:id", (req, res) => {
      res.status = 200;
      res.body = req.params.id;
    });
    expect(app.handle("GET", "/users/42").body).toBe("42");
  });
  it("matches the method and the whole path", () => {
    const app = createApp();
    app.get("/hi", (req, res) => {
      res.status = 200;
    });
    expect(app.handle("POST", "/hi").status).toBe(404);
    expect(app.handle("GET", "/hello")).toEqual({ status: 404, body: "Not found" });
    expect(app.handle("GET", "/hi/extra").status).toBe(404);
  });
  it("lets middleware pass data along with next()", () => {
    const app = createApp();
    app.use((req, res, next) => {
      req.user = "ada";
      next();
    });
    app.get("/me", (req, res) => {
      res.status = 200;
      res.body = req.user;
    });
    expect(app.handle("GET", "/me").body).toBe("ada");
  });
  it("skips normal handlers and reaches the error handler after next(error)", () => {
    const app = createApp();
    app.get("/boom", (req, res, next) => next(new Error("db down")));
    app.use((req, res) => {
      res.status = 200;
      res.body = "skipped";
    });
    app.use((error, req, res, next) => {
      res.status = 500;
      res.body = "caught " + error.message;
    });
    expect(app.handle("GET", "/boom")).toEqual({ status: 500, body: "caught db down" });
  });
  it("catches errors thrown by handlers", () => {
    const app = createApp();
    app.get("/x", () => {
      throw new Error("oops");
    });
    app.use((error, req, res, next) => {
      res.status = 400;
      res.body = "caught " + error.message;
    });
    expect(app.handle("GET", "/x")).toEqual({ status: 400, body: "caught oops" });
  });
  it("answers 500 when an error is never handled", () => {
    const app = createApp();
    app.get("/boom", (req, res, next) => next(new Error("nobody listens")));
    expect(app.handle("GET", "/boom")).toEqual({ status: 500, body: "Internal error" });
  });
  it("doesn't run error handlers for normal requests", () => {
    const app = createApp();
    app.use((error, req, res, next) => {
      res.status = 500;
    });
    expect(app.handle("GET", "/nothing")).toEqual({ status: 404, body: "Not found" });
  });
});
`;

export default defineTasks([
  quiz(
    "express-error-arity",
    ["express", w("nodejs", 0.3)],
    2,
    75,
    ["How Express finds error handlers", "Як Express знаходить обробники помилок"],
    ["Why does Express error-handling middleware have four parameters, `(err, req, res, next)`?", "Чому middleware для обробки помилок в Express має чотири параметри `(err, req, res, next)`?"],
    [
      ["Express recognises error handlers by their arity: a function with four parameters is only called when there is an error", "Express розпізнає обробники помилок за кількістю параметрів: функцію з чотирма параметрами викликають лише тоді, коли є помилка"],
      ["The fourth parameter is required for the error to be logged", "Четвертий параметр потрібен, щоб помилку записали в журнал"],
      ["Express requires the error handler to be async", "Express вимагає, щоб обробник помилок був асинхронним"],
      ["Three parameters are enough, but four makes the handler faster", "Достатньо трьох параметрів, а четвертий лише прискорює обробник"],
    ],
    "a",
    [
      "There is no separate registration for error handlers: a middleware with four parameters is skipped for normal requests and run only after `next(err)` or a thrown error. That's why dropping the unused `next` parameter silently turns your error handler into a normal middleware that never sees errors.",
      "Окремої реєстрації для обробників помилок немає: middleware з чотирма параметрами пропускається для звичайних запитів і виконується лише після `next(err)` або кинутої помилки. Тому, якщо прибрати невикористаний параметр `next`, обробник помилок мовчки стане звичайним middleware, який помилок не бачить.",
    ],
  ),
  practice({
    slug: "express-mini-app",
    skills: ["express", w("nodejs"), w("typescript")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["A mini Express: middleware, routes and errors", "Міні-Express: middleware, маршрути й помилки"],
    prompt: [
      "Implement `createApp()` in `src/app.ts`, a small version of Express's request pipeline. `handle(method, path, body)` runs one request through the layers you registered and returns `{ status, body }`:\n\n- `use(handler)` adds a middleware for every request; `get(path, handler)` adds a GET route. Layers run in registration order.\n- A path like `/users/:id` matches one path segment per part and puts the value in `req.params`. Methods and the whole path must match.\n- Each handler gets `(req, res, next)`. Calling `next()` continues to the next matching layer. Calling `next(error)` skips normal handlers and goes to the next **error handler**, which is a middleware with four parameters `(error, req, res, next)`. A thrown error does the same.\n- If nothing answers, the default is `404` with body `Not found`. An error nobody handles gives `500` with body `Internal error`.",
      "Реалізуйте `createApp()` у `src/app.ts`, спрощену версію конвеєра запитів Express. `handle(method, path, body)` пропускає один запит через зареєстровані шари й повертає `{ status, body }`:\n\n- `use(handler)` додає middleware для кожного запиту; `get(path, handler)` додає маршрут GET. Шари виконуються в порядку реєстрації.\n- Шлях на кшталт `/users/:id` збігається по одному сегменту й записує значення в `req.params`. Метод і весь шлях мають збігатися.\n- Кожен обробник отримує `(req, res, next)`. Виклик `next()` переходить до наступного шару, що підходить. Виклик `next(error)` пропускає звичайні обробники і йде до наступного **обробника помилок**, тобто middleware з чотирма параметрами `(error, req, res, next)`. Кинута помилка працює так само.\n- Якщо ніхто не відповів, типова відповідь — `404` з тілом `Not found`. Необроблена помилка дає `500` з тілом `Internal error`.",
    ],
    files: {
      "/src/app.ts": APP_STARTER,
      "/index.ts": APP_INDEX,
    },
    visibleFiles: ["/src/app.ts"],
    activeFile: "/src/app.ts",
    tests: APP_TESTS,
    solution: { "/src/app.ts": APP_SOLUTION },
    explanation: [
      "Express is a list of layers and a cursor. `step()` walks the list from the current position, skipping layers that don't match the method or path, and calls the first one that fits. `next()` is just `step()` again, which is why calling it from inside a handler continues the same walk. Errors change which layers are eligible: `failed` decides between normal handlers and error handlers, and the arity check (`handler.length === 4`) is the same trick Express uses. Wrapping each call in `try/catch` turns a thrown error into the same state as `next(error)`. Stopping the loop with `return` after a handler is what makes a handler that answers without calling `next()` end the request, just as in Express.",
      "Express — це список шарів і курсор. `step()` іде списком від поточної позиції, пропускає шари, що не збігаються з методом чи шляхом, і викликає перший, що підходить. `next()` — це просто знову `step()`, тому виклик з обробника продовжує той самий прохід. Помилки змінюють, які шари можна викликати: `failed` вирішує між звичайними обробниками й обробниками помилок, а перевірка кількості параметрів (`handler.length === 4`) — той самий прийом, що використовує Express. Обгортання кожного виклику в `try/catch` перетворює кинуту помилку на той самий стан, що й `next(error)`. Зупинка циклу через `return` після обробника — це те, через що обробник, який відповів без `next()`, завершує запит, як і в Express.",
    ],
  }),
]);
