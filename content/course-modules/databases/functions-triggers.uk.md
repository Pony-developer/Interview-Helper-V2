PostgreSQL уміє виконувати код усередині бази: **функції**, які викликають із SQL, і **тригери**, що автоматично викликають функції, коли змінюються дані.

## SQL-функції

```sql
CREATE FUNCTION order_total(p_order_id integer) RETURNS numeric
LANGUAGE sql STABLE AS $$
    SELECT coalesce(sum(quantity * unit_price), 0)
    FROM order_items
    WHERE order_id = p_order_id;
$$;

SELECT id, order_total(id) FROM orders;
```

- `$$ … $$` — це **доларові лапки**: рядковий літерал, у якому не треба екранувати одинарні лапки.
- **Мінливість** (volatility) підказує планувальнику, що може робити функція: `IMMUTABLE` (ті самі входи → той самий результат назавжди, як `lower`), `STABLE` (той самий результат у межах однієї інструкції, може читати таблиці), `VOLATILE` (будь-що, типово; як `random()` чи функції, що пишуть). В індексах за виразами можна використовувати лише `IMMUTABLE`-функції.
- Функція може повертати набір рядків: `RETURNS TABLE (id integer, name text)` або `RETURNS SETOF products`.

## PL/pgSQL

Для логіки зі змінними, умовами, циклами й обробкою помилок використовуйте процедурну мову **PL/pgSQL**:

```sql
CREATE FUNCTION transfer(p_from integer, p_to integer, p_amount numeric) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    v_balance numeric;
BEGIN
    SELECT balance INTO v_balance FROM accounts WHERE id = p_from FOR UPDATE;
    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds: % < %', v_balance, p_amount
            USING ERRCODE = 'P0001';
    END IF;
    UPDATE accounts SET balance = balance - p_amount WHERE id = p_from;
    UPDATE accounts SET balance = balance + p_amount WHERE id = p_to;
END;
$$;
```

Функція виконується всередині транзакції того, хто її викликав: якщо вона кидає виняток, усе зроблене нею відкочується разом із транзакцією. Блоки `BEGIN … EXCEPTION WHEN … THEN … END` перехоплюють помилки (усередині вони використовують точку збереження, що має свою ціну). **Процедури** (`CREATE PROCEDURE`, викликаються через `CALL`) можуть ще й робити `COMMIT` у своєму тілі, що допомагає в пакетних задачах.

## Тригери

Тригер пов'язує функцію з подією в таблиці:

```sql
CREATE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```

Складові тригера:

| Вибір | Варіанти |
|---|---|
| Коли | `BEFORE`, `AFTER` або `INSTEAD OF` (лише для представлень) |
| Подія | `INSERT`, `UPDATE` (за бажання `UPDATE OF стовпець`), `DELETE`, `TRUNCATE` |
| Гранулярність | `FOR EACH ROW` або `FOR EACH STATEMENT` |
| Умова | `WHEN (OLD.price IS DISTINCT FROM NEW.price)` |

Усередині функції рядкового тригера:

- `NEW` — новий рядок (для `INSERT` і `UPDATE`), `OLD` — старий (для `UPDATE` і `DELETE`); `TG_OP` каже, яка подія спрацювала.
- Тригер `BEFORE` може **змінити** `NEW` перед записом або повернути `NULL`, щоб тихо пропустити рядок.
- Тригер `AFTER` бачить остаточний рядок і використовується для побічних ефектів: журналів аудиту, таблиць історії, сповіщень (`pg_notify`). Його значення, що повертається, ігнорується.

## Коли використовувати тригери

Добрі застосування:

- позначки часу `updated_at`;
- таблиці аудиту й історії («хто що змінив і коли»);
- підтримка денормалізованого лічильника чи суми в тій самій транзакції;
- правило, яке не можна виразити обмеженнями.

Аргументи проти, які інтерв'юери теж люблять чути:

- **Прихована поведінка**: розробник, читаючи код застосунку, не бачить, що `UPDATE` записує ще три таблиці.
- **Продуктивність**: рядковий тригер виконується для кожного рядка; масове оновлення мільйона рядків запустить його мільйон разів.
- **Каскади**: тригери, що змінюють таблиці з власними тригерами, важко аналізувати.

Збалансована позиція: тримайте тригери невеликими й зосередженими на цілісності даних, а бізнес-процеси (надіслати лист, викликати платіжний API) — у застосунку, найкраще через таблицю outbox, яку обробляє окремий обробник.
