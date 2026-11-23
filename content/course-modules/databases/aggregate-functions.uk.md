Агрегатні функції перетворюють багато рядків на одне значення: скільки, скільки разом, у середньому, найменше, найбільше.

## Агрегати над усією таблицею

```sql
SELECT count(*)            AS products,
       count(category_id)  AS categorized,
       sum(stock)          AS units,
       avg(price)          AS avg_price,
       min(price)          AS cheapest,
       max(price)          AS most_expensive
FROM products;
```

| Функція | Повертає |
|---|---|
| `count(*)` | Кількість рядків |
| `count(вираз)` | Кількість рядків, де вираз не `NULL` |
| `count(DISTINCT вираз)` | Кількість різних значень, що не є `NULL` |
| `sum`, `avg` | Суму та середнє значень, що не є `NULL` |
| `min`, `max` | Найменше й найбільше (працюють і з текстом, і з датами) |
| `string_agg(вираз, ', ' ORDER BY …)` | Значення, склеєні в один рядок |
| `array_agg(вираз ORDER BY …)` | Значення, зібрані в масив |
| `bool_and`, `bool_or` | Чи всі / чи хоч одне значення істинне |

Два правила про `NULL`, які люблять на співбесідах:

- Агрегати, окрім `count(*)`, **пропускають** `NULL`: `avg` від 10, 20 і `NULL` дорівнює 15, а не 10.
- Над нулем рядків `count` повертає 0, а `sum`, `avg`, `min` і `max` повертають `NULL`. Пишіть `coalesce(sum(x), 0)`, коли потрібне число.

`avg` від цілих повертає `numeric` з багатьма цифрами; для показу округлюйте: `round(avg(price), 2)`.

## GROUP BY

`GROUP BY` розбиває рядки на групи з однаковими значеннями стовпців групування й обчислює агрегати для кожної групи:

```sql
SELECT category_id, count(*) AS products, round(avg(price), 2) AS avg_price
FROM products
GROUP BY category_id
ORDER BY category_id;
```

```text
 category_id | products | avg_price
-------------+----------+-----------
           1 |        3 |     37.80
           2 |        3 |    146.00
           3 |        2 |     24.75
           4 |        1 |     22.00
        NULL |        1 |      9.99
```

Усі рядки з `NULL` у стовпці групування утворюють **одну** групу.

## Правило одного значення

Після групування кожен рядок результату представляє цілу групу, тож кожен стовпець у `SELECT` мусить мати **одне значення на групу**: бути в `GROUP BY` або всередині агрегату.

```sql
-- ERROR: column "products.name" must appear in the GROUP BY clause
-- or be used in an aggregate function
SELECT category_id, name, count(*) FROM products GROUP BY category_id;
```

Яку `name` має показати група з трьох книжок? База відмовляється вгадувати. (MySQL колись обирала довільну; PostgreSQL — ніколи.) Один виняток: якщо групувати за первинним ключем таблиці, можна вибирати будь-який інший стовпець цієї таблиці, бо він визначається ключем:

```sql
SELECT c.id, c.name, c.city, count(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;          -- c.name і c.city дозволено
```

## Групування за виразами

```sql
-- замовлення за місяцями
SELECT date_trunc('month', ordered_at)::date AS month, count(*) AS orders
FROM orders
GROUP BY month          -- PostgreSQL дозволяє тут псевдонім результату
ORDER BY month;
```

## Агрегація з'єднаних даних

Поєднання з'єднань і агрегатів — хліб звітності:

```sql
SELECT c.name, sum(oi.quantity * oi.unit_price) AS spent
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id, c.name
ORDER BY spent DESC;
```

Стежте за «зерном»: після приєднання `order_items` кожен рядок — це одна **позиція**, а не замовлення, тож `count(*)` рахує позиції. Замовлення рахуйте через `count(DISTINCT o.id)`.
