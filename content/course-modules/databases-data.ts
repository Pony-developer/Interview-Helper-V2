/**
 * Practice databases of the "Databases" course. Each SQL practice runs its `setup` on a fresh
 * PostgreSQL (PGlite) database, then the learner's code. Most practices share the online shop below,
 * so learners get to know one schema well.
 */

/** Online shop: categories, products, customers, orders, order_items. */
export const SHOP = `CREATE TABLE categories (
    id   integer PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE products (
    id          integer PRIMARY KEY,
    name        text NOT NULL,
    category_id integer REFERENCES categories (id),
    price       numeric(10, 2) NOT NULL CHECK (price >= 0),
    stock       integer NOT NULL DEFAULT 0
);

CREATE TABLE customers (
    id         integer PRIMARY KEY,
    name       text NOT NULL,
    email      text UNIQUE,
    city       text,
    created_at date NOT NULL
);

CREATE TABLE orders (
    id          integer PRIMARY KEY,
    customer_id integer NOT NULL REFERENCES customers (id),
    status      text NOT NULL CHECK (status IN ('new', 'paid', 'shipped', 'cancelled')),
    ordered_at  date NOT NULL
);

CREATE TABLE order_items (
    order_id   integer REFERENCES orders (id),
    product_id integer REFERENCES products (id),
    quantity   integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

INSERT INTO categories (id, name) VALUES
    (1, 'Books'), (2, 'Electronics'), (3, 'Games'), (4, 'Garden');

INSERT INTO products (id, name, category_id, price, stock) VALUES
    (1,  'SQL Basics',          1,     25.00,  40),
    (2,  'Postgres Internals',  1,     48.50,  12),
    (3,  'Mongo in Action',     1,     39.90,   0),
    (4,  'Wireless Mouse',      2,     19.99, 150),
    (5,  'Mechanical Keyboard', 2,     89.00,  35),
    (6,  '4K Monitor',          2,    329.00,   8),
    (7,  'Chess Set',           3,     35.00,  20),
    (8,  'Puzzle 1000',         3,     14.50,  60),
    (9,  'Garden Hose',         4,     22.00,   0),
    (10, 'Seed Kit',            NULL,   9.99, 100);

INSERT INTO customers (id, name, email, city, created_at) VALUES
    (1, 'Olena Koval',       'olena@example.com',  'Kyiv',  '2024-01-15'),
    (2, 'Taras Melnyk',      'taras@example.com',  'Lviv',  '2024-02-03'),
    (3, 'Iryna Bondar',      'iryna@example.com',  'Kyiv',  '2024-03-21'),
    (4, 'Andrii Shevchenko', NULL,                 'Odesa', '2024-04-10'),
    (5, 'Sofia Tkachenko',   'sofia@example.com',  NULL,    '2024-05-05'),
    (6, 'Maksym Kravets',    'maksym@example.com', 'Lviv',  '2024-06-18');

INSERT INTO orders (id, customer_id, status, ordered_at) VALUES
    (1, 1, 'shipped',   '2024-06-01'),
    (2, 1, 'paid',      '2024-06-15'),
    (3, 2, 'shipped',   '2024-06-20'),
    (4, 3, 'cancelled', '2024-07-02'),
    (5, 3, 'shipped',   '2024-07-10'),
    (6, 4, 'new',       '2024-07-15'),
    (7, 1, 'shipped',   '2024-08-01'),
    (8, 2, 'paid',      '2024-08-05');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 2,  25.00), (1, 4, 1,  19.99),
    (2, 6, 1, 329.00),
    (3, 5, 1,  89.00), (3, 8, 2,  14.50),
    (4, 7, 1,  35.00),
    (5, 2, 1,  48.50), (5, 1, 1,  25.00),
    (6, 9, 3,  22.00),
    (7, 7, 2,  35.00), (7, 4, 2,  19.99),
    (8, 3, 1,  39.90);
`;

/** A small company: departments, salaries and who reports to whom. */
export const COMPANY = `CREATE TABLE employees (
    id         integer PRIMARY KEY,
    name       text NOT NULL,
    department text NOT NULL,
    salary     integer NOT NULL,
    manager_id integer REFERENCES employees (id),
    hired_on   date NOT NULL
);

INSERT INTO employees (id, name, department, salary, manager_id, hired_on) VALUES
    (1,  'Oksana',   'Management',  9000, NULL, '2018-03-01'),
    (2,  'Bohdan',   'Engineering', 6000, 1,    '2019-05-13'),
    (3,  'Dmytro',   'Engineering', 4500, 2,    '2020-09-01'),
    (4,  'Kateryna', 'Engineering', 5200, 2,    '2020-01-20'),
    (5,  'Yulia',    'Engineering', 4500, 2,    '2021-11-08'),
    (6,  'Roman',    'Sales',       5000, 1,    '2019-02-11'),
    (7,  'Natalia',  'Sales',       3800, 6,    '2022-04-04'),
    (8,  'Petro',    'Sales',       4100, 6,    '2021-06-15'),
    (9,  'Halyna',   'Marketing',   4700, 1,    '2020-07-07'),
    (10, 'Vasyl',    'Marketing',   3900, 9,    '2023-01-09'),
    (11, 'Lesia',    'Engineering', 3600, 3,    '2024-02-26');
`;

/** Daily revenue of two stores, for window functions. */
export const DAILY_SALES = `CREATE TABLE daily_sales (
    store  text NOT NULL,
    day    date NOT NULL,
    amount numeric(10, 2) NOT NULL,
    PRIMARY KEY (store, day)
);

INSERT INTO daily_sales (store, day, amount) VALUES
    ('Kyiv', '2024-09-01', 120.00), ('Kyiv', '2024-09-02',  80.00), ('Kyiv', '2024-09-03', 150.00),
    ('Kyiv', '2024-09-04',  60.00), ('Kyiv', '2024-09-05', 200.00),
    ('Lviv', '2024-09-01',  90.00), ('Lviv', '2024-09-02', 110.00), ('Lviv', '2024-09-03',  70.00),
    ('Lviv', '2024-09-04', 130.00), ('Lviv', '2024-09-05', 100.00);
`;

/**
 * `try_sql(statement)` runs a statement and reports how it ended: `ok`, or the kind of error
 * (`unique_violation`, `check_violation`…). Lets a practice test constraints without stopping at the
 * first rejected row.
 */
export const TRY_SQL = `CREATE FUNCTION try_sql(statement text) RETURNS text
LANGUAGE plpgsql AS $$
BEGIN
    EXECUTE statement;
    RETURN 'ok';
EXCEPTION
    WHEN unique_violation      THEN RETURN 'unique_violation';
    WHEN check_violation       THEN RETURN 'check_violation';
    WHEN not_null_violation    THEN RETURN 'not_null_violation';
    WHEN foreign_key_violation THEN RETURN 'foreign_key_violation';
    WHEN others                THEN RETURN 'error: ' || SQLERRM;
END;
$$;
`;

/** The starter of most query practices. */
export const WRITE_QUERY = "-- Write your query here\n";
