## RETURNING

`INSERT`, `UPDATE` і `DELETE` можуть повертати рядки, яких торкнулися, що заощаджує зайвий запит:

```sql
INSERT INTO users (email, name) VALUES ('ann@example.com', 'Ann')
RETURNING id, created_at;               -- згенеровані значення

UPDATE products SET stock = stock - 1 WHERE id = 4 AND stock > 0
RETURNING stock;                        -- рядка немає = товару не було в наявності

DELETE FROM sessions WHERE expires_at < now()
RETURNING user_id;                      -- кого розлогінено
```

`RETURNING` — можливість PostgreSQL (у SQL Server є `OUTPUT`, у MySQL для `UPDATE` нічого подібного немає). ORM використовують її, щоб отримати id після вставки.

Шаблон `UPDATE … WHERE stock > 0 RETURNING` вище — це ще й **атомарне** «зменшити, якщо можна»: перевірка і зміна відбуваються в одній інструкції, тож два покупці не можуть обидва забрати останню одиницю товару.

## Upsert: INSERT … ON CONFLICT

«Вставити рядок або оновити його, якщо він уже існує» називають **upsert**. Робити це в застосунку як «SELECT, потім INSERT або UPDATE» — це стан гонки. PostgreSQL робить це атомарно:

```sql
INSERT INTO products (id, name, category_id, price, stock)
VALUES (4, 'Wireless Mouse', 2, 17.99, 0)
ON CONFLICT (id) DO UPDATE
SET price = EXCLUDED.price;
```

- **Ціль конфлікту** `(id)` має відповідати унікальному індексу чи обмеженню (первинний ключ теж підходить).
- `EXCLUDED` — рядок, який ви намагалися вставити; назва таблиці (`products.price`) вказує на наявний рядок.
- Можна додати умову: `DO UPDATE SET price = EXCLUDED.price WHERE products.price <> EXCLUDED.price`.
- `ON CONFLICT DO NOTHING` тихо пропускає дублікати, що ідеально для ідемпотентної обробки подій:

```sql
INSERT INTO processed_events (event_id) VALUES ('evt_123')
ON CONFLICT DO NOTHING
RETURNING event_id;     -- є рядок: уперше; немає рядка: уже оброблено
```

Атомарний підрахунок, наприклад переглядів сторінки за день:

```sql
INSERT INTO page_views (page, day, views) VALUES ('/home', current_date, 1)
ON CONFLICT (page, day) DO UPDATE SET views = page_views.views + 1;
```

Одна інструкція upsert не може торкнутися того самого рядка двічі: `VALUES (1, …), (1, …)` з `DO UPDATE` падає з «command cannot affect row a second time». Спершу приберіть дублікати з вхідних даних.

Аналог у MySQL — `INSERT … ON DUPLICATE KEY UPDATE`; SQLite запозичила синтаксис PostgreSQL.

## MERGE

`MERGE` (стандартний SQL, у PostgreSQL з версії 15) синхронізує таблицю з джерелом однією інструкцією з різними діями для рядків, що збіглися й не збіглися:

```sql
MERGE INTO products AS p
USING supplier_prices AS s ON s.product_id = p.id
WHEN MATCHED AND s.discontinued THEN
    DELETE
WHEN MATCHED THEN
    UPDATE SET price = s.price
WHEN NOT MATCHED THEN
    INSERT (id, name, price) VALUES (s.product_id, s.name, s.price);
```

`MERGE` гнучкіший (уміє видаляти й обробляє кілька умов), а `ON CONFLICT` побудований на унікальному індексі й безпечніший за паралельної роботи: `MERGE` усе ще може впасти з порушенням унікальності, якщо інша транзакція вставить той самий ключ у ту саму мить. Для звичайного upsert обирайте `ON CONFLICT`.
