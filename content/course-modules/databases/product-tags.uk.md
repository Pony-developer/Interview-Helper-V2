Магазин хоче позначати товари тегами, причому товар може мати багато тегів, а тег може бути на багатьох товарах: зв'язок «багато-до-багатьох». Напишіть у редакторі три кроки:

1. **Створіть дві таблиці.**
   - `tags`: `id` (identity первинний ключ) і `name` (обов'язкова, унікальна).
   - `product_tags`: `product_id` і `tag_id`, обидва обов'язкові зовнішні ключі (на `products` і `tags`), а первинний ключ — **пара**. Коли видаляють товар чи тег, його зв'язки мають теж зникати (`ON DELETE CASCADE`).
2. **Додайте три теги**: `bestseller`, `gift`, `new`.
3. **Позначте товари**: SQL Basics → bestseller; Chess Set → bestseller і gift; Puzzle 1000 → gift; 4K Monitor → new.

Перевірки наприкінці намагаються порушити ваші обмеження, а потім показують теги кожного товару. Остання перевірка видаляє тег `new`, що має прибрати і його зв'язок із монітором. Очікуваний вивід:

```text
     check_name     |        result
--------------------+-----------------------
 duplicate link     | unique_violation
 unknown product    | foreign_key_violation
 unknown tag        | foreign_key_violation
 duplicate tag name | unique_violation
 delete a used tag  | ok
(5 rows)

   product   |       tags
-------------+------------------
 Chess Set   | bestseller, gift
 Puzzle 1000 | gift
 SQL Basics  | bestseller
(3 rows)
```

Підказка до кроку 3: замість того щоб жорстко вписувати id, вставляйте із запиту, що з'єднує список `VALUES` пар `(назва товару, назва тегу)` з `products` і `tags`.
