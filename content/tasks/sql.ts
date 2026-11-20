import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code below contains template literals, which can't live inside String.raw: "~" stands for a backtick and "#{" for "${". */
const js = (source: string) => source.replace(/~/g, "`").replace(/#\{/g, "${");

const SQL_STARTER = js(String.raw`export class Sql {
  constructor(readonly text: string, readonly values: unknown[] = []) {}
}

/**
 * Tagged template that builds a parameterised query:
 *   sql~SELECT * FROM users WHERE id = #{id}~  →  { text: "… WHERE id = $1", values: [id] }
 */
export function sql(strings: TemplateStringsArray, ...values: unknown[]): Sql {
  // TODO: this pastes values straight into the SQL text (SQL injection!)
  let text = strings[0];
  values.forEach((value, i) => {
    text += String(value) + strings[i + 1];
  });
  return new Sql(text);
}

/** A safely quoted identifier (table or column name), e.g. for ORDER BY. */
export function identifier(name: string): Sql {
  return new Sql(name);
}
`);

const SQL_SOLUTION = js(String.raw`type Chunk = string | { value: unknown };

export class Sql {
  constructor(readonly chunks: readonly Chunk[]) {}

  /** SQL text with $1, $2, … placeholders, numbered across nested fragments. */
  get text(): string {
    let n = 0;
    return this.chunks.map((c) => (typeof c === "string" ? c : "$" + ++n)).join("");
  }

  get values(): unknown[] {
    return this.chunks.filter((c): c is { value: unknown } => typeof c !== "string").map((c) => c.value);
  }
}

export function sql(strings: TemplateStringsArray, ...values: unknown[]): Sql {
  const chunks: Chunk[] = [strings[0]];
  values.forEach((value, i) => {
    if (value instanceof Sql) {
      chunks.push(...value.chunks); // nested fragment: keep its parameters, renumber later
    } else if (Array.isArray(value)) {
      if (value.length === 0) throw new RangeError("Can't build an empty IN () list");
      chunks.push("(");
      value.forEach((item, j) => {
        if (j > 0) chunks.push(", ");
        chunks.push({ value: item });
      });
      chunks.push(")");
    } else if (value === undefined) {
      throw new TypeError("Value #" + (i + 1) + " is undefined");
    } else {
      chunks.push({ value }); // values never become part of the SQL text
    }
    chunks.push(strings[i + 1]);
  });
  return new Sql(chunks);
}

export function identifier(name: string): Sql {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error("Invalid identifier: " + name);
  return new Sql(['"' + name + '"']);
}
`);

const SQL_INDEX = js(String.raw`import "./styles.css";
import { identifier, sql } from "./src/sql";

const search = "O'Brien'; DROP TABLE users; --";
const filter = sql~status = #{"active"}~;
const query = sql~SELECT * FROM users WHERE name = #{search} AND #{filter} AND id IN #{[1, 2, 3]} ORDER BY #{identifier("created_at")}~;

document.getElementById("app")!.innerHTML = "<h1>Parameterised query</h1><pre></pre>";
document.querySelector("pre")!.textContent = query.text + "\n\n" + JSON.stringify(query.values, null, 2);
`);

const SQL_TESTS = js(String.raw`import { describe, it, expect } from "./test-kit";
import { Sql, identifier, sql } from "../src/sql";

describe("sql", () => {
  it("turns values into numbered placeholders", () => {
    const q = sql~SELECT * FROM users WHERE email = #{"ada@example.com"} AND age > #{18}~;
    expect(q.text).toBe("SELECT * FROM users WHERE email = $1 AND age > $2");
    expect(q.values).toEqual(["ada@example.com", 18]);
  });
  it("never puts values into the SQL text", () => {
    const evil = "'; DROP TABLE users; --";
    const q = sql~SELECT * FROM users WHERE name = #{evil}~;
    expect(q.text).toBe("SELECT * FROM users WHERE name = $1");
    expect(q.values).toEqual([evil]);
  });
  it("keeps null as a real parameter", () => {
    const q = sql~UPDATE users SET deleted_at = #{null} WHERE id = #{5}~;
    expect(q.text).toBe("UPDATE users SET deleted_at = $1 WHERE id = $2");
    expect(q.values).toEqual([null, 5]);
  });
  it("expands arrays into parameter lists for IN", () => {
    const q = sql~SELECT * FROM users WHERE id IN #{[1, 2, 3]} AND active = #{true}~;
    expect(q.text).toBe("SELECT * FROM users WHERE id IN ($1, $2, $3) AND active = $4");
    expect(q.values).toEqual([1, 2, 3, true]);
  });
  it("rejects empty lists and undefined values", () => {
    expect(() => sql~SELECT * FROM users WHERE id IN #{[]}~).toThrow();
    expect(() => sql~SELECT * FROM users WHERE id = #{undefined}~).toThrow();
  });
  it("inlines nested fragments and renumbers their placeholders", () => {
    const filter = sql~status = #{"active"} AND role = #{"admin"}~;
    const q = sql~SELECT * FROM users WHERE org = #{7} AND #{filter} LIMIT #{10}~;
    expect(q instanceof Sql).toBe(true);
    expect(q.text).toBe("SELECT * FROM users WHERE org = $1 AND status = $2 AND role = $3 LIMIT $4");
    expect(q.values).toEqual([7, "active", "admin", 10]);
  });
  it("quotes valid identifiers and rejects anything else", () => {
    const q = sql~SELECT * FROM users ORDER BY #{identifier("created_at")} DESC LIMIT #{5}~;
    expect(q.text).toBe('SELECT * FROM users ORDER BY "created_at" DESC LIMIT $1');
    expect(q.values).toEqual([5]);
    expect(() => identifier("name; DROP TABLE users")).toThrow();
    expect(() => identifier('a"b')).toThrow();
  });
});
`);

export default defineTasks([
  quiz(
    "sql-where-vs-having",
    ["sql"],
    1,
    60,
    ["Filtering groups", "Фільтрація груп"],
    ["You want customers with **at least 3** orders. Where does `count(*) >= 3` go?", "Потрібні клієнти, що мають **щонайменше 3** замовлення. Куди поставити `count(*) >= 3`?"],
    [
      ["In `HAVING`, after `GROUP BY`", "У `HAVING`, після `GROUP BY`"],
      ["In `WHERE`", "У `WHERE`"],
      ["In the `ON` clause of the join", "В умову `ON` з'єднання"],
      ["In `ORDER BY`", "В `ORDER BY`"],
    ],
    "a",
    [
      "`WHERE` filters individual rows **before** grouping, so aggregates don't exist yet there. `HAVING` filters groups **after** `GROUP BY`, which is where `count(*)` is known. Use `WHERE` for row conditions (it also makes the query cheaper) and `HAVING` only for conditions on aggregates.",
      "`WHERE` фільтрує окремі рядки **до** групування, тож агрегатів там ще немає. `HAVING` фільтрує групи **після** `GROUP BY`, де `count(*)` уже відомий. Використовуйте `WHERE` для умов на рядки (так запит ще й дешевший), а `HAVING` лише для умов на агрегати.",
    ],
    { code: "SELECT customer_id, count(*) AS orders\nFROM orders\nGROUP BY customer_id\n-- ??? count(*) >= 3", codeLanguage: "sql" },
  ),
  quiz(
    "sql-null-equals",
    ["sql"],
    2,
    60,
    ["Comparing with NULL", "Порівняння з NULL"],
    ["The table has rows where `deleted_at` is `NULL`. How many rows does this query return?", "У таблиці є рядки, де `deleted_at` дорівнює `NULL`. Скільки рядків поверне цей запит?"],
    [
      ["None: `= NULL` is never true; use `IS NULL`", "Жодного: `= NULL` ніколи не буває істинним; використовуйте `IS NULL`"],
      ["Every row where `deleted_at` is `NULL`", "Кожен рядок, де `deleted_at` дорівнює `NULL`"],
      ["Every row in the table", "Усі рядки таблиці"],
      ["It's a syntax error", "Це синтаксична помилка"],
    ],
    "a",
    [
      "`NULL` means \"unknown\", so `deleted_at = NULL` evaluates to `NULL` (unknown) for every row, even when `deleted_at` is `NULL`. `WHERE` keeps only rows where the condition is **true**. Use `deleted_at IS NULL`, or `IS NOT DISTINCT FROM` to compare two values that may both be `NULL`.",
      "`NULL` означає «невідомо», тож `deleted_at = NULL` дає `NULL` (невідомо) для кожного рядка, навіть коли `deleted_at` дорівнює `NULL`. `WHERE` лишає тільки рядки, де умова **істинна**. Використовуйте `deleted_at IS NULL` або `IS NOT DISTINCT FROM`, щоб порівняти два значення, які обидва можуть бути `NULL`.",
    ],
    { code: "SELECT * FROM users WHERE deleted_at = NULL;", codeLanguage: "sql" },
  ),
  quiz(
    "sql-left-join-rows",
    ["sql"],
    2,
    90,
    ["Counting LEFT JOIN rows", "Скільки рядків дасть LEFT JOIN"],
    ["Ada has 2 orders, Bob has none, Cy has 1. How many rows does the query return?", "Ada має 2 замовлення, Bob жодного, Cy одне. Скільки рядків поверне запит?"],
    [
      ["4: Ada twice, Bob once with `NULL` order columns, Cy once", "4: Ada двічі, Bob один раз із `NULL` у стовпцях замовлення, Cy один раз"],
      ["3: one row per user", "3: по одному рядку на користувача"],
      ["3: Bob is dropped because he has no orders", "3: Bob відкидається, бо не має замовлень"],
      ["6: every user combined with every order", "6: кожен користувач з кожним замовленням"],
    ],
    "a",
    [
      "A join produces one row per matching pair, so a user with two orders appears twice. `LEFT JOIN` additionally keeps left rows without any match, filling the right side with `NULL`s, which is why Bob appears once. An `INNER JOIN` would return 3 rows (no Bob), and a `CROSS JOIN` would return 3 × 3 = 9.",
      "З'єднання дає по рядку на кожну відповідну пару, тож користувач із двома замовленнями з'являється двічі. `LEFT JOIN` додатково зберігає ліві рядки без збігу, заповнюючи праву частину `NULL`, тому Bob з'являється один раз. `INNER JOIN` повернув би 3 рядки (без Bob), а `CROSS JOIN` повернув би 3 × 3 = 9.",
    ],
    { code: "SELECT u.name, o.id AS order_id\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id;", codeLanguage: "sql" },
  ),
  quiz(
    "sql-count-variants",
    ["sql"],
    3,
    90,
    ["Three kinds of COUNT", "Три види COUNT"],
    [
      "`subscribers` has 5 rows. `email` is `NULL` in 2 of them; the other 3 contain `a@x.io`, `a@x.io` and `b@x.io`. What does the query return?",
      "`subscribers` має 5 рядків. `email` дорівнює `NULL` у 2 з них; інші 3 містять `a@x.io`, `a@x.io` і `b@x.io`. Що поверне запит?",
    ],
    [
      ["`5, 3, 2`", "`5, 3, 2`"],
      ["`5, 5, 3`", "`5, 5, 3`"],
      ["`5, 3, 3`", "`5, 3, 3`"],
      ["`3, 3, 2`", "`3, 3, 2`"],
    ],
    "a",
    [
      "`count(*)` counts rows, whatever they contain. `count(email)` counts only non-`NULL` values. `count(DISTINCT email)` also removes duplicates, leaving `a@x.io` and `b@x.io`. Aggregates other than `count(*)` skip `NULL`s, so `avg(score)` averages only the known scores.",
      "`count(*)` рахує рядки, незалежно від їхнього вмісту. `count(email)` рахує лише значення, що не є `NULL`. `count(DISTINCT email)` ще й прибирає дублікати, лишаючи `a@x.io` і `b@x.io`. Агрегати, окрім `count(*)`, пропускають `NULL`, тож `avg(score)` усереднює лише відомі оцінки.",
    ],
    { code: "SELECT count(*), count(email), count(DISTINCT email)\nFROM subscribers;", codeLanguage: "sql" },
  ),
  quiz(
    "sql-alias-in-where",
    ["sql"],
    3,
    90,
    ["Using a SELECT alias", "Використання псевдоніма з SELECT"],
    ["PostgreSQL rejects this query with `column \"total\" does not exist`. Why?", "PostgreSQL відхиляє цей запит із помилкою `column \"total\" does not exist`. Чому?"],
    [
      ["`WHERE` is evaluated before `SELECT`, so the alias doesn't exist yet; repeat the expression or use a subquery", "`WHERE` обчислюється раніше за `SELECT`, тож псевдоніма ще немає; повторіть вираз або використайте підзапит"],
      ["Aliases must be written in double quotes", "Псевдоніми треба писати в подвійних лапках"],
      ["Arithmetic isn't allowed in `SELECT`", "Арифметика в `SELECT` заборонена"],
      ["`total` is a reserved word", "`total` є зарезервованим словом"],
    ],
    "a",
    [
      "Logically a query runs `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`. Aliases are created in `SELECT`, so `WHERE` can't see them, but `ORDER BY` can. Write `WHERE price * qty > 100`, or wrap the query in a subquery or CTE and filter on `total` outside.",
      "Логічно запит виконується так: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`. Псевдоніми створюються в `SELECT`, тож `WHERE` їх не бачить, а `ORDER BY` бачить. Напишіть `WHERE price * qty > 100` або обгорніть запит у підзапит чи CTE і фільтруйте за `total` ззовні.",
    ],
    { code: "SELECT id, price * qty AS total\nFROM order_lines\nWHERE total > 100;", codeLanguage: "sql" },
  ),
  quiz(
    "sql-injection",
    ["sql", w("web-security")],
    3,
    90,
    ["Preventing SQL injection", "Захист від SQL-ін'єкцій"],
    ["What is the right fix for this query?", "Як правильно виправити цей запит?"],
    [
      ["Use a parameterised query: `db.query(\"SELECT * FROM users WHERE email = $1\", [email])`", "Використати параметризований запит: `db.query(\"SELECT * FROM users WHERE email = $1\", [email])`"],
      ["Escape single quotes with `email.replace(/'/g, \"''\")`", "Екранувати одинарні лапки через `email.replace(/'/g, \"''\")`"],
      ["Validate the email on the frontend before sending it", "Перевіряти email на фронтенді перед надсиланням"],
      ["Wrap the value in double quotes instead of single quotes", "Взяти значення в подвійні лапки замість одинарних"],
    ],
    "a",
    [
      "With a parameterised query the driver sends the SQL text and the values separately, so input can never change the query's structure, whatever characters it contains. Hand-written escaping misses edge cases (encodings, backslashes, other contexts), and client-side validation is trivially bypassed. Column names can't be parameters; map them through an allow-list.",
      "У параметризованому запиті драйвер надсилає текст SQL і значення окремо, тож дані ніколи не змінять структуру запиту, хоч які символи вони містять. Саморобне екранування пропускає крайні випадки (кодування, зворотні слеші, інші контексти), а перевірку на клієнті легко обійти. Назви стовпців не можуть бути параметрами; пропускайте їх крізь білий список.",
    ],
    { code: "app.get(\"/user\", async (req, res) => {\n  const rows = await db.query(\n    \"SELECT * FROM users WHERE email = '\" + req.query.email + \"'\",\n  );\n  res.json(rows);\n});", codeLanguage: "ts" },
  ),
  quiz(
    "sql-left-join-where-trap",
    ["sql"],
    4,
    120,
    ["LEFT JOIN that stopped being left", "LEFT JOIN, що перестав бути лівим"],
    [
      "The goal is to list **every** user with their paid orders, if any. Users without paid orders are missing from the result. Why?",
      "Мета: показати **кожного** користувача з його оплаченими замовленнями, якщо вони є. Користувачів без оплачених замовлень у результаті немає. Чому?",
    ],
    [
      ["The `WHERE` condition on `o.status` removes the `NULL` rows the left join added; move it into the `ON` clause", "Умова `WHERE` на `o.status` прибирає рядки з `NULL`, додані лівим з'єднанням; перенесіть її в `ON`"],
      ["`LEFT JOIN` doesn't work with string comparisons", "`LEFT JOIN` не працює з порівнянням рядків"],
      ["It needs `LEFT OUTER JOIN` instead of `LEFT JOIN`", "Потрібен `LEFT OUTER JOIN` замість `LEFT JOIN`"],
      ["The users table must come second", "Таблиця users має йти другою"],
    ],
    "a",
    [
      "For users without matching orders, `o.status` is `NULL`, and `NULL = 'paid'` isn't true, so `WHERE` drops them, which makes the query behave like an inner join. A condition in `ON` decides which orders match while still keeping every user: `LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'`. (`LEFT OUTER JOIN` is the same thing as `LEFT JOIN`.)",
      "Для користувачів без відповідних замовлень `o.status` дорівнює `NULL`, а `NULL = 'paid'` не є істинним, тож `WHERE` їх відкидає, і запит поводиться як внутрішнє з'єднання. Умова в `ON` визначає, які замовлення підходять, і при цьому зберігає кожного користувача: `LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'`. (`LEFT OUTER JOIN` означає те саме, що й `LEFT JOIN`.)",
    ],
    { code: "SELECT u.name, o.id AS order_id\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE o.status = 'paid';", codeLanguage: "sql" },
  ),
  quiz(
    "sql-index-expression",
    ["sql", w("web-performance")],
    4,
    120,
    ["An index that isn't used", "Індекс, який не використовується"],
    ["There's a B-tree index on `users(email)`, yet `EXPLAIN` shows a sequential scan for this query. What helps?", "Є B-tree індекс на `users(email)`, але `EXPLAIN` показує послідовне сканування для цього запиту. Що допоможе?"],
    [
      ["An expression index: `CREATE INDEX ON users (lower(email))`", "Індекс за виразом: `CREATE INDEX ON users (lower(email))`"],
      ["Adding `ORDER BY email`", "Додати `ORDER BY email`"],
      ["Running `VACUUM` so the index is rebuilt", "Запустити `VACUUM`, щоб перебудувати індекс"],
      ["Replacing `=` with `LIKE`", "Замінити `=` на `LIKE`"],
    ],
    "a",
    [
      "An index on `email` stores the raw values, so it can't answer a question about `lower(email)`: the database would have to compute `lower` for every row. Index the expression itself (or store emails normalised, or use the case-insensitive `citext` type). The same applies to casts and other functions wrapped around indexed columns.",
      "Індекс на `email` зберігає сирі значення, тож не може відповісти на питання про `lower(email)`: базі довелося б обчислити `lower` для кожного рядка. Проіндексуйте сам вираз (або зберігайте email нормалізованими чи використайте нечутливий до регістру тип `citext`). Те саме стосується приведень типів та інших функцій навколо індексованих стовпців.",
    ],
    { code: "SELECT * FROM users WHERE lower(email) = lower($1);", codeLanguage: "sql" },
  ),
  quiz(
    "sql-not-in-null",
    ["sql"],
    5,
    150,
    ["NOT IN and NULL", "NOT IN і NULL"],
    [
      "The query should list employees who manage nobody. The CEO's `manager_id` is `NULL`. What does it return?",
      "Запит має показати працівників, які нікими не керують. У гендиректора `manager_id` дорівнює `NULL`. Що він поверне?",
    ],
    [
      ["No rows at all, because the subquery contains a `NULL`; `NOT EXISTS` fixes it", "Жодного рядка, бо підзапит містить `NULL`; виправляє це `NOT EXISTS`"],
      ["The correct list of non-managers", "Правильний список тих, хто не керує"],
      ["Every employee", "Усіх працівників"],
      ["An error: subqueries can't return `NULL`", "Помилку: підзапити не можуть повертати `NULL`"],
    ],
    "a",
    [
      "`x NOT IN (1, 2, NULL)` means `x <> 1 AND x <> 2 AND x <> NULL`. The last comparison is `NULL` (unknown), so the whole condition is never true and every row is filtered out. Use `WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.id)`, or filter `NULL`s out of the subquery.",
      "`x NOT IN (1, 2, NULL)` означає `x <> 1 AND x <> 2 AND x <> NULL`. Останнє порівняння дає `NULL` (невідомо), тож уся умова ніколи не буває істинною, і кожен рядок відкидається. Використайте `WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.id)` або відфільтруйте `NULL` у підзапиті.",
    ],
    { code: "SELECT e.name\nFROM employees e\nWHERE e.id NOT IN (SELECT manager_id FROM employees);", codeLanguage: "sql" },
  ),
  practice({
    slug: "sql-query-builder",
    skills: ["sql", w("web-security"), w("typescript")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["A safe `sql` template tag", "Безпечний тег шаблону `sql`"],
    prompt: [
      "The current `sql` tag in `src/sql.ts` pastes values into the query text, which is open to SQL injection. Rewrite it to build **parameterised** queries (PostgreSQL style):\n\n- Return an `Sql` object with `text` (using `$1`, `$2`, … placeholders) and `values` (in placeholder order). Values never appear in `text`; `null` is a normal value.\n- An **array** expands to a parenthesised list for `IN`: `${[1, 2]}` → `($1, $2)`. An empty array throws (`IN ()` is invalid SQL).\n- `undefined` throws (it's almost always a bug).\n- A nested `Sql` fragment is inlined, and its placeholders are **renumbered** to fit the outer query.\n- `identifier(name)` returns a fragment with a double-quoted identifier for places parameters can't go (like `ORDER BY`). Allow only letters, digits and `_` (not starting with a digit); throw otherwise.",
      "Поточний тег `sql` у `src/sql.ts` вставляє значення в текст запиту, тож вразливий до SQL-ін'єкцій. Перепишіть його так, щоб він будував **параметризовані** запити (у стилі PostgreSQL):\n\n- Повертайте об'єкт `Sql` з `text` (із заповнювачами `$1`, `$2`, …) і `values` (у порядку заповнювачів). Значення ніколи не потрапляють у `text`; `null` є звичайним значенням.\n- **Масив** розгортається у список у дужках для `IN`: `${[1, 2]}` → `($1, $2)`. Порожній масив кидає помилку (`IN ()` є некоректним SQL).\n- `undefined` кидає помилку (це майже завжди баг).\n- Вкладений фрагмент `Sql` вбудовується, а його заповнювачі **перенумеровуються** під зовнішній запит.\n- `identifier(name)` повертає фрагмент з ідентифікатором у подвійних лапках для місць, де параметри неможливі (як-от `ORDER BY`). Дозволяйте лише літери, цифри й `_` (не з цифри на початку); інакше кидайте помилку.",
    ],
    files: { "/src/sql.ts": SQL_STARTER, "/index.ts": SQL_INDEX },
    visibleFiles: ["/src/sql.ts", "/index.ts"],
    activeFile: "/src/sql.ts",
    tests: SQL_TESTS,
    solution: { "/src/sql.ts": SQL_SOLUTION },
    explanation: [
      "Keeping the query as a list of text chunks and value slots, and numbering placeholders only when `text` is read, is what makes nested fragments compose: each fragment doesn't need to know its position in the final query. Values travel separately to the database, so no input can alter the SQL. Identifiers can't be parameters, so they're validated against a strict pattern and quoted. Libraries such as `postgres`, `slonik` and Prisma's `$queryRaw` work this way.",
      "Зберігання запиту як списку текстових шматків і місць для значень із нумерацією заповнювачів лише під час читання `text` дає змогу комбінувати вкладені фрагменти: кожен фрагмент не мусить знати свою позицію в остаточному запиті. Значення йдуть до бази окремо, тож жодні дані не змінять SQL. Ідентифікатори не можуть бути параметрами, тому їх перевіряють за суворим шаблоном і беруть у лапки. Так працюють бібліотеки `postgres`, `slonik` і `$queryRaw` у Prisma.",
    ],
  }),
]);
