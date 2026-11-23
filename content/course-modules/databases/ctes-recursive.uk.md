## WITH: загальні табличні вирази

**CTE** (common table expression) заздалегідь дає підзапиту назву, тож складний запит читається згори донизу як послідовність кроків:

```sql
WITH order_totals AS (
    SELECT order_id, sum(quantity * unit_price) AS total
    FROM order_items
    GROUP BY order_id
),
big_orders AS (
    SELECT order_id FROM order_totals WHERE total > 100
)
SELECT o.id, c.name, t.total
FROM big_orders b
JOIN order_totals t ON t.order_id = b.order_id
JOIN orders o       ON o.id = b.order_id
JOIN customers c    ON c.id = o.customer_id
ORDER BY t.total DESC;
```

- Кожен CTE може використовувати ті, що оголошені перед ним.
- На CTE можна посилатися кілька разів, на відміну від похідної таблиці, яку довелося б повторювати.
- Він існує лише в межах цієї інструкції.

## Чи є CTE бар'єром для оптимізації?

До PostgreSQL 12 кожен CTE обчислювався окремо й зберігався, що блокувало оптимізації (зовнішній `WHERE` не можна було «проштовхнути» всередину). З версії 12 CTE, на який посилаються один раз і який не має побічних ефектів, **вбудовується** як підзапит. Будь-яку поведінку можна вимагати явно: `WITH x AS MATERIALIZED (…)` або `AS NOT MATERIALIZED`. Інтерв'юери іноді про це питають, бо старі статті досі пишуть «CTE в Postgres повільні».

## CTE, що змінюють дані

CTE може містити `INSERT`, `UPDATE` чи `DELETE … RETURNING`, тож кілька змін відбуваються в одній інструкції:

```sql
-- атомарно перенести старі скасовані замовлення в архів
WITH moved AS (
    DELETE FROM orders
    WHERE status = 'cancelled' AND ordered_at < '2024-01-01'
    RETURNING *
)
INSERT INTO orders_archive
SELECT * FROM moved;
```

## Рекурсивні CTE

`WITH RECURSIVE` дозволяє запиту посилатися на власний результат — так SQL обходить дерева й графи будь-якої глибини:

```sql
WITH RECURSIVE subordinates AS (
    -- якір: звідки почати
    SELECT id, name, manager_id, 1 AS depth
    FROM employees
    WHERE name = 'Bohdan'

    UNION ALL

    -- рекурсивна частина: прямі підлеглі вже знайдених рядків
    SELECT e.id, e.name, e.manager_id, s.depth + 1
    FROM employees e
    JOIN subordinates s ON e.manager_id = s.id
)
SELECT name, depth FROM subordinates;
```

Як це виконується:

1. Виконати **якірний** запит; його рядки — перший «робочий набір».
2. Виконати **рекурсивну** частину, підставивши робочий набір замість `subordinates`; нові рядки стають наступним робочим набором.
3. Повторювати, доки ітерація не дасть **жодного рядка**.
4. Результат — усі рядки з усіх ітерацій.

Типові застосування: оргструктури, дерева категорій, гілки коментарів, специфікації виробів, найкоротші маршрути в невеликому графі, генерування послідовностей.

## Упорядкування дерева

Щоб надрукувати дерево в порядку «вглиб», зберіть шлях від кореня й сортуйте за ним:

```sql
WITH RECURSIVE tree AS (
    SELECT id, name, ARRAY[name] AS path FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, t.path || e.name
    FROM employees e JOIN tree t ON e.manager_id = t.id
)
SELECT array_to_string(path, ' > ') FROM tree ORDER BY path;
```

Масиви порівнюються поелементно, тож кожен керівник опиняється одразу перед своїми підлеглими.

## Нескінченні цикли

Якщо в даних є цикл (A керує B, B керує A), рекурсія ніколи не зупиниться. Захист:

- `UNION` замість `UNION ALL` відкидає вже бачені рядки (лише якщо рядки цілком однакові, тож не зі зростаючим `depth`);
- зупинка на певній глибині: `WHERE s.depth < 20`;
- відстеження шляху й пропуск відвіданих id: `WHERE NOT e.id = ANY(s.visited)`;
- у PostgreSQL 14+ є вбудована конструкція `CYCLE id SET is_cycle USING path`.

Редактор практик зупиняє запит через 10 секунд, тож нескінченну рекурсію можна безпечно спробувати.
