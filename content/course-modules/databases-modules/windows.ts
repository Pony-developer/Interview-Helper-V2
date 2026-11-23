import { COMPANY, DAILY_SALES, WRITE_QUERY } from "../databases-data";
import type { ModuleDef } from "../types";

export const windowsModule: ModuleDef = {
  slug: "window-functions",
  title: { en: "Window functions", uk: "Віконні функції" },
  slides: [
    { kind: "lecture", slug: "window-ranking", title: { en: "OVER, PARTITION BY and ranking", uk: "OVER, PARTITION BY і ранжування" } },
    {
      kind: "practice",
      slug: "top-two-per-department",
      title: { en: "Practice: Top two per department", uk: "Практика «Двоє найкращих у відділі»" },
      language: "sql",
      setup: COMPANY,
      starter: WRITE_QUERY,
      solution: `SELECT department, name, salary, salary_rank
FROM (
    SELECT department,
           name,
           salary,
           dense_rank() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank
    FROM employees
) AS ranked
WHERE salary_rank <= 2
ORDER BY department, salary_rank, name;
`,
      expectedOutput: " department  |   name   | salary | salary_rank\n-------------+----------+--------+-------------\n Engineering | Bohdan   |   6000 |           1\n Engineering | Kateryna |   5200 |           2\n Management  | Oksana   |   9000 |           1\n Marketing   | Halyna   |   4700 |           1\n Marketing   | Vasyl    |   3900 |           2\n Sales       | Roman    |   5000 |           1\n Sales       | Petro    |   4100 |           2\n(7 rows)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "window-frames", title: { en: "Running totals, LAG/LEAD and frames", uk: "Накопичувальні суми, LAG/LEAD і рамки" } },
    {
      kind: "practice",
      slug: "running-total",
      title: { en: "Practice: Running total", uk: "Практика «Наростаючий підсумок»" },
      language: "sql",
      setup: DAILY_SALES,
      starter: WRITE_QUERY,
      solution: `SELECT store,
       day,
       amount,
       sum(amount) OVER (PARTITION BY store ORDER BY day) AS running_total,
       amount - lag(amount) OVER (PARTITION BY store ORDER BY day) AS change
FROM daily_sales
ORDER BY store, day;
`,
      expectedOutput: " store |    day     | amount | running_total | change\n-------+------------+--------+---------------+--------\n Kyiv  | 2024-09-01 | 120.00 |        120.00 | NULL\n Kyiv  | 2024-09-02 |  80.00 |        200.00 | -40.00\n Kyiv  | 2024-09-03 | 150.00 |        350.00 |  70.00\n Kyiv  | 2024-09-04 |  60.00 |        410.00 | -90.00\n Kyiv  | 2024-09-05 | 200.00 |        610.00 | 140.00\n Lviv  | 2024-09-01 |  90.00 |         90.00 | NULL\n Lviv  | 2024-09-02 | 110.00 |        200.00 |  20.00\n Lviv  | 2024-09-03 |  70.00 |        270.00 | -40.00\n Lviv  | 2024-09-04 | 130.00 |        400.00 |  60.00\n Lviv  | 2024-09-05 | 100.00 |        500.00 | -30.00\n(10 rows)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "windows-quiz",
      title: { en: "Window functions check", uk: "Перевірка віконних функцій" },
      questions: [
        {
          id: "vs-group-by",
          mode: "single",
          prompt: { en: "How does `sum(x) OVER (PARTITION BY g)` differ from `sum(x) … GROUP BY g`?", uk: "Чим `sum(x) OVER (PARTITION BY g)` відрізняється від `sum(x) … GROUP BY g`?" },
          options: [
            { id: "a", text: { en: "The window version keeps every row and adds the group's sum to each", uk: "Віконна версія зберігає кожен рядок і додає до нього суму групи" } },
            { id: "b", text: { en: "They return the same rows", uk: "Вони повертають ті самі рядки" } },
            { id: "c", text: { en: "The window version is not allowed with ORDER BY", uk: "Віконна версія не дозволена з ORDER BY" } },
          ],
          correct: ["a"],
        },
        {
          id: "ranks",
          mode: "single",
          prompt: {
            en: "Salaries 500, 400, 400, 300 ordered descending. What does `rank()` give the 300?",
            uk: "Зарплати 500, 400, 400, 300 за спаданням. Який `rank()` отримає 300?",
          },
          options: [
            { id: "a", text: { en: "4 (`dense_rank()` would give 3, `row_number()` 4)", uk: "4 (`dense_rank()` дав би 3, `row_number()` — 4)" } },
            { id: "b", text: { en: "3", uk: "3" } },
            { id: "c", text: { en: "2", uk: "2" } },
          ],
          correct: ["a"],
        },
        {
          id: "where-window",
          mode: "single",
          prompt: { en: "Why can't you write `WHERE row_number() OVER (…) <= 3`?", uk: "Чому не можна написати `WHERE row_number() OVER (…) <= 3`?" },
          options: [
            { id: "a", text: { en: "Window functions are computed after WHERE; filter in an outer query or a CTE", uk: "Віконні функції обчислюються після WHERE; фільтруйте в зовнішньому запиті чи CTE" } },
            { id: "b", text: { en: "row_number has no ORDER BY", uk: "row_number не має ORDER BY" } },
            { id: "c", text: { en: "You can, it works", uk: "Можна, це працює" } },
          ],
          correct: ["a"],
        },
        {
          id: "lag",
          mode: "single",
          prompt: { en: "What does `lag(amount) OVER (ORDER BY day)` return for the first day?", uk: "Що поверне `lag(amount) OVER (ORDER BY day)` для першого дня?" },
          options: [
            { id: "a", text: { en: "NULL, unless a default is given as the third argument", uk: "NULL, якщо не задано значення за замовчуванням третім аргументом" } },
            { id: "b", text: { en: "0", uk: "0" } },
            { id: "c", text: { en: "The amount of the last day", uk: "Суму останнього дня" } },
          ],
          correct: ["a"],
        },
        {
          id: "default-frame",
          mode: "single",
          prompt: {
            en: "With `ORDER BY` in the window and no frame clause, what does `sum()` add up?",
            uk: "Якщо у вікні є `ORDER BY`, а рамку не задано, що підсумовує `sum()`?",
          },
          options: [
            { id: "a", text: { en: "From the first row of the partition up to the current row (and its peers): a running total", uk: "Від першого рядка розділу до поточного (і рівних йому): наростаючий підсумок" } },
            { id: "b", text: { en: "The whole partition", uk: "Увесь розділ" } },
            { id: "c", text: { en: "Only the current row", uk: "Лише поточний рядок" } },
          ],
          correct: ["a"],
        },
        {
          id: "last-value",
          mode: "single",
          prompt: {
            en: "Why does `last_value(x) OVER (ORDER BY day)` often return the current row's value?",
            uk: "Чому `last_value(x) OVER (ORDER BY day)` часто повертає значення поточного рядка?",
          },
          options: [
            { id: "a", text: { en: "The default frame ends at the current row; use `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`", uk: "Типова рамка закінчується на поточному рядку; використайте `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`" } },
            { id: "b", text: { en: "It is a bug in PostgreSQL", uk: "Це помилка в PostgreSQL" } },
            { id: "c", text: { en: "last_value ignores ORDER BY", uk: "last_value ігнорує ORDER BY" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
