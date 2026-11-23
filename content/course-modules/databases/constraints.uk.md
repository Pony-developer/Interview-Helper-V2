Обмеження — це правила, які база даних перевіряє під час кожного запису, хоч би який застосунок, скрипт чи людина його робили. Валідація в застосунку потрібна для зрозумілих повідомлень про помилки; обмеження — це гарантія.

## Шість видів

```sql
CREATE TABLE orders (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,       -- PRIMARY KEY
    customer_id integer NOT NULL                                         -- NOT NULL
                REFERENCES customers (id) ON DELETE RESTRICT,            -- FOREIGN KEY
    number      text NOT NULL UNIQUE,                                    -- UNIQUE
    status      text NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'paid', 'shipped', 'cancelled')), -- CHECK
    total       numeric(10, 2) NOT NULL CHECK (total >= 0)
);
```

| Обмеження | Гарантує | Примітки |
|---|---|---|
| `NOT NULL` | Значення наявне | Робіть стовпці `NOT NULL`, якщо «невідомо» не є реальним станом |
| `UNIQUE` | Жодні два рядки не мають однакового значення | Створює унікальний індекс; NULL не конфліктують між собою (якщо не `UNIQUE NULLS NOT DISTINCT`) |
| `PRIMARY KEY` | `UNIQUE` + `NOT NULL`, один на таблицю | Ідентичність рядка |
| `FOREIGN KEY` | Значення існує в таблиці, на яку посилаються | Стовпці, на які посилаються, мають бути унікальними |
| `CHECK` | Виконується логічна умова | Спрацьовує лише тоді, коли умова **false**; `NULL` проходить |
| `EXCLUDE` | Жодні два рядки не «перетинаються» за заданим оператором | Лише PostgreSQL, напр. бронювання з діапазонами, що перекриваються |

## Обмеження стовпця й таблиці

Обмеження одного стовпця можна написати поруч із ним. Обмеження на кілька стовпців пишуть окремо:

```sql
CREATE TABLE order_items (
    order_id   integer REFERENCES orders (id) ON DELETE CASCADE,
    product_id integer REFERENCES products (id),
    quantity   integer NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_id, product_id),                     -- складений ключ
    CONSTRAINT reasonable_quantity CHECK (quantity <= 1000) -- іменоване обмеження
);
```

Обмеження без назви отримують згенеровані назви на кшталт `products_price_check` чи `orders_customer_id_fkey`. Якщо самостійно назвати важливі обмеження, повідомлення про помилки й міграції стануть зрозумілішими.

## Дії зовнішнього ключа

Що станеться з `order_items`, коли замовлення видалять (або зміниться його id)?

| Дія | Наслідок |
|---|---|
| `NO ACTION` (типово) / `RESTRICT` | Видалення не вдасться, поки існують рядки, що посилаються |
| `CASCADE` | Рядки, що посилаються, теж видаляються (або оновлюються для `ON UPDATE`) |
| `SET NULL` | Стовпець зовнішнього ключа стає `NULL` |
| `SET DEFAULT` | Стовпець отримує значення за замовчуванням |

`CASCADE` зручний для частин, що не можуть жити без батька (позиції замовлення), але небезпечний для незалежних даних: ви ж не хочете, щоб видалення категорії тихо видалило її товари. До того ж PostgreSQL **не** створює індекс на стовпці, що посилається, автоматично. Без індексу по `order_items.order_id` видалення замовлення сканує всю таблицю `order_items`, перевіряючи посилання. Індексуйте зовнішні ключі.

## Відкладені обмеження

Зазвичай обмеження перевіряється після кожної інструкції. `DEFERRABLE INITIALLY DEFERRED` відкладає перевірку до `COMMIT`, що допомагає, коли два рядки тимчасово порушують правило, як-от під час обміну позиціями двох елементів за обмеження `UNIQUE (list_id, position)`.

## Помилки, які ви побачите

```text
ERROR:  duplicate key value violates unique constraint "users_email_key"
ERROR:  null value in column "name" of relation "users" violates not-null constraint
ERROR:  new row for relation "users" violates check constraint "users_age_check"
ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
```

Кожна має код SQLSTATE (`23505` унікальність, `23502` not null, `23514` check, `23503` зовнішній ключ), який код застосунку може перехопити, щоб, наприклад, відповісти «цей email уже зареєстровано» з HTTP 409, а не 500.

## Обмеження проти перевірок у застосунку

«Перевірити, чи існує email, а потім вставити» в коді застосунку має гонку: два запити можуть обидва побачити «вільно» й обидва вставити. Закрити цю гонку може лише обмеження `UNIQUE`. Те саме з «залишок не може бути від'ємним» (`CHECK (stock >= 0)`) і «замовлення має належати клієнту» (зовнішній ключ).

## Про практику

Практика використовує допоміжну функцію `try_sql(statement)` зі скрипту налаштування. Вона виконує інструкцію й повертає `ok` або вид помилки (`unique_violation`, `check_violation`, `not_null_violation`), тож один запуск може перевірити кілька обмежень, не зупиняючись на першому відхиленому рядку.
