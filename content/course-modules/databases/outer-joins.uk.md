Внутрішнє з'єднання відкидає рядки без пари. **Зовнішнє з'єднання** зберігає їх і заповнює відсутній бік значеннями `NULL`.

## LEFT JOIN

```sql
SELECT c.name, o.id AS order_id, o.status
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
ORDER BY c.name, o.id;
```

```text
       name        | order_id |  status
-------------------+----------+-----------
 Andrii Shevchenko |        6 | new
 Iryna Bondar      |        4 | cancelled
 …
 Maksym Kravets    |     NULL | NULL        ← замовлень немає, але клієнта показано
 Sofia Tkachenko   |     NULL | NULL
```

`LEFT JOIN` (або `LEFT OUTER JOIN`) зберігає **кожен рядок лівої таблиці**. `RIGHT JOIN` зберігає кожен рядок правої; його використовують рідко, бо можна поміняти таблиці місцями й написати `LEFT JOIN`, що читається природніше.

## FULL JOIN

`FULL JOIN` зберігає рядки без пари з **обох** боків. Це зручно для порівняння двох наборів даних:

```sql
-- товари в каталозі проти товарів у вивантаженні складу
SELECT coalesce(c.sku, w.sku) AS sku, c.price, w.quantity
FROM catalog AS c
FULL JOIN warehouse AS w ON w.sku = c.sku
WHERE c.sku IS NULL OR w.sku IS NULL;   -- є лише з одного боку
```

## Анти-з'єднання: рядки без пари

«Клієнти, які ніколи не замовляли» — це `LEFT JOIN` плюс перевірка, що правого боку немає:

```sql
SELECT c.name
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

Перевіряйте стовпець, що не може бути `NULL` у справжньому збігу, як-от первинний ключ або стовпець з'єднання. Той самий запит із `NOT EXISTS` часто зрозуміліший, а планувальник виконує обидва однаково (як «anti join»):

```sql
SELECT c.name
FROM customers AS c
WHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id);
```

Уникайте `NOT IN (SELECT customer_id FROM orders)`: якщо підзапит поверне хоч один `NULL`, результат буде порожнім (див. лекцію про `NULL`).

## Куди ставити умову

Для зовнішніх з'єднань `ON` і `WHERE` означають різне:

```sql
-- усі клієнти, і їхні ОПЛАЧЕНІ замовлення, якщо є
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid';

-- лише клієнти, які МАЮТЬ оплачені замовлення: WHERE прибирає рядки з NULL,
-- тож це непомітно стає внутрішнім з'єднанням
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid';
```

Правило: умова на **необов'язкову** (праву) таблицю має бути в `ON`, якщо ви хочете зберегти рядки без пари. Умова у `WHERE` на цю таблицю, окрім `IS NULL`, перетворює ліве з'єднання на внутрішнє. Це одна з найпоширеніших помилок у SQL і улюблене питання на співбесідах.

## Підрахунок із зовнішніми з'єднаннями

```sql
SELECT c.name, count(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
```

`count(o.id)` рахує значення, що не є `NULL`, тож клієнти без замовлень отримують `0`. `count(*)` рахував би сам рядок і дав би їм `1`.
