This practice stores products the way MongoDB would: a table `products` with an `id` (like `_id`) and one `jsonb` document per product. Open **Practice database** to see the documents: they have `name`, `category`, `price`, a `tags` array, a nested `stock` object, and some have `specs`.

The editor lists four MongoDB queries as comments. Translate each into PostgreSQL:

1. Bestsellers (`tags` contains `"bestseller"`): `name` and `price`, most expensive first. Output `price` as a number: `(doc ->> 'price')::numeric`.
2. Products whose `specs.color` is `"black"` and whose price is below 100: just the `name`.
3. Per `category`: the number of `products` and the average price `avg_price`, rounded to 2 decimals, ordered by category.
4. `$unwind` the tags and count products per `tag`; most used tags first, then alphabetically.

Expected output:

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

Useful tools from the JSON lecture: `->>` (field as text), `?` (array contains a string), `@>` (document contains a JSON fragment) and `jsonb_array_elements_text`, which plays the role of `$unwind`.
