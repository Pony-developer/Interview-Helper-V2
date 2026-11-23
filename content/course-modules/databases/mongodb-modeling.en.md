In SQL, you normalise first and let queries join the pieces. In MongoDB, the guiding rule is the opposite: **design for how the application reads and writes the data**. "Data that is accessed together should be stored together."

## Embed or reference?

**Embedding** puts related data inside the parent document:

```js
// an order with its lines and a snapshot of the shipping address
{
  _id: 1001,
  customerId: 42,
  status: "shipped",
  items: [
    { productId: 1, name: "SQL Basics", quantity: 2, price: 25.0 },
    { productId: 4, name: "Wireless Mouse", quantity: 1, price: 19.99 }
  ],
  shipping: { city: "Kyiv", street: "Khreshchatyk 1" }
}
```

One read returns the whole order, and changing it is a single atomic operation.

**Referencing** stores an id, like a foreign key:

```js
{ _id: 42, name: "Olena Koval", email: "olena@example.com" }     // customers
{ _id: 1001, customerId: 42, status: "shipped", … }              // orders
```

| Embed when | Reference when |
|---|---|
| The child belongs to the parent and is read with it (order lines, addresses) | The related entity is independent and has its own life (customers, products) |
| The relationship is one-to-few | One-to-many with **unbounded** growth (a user's page views, a post with 100,000 comments) |
| The embedded data rarely changes, or a snapshot is what you want | The data is shared by many parents and updated often |
| You need atomic updates across parent and child | The document would approach the 16 MB limit |

The **unbounded array** is the classic MongoDB anti-pattern: a document that grows forever gets slower to read, write and index, and eventually hits the size limit.

## Duplication is a tool

In the order above, the product `name` and `price` are copied into the line. For the price, that is a correct snapshot (exactly like `order_items.unit_price` in SQL). For the name, it is a deliberate denormalization: listing orders needs no lookup, at the cost of updating copies if a product is renamed (or accepting that old orders show the old name).

Ask two questions before duplicating: how often does the source change, and how bad is a stale copy?

## Common patterns

| Pattern | Idea | Example |
|---|---|---|
| **Subset** | Embed only the most used part, reference the rest | A product with its 10 newest reviews embedded; all reviews in a `reviews` collection |
| **Extended reference** | Copy the few fields you always show next to the id | `customer: { _id, name }` in each order |
| **Bucket** | Group many small items into documents per time window | One document per sensor per hour with an array of readings |
| **Computed** | Store precomputed values, updated on write | `ratingCount` and `ratingAvg` on a product |
| **Polymorphic** | Different shapes in one collection with a `type` field | Products of different kinds in `products` |
| **Schema versioning** | A `schemaVersion` field; migrate lazily on read | Evolving documents without downtime |

## Many-to-many

Students and courses: either store an array of course ids in each student (and/or student ids in each course), or a separate `enrollments` collection when the relationship has its own data (grade, date) or grows large. An array of references with a multikey index answers "courses of a student" and "students of a course" well.

## Schema validation

"Schemaless" really means "the schema lives in the application". You can enforce the important parts in the database:

```js
db.createCollection("orders", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["customerId", "status", "items"],
    properties: {
      status: { enum: ["new", "paid", "shipped", "cancelled"] },
      items:  { bsonType: "array", minItems: 1 }
    }
  } }
})
```

Unique indexes provide uniqueness. There are no foreign keys: referential integrity is the application's job, which is one of the real costs of the model.

## The SQL perspective

Modeling an order as one document is close to a PostgreSQL row with a `jsonb items` column, and an "extended reference" is a denormalized column. The difference is the default: SQL starts normalised and denormalises where measurements say so; MongoDB starts from the access patterns and normalises (references) where growth or sharing demands it.
