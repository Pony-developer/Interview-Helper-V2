## Таблиці для прикладів

```text
employees                     assignments                projects
id | name     | department    employee_id | project_id  id | title
---+----------+-----------    ------------+-----------  ---+-----------
 1 | Anna     | Development             1 | 1            1 | Portal
 2 | Bohdan   | Development             1 | 2            2 | Mobile app
 3 | Daria    | QA                      2 | 1            3 | CRM
 4 | Ivan     | Operations              3 | 1            4 | Archive
```

## Типи JOIN (П50)

```sql
-- INNER JOIN: лише працівники з призначеннями (Anna ×2, Bohdan, Daria)
SELECT e.name, p.title
FROM employees e
JOIN assignments a ON a.employee_id = e.id
JOIN projects p    ON p.id = a.project_id;

-- LEFT JOIN: кожен працівник; NULL там, де збігу немає (Ivan → NULL)
SELECT e.name, a.project_id
FROM employees e
LEFT JOIN assignments a ON a.employee_id = e.id;

-- «Антиз'єднання»: працівники без жодного проєкту
SELECT e.name
FROM employees e
LEFT JOIN assignments a ON a.employee_id = e.id
WHERE a.employee_id IS NULL;          -- або: WHERE NOT EXISTS (...)

-- RIGHT JOIN: кожен проєкт, навіть без людей (Archive)
SELECT p.title, a.employee_id
FROM assignments a
RIGHT JOIN projects p ON p.id = a.project_id;

-- FULL OUTER JOIN: рядки без пари з обох боків
-- CROSS JOIN: усі комбінації (4 працівники × 4 проєкти = 16 рядків)
-- SELF JOIN: employees e JOIN employees m ON m.id = e.manager_id
```

Типові пастки:
- Умова на праву таблицю у `WHERE` перетворює `LEFT JOIN` назад на внутрішнє з'єднання (`WHERE a.role = 'lead'` прибирає рядки з NULL). Кладіть її в `ON`.
- Підрахунок після `LEFT JOIN`: `count(*)` рахує NULL-рядок як 1; `count(a.project_id)` дає 0.
- З'єднання одразу двох таблиць «один до багатьох» множить рядки (кожен рядок замовлення × кожен платіж): спершу агрегуйте в підзапитах.

## Індекси на прикладах (П49)

```sql
-- пошук за email без індексу сканує всю таблицю
CREATE UNIQUE INDEX ix_users_email ON users (email);

-- замовлення одного клієнта, найновіші першими: один індекс обслуговує і фільтр, і сортування
CREATE INDEX ix_orders_customer_date ON orders (customer_id, created_at DESC);

-- зовнішні ключі не індексуються автоматично ні в SQL Server, ні в PostgreSQL:
CREATE INDEX ix_assignments_project ON assignments (project_id);
```

Індекс допомагає, коли запит фільтрує, з'єднує чи сортує за його **початковими** колонками й повертає невелику частку рядків. Він не допомагає (або ігнорується) для `WHERE lower(email) = ...` (функція над колонкою — створіть індекс за виразом), `LIKE '%text'` (шаблон на початку) чи колонок із кількома різними значеннями. Кожен індекс трохи сповільнює кожен `INSERT/UPDATE/DELETE` і займає місце, тож індексуйте під запити, які справді виконуєте, — `EXPLAIN` (PostgreSQL) або план виконання (SQL Server) покаже, чи його використано.
