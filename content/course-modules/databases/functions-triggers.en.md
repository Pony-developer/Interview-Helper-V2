PostgreSQL can run code inside the database: **functions** you call from SQL, and **triggers** that call functions automatically when data changes.

## SQL functions

```sql
CREATE FUNCTION order_total(p_order_id integer) RETURNS numeric
LANGUAGE sql STABLE AS $$
    SELECT coalesce(sum(quantity * unit_price), 0)
    FROM order_items
    WHERE order_id = p_order_id;
$$;

SELECT id, order_total(id) FROM orders;
```

- `$$ … $$` is **dollar quoting**: a string literal in which you do not need to escape single quotes.
- **Volatility** tells the planner what the function may do: `IMMUTABLE` (same inputs → same output forever, like `lower`), `STABLE` (same output within one statement, may read tables), `VOLATILE` (anything, the default, like `random()` or functions that write). Only `IMMUTABLE` functions can be used in index expressions.
- A function can return a set of rows: `RETURNS TABLE (id integer, name text)` or `RETURNS SETOF products`.

## PL/pgSQL

For logic with variables, conditions, loops and error handling, use the procedural language **PL/pgSQL**:

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

A function runs inside the caller's transaction: if it raises an exception, everything it did is rolled back with the transaction. `BEGIN … EXCEPTION WHEN … THEN … END` blocks catch errors (internally they use a savepoint, which has a cost). **Procedures** (`CREATE PROCEDURE`, invoked with `CALL`) can additionally `COMMIT` inside their body, which helps with batch jobs.

## Triggers

A trigger connects a function to an event on a table:

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

The parts of a trigger:

| Choice | Options |
|---|---|
| When | `BEFORE`, `AFTER`, or `INSTEAD OF` (views only) |
| Event | `INSERT`, `UPDATE` (optionally `UPDATE OF column`), `DELETE`, `TRUNCATE` |
| Granularity | `FOR EACH ROW` or `FOR EACH STATEMENT` |
| Condition | `WHEN (OLD.price IS DISTINCT FROM NEW.price)` |

Inside a row trigger function:

- `NEW` is the new row (for `INSERT` and `UPDATE`), `OLD` the old one (for `UPDATE` and `DELETE`); `TG_OP` says which event fired.
- A `BEFORE` trigger can **change** `NEW` before it is written, or return `NULL` to skip the row silently.
- An `AFTER` trigger sees the final row and is used for side effects: audit logs, history tables, notifications (`pg_notify`). Its return value is ignored.

## When to use triggers

Good uses:

- `updated_at` timestamps;
- audit and history tables ("who changed what, when");
- keeping a denormalized counter or total in sync inside the same transaction;
- enforcing a rule that constraints cannot express.

Arguments against, which interviewers like to hear too:

- **Hidden behaviour**: a developer reading the application code does not see that an `UPDATE` writes three other tables.
- **Performance**: a row trigger runs once per row; a bulk update of a million rows runs it a million times.
- **Cascades**: triggers that change tables with their own triggers are hard to reason about.

A balanced position: keep triggers small and focused on data integrity, and keep business workflows (send an email, call a payment API) in the application, ideally via an outbox table that a worker processes.
