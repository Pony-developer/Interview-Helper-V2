Частину SQL, що визначає структуру, називають **DDL** (data definition language): `CREATE`, `ALTER`, `DROP`. Частина, що змінює дані, — **DML** (`INSERT`, `UPDATE`, `DELETE`), а `SELECT` іноді виділяють як **DQL**. `GRANT` і `REVOKE` утворюють **DCL**.

## CREATE TABLE

```sql
CREATE TABLE products (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        text NOT NULL,
    category_id integer REFERENCES categories (id),
    price       numeric(10, 2) NOT NULL CHECK (price >= 0),
    stock       integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);
```

Кожен рядок має вигляд `стовпець тип [обмеження]`. `DEFAULT` задає значення, яке використовується, коли `INSERT` не згадує стовпець.

Корисні варіанти:

- `CREATE TABLE IF NOT EXISTS …` нічого не робить, якщо таблиця існує (зручно у скриптах, небезпечно в міграціях, бо приховує розбіжності).
- `CREATE TABLE archive (LIKE orders INCLUDING ALL);` копіює структуру.
- `CREATE TABLE top_products AS SELECT …;` створює таблицю з результату запиту (без обмежень).
- `CREATE TEMP TABLE …` живе до кінця сесії.

## Обчислювані стовпці

Стовпець можна обчислювати з інших стовпців того самого рядка:

```sql
CREATE TABLE order_items (
    quantity   integer NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    line_total numeric(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
```

Стовпці `STORED` обчислюються під час запису; PostgreSQL 18 підтримує й `VIRTUAL`, що обчислюються під час читання.

## ALTER TABLE

```sql
ALTER TABLE products ADD COLUMN description text;
ALTER TABLE products ALTER COLUMN description SET NOT NULL;   -- впаде, якщо є NULL
ALTER TABLE products ALTER COLUMN price TYPE numeric(12, 2);
ALTER TABLE products RENAME COLUMN stock TO quantity_in_stock;
ALTER TABLE products DROP COLUMN description;
ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);
ALTER TABLE products RENAME TO items;
```

## Безпечна зміна живої таблиці

Багато форм `ALTER TABLE` беруть блокування `ACCESS EXCLUSIVE`: ніхто навіть не може читати таблицю, доки зміна не завершиться. На великій навантаженій таблиці це простій. Емпіричні правила, які люблять інтерв'юери:

- **Додавання стовпця, що допускає NULL**, або стовпця зі сталим значенням за замовчуванням — миттєве (змінюється лише каталог).
- **Зміна типу стовпця** зазвичай переписує всю таблицю. Замість цього додайте новий стовпець, заповніть його партіями, переключіть код, а потім видаліть старий.
- **Додавання `NOT NULL` чи зовнішнього ключа** має перевірити кожен рядок. Для зовнішнього ключа чи `CHECK` додайте обмеження як `NOT VALID` (миттєво), а згодом виконайте `ALTER TABLE … VALIDATE CONSTRAINT …`, що не блокує записів.
- **Створення індексу** блокує записи; у продакшні використовуйте `CREATE INDEX CONCURRENTLY`.
- Задавайте в міграціях `lock_timeout`, щоб міграція, яка не може отримати блокування, швидко падала, а не ставила в чергу за собою всі інші запити.

## DROP і TRUNCATE

```sql
DROP TABLE order_items;              -- видаляє таблицю разом із даними
DROP TABLE IF EXISTS order_items;
DROP TABLE categories CASCADE;       -- видаляє й залежні від неї зовнішні ключі
TRUNCATE order_items;                -- миттєво видаляє всі рядки, залишаючи таблицю
TRUNCATE orders RESTART IDENTITY CASCADE;
```

`TRUNCATE` значно швидший за `DELETE FROM t` на великих таблицях, бо не обходить рядки поодинці, але він не запускає тригерів `ON DELETE`.

## DDL транзакційний

У PostgreSQL DDL бере участь у транзакціях, тож міграція може бути «все або нічого»:

```sql
BEGIN;
ALTER TABLE products ADD COLUMN sku text;
UPDATE products SET sku = 'P-' || id;
ALTER TABLE products ALTER COLUMN sku SET NOT NULL;
COMMIT;   -- або ROLLBACK, і нічого не сталося
```

MySQL і Oracle неявно фіксують транзакцію на DDL, тож це справжня перевага PostgreSQL.

## Схеми

Таблиці живуть у **схемі**; типова — `public`. `CREATE SCHEMA billing;` і `billing.invoices` розділяють частини великої бази. Налаштування `search_path` визначає, в яких схемах шукати назви без префікса.
