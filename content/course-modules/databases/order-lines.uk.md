Склад друкує пакувальні листи для **відправлених** замовлень. Для кожної позиції кожного замовлення зі статусом `shipped` покажіть:

- `order_id`, id замовлення;
- `customer`, ім'я клієнта;
- `product`, назву товару;
- `quantity`.

Упорядкуйте рядки за id замовлення, а потім за назвою товару. Знадобляться чотири таблиці: `orders`, `customers`, `order_items` і `products`.

Очікуваний вивід:

```text
 order_id |   customer   |       product       | quantity
----------+--------------+---------------------+----------
        1 | Olena Koval  | SQL Basics          |        2
        1 | Olena Koval  | Wireless Mouse      |        1
        3 | Taras Melnyk | Mechanical Keyboard |        1
        3 | Taras Melnyk | Puzzle 1000         |        2
        5 | Iryna Bondar | Postgres Internals  |        1
        5 | Iryna Bondar | SQL Basics          |        1
        7 | Olena Koval  | Chess Set           |        2
        7 | Olena Koval  | Wireless Mouse      |        2
(8 rows)
```
