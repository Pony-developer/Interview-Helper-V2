import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const ODATA_STARTER = code`export type Condition = {
  field: string;
  op: "eq" | "ne" | "gt" | "ge" | "lt" | "le" | "contains";
  value: string | number | boolean | null;
};
export type QueryOptions = {
  select?: string[];
  filter?: Condition[];
  orderby?: Array<{ field: string; desc?: boolean }>;
  top?: number;
};

/** Builds the $filter text for a list of conditions, joined with "and". */
export function buildFilter(conditions: Condition[]): string {
  // TODO
  return "";
}

/** Builds a Dataverse Web API URL: base/entitySet?$select=…&$filter=…&$orderby=…&$top=… */
export function buildUrl(baseUrl: string, entitySet: string, options: QueryOptions = {}): string {
  // TODO
  return "";
}

/** The @odata.nextLink of a response body, or null when this was the last page. */
export function nextLink(body: unknown): string | null {
  // TODO
  return null;
}
`;

const ODATA_SOLUTION = code`export type Condition = {
  field: string;
  op: "eq" | "ne" | "gt" | "ge" | "lt" | "le" | "contains";
  value: string | number | boolean | null;
};
export type QueryOptions = {
  select?: string[];
  filter?: Condition[];
  orderby?: Array<{ field: string; desc?: boolean }>;
  top?: number;
};

// Logical names in Dataverse are lowercase letters, digits and underscores. Anything else would
// let a value smuggle extra query syntax into the URL, so names are checked before use.
const NAME = /^[a-z][a-z0-9_]*$/;
const checkName = (name: string): string => {
  if (!NAME.test(name)) throw new RangeError("Invalid column name: " + name);
  return name;
};

/** A string literal in OData: single quotes, with each inner quote doubled. */
export function escapeString(value: string): string {
  return "'" + value.replace(/'/g, "''") + "'";
}

function formatValue(op: string, value: Condition["value"]): string {
  if (value === null) {
    if (op !== "eq" && op !== "ne") throw new TypeError("null can only be compared with eq or ne");
    return "null";
  }
  if (typeof value === "string") return escapeString(value);
  if (typeof value === "boolean") return String(value);
  if (!Number.isFinite(value)) throw new TypeError("Numbers must be finite");
  return String(value);
}

export function buildFilter(conditions: Condition[]): string {
  return conditions
    .map((c) => {
      const field = checkName(c.field);
      if (c.op === "contains") {
        if (typeof c.value !== "string") throw new TypeError("contains needs a string");
        return "contains(" + field + "," + escapeString(c.value) + ")";
      }
      return field + " " + c.op + " " + formatValue(c.op, c.value);
    })
    .join(" and ");
}

export function buildUrl(baseUrl: string, entitySet: string, options: QueryOptions = {}): string {
  const params: string[] = [];
  if (options.select && options.select.length > 0) {
    params.push("$select=" + options.select.map(checkName).join(","));
  }
  if (options.filter && options.filter.length > 0) {
    params.push("$filter=" + encodeURIComponent(buildFilter(options.filter)));
  }
  if (options.orderby && options.orderby.length > 0) {
    const order = options.orderby.map((o) => checkName(o.field) + (o.desc ? " desc" : " asc")).join(",");
    params.push("$orderby=" + encodeURIComponent(order));
  }
  if (options.top !== undefined) {
    if (!Number.isInteger(options.top) || options.top < 1) throw new RangeError("$top must be a positive integer");
    params.push("$top=" + options.top);
  }
  const base = baseUrl.replace(/\/+$/, "");
  return base + "/" + checkName(entitySet) + (params.length > 0 ? "?" + params.join("&") : "");
}

export function nextLink(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const link = (body as Record<string, unknown>)["@odata.nextLink"];
  return typeof link === "string" ? link : null;
}
`;

const ODATA_INDEX = code`import "./styles.css";
import { buildUrl } from "./src/odata";

document.getElementById("app")!.innerHTML = '<h1>Dataverse query</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = buildUrl("https://org.example/api/data/v9.2/", "accounts", {
  select: ["name", "revenue"],
  filter: [{ field: "statecode", op: "eq", value: 0 }],
  top: 10,
});
`;

const ODATA_TESTS = code`import { describe, it, expect } from "./test-kit";
import { buildFilter, buildUrl, nextLink } from "../src/odata";

const BASE = "https://org.example/api/data/v9.2";

describe("buildFilter", () => {
  it("quotes strings and doubles inner single quotes", () => {
    expect(buildFilter([{ field: "name", op: "eq", value: "O'Brien" }])).toBe("name eq 'O''Brien'");
  });
  it("formats numbers, booleans and null", () => {
    expect(buildFilter([{ field: "revenue", op: "gt", value: 1000 }])).toBe("revenue gt 1000");
    expect(buildFilter([{ field: "isactive", op: "eq", value: true }])).toBe("isactive eq true");
    expect(buildFilter([{ field: "parentid", op: "ne", value: null }])).toBe("parentid ne null");
  });
  it("uses contains for substring matches", () => {
    expect(buildFilter([{ field: "name", op: "contains", value: "Acme" }])).toBe("contains(name,'Acme')");
  });
  it("joins conditions with and", () => {
    expect(
      buildFilter([
        { field: "statecode", op: "eq", value: 0 },
        { field: "revenue", op: "ge", value: 500 },
      ]),
    ).toBe("statecode eq 0 and revenue ge 500");
  });
  it("is empty for no conditions", () => {
    expect(buildFilter([])).toBe("");
  });
  it("rejects column names that could smuggle query syntax", () => {
    expect(() => buildFilter([{ field: "name eq 'x' or 1", op: "eq", value: 1 }])).toThrow(RangeError);
  });
  it("only compares null with eq and ne, and rejects non-finite numbers", () => {
    expect(() => buildFilter([{ field: "revenue", op: "gt", value: null }])).toThrow(TypeError);
    expect(() => buildFilter([{ field: "revenue", op: "gt", value: NaN }])).toThrow(TypeError);
  });
});

describe("buildUrl", () => {
  it("builds the full query in a fixed order, with encoded filter and order", () => {
    const url = buildUrl(BASE + "/", "accounts", {
      select: ["name", "revenue"],
      filter: [{ field: "statecode", op: "eq", value: 0 }],
      orderby: [{ field: "name", desc: true }],
      top: 10,
    });
    expect(url).toBe(
      BASE + "/accounts?$select=name,revenue&$filter=" + encodeURIComponent("statecode eq 0") +
        "&$orderby=" + encodeURIComponent("name desc") + "&$top=10",
    );
  });
  it("adds no query string when there are no options", () => {
    expect(buildUrl(BASE, "contacts")).toBe(BASE + "/contacts");
  });
  it("validates the entity set name and $top", () => {
    expect(() => buildUrl(BASE, "accounts;drop")).toThrow(RangeError);
    expect(() => buildUrl(BASE, "accounts", { top: 0 })).toThrow(RangeError);
    expect(() => buildUrl(BASE, "accounts", { top: 2.5 })).toThrow(RangeError);
  });
});

describe("nextLink", () => {
  it("returns the next page's address while there is one", () => {
    expect(nextLink({ value: [], "@odata.nextLink": BASE + "/accounts?$skiptoken=abc" })).toBe(BASE + "/accounts?$skiptoken=abc");
  });
  it("returns null on the last page", () => {
    expect(nextLink({ value: [] })).toBeNull();
    expect(nextLink(null)).toBeNull();
  });
});
`;

export default defineTasks([
  quiz(
    "dv-many-to-many",
    ["dynamics-crm", w("sql", 0.3)],
    2,
    75,
    ["Choosing a relationship type", "Вибір типу зв'язку"],
    ["A contact can belong to several accounts, and an account has many contacts. Which Dataverse relationship fits?", "Контакт може належати до кількох облікових записів, а в облікового запису багато контактів. Який зв'язок Dataverse підходить?"],
    [
      ["One-to-many, with a lookup column on the contact", "Один-до-багатьох, з пошуковим стовпцем у контакті"],
      ["Many-to-many, stored in an intersect table", "Багато-до-багатьох, що зберігається в проміжній таблиці"],
      ["Self-referencing, on the contact table", "Самопосилання в таблиці контактів"],
      ["An alternate key on the account", "Альтернативний ключ в обліковому записі"],
    ],
    "b",
    [
      "A single lookup can point from many contacts to one account, but not from one contact to several. Both sides being \"many\" needs a many-to-many relationship, which Dataverse stores in an intersect table linking the two.",
      "Один пошуковий стовпець може вказувати з багатьох контактів на один обліковий запис, але не з одного контакту на кілька. Коли обидві сторони — «багато», потрібен зв'язок багато-до-багатьох, який Dataverse зберігає в проміжній таблиці, що з'єднує їх.",
    ],
  ),
  quiz(
    "dv-paging",
    ["dynamics-crm", w("http-rest", 0.3)],
    2,
    75,
    ["Reading all the rows", "Читання всіх рядків"],
    ["A Web API response contains an @odata.nextLink. What should the client do?", "Відповідь Web API містить @odata.nextLink. Що має зробити клієнт?"],
    [
      ["Follow the link, and keep following each new nextLink until none is returned", "Перейти за посиланням і йти за кожним новим nextLink, доки він не перестане повертатися"],
      ["Raise $top to a very large number and stop", "Підняти $top до дуже великого числа і зупинитися"],
      ["Build $skip offsets from the row count", "Формувати зсуви $skip з кількості рядків"],
      ["Treat the response as complete, since it has data", "Вважати відповідь повною, бо в ній є дані"],
    ],
    "a",
    [
      "Results above one page come with a link to the next page, which carries a token the server needs. Following links reads everything correctly even when rows change between requests, while offsets can skip or repeat rows.",
      "Результати понад одну сторінку мають посилання на наступну сторінку з токеном, який потрібен серверу. Перехід за посиланнями читає все коректно навіть тоді, коли рядки змінюються між запитами, тоді як зсуви можуть пропустити або повторити рядки.",
    ],
  ),
  quiz(
    "dv-privilege-depth",
    ["dynamics-crm", w("auth", 0.3)],
    3,
    90,
    ["Who sees which records", "Хто бачить які записи"],
    ["Sales reps should see only the accounts they own, and their manager should see the accounts of the whole team. Which security setting handles this?", "Торгові представники мають бачити лише облікові записи, яких є власниками, а їхній менеджер — облікові записи всієї команди. Яке налаштування безпеки для цього?"],
    [
      ["Privilege depth on the Read privilege: User depth for reps, Parent: child business units for the manager", "Глибина привілеїв для читання: глибина «Користувач» для представників, «Батьківський: дочірні» для менеджера"],
      ["Field-level security on the account's owner column", "Безпека на рівні полів для стовпця власника облікового запису"],
      ["A separate environment per team", "Окреме середовище для кожної команди"],
      ["Alternate keys on the account table", "Альтернативні ключі в таблиці облікових записів"],
    ],
    "a",
    [
      "Security roles grant privileges with a depth, and depth decides which records a privilege covers: the user's own records, the business unit, or the unit and its children. Field-level security hides columns rather than rows, and separate environments are a costly way to do what a role already does.",
      "Ролі безпеки надають привілеї з глибиною, а глибина визначає, які записи покриває привілей: власні записи користувача, бізнес-підрозділ або підрозділ з дочірніми. Безпека на рівні полів приховує стовпці, а не рядки, а окремі середовища — дорогий спосіб зробити те, що вже робить роль.",
    ],
  ),
  quiz(
    "dv-plugin-stage",
    ["dynamics-crm", w("dotnet", 0.3)],
    3,
    90,
    ["Where to validate a save", "Де перевіряти збереження"],
    ["A plug-in must check a field on Create and cancel the save if it's invalid. Which registration fits?", "Плагін має перевіряти поле під час Create і скасовувати збереження, якщо воно некоректне. Яка реєстрація підходить?"],
    [
      ["Pre-operation, synchronous, throwing InvalidPluginExecutionException", "До операції, синхронно, з кидком InvalidPluginExecutionException"],
      ["Post-operation, asynchronous, logging the error", "Після операції, асинхронно, із записом помилки в журнал"],
      ["A business rule on the form", "Бізнес-правило на формі"],
      ["A scheduled cloud flow", "Запланований хмарний потік"],
    ],
    "a",
    [
      "A synchronous pre-operation plug-in runs inside the save's transaction, so throwing an exception stops the change. An asynchronous plug-in runs after the save and can't cancel it, and a business rule only runs in the form, not on the API.",
      "Синхронний плагін до операції виконується всередині транзакції збереження, тож кидок виключення зупиняє зміну. Асинхронний плагін виконується після збереження і не може його скасувати, а бізнес-правило працює лише на формі, а не в API.",
    ],
  ),
  practice({
    slug: "dv-odata-query-builder",
    skills: ["dynamics-crm", w("http-rest"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Build Dataverse Web API queries safely", "Безпечно будуйте запити Web API до Dataverse"],
    prompt: [
      "Dynamics apps query Dataverse with OData URLs assembled from user input (a search box, a filter panel). Careless string concatenation lets a value break out of its quotes and change the query. Implement the helpers in `src/odata.ts`:\n\n- `buildFilter(conditions)` joins conditions with `and`. Strings become quoted literals with each inner single quote doubled (`O'Brien` → `'O''Brien'`). Numbers and booleans are written as-is, and `null` only works with `eq` and `ne`. `contains` produces `contains(field,'text')`. Column names must be lowercase letters, digits and underscores, or it's a `RangeError`. Non-finite numbers are a `TypeError`.\n- `buildUrl(baseUrl, entitySet, options)` builds `base/entitySet?$select=…&$filter=…&$orderby=…&$top=…`, in that order, with the filter and order **URL-encoded**, and only the options that are given. A trailing slash on the base is ignored. `$top` must be a positive integer.\n- `nextLink(body)` returns the `@odata.nextLink` of a response, or `null` when there isn't one.",
      "Застосунки Dynamics запитують Dataverse за адресами OData, складеними з вхідних даних користувача (поле пошуку, панель фільтрів). Необережна конкатенація рядків дає значенню вирватися з лапок і змінити запит. Реалізуйте помічники в `src/odata.ts`:\n\n- `buildFilter(conditions)` з'єднує умови через `and`. Рядки стають літералами в лапках, де кожна внутрішня одинарна лапка подвоюється (`O'Brien` → `'O''Brien'`). Числа і булеві значення записуються як є, а `null` працює лише з `eq` і `ne`. `contains` дає `contains(field,'text')`. Назви стовпців мають складатися з малих літер, цифр і підкреслень, інакше це `RangeError`. Нескінченні числа — це `TypeError`.\n- `buildUrl(baseUrl, entitySet, options)` будує `base/entitySet?$select=…&$filter=…&$orderby=…&$top=…` у такому порядку, з фільтром і сортуванням у **URL-кодуванні**, і лише для переданих параметрів. Завершальна скісна риска бази ігнорується. `$top` має бути додатним цілим.\n- `nextLink(body)` повертає `@odata.nextLink` відповіді або `null`, якщо його немає.",
    ],
    files: {
      "/src/odata.ts": ODATA_STARTER,
      "/index.ts": ODATA_INDEX,
    },
    visibleFiles: ["/src/odata.ts"],
    activeFile: "/src/odata.ts",
    tests: ODATA_TESTS,
    solution: { "/src/odata.ts": ODATA_SOLUTION },
    explanation: [
      "An OData query is text, so any user value that reaches it can change its meaning. Two rules close the gap. Values are always written as typed literals: strings are quoted and any inner quote is doubled, so the value can't end the literal early. Column names, which can't be escaped that way, are restricted to a pattern, because they are identifiers rather than data. The filter and order are URL-encoded as whole strings, so characters such as `&` or `#` inside a value can't split the query. The same discipline applies to every API that builds queries from user input, not only Dataverse.",
      "Запит OData — це текст, тож будь-яке значення користувача, що потрапляє в нього, може змінити його сенс. Два правила закривають цю щілину. Значення завжди записуються як типізовані літерали: рядки беруться в лапки, а внутрішні лапки подвоюються, тож значення не може достроково завершити літерал. Назви стовпців, які так не екрануються, обмежуються шаблоном, бо це ідентифікатори, а не дані. Фільтр і сортування кодуються в URL цілими рядками, тож символи на кшталт `&` чи `#` у значенні не можуть розбити запит. Та сама дисципліна потрібна для кожного API, що будує запити з вхідних даних користувача, а не лише для Dataverse.",
    ],
  }),
]);
