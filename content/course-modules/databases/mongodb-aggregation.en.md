`find` filters and projects documents of one collection. For grouping, joining and reshaping, MongoDB has the **aggregation pipeline**: an array of **stages**, each taking a stream of documents and passing a new stream to the next one, like a Unix pipe.

```js
db.orders.aggregate([
  { $match: { status: { $ne: "cancelled" } } },                 // WHERE
  { $unwind: "$items" },                                         // one document per array element
  { $group: {                                                    // GROUP BY
      _id: "$items.category",
      revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      orders: { $addToSet: "$_id" }
  } },
  { $project: { _id: 0, category: "$_id", revenue: 1, orders: { $size: "$orders" } } },  // SELECT
  { $sort: { revenue: -1 } },                                    // ORDER BY
  { $limit: 5 }                                                  // LIMIT
])
```

## The main stages and their SQL twins

| Stage | Does | SQL |
|---|---|---|
| `$match` | Filters documents | `WHERE` (or `HAVING` after `$group`) |
| `$project`, `$set` / `$addFields`, `$unset` | Reshapes documents, computes fields | `SELECT` list |
| `$group` | Groups by `_id` and computes accumulators | `GROUP BY` + aggregates |
| `$sort`, `$skip`, `$limit` | Order and paging | `ORDER BY`, `OFFSET`, `LIMIT` |
| `$unwind` | One output document per element of an array | `CROSS JOIN LATERAL unnest(…)` |
| `$lookup` | Pulls matching documents from another collection into an array field | `LEFT JOIN` |
| `$count` | Counts documents | `count(*)` |
| `$facet` | Several sub-pipelines over the same input | Several queries at once |
| `$bucket`, `$bucketAuto` | Histogram buckets | `GROUP BY width_bucket(…)` |
| `$setWindowFields` | Running totals, ranks, moving averages | Window functions |
| `$merge`, `$out` | Writes the result to a collection | `INSERT INTO … SELECT`, materialized view |

Accumulators in `$group`: `$sum`, `$avg`, `$min`, `$max`, `$count`, `$first`, `$last`, `$push` (collect into an array), `$addToSet` (collect unique values). `{ $sum: 1 }` counts documents.

`"$field"` with a dollar sign means "the value of this field" inside expressions; without the dollar, it is a literal string.

## $lookup: joins exist

```js
db.orders.aggregate([
  { $match: { status: "shipped" } },
  { $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
  } },
  { $unwind: "$customer" },            // the lookup result is an array; turn it into an object
  { $project: { _id: 1, "customer.name": 1, total: 1 } }
])
```

`$lookup` is a left outer join, and it is reasonably fast with an index on `foreignField`. But it is not where MongoDB shines: if every request needs a `$lookup`, the data model probably should embed or duplicate that data instead (next lecture). Joins across shards have extra limitations.

## Writing efficient pipelines

- Put **`$match` and `$sort` early**, so they can use indexes and every later stage processes fewer documents. The optimizer moves some stages automatically, but do not count on it.
- **Project away** fields you do not need before heavy stages.
- `$group` and `$sort` that do not fit in 100 MB of memory spill to disk (`allowDiskUse`, on by default in recent versions) and become slower.
- Check the plan: `db.orders.explain("executionStats").aggregate([...])`. Look for `IXSCAN` (index used) vs `COLLSCAN` (full scan) in the first stage, and the number of documents examined.

## The same report in SQL and MongoDB

```sql
SELECT category, count(*) AS products, avg(price) AS avg_price
FROM products
GROUP BY category
ORDER BY category;
```

```js
db.products.aggregate([
  { $group: { _id: "$category", products: { $sum: 1 }, avg_price: { $avg: "$price" } } },
  { $sort: { _id: 1 } }
])
```

The pipeline is more verbose, but it composes nicely and is built from data (an array of objects), which makes generating queries in code easy. In the practice of this module you will translate MongoDB queries into PostgreSQL `jsonb` SQL and see how close the two models really are.
