Магазин мусить зберігати історію змін цін для бухгалтерії. Скрипт налаштування додав порожню таблицю:

```sql
CREATE TABLE price_history (
    id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id integer NOT NULL REFERENCES products (id),
    old_price  numeric(10, 2) NOT NULL,
    new_price  numeric(10, 2) NOT NULL
);
```

Напишіть тригер, щоб **кожне оновлення, що змінює ціну товару**, додавало рядок з id товару, старою та новою ціною. Оновлення, що не змінюють ціни (залишок, назва чи та сама ціна), мають не додавати **нічого**.

1. Створіть тригерну функцію на PL/pgSQL (`RETURNS trigger`), що вставляє в `price_history`, використовуючи `OLD` і `NEW`.
2. Створіть рядковий тригер `AFTER UPDATE` на `products`, що її викликає. Фільтруйте умовою `WHEN` або через `IF` усередині функції.

Перевірки виконують п'ять оновлень і показують історію. Очікуваний вивід:

```text
 id |       name       | old_price | new_price
----+------------------+-----------+-----------
  1 | SQL Basics       |     25.00 |     27.00
  2 | Chess Set Deluxe |     35.00 |     17.50
  3 | SQL Basics       |     27.00 |     25.00
(3 rows)
```

Підказка: порівнюйте ціни через `OLD.price IS DISTINCT FROM NEW.price`, що поводиться правильно, навіть якщо один бік `NULL`.
