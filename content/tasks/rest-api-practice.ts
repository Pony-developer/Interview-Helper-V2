import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const PROBLEM_STARTER = code`export const CONTENT_TYPE = "application/problem+json";

export type FieldError = { field: string; message: string };
export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: FieldError[];
};

/** Builds an RFC 9457 "problem details" body for an error response. */
export function problemDetails(
  status: number,
  detail: string | FieldError[] | null,
  options: { instance?: string } = {},
): ProblemDetails {
  // TODO: 4xx and 5xx only; the standard title for the status; detail as text or as a list of field errors
  return { type: "about:blank", title: "", status };
}
`;

const PROBLEM_SOLUTION = code`export const CONTENT_TYPE = "application/problem+json";

export type FieldError = { field: string; message: string };
export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: FieldError[];
};

const TITLES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

export function problemDetails(
  status: number,
  detail: string | FieldError[] | null,
  options: { instance?: string } = {},
): ProblemDetails {
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    throw new RangeError("Problem details are for 4xx and 5xx statuses, got " + status);
  }
  // "about:blank" means the title alone describes the problem, which is what RFC 9457 suggests for standard statuses.
  const problem: ProblemDetails = { type: "about:blank", title: TITLES[status] ?? "Error", status };
  if (typeof detail === "string") problem.detail = detail;
  // Copy the field errors, so the response can't change the caller's list later.
  if (Array.isArray(detail) && detail.length > 0) {
    problem.errors = detail.map((error) => ({ field: error.field, message: error.message }));
  }
  if (options.instance !== undefined) problem.instance = options.instance;
  return problem;
}
`;

const PROBLEM_INDEX = code`import "./styles.css";
import { problemDetails } from "./src/problem";

document.getElementById("app")!.innerHTML = '<h1>Problem details</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = JSON.stringify(problemDetails(404, "User 7 not found", { instance: "/users/7" }), null, 2);
`;

const PROBLEM_TESTS = code`import { describe, it, expect } from "./test-kit";
import { CONTENT_TYPE, problemDetails } from "../src/problem";

describe("problemDetails", () => {
  it("describes a not-found error with its standard title", () => {
    expect(problemDetails(404, "User 7 not found", { instance: "/users/7" })).toEqual({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "User 7 not found",
      instance: "/users/7",
    });
  });
  it("lists validation errors per field, with no detail text", () => {
    expect(problemDetails(422, [{ field: "email", message: "must contain @" }])).toEqual({
      type: "about:blank",
      title: "Unprocessable Content",
      status: 422,
      errors: [{ field: "email", message: "must contain @" }],
    });
  });
  it("leaves out an empty error list", () => {
    expect(problemDetails(400, [])).toEqual({ type: "about:blank", title: "Bad Request", status: 400 });
  });
  it("uses a generic title for statuses it doesn't know", () => {
    expect(problemDetails(418, "tea").title).toBe("Error");
    expect(problemDetails(429, "slow down").title).toBe("Too Many Requests");
  });
  it("only describes errors", () => {
    expect(() => problemDetails(200, "fine")).toThrow(RangeError);
    expect(() => problemDetails(600, "odd")).toThrow(RangeError);
  });
  it("copies the field errors it was given", () => {
    const errors = [{ field: "name", message: "required" }];
    const problem = problemDetails(422, errors);
    expect(problem.errors).toEqual(errors);
    expect(problem.errors).not.toBe(errors);
  });
  it("is served as application/problem+json", () => {
    expect(CONTENT_TYPE).toBe("application/problem+json");
  });
});
`;

export default defineTasks([
  quiz(
    "rest-created-status",
    ["rest-api-design", w("http-rest", 0.3)],
    2,
    75,
    ["The status for a created resource", "Статус для створеного ресурсу"],
    ["A `POST /orders` creates a new order. Which response is the most correct?", "`POST /orders` створює нове замовлення. Яка відповідь найправильніша?"],
    [
      ["`200 OK` with the order in the body", "`200 OK` з замовленням у тілі"],
      ["`201 Created` with a `Location` header pointing at the new order", "`201 Created` із заголовком `Location`, що вказує на нове замовлення"],
      ["`204 No Content`, since nothing needs to be returned", "`204 No Content`, бо нічого повертати не потрібно"],
      ["`302 Found` redirecting to the order list", "`302 Found` з перенаправленням на список замовлень"],
    ],
    "b",
    [
      "`201 Created` says a resource now exists, and the `Location` header tells the client where to find it. `200` is for a plain success, `204` means success with no body, and `302` is a redirect for the browser, which is not what an API creating data should answer with.",
      "`201 Created` каже, що ресурс тепер існує, а заголовок `Location` підказує клієнту, де його шукати. `200` — звичайний успіх, `204` означає успіх без тіла, а `302` — перенаправлення для браузера, чим API, що створює дані, відповідати не повинен.",
    ],
  ),
  quiz(
    "rest-safe-idempotent",
    ["rest-api-design", w("http-rest", 0.3)],
    2,
    75,
    ["Safe and idempotent methods", "Безпечні й ідемпотентні методи"],
    ["Which HTTP method is both safe and idempotent?", "Який метод HTTP одночасно безпечний і ідемпотентний?"],
    [
      ["GET", "GET"],
      ["POST", "POST"],
      ["PATCH", "PATCH"],
      ["DELETE", "DELETE"],
    ],
    "a",
    [
      "Safe means the request doesn't change server state, and idempotent means repeating it gives the same result as doing it once. GET is both. DELETE is idempotent but not safe, and PATCH and POST are neither in general, which is why retrying them needs an idempotency key.",
      "Безпечний означає, що запит не змінює стан сервера, а ідемпотентний — що повтор дає той самий результат, що й одноразове виконання. GET є обома. DELETE ідемпотентний, але не безпечний, а PATCH і POST загалом не є жодним з них, тому повтори для них потребують ключа ідемпотентності.",
    ],
  ),
  practice({
    slug: "rest-problem-details",
    skills: ["rest-api-design", w("http-rest"), w("typescript")],
    complexity: 2,
    estSeconds: 780,
    framework: "vanilla-ts",
    title: ["Build RFC 9457 problem details", "Побудуйте problem details за RFC 9457"],
    prompt: [
      "Every error response of a good API has the same shape, so clients can handle errors in one place. Implement `problemDetails(status, detail, { instance })` in `src/problem.ts`, which builds an RFC 9457 \"problem details\" object:\n\n- `status` must be a 4xx or 5xx code. Anything else is a `RangeError`.\n- `type` is `about:blank`, and `title` is the standard reason phrase for the status (`Not Found`, `Unprocessable Content`, `Too Many Requests`…). Unknown codes get `Error`.\n- `detail` is a string when you pass text; a list of `{ field, message }` items becomes `errors` (copied, and left out when empty).\n- `instance` is included only when given.\n- `CONTENT_TYPE` is `application/problem+json`.",
      "Кожна відповідь з помилкою в доброму API має однакову форму, щоб клієнти обробляли помилки в одному місці. Реалізуйте `problemDetails(status, detail, { instance })` у `src/problem.ts`, який будує об'єкт «problem details» за RFC 9457:\n\n- `status` має бути кодом 4xx або 5xx. Інше — це `RangeError`.\n- `type` — `about:blank`, а `title` — стандартна фраза для статусу (`Not Found`, `Unprocessable Content`, `Too Many Requests`…). Невідомі коди отримують `Error`.\n- `detail` — рядок, коли ви передаєте текст; список `{ field, message }` стає `errors` (копіюється і відсутній, коли порожній).\n- `instance` додається, лише коли його передано.\n- `CONTENT_TYPE` дорівнює `application/problem+json`.",
    ],
    files: {
      "/src/problem.ts": PROBLEM_STARTER,
      "/index.ts": PROBLEM_INDEX,
    },
    visibleFiles: ["/src/problem.ts"],
    activeFile: "/src/problem.ts",
    tests: PROBLEM_TESTS,
    solution: { "/src/problem.ts": PROBLEM_SOLUTION },
    explanation: [
      "RFC 9457 (which replaces RFC 7807) standardises the error body: a machine-readable `type`, a human `title`, the `status`, and optional `detail`, `instance` and extension members like `errors`. Using `about:blank` as the type says that the title alone describes the problem, which is right for standard HTTP statuses. Field errors belong in a list so a form can highlight each field, and copying them keeps later changes to the caller's array from leaking into an already-built response. Serving the body as `application/problem+json` tells clients it's an error to parse, not a normal payload.",
      "RFC 9457 (який замінює RFC 7807) стандартизує тіло помилки: машинно-читаний `type`, людський `title`, `status` і необов'язкові `detail`, `instance` та розширення на кшталт `errors`. Вказання `about:blank` як типу означає, що сам заголовок описує проблему, що правильно для стандартних HTTP-статусів. Помилки полів мають бути списком, щоб форма могла підсвітити кожне поле, а їх копіювання не дає подальшим змінам масиву викликача потрапити у вже побудовану відповідь. Подання тіла як `application/problem+json` каже клієнтам, що це помилку треба розібрати, а не звичайні дані.",
    ],
  }),
]);
