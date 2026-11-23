The shop wants to tag products, and a product can have many tags while a tag can be on many products: a many-to-many relationship. Write three steps in the editor:

1. **Create two tables.**
   - `tags`: `id` (an identity primary key) and `name` (required, unique).
   - `product_tags`: `product_id` and `tag_id`, both required foreign keys (to `products` and `tags`), with the **pair** as the primary key. When a product or a tag is deleted, its links must disappear too (`ON DELETE CASCADE`).
2. **Add three tags**: `bestseller`, `gift`, `new`.
3. **Tag the products**: SQL Basics → bestseller; Chess Set → bestseller and gift; Puzzle 1000 → gift; 4K Monitor → new.

The checks at the end try to break your constraints and then list the tags of each product. The last check deletes the tag `new`, which must also remove its link to the monitor. Expected output:

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

Hint for step 3: instead of hard-coding ids, insert from a query that joins a `VALUES` list of `(product name, tag name)` pairs to `products` and `tags`.
