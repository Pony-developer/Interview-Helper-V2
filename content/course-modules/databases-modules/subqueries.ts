import { COMPANY, SHOP, WRITE_QUERY } from "../databases-data";
import type { ModuleDef } from "../types";

export const subqueriesModule: ModuleDef = {
  slug: "subqueries-ctes",
  title: { en: "Subqueries and CTEs", uk: "Підзапити та CTE" },
  slides: [
    { kind: "lecture", slug: "subqueries", title: { en: "Subqueries", uk: "Підзапити" } },
    {
      kind: "practice",
      slug: "above-category-average",
      title: { en: "Practice: Above the category average", uk: "Практика «Дорожче за середнє в категорії»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution: `SELECT p.name,
       c.name AS category,
       p.price,
       (SELECT round(avg(p2.price), 2)
        FROM products AS p2
        WHERE p2.category_id = p.category_id) AS category_avg
FROM products AS p
JOIN categories AS c ON c.id = p.category_id
WHERE p.price > (SELECT avg(p2.price)
                 FROM products AS p2
                 WHERE p2.category_id = p.category_id)
ORDER BY category, p.price DESC;
`,
      expectedOutput: "        name        |  category   | price  | category_avg\n--------------------+-------------+--------+--------------\n Postgres Internals | Books       |  48.50 |        37.80\n Mongo in Action    | Books       |  39.90 |        37.80\n 4K Monitor         | Electronics | 329.00 |       146.00\n Chess Set          | Games       |  35.00 |        24.75\n(4 rows)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "ctes-recursive", title: { en: "CTEs and recursive queries", uk: "CTE та рекурсивні запити" } },
    {
      kind: "practice",
      slug: "org-chart",
      title: { en: "Practice: The org chart", uk: "Практика «Оргструктура»" },
      language: "sql",
      setup: COMPANY,
      starter: WRITE_QUERY,
      solution: `WITH RECURSIVE tree AS (
    SELECT id, name, 1 AS level, ARRAY[name] AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT e.id, e.name, t.level + 1, t.path || e.name
    FROM employees AS e
    JOIN tree AS t ON e.manager_id = t.id
)
SELECT repeat('    ', level - 1) || name AS org_chart,
       level
FROM tree
ORDER BY path;
`,
      expectedOutput: "     org_chart     | level\n-------------------+-------\n Oksana            |     1\n     Bohdan        |     2\n         Dmytro    |     3\n             Lesia |     4\n         Kateryna  |     3\n         Yulia     |     3\n     Halyna        |     2\n         Vasyl     |     3\n     Roman         |     2\n         Natalia   |     3\n         Petro     |     3\n(11 rows)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "subqueries-quiz",
      title: { en: "Subqueries and CTEs check", uk: "Перевірка підзапитів і CTE" },
      questions: [
        {
          id: "scalar",
          mode: "single",
          prompt: { en: "What happens when a scalar subquery in SELECT returns two rows?", uk: "Що станеться, коли скалярний підзапит у SELECT поверне два рядки?" },
          options: [
            { id: "a", text: { en: "An error: more than one row returned by a subquery used as an expression", uk: "Помилка: підзапит, використаний як вираз, повернув більше одного рядка" } },
            { id: "b", text: { en: "The first row is used", uk: "Використовується перший рядок" } },
            { id: "c", text: { en: "The outer row is duplicated", uk: "Зовнішній рядок дублюється" } },
          ],
          correct: ["a"],
        },
        {
          id: "correlated",
          mode: "single",
          prompt: { en: "What makes a subquery correlated?", uk: "Що робить підзапит корельованим?" },
          options: [
            { id: "a", text: { en: "It refers to a column of the outer query, so it is conceptually evaluated per outer row", uk: "Він посилається на стовпець зовнішнього запиту, тож концептуально обчислюється для кожного зовнішнього рядка" } },
            { id: "b", text: { en: "It uses a JOIN inside", uk: "Він використовує JOIN усередині" } },
            { id: "c", text: { en: "It is in the FROM clause", uk: "Він стоїть у FROM" } },
          ],
          correct: ["a"],
        },
        {
          id: "exists-select",
          mode: "single",
          prompt: { en: "Does it matter what `EXISTS (SELECT … )` selects?", uk: "Чи важливо, що вибирає `EXISTS (SELECT … )`?" },
          options: [
            { id: "a", text: { en: "No, only whether at least one row exists; `SELECT 1` is the convention", uk: "Ні, важливо лише, чи існує хоч один рядок; за домовленістю пишуть `SELECT 1`" } },
            { id: "b", text: { en: "Yes, it must select the primary key", uk: "Так, він має вибирати первинний ключ" } },
          ],
          correct: ["a"],
        },
        {
          id: "recursive-parts",
          mode: "single",
          prompt: { en: "What are the two parts of a recursive CTE?", uk: "З яких двох частин складається рекурсивний CTE?" },
          options: [
            { id: "a", text: { en: "An anchor query, then UNION ALL with a recursive query that refers to the CTE", uk: "Початковий (якірний) запит, далі UNION ALL з рекурсивним запитом, що посилається на CTE" } },
            { id: "b", text: { en: "A SELECT and an INSERT", uk: "SELECT та INSERT" } },
            { id: "c", text: { en: "Two CTEs that refer to each other", uk: "Два CTE, що посилаються один на одного" } },
          ],
          correct: ["a"],
        },
        {
          id: "recursion-stop",
          mode: "single",
          prompt: { en: "When does a recursive CTE stop?", uk: "Коли зупиняється рекурсивний CTE?" },
          options: [
            { id: "a", text: { en: "When an iteration of the recursive part returns no new rows", uk: "Коли черговий крок рекурсивної частини не повертає нових рядків" } },
            { id: "b", text: { en: "After 100 iterations", uk: "Після 100 ітерацій" } },
            { id: "c", text: { en: "When the outer query has a LIMIT", uk: "Коли зовнішній запит має LIMIT" } },
          ],
          correct: ["a"],
        },
        {
          id: "cte-materialize",
          mode: "single",
          prompt: { en: "Since PostgreSQL 12, a CTE referenced once and without side effects is…", uk: "Починаючи з PostgreSQL 12, CTE без побічних ефектів, на який посилаються один раз, —" },
          options: [
            { id: "a", text: { en: "Inlined into the main query, like a subquery (unless `MATERIALIZED` is specified)", uk: "Вбудовується в основний запит, як підзапит (якщо не вказано `MATERIALIZED`)" } },
            { id: "b", text: { en: "Always computed separately and stored", uk: "Завжди обчислюється окремо й зберігається" } },
            { id: "c", text: { en: "Cached between queries", uk: "Кешується між запитами" } },
          ],
          correct: ["a"],
        },
        {
          id: "in-vs-exists",
          mode: "multi",
          prompt: { en: "Which statements about `IN` and `EXISTS` are true?", uk: "Які твердження про `IN` і `EXISTS` правдиві?" },
          options: [
            { id: "a", text: { en: "`NOT IN` with a subquery that returns a NULL matches nothing", uk: "`NOT IN` з підзапитом, що повертає NULL, нічого не знаходить" } },
            { id: "b", text: { en: "`NOT EXISTS` is not affected by NULLs in the subquery", uk: "На `NOT EXISTS` не впливають NULL у підзапиті" } },
            { id: "c", text: { en: "`IN (subquery)` can return duplicates of outer rows", uk: "`IN (підзапит)` може дублювати зовнішні рядки" } },
          ],
          correct: ["a", "b"],
        },
      ],
    },
  ],
};
