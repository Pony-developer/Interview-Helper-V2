## Початок: одна пласка таблиця (П110)

```text
order_rows
order_id | order_date | customer_email    | customer_name | customer_city | product_sku | product_name | unit_price | quantity
---------+------------+-------------------+---------------+---------------+-------------+--------------+------------+---------
1        | 2026-03-01 | olena@example.com | Olena Koval   | Lviv          | KB-01       | Keyboard     | 49.90      | 1
1        | 2026-03-01 | olena@example.com | Olena Koval   | Lviv          | MS-02       | Mouse        | 19.90      | 2
2        | 2026-03-02 | taras@example.com | Taras Melnyk  | Kyiv          | MS-02       | Mouse        | 19.90      | 1
```

Аномалії:
- **Аномалія оновлення**: Олена переїжджає до Києва — треба оновити кожен її рядок, а пропущений рядок лишає суперечливі дані.
- **Аномалія вставлення**: новий товар не зберегти, доки хтось його не замовить.
- **Аномалія видалення**: видалення єдиного замовлення Тараса видаляє все, що ми знаємо про Тараса.

## Крок за кроком

- **1НФ** — атомарні значення, ключ. Тут уже виконано; ключ — `(order_id, product_sku)`.
- **2НФ** — жодної часткової залежності від частини складеного ключа: `order_date` і `customer_*` залежать лише від `order_id`; `product_name` і `unit_price` — лише від `product_sku`. Виносимо `orders(order_id, order_date, customer_…)` і `products(sku, name, price)`; лишається `order_items(order_id, product_sku, quantity)`.
- **3НФ** — жодної транзитивної залежності: в `orders` `customer_name` і `customer_city` залежать від `customer_email`, а не від `order_id`. Переносимо їх у `customers(id, email, name, city)` і лишаємо `orders(id, order_date, customer_id)`.

```sql
INSERT INTO customers (email, name, city)
SELECT DISTINCT customer_email, customer_name, customer_city FROM order_rows;

INSERT INTO orders (id, order_date, customer_id)
SELECT DISTINCT r.order_id, r.order_date, c.id
FROM order_rows r JOIN customers c ON c.email = r.customer_email;
```

Нюанс із реального життя: якщо ціна товару змінюється, старі замовлення мають зберегти ціну, за якою їх продали. Тож `order_items` зазвичай зберігає власну `unit_price` — це не помилка нормалізації, а інший факт («ціна на момент продажу»). Інтерв'юерам подобається, коли ви це помічаєте.

Цю міграцію ви зробите самі в SQL-практиці цього модуля.

## Типи індексів поруч (П113)

```sql
CREATE CLUSTERED INDEX cx_orders ON orders (id);                 -- SQL Server: фізичний порядок таблиці
CREATE INDEX ix_orders_customer ON orders (customer_id) INCLUDE (order_date, total);   -- покривний
CREATE UNIQUE INDEX ux_customers_email ON customers (email);    -- унікальність + швидкий пошук
CREATE INDEX ix_orders_open ON orders (created_at) WHERE status = 'open';   -- фільтрований / частковий
CREATE NONCLUSTERED COLUMNSTORE INDEX cs_sales ON sales (product_id, qty, amount);   -- аналітика
CREATE INDEX ix_docs_body ON docs USING GIN (to_tsvector('english', body));   -- повнотекстовий у PostgreSQL
```

## Читаємо план виконання (П116)

```text
Nested Loops (Inner Join)                    cost 38%
├── Index Seek  ix_orders_customer           Actual rows 12 / Estimated 10
└── Key Lookup  cx_orders                    Executions 12   ← дочитування колонок, яких немає в індексі
```

На що дивитися: **Scan** проти **Seek** (скан великої таблиці для селективного фільтра означає відсутній чи непридатний індекс); **Key Lookup / RID Lookup**, повторений багато разів (зробіть індекс покривним); великий розрив між **оціненими й фактичними рядками** (застаріла статистика чи parameter sniffing — план збудовано для інших значень); **Sort** і **Hash Match** з вивантаженням у tempdb (попередження про виділення пам'яті); товсті стрілки (багато рядків між операторами); попередження про неявні перетворення. У PostgreSQL: `EXPLAIN (ANALYZE, BUFFERS)` показує `Seq Scan`, `Index Scan`, `Index Only Scan`, оцінки `rows=` проти `actual rows` і влучання/читання буферів.
