`WHERE` залишає лише рядки, для яких умова **істинна**:

```sql
SELECT name, price FROM products WHERE price < 30;
```

## Оператори порівняння

| Оператор | Значення | Приклад |
|---|---|---|
| `=`, `<>` (або `!=`) | дорівнює, не дорівнює | `status = 'paid'` |
| `<`, `<=`, `>`, `>=` | впорядкування | `price >= 100` |
| `BETWEEN a AND b` | `>= a AND <= b`, обидва кінці включно | `price BETWEEN 10 AND 20` |
| `IN (…)` | дорівнює одному зі значень | `city IN ('Kyiv', 'Lviv')` |
| `LIKE` | шаблон: `%` будь-який текст, `_` один символ | `name LIKE 'Post%'` |
| `ILIKE` | `LIKE` без урахування регістру (PostgreSQL) | `name ILIKE '%mouse%'` |
| `~`, `~*` | регулярний вираз (з урахуванням регістру / без) | `email ~ '@example\.com$'` |
| `IS NULL`, `IS NOT NULL` | значення відсутнє / наявне | `email IS NULL` |

Умови поєднують через `AND`, `OR` і `NOT`. `AND` зв'язує сильніше за `OR`, тож коли змішуєте їх, ставте дужки:

```sql
-- товари з Books або Games дешевші за 40
SELECT name FROM products
WHERE (category_id = 1 OR category_id = 3) AND price < 40;
```

Без дужок запит означав би «усі Books, а також Games дешевші за 40».

`BETWEEN` із часовими мітками — пастка: `created_at BETWEEN '2024-01-01' AND '2024-01-31'` пропускає все після опівночі 31-го. Краще напіввідкритий діапазон: `created_at >= '2024-01-01' AND created_at < '2024-02-01'`.

## NULL і тризначна логіка

Логіка SQL має три значення: **true**, **false** і **unknown** (`NULL`). Будь-яке порівняння з `NULL` дає `NULL`:

```sql
SELECT NULL = NULL,   -- NULL, а не true!
       NULL <> 1,     -- NULL
       NULL + 1,      -- NULL
       'a' || NULL;   -- NULL
```

`WHERE` залишає рядок лише тоді, коли умова **true**, тож і `city = NULL`, і `city <> NULL` нічого не знаходять. Використовуйте `IS NULL` / `IS NOT NULL` або `IS DISTINCT FROM`, який вважає `NULL` звичайним значенням:

```sql
SELECT name FROM customers WHERE city IS NULL;
SELECT name FROM customers WHERE city IS DISTINCT FROM 'Kyiv';  -- включає й місто NULL
```

Як `AND`, `OR` і `NOT` поводяться з невідомим:

| a | b | a AND b | a OR b |
|---|---|---|---|
| true | NULL | NULL | true |
| false | NULL | false | NULL |
| NULL | NULL | NULL | NULL |

а `NOT NULL` дає `NULL`. Наслідок, про який часто питають на співбесідах:

```sql
SELECT name FROM customers WHERE city <> 'Kyiv';
```

**не** поверне Софію, в якої місто `NULL`: `NULL <> 'Kyiv'` — невідомо, а не true.

## Пастка NOT IN

`x NOT IN (1, 2, NULL)` означає `x <> 1 AND x <> 2 AND x <> NULL`. Остання частина завжди невідома, тож уся умова ніколи не буде true, і запит нічого не поверне. Це болить, коли список береться з підзапиту, що містить `NULL`. Використовуйте `NOT EXISTS` (про нього — в модулі про підзапити).

## COALESCE і NULLIF

- `COALESCE(a, b, c)` повертає перший аргумент, що не є `NULL`: `COALESCE(city, 'unknown')`.
- `NULLIF(a, b)` повертає `NULL`, коли `a = b`, інакше `a`. Типове застосування — уникнути ділення на нуль: `total / NULLIF(count, 0)`.

## Фільтрування з функціями

```sql
SELECT name FROM customers WHERE extract(month FROM created_at) = 3;
SELECT name FROM customers WHERE lower(email) = 'olena@example.com';
```

Це працює, але функція навколо стовпця зазвичай не дає скористатися звичайним індексом по цьому стовпцю. Модуль про індекси покаже, як це виправити індексом за виразом.
