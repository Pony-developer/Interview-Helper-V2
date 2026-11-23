Ця практика зберігає товари так, як це робила б MongoDB: таблиця `products` з `id` (як `_id`) і одним документом `jsonb` на товар. Відкрийте **База даних практики**, щоб побачити документи: вони мають `name`, `category`, `price`, масив `tags`, вкладений об'єкт `stock`, а деякі — ще й `specs`.

Редактор містить чотири запити MongoDB у коментарях. Перекладіть кожен на PostgreSQL:

1. Бестселери (`tags` містить `"bestseller"`): `name` і `price`, від найдорожчого. Виведіть `price` як число: `(doc ->> 'price')::numeric`.
2. Товари, в яких `specs.color` дорівнює `"black"`, а ціна менша за 100: лише `name`.
3. Для кожної `category`: кількість товарів `products` і середня ціна `avg_price`, округлена до 2 знаків, упорядковано за категорією.
4. Розгорніть теги (`$unwind`) і порахуйте товари для кожного `tag`; спершу найпопулярніші теги, далі за абеткою.

Очікуваний вивід:

```text
    name    | price
------------+-------
 4K Monitor |   329
 Chess Set  |    35
 SQL Basics |    25
(3 rows)

      name
----------------
 Wireless Mouse
(1 row)

  category   | products | avg_price
-------------+----------+-----------
 books       |        3 |     37.80
 electronics |        2 |    174.50
 games       |        1 |     35.00
(3 rows)

     tag     | products
-------------+----------
 bestseller  |        3
 sql         |        2
 accessories |        1
 display     |        1
 gift        |        1
 mongodb     |        1
 nosql       |        1
 postgres    |        1
(8 rows)
```

Корисні інструменти з лекції про JSON: `->>` (поле як текст), `?` (масив містить рядок), `@>` (документ містить фрагмент JSON) і `jsonb_array_elements_text`, що грає роль `$unwind`.
