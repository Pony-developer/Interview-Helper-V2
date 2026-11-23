## HAVING

`WHERE` фільтрує **рядки** до групування. `HAVING` фільтрує **групи** після обчислення агрегатів:

```sql
-- категорії, в яких щонайменше 3 товари дешевші за 100
SELECT category_id, count(*) AS products
FROM products
WHERE price < 100          -- рядки: беруть участь лише дешеві товари
GROUP BY category_id
HAVING count(*) >= 3       -- групи: залишаємо великі
ORDER BY category_id;
```

Агрегат не можна використати у `WHERE` (`WHERE count(*) > 2` — помилка), бо `WHERE` виконується до появи груп. І навпаки, умова на звичайний стовпець належить до `WHERE`, а не до `HAVING`: вона фільтрує раніше й дозволяє планувальнику використати індекси.

Повний логічний порядок тепер такий: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`.

## FILTER: умовні агрегати

Часто в одному рядку треба кілька підрахунків з різними умовами. `FILTER` застосовує умову лише до одного агрегату:

```sql
SELECT c.name,
       count(*)                                    AS all_orders,
       count(*) FILTER (WHERE o.status = 'shipped') AS shipped,
       count(*) FILTER (WHERE o.status = 'cancelled') AS cancelled
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
```

`FILTER` — стандартний SQL, який підтримує PostgreSQL. В інших базах те саме пишуть через `CASE`: `sum(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END)`. Цей прийом «зведення» (pivot) перетворює значення стовпця на стовпці звіту.

## Упорядковані агрегати

`string_agg` і `array_agg` мають власний `ORDER BY`:

```sql
SELECT cat.name, string_agg(p.name, ', ' ORDER BY p.price DESC) AS products
FROM categories cat
JOIN products p ON p.category_id = cat.id
GROUP BY cat.name;
```

## Набори групування, ROLLUP і CUBE

Звітам часто потрібні проміжні й загальні підсумки. `ROLLUP` додає їх в одному запиті:

```sql
SELECT cat.name AS category, o.status, sum(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN orders o     ON o.id = oi.order_id
JOIN products p   ON p.id = oi.product_id
JOIN categories cat ON cat.id = p.category_id
GROUP BY ROLLUP (cat.name, o.status)
ORDER BY cat.name, o.status;
```

`ROLLUP (a, b)` утворює групи `(a, b)`, `(a)` і `()`: за категорією й статусом, за категорією та загальний підсумок. У рядках підсумків згорнуті стовпці показують `NULL`; `GROUPING(o.status)` повертає в таких рядках 1, тож їх можна підписати як `'all'`. `CUBE (a, b)` додає всі комбінації, зокрема й саму `(b)`, а `GROUPING SETS ((a), (b))` перелічує групування явно.

## Поширені шаблони

```sql
-- дублікати: email, який використовує більше ніж один клієнт
SELECT lower(email), count(*) FROM customers
WHERE email IS NOT NULL
GROUP BY lower(email)
HAVING count(*) > 1;

-- частка кожного статусу у відсотках
SELECT status, round(100.0 * count(*) / sum(count(*)) OVER (), 1) AS pct
FROM orders
GROUP BY status;
```

Другий запит поєднує агрегат із **віконною** функцією: `sum(count(*)) OVER ()` — це загальна сума по всіх групах. Віконним функціям присвячено окремий модуль.
