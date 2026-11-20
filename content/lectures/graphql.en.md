---
skill: graphql
title: "GraphQL: schemas, queries, resolvers and the N+1 problem"
summary: "What GraphQL solves compared with REST, the schema and type system, queries, mutations and variables, how resolvers execute, nullability and partial errors, DataLoader batching, client-side normalised caching, and protecting the API from expensive queries."
readingMinutes: 9
---

GraphQL is a query language for APIs. The server publishes a typed **schema**; clients send a query describing exactly the data they need, usually as a `POST` to a single `/graphql` endpoint, and get back JSON shaped like the query.

## Why teams pick it

- **No over-fetching or under-fetching.** A profile screen asks for `name` and `avatarUrl` and nothing else, and gets the user, their last five posts and each post's comment count in one round trip instead of several REST calls.
- **A typed contract.** The schema is introspectable, so tools generate TypeScript types and editors autocomplete queries.
- **Evolution without versions.** Add fields freely and mark old ones `@deprecated`.

The trade-offs: HTTP caching and CDNs work less naturally, query cost is harder to predict, and the server needs more care (N+1 queries, limits).

## Schema and operations

```graphql
type User {
  id: ID!
  name: String!
  email: String          # nullable
  posts(first: Int = 10): [Post!]!
}
type Query    { user(id: ID!): User }
type Mutation { renamePost(id: ID!, title: String!): Post! }
```

`!` means non-null. `[Post!]!` is a non-null list of non-null posts. There are three operation types: **query** (read), **mutation** (write, executed in order) and **subscription** (a stream of events, usually over WebSockets).

```graphql
query Profile($id: ID!) {
  user(id: $id) { name posts(first: 5) { id title } }
}
```

Always pass inputs as **variables** (`{ "id": "42" }`) instead of interpolating them into the query string. That avoids injection into the query, lets the server validate types, and keeps the query text constant, which enables persisted queries and caching.

## Resolvers and execution

Each field has a **resolver** `(parent, args, context) => value`. Execution walks the query: `Query.user` returns a user, then `User.posts` runs with that user as `parent`, and so on. Fields at the same level resolve in parallel.

Naive resolvers cause the **N+1 problem**: one query for 50 posts, then `Post.author` runs 50 times and makes 50 more queries. The standard fix is **DataLoader**: during one tick it collects every `load(id)` call, issues a single batched query (`WHERE id IN (…)`), and caches results per request.

## Errors and nullability

A GraphQL response usually has HTTP status `200`, even when something failed:

```json
{ "data": { "user": null }, "errors": [{ "message": "…", "path": ["user", "name"] }] }
```

Clients must check `errors`, not only the status code. When a **non-null** field fails, its `null` propagates to the nearest nullable parent: if `User.name: String!` throws, the whole `user` becomes `null`. Make fields nullable where partial results are acceptable, so one failing field doesn't wipe out a whole screen.

## Client caching

Apollo Client and urql (Graphcache) keep a **normalised cache**: every object is stored once under `__typename:id`. A mutation that returns the changed object's `id` and fields updates every query showing it automatically. Creating or deleting items is different: the cache doesn't know which lists should change, so you update them yourself (`cache.modify`, `update`) or refetch the affected queries. Always request `id` so objects can be normalised.

## Protecting the server

One request can ask for a lot: deeply nested relations (`posts { author { posts { author … } } }`) or huge lists. Defences:

- limit query **depth** and estimated **complexity/cost**;
- cap list sizes and use pagination (`first`, `after` cursors);
- allow only **persisted queries** (an allow-list of known operations) for first-party clients;
- disable introspection in production if the schema is private, and rate-limit by cost, not just by request count.

## Interview checklist

- Compare GraphQL and REST, including caching and error handling.
- Read a schema: what `!` and `[T!]!` mean; query vs mutation vs subscription.
- Explain resolvers, the N+1 problem and how DataLoader fixes it.
- Explain partial data with `errors` and null propagation.
- Describe normalised caching and why new items don't appear in lists automatically.
