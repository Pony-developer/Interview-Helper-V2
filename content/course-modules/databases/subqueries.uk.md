**Підзапит** — це `SELECT` усередині іншої інструкції. Те, де він стоїть, визначає, що він має повертати.

## Скалярні підзапити: одне значення

Підзапит у дужках, що повертає один рядок з одним стовпцем, можна використати всюди, де можна значення:

```sql
-- товари, дорожчі за середній товар
SELECT name, price
FROM products
WHERE price > (SELECT avg(price) FROM products);

-- середнє як стовпець, для порівняння
SELECT name, price, (SELECT round(avg(price), 2) FROM products) AS avg_price
FROM products;
```

Якщо він не повертає рядків, значення — `NULL`; якщо повертає більше одного рядка, запит падає з «more than one row returned by a subquery used as an expression».

## IN і EXISTS: належність

```sql
-- клієнти, які мають хоча б одне відправлене замовлення
SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE status = 'shipped');

-- те саме з EXISTS
SELECT c.name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.status = 'shipped'
);
```

Обидва — це **напівз'єднання** (semi-join): на відміну від `JOIN`, вони ніколи не дублюють клієнта з трьома відправленими замовленнями. `EXISTS` цікавить лише, чи існує рядок, тож за домовленістю пишуть `SELECT 1`. Сучасний PostgreSQL однаково добре планує `IN` і `EXISTS`; стара порада «EXISTS завжди швидший» застаріла.

Заперечні форми **не** рівнозначні: `NOT IN` не повертає нічого, щойно підзапит видасть `NULL`, а `NOT EXISTS` поводиться очікувано. Обирайте `NOT EXISTS`.

`ANY` і `ALL` порівнюють з кожним значенням підзапиту: `price > ALL (SELECT price FROM products WHERE category_id = 3)` означає «дорожче за кожну гру».

## Корельовані підзапити

Підзапит, що посилається на зовнішній запит, називають **корельованим**. Концептуально він виконується для кожного зовнішнього рядка:

```sql
-- товари, дорожчі за середнє ЇХНЬОЇ категорії
SELECT p.name, p.price
FROM products p
WHERE p.price > (
    SELECT avg(p2.price)
    FROM products p2
    WHERE p2.category_id = p.category_id    -- посилання на зовнішній p
);
```

Внутрішньому запиту потрібен власний псевдонім (`p2`), щоб `p.category_id` однозначно означав зовнішній рядок. Корельовані підзапити легко читати; на великих таблицях перевіряйте план, бо «для кожного рядка» може бути повільним, якщо планувальник не перетворить його на з'єднання. Той самий результат через з'єднання з попередньо агрегованою таблицею:

```sql
SELECT p.name, p.price
FROM products p
JOIN (SELECT category_id, avg(price) AS avg_price
      FROM products GROUP BY category_id) AS a
  ON a.category_id = p.category_id
WHERE p.price > a.avg_price;
```

## Підзапити у FROM

Підзапит у `FROM` (**похідна таблиця**) — це тимчасовий результат, який можна з'єднувати й фільтрувати. Він мусить мати псевдонім, як у запиті вище. Використовуйте його, щоб спершу агрегувати, а потім з'єднувати: так не буде множення рядків, яке ви бачили зі з'єднаннями:

```sql
SELECT c.name, t.orders, t.spent
FROM customers c
JOIN (
    SELECT o.customer_id, count(DISTINCT o.id) AS orders, sum(oi.quantity * oi.unit_price) AS spent
    FROM orders o JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.customer_id
) AS t ON t.customer_id = c.id;
```

## Підзапити у змінах даних

```sql
DELETE FROM products
WHERE id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)
  AND stock = 0;

UPDATE products SET price = price * 0.9
WHERE category_id = (SELECT id FROM categories WHERE name = 'Books');
```

(`IS NOT NULL` робить `NOT IN` безпечним; з `NOT EXISTS` було б ще чистіше.)
