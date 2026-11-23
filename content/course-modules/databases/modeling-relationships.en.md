## From requirements to tables

A practical way to design a schema:

1. List the **entities** (nouns): customer, product, order, category, tag.
2. List their **attributes** and decide which are required (`NOT NULL`) and unique.
3. Find the **relationships** and their cardinality ("one customer has many orders").
4. Add constraints for the business rules: `CHECK`, `UNIQUE`, foreign keys.
5. Think about the main queries, and add indexes for them.

An entity-relationship (ER) diagram draws this: boxes for tables, lines for foreign keys, with "crow's feet" marking the "many" end.

## One-to-many

The most common relationship. The foreign key goes on the "many" side:

```sql
CREATE TABLE orders (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id integer NOT NULL REFERENCES customers (id)
);
CREATE INDEX ON orders (customer_id);   -- foreign keys are not indexed automatically
```

`NOT NULL` makes the relationship mandatory (an order must have a customer); without it, it is optional.

## Many-to-many

A product can have many tags, and a tag can be on many products. Neither side can hold a single foreign key, so a **junction table** (also called a link, bridge or associative table) holds the pairs:

```sql
CREATE TABLE product_tags (
    product_id integer NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    tag_id     integer NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)          -- each pair at most once
);
CREATE INDEX ON product_tags (tag_id);         -- the PK index covers lookups by product_id
```

The composite primary key prevents duplicate pairs and serves lookups by `product_id`; a second index serves "all products with this tag". The junction table can carry attributes of the relationship itself: `order_items` is a junction between orders and products with `quantity` and `unit_price`.

## One-to-one

A user and their profile, an order and its shipment. Either share the primary key, or put a **unique** foreign key on one side:

```sql
CREATE TABLE user_profiles (
    user_id integer PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    bio     text,
    avatar  text
);
```

Splitting one-to-one is useful when the extra columns are large, rarely read, optional, or have different access rights.

## Hierarchies

A tree in one table uses a self-referencing foreign key (the **adjacency list**): `employees.manager_id → employees.id`, `categories.parent_id → categories.id`. Query it with recursive CTEs. Alternatives for read-heavy trees: a **materialized path** (`'1.4.17'`, PostgreSQL even has the `ltree` type), or a **closure table** storing every ancestor–descendant pair.

## Keys: surrogate or natural

- A **natural key** comes from the domain: an email, an ISBN, a country code.
- A **surrogate key** is meaningless: an identity number or a UUID.

Most tables use a surrogate primary key, because natural values change (people change emails), and a primary key change would have to cascade into every referencing table. Keep the natural key as a `UNIQUE` constraint, so the business rule is still enforced.

`bigint` identity vs `uuid`: identity values are small, fast and ordered, but reveal how many rows you have and need the database to generate them. UUIDs can be generated anywhere, are safe to expose and merge across systems, but are larger; random UUID v4 values scatter inserts across the index, which is why time-ordered **UUID v7** is the modern choice.

## Polymorphic data

Products of different kinds have different attributes. Options:

| Design | Idea | Trade-off |
|---|---|---|
| One table, nullable columns | `pages`, `resolution`, `color`… | Many NULLs, but simple |
| Table per type | `books`, `monitors` sharing `products.id` | Clean, but more joins and tables |
| `jsonb` column | Common columns + `attributes jsonb` | Flexible and indexable; weaker validation |
| Entity–attribute–value | Rows `(product_id, attribute, value)` | Very flexible, painful to query and type: usually an anti-pattern |

In PostgreSQL, "relational columns for what you filter and join on, `jsonb` for the long tail" is a strong default. That is already halfway to a document database, which is where the NoSQL part of the course starts.
