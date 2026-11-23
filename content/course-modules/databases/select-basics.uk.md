`SELECT` читає дані. Найпростіша форма називає стовпці й таблицю:

```sql
SELECT name, price
FROM products;
```

`SELECT *` повертає всі стовпці. Це зручно в консолі, але в коді застосунку цього краще уникати: результат зміниться, коли хтось додасть стовпець, а ви передаєте дані, які вам не потрібні.

## Вирази та псевдоніми

Стовпцем у `SELECT` може бути будь-який вираз. `AS` дає стовпцю результату назву:

```sql
SELECT name,
       price,
       price * 0.8          AS sale_price,
       upper(name)          AS shouting,
       name || ' (' || stock || ' left)' AS label
FROM products;
```

- Арифметика: `+ - * / %`. Обережно: ділення двох цілих чисел у PostgreSQL цілочисельне, тож `7 / 2` дорівнює `3`. Пишіть `7 / 2.0` або `7::numeric / 2`, щоб отримати `3.5`.
- `||` склеює рядки. `concat(a, b)` робить те саме, але вважає `NULL` порожнім рядком.
- Функції: `upper`, `lower`, `length`, `round(x, 2)`, `abs`, `now()`, `current_date`, `extract(year FROM created_at)` і сотні інших.
- `::тип` перетворює значення: `'42'::integer`, `price::text`, `created_at::date`.

Псевдонім із пробілами чи великими літерами потребує подвійних лапок: `AS "Sale price"`. Без лапок назва зводиться до нижнього регістру.

## SELECT без FROM

PostgreSQL уміє обчислювати вирази без таблиці, що зручно для швидких перевірок:

```sql
SELECT 2 + 2 AS four, now()::date AS today, 7 / 2 AS int_div, 7 / 2.0 AS real_div;
```

## DISTINCT

`DISTINCT` прибирає з результату рядки-дублікати:

```sql
SELECT DISTINCT city FROM customers;             -- кожне місто один раз (NULL тут вважається одним значенням)
SELECT DISTINCT city, created_at FROM customers; -- унікальні пари
```

У PostgreSQL є ще `DISTINCT ON (вираз)`, який залишає перший рядок для кожного значення виразу згідно з `ORDER BY`. Це розширення PostgreSQL:

```sql
-- найдешевший товар у кожній категорії
SELECT DISTINCT ON (category_id) category_id, name, price
FROM products
ORDER BY category_id, price;
```

## CASE

`CASE` — це `if`/`else` усередині виразу:

```sql
SELECT name,
       CASE
           WHEN stock = 0   THEN 'sold out'
           WHEN stock < 20  THEN 'few left'
           ELSE 'in stock'
       END AS availability
FROM products;
```

Гілки перевіряються згори донизу; перемагає перша істинна. Без `ELSE` результатом буде `NULL`.

## Логічний порядок запиту

Ви пишете `SELECT … FROM … WHERE … ORDER BY`, але база обчислює частини в іншому, логічному порядку:

1. `FROM` і `JOIN`: які рядки існують;
2. `WHERE`: які рядки залишаються;
3. `GROUP BY`, потім `HAVING`;
4. `SELECT`: які стовпці та вирази обчислюються (тут народжуються псевдоніми);
5. `DISTINCT`;
6. `ORDER BY`;
7. `LIMIT` / `OFFSET`.

Це пояснює класичну помилку: псевдонім із `SELECT` не можна використати у `WHERE`, бо `WHERE` виконується раніше. А в `ORDER BY` **можна**, бо він виконується після `SELECT`.
