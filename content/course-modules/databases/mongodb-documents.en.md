MongoDB stores **documents**: JSON-like objects grouped into **collections**, which live in a **database**.

| Relational | MongoDB |
|---|---|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Primary key | `_id` |
| Join | Embedding, or `$lookup` |
| Index | Index |

## Documents and BSON

```js
{
  _id: ObjectId("66a1f0c2e4b0a1b2c3d4e5f6"),
  name: "4K Monitor",
  category: "electronics",
  price: NumberDecimal("329.00"),
  tags: ["display", "bestseller"],
  specs: { size: 27, color: "black" },
  createdAt: ISODate("2024-06-01T10:00:00Z")
}
```

- Documents are stored as **BSON** (binary JSON), which adds types JSON lacks: dates, 32/64-bit integers, `Decimal128` (use it for money), binary data and `ObjectId`.
- Every document has an `_id`, unique in its collection. By default the driver generates an **ObjectId**: 12 bytes made of a timestamp, a random value and a counter. It is roughly time-ordered, so `_id` also tells when the document was created.
- Fields can hold arrays and nested documents, so one document can represent what would be several joined tables in SQL.
- A document may be at most **16 MB**.
- There is no fixed schema: two documents in a collection can have different fields. You can still enforce one with **schema validation** (`$jsonSchema`) on the collection.

## Create

The examples use `mongosh`, the MongoDB shell; driver APIs (Node.js, Python, C#, Java) look almost the same.

```js
db.products.insertOne({ name: "Chess Set", category: "games", price: 35, tags: ["gift"] })
db.products.insertMany([
  { name: "Puzzle 1000", category: "games", price: 14.5 },
  { name: "Seed Kit", price: 9.99 }                 // no category: allowed
])
```

Collections and databases are created on first insert.

## Read

```js
db.products.find()                                          // everything
db.products.find({ category: "games" })                     // equality
db.products.find({ price: { $gte: 20, $lt: 100 } })         // range
db.products.find({ category: { $in: ["games", "books"] } }) // IN
db.products.find({ "specs.color": "black" })                // nested field: dot notation
db.products.find({ tags: "bestseller" })                    // array contains the value
db.products.find({ tags: { $all: ["gift", "bestseller"] } })// array contains all values
db.products.find({ discount: { $exists: true } })           // field present
db.products.find({ $or: [{ price: { $lt: 15 } }, { tags: "gift" }] })

db.products.find({ category: "games" }, { name: 1, price: 1, _id: 0 })   // projection
  .sort({ price: -1 })                                                    // ORDER BY price DESC
  .skip(20).limit(10)                                                     // OFFSET 20 LIMIT 10

db.products.findOne({ _id: ObjectId("66a1f0c2e4b0a1b2c3d4e5f6") })
db.products.countDocuments({ category: "games" })
```

Conditions in one object are combined with AND. Note two things that differ from SQL: a condition on an **array** field matches if **any element** matches, and a missing field simply does not match (there is no three-valued logic, but `{ field: null }` matches both `null` and a missing field).

## Update

Updates use **operators**:

```js
db.products.updateOne(
  { name: "Chess Set" },
  { $set: { price: 38.5, "specs.material": "wood" }, $inc: { stock: -1 } }
)
db.products.updateMany({ category: "games" }, { $mul: { price: 1.1 } })
db.products.updateOne({ name: "Chess Set" }, { $push: { tags: "classic" } })     // add to array
db.products.updateOne({ name: "Chess Set" }, { $addToSet: { tags: "gift" } })    // add if absent
db.products.updateOne({ name: "Chess Set" }, { $pull: { tags: "classic" } })     // remove from array
db.products.updateOne({ name: "Chess Set" }, { $unset: { discount: "" } })       // remove a field

// upsert: update, or insert if nothing matches
db.pageViews.updateOne({ page: "/home", day: "2024-09-01" }, { $inc: { views: 1 } }, { upsert: true })

// replace the whole document (except _id)
db.products.replaceOne({ name: "Seed Kit" }, { name: "Seed Kit", price: 8.99, category: "garden" })
```

Every operation on **one document** is atomic, including changes to several fields and nested arrays. That is why MongoDB modeling tries to keep data that changes together in one document. `findOneAndUpdate` returns the document before or after the change, like `UPDATE … RETURNING`.

## Delete

```js
db.products.deleteOne({ name: "Seed Kit" })
db.products.deleteMany({ stock: 0 })
db.products.deleteMany({})          // everything, careful
```

## In application code

```js
// Node.js driver
const products = client.db("shop").collection("products");
const cheap = await products.find({ price: { $lt: 30 } }).sort({ price: 1 }).toArray();
```

ODMs such as **Mongoose** add schemas, validation and middleware on top, much like ORMs do for SQL databases.
