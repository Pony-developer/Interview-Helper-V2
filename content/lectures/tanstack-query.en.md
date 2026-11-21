---
skill: tanstack-query
title: "TanStack Query: managing server state in the browser"
summary: "Why server data needs different tools from client state, query keys and caching, stale time versus garbage collection, invalidation, mutations with optimistic updates, and the common mistakes that cause stale screens and duplicate requests."
readingMinutes: 9
---

Most state in a web app is not really the app's state: it is a copy of data that lives on a server. The copy can be stale, it's shared between components, and it's loaded asynchronously. TanStack Query (formerly React Query) manages exactly that: fetching, caching, refreshing and updating server data, so components don't reimplement those rules with `useEffect` and `useState`.

## Server state is not client state

Client state (whether a modal is open, which tab is selected) lives only in the browser and is always current. **Server state** is a snapshot that can be out of date the moment it arrives. Mixing the two in one store is a common source of bugs. Keep server data in a query cache, and client-only UI state in `useState` or a small store.

## Queries and keys

```ts
const { data, isPending, error } = useQuery({
  queryKey: ["orders", { status: "open" }],
  queryFn: () => fetchOrders({ status: "open" }),
});
```

The **query key** identifies the cached data. Two components asking for the same key share one request and one cache entry. Include every value the result depends on in the key, and nothing else: if the key is `["orders"]` but the data depends on a filter, filtered and unfiltered results overwrite each other.

## Stale time and garbage collection

- **`staleTime`** (default 0) says how long data counts as fresh. Fresh data is not refetched on mount or focus. Raise it for data that changes rarely.
- **`gcTime`** (default 5 minutes) says how long unused data stays in memory after the last component stops using it.

A query refetches on window focus, reconnect and mount when its data is stale. That default is usually right, and it means users see fresh data without writing refresh code.

## Mutations and invalidation

Writes go through `useMutation`. After a successful write, mark the affected queries as stale so they refetch:

```ts
const queryClient = useQueryClient();
const addOrder = useMutation({
  mutationFn: createOrder,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
});
```

For a snappy interface, update the cache **optimistically**: write the expected result into the cache in `onMutate`, keep the previous value for rollback, and restore it in `onError`. Invalidate again in `onSettled` so the cache matches the server.

## Common mistakes

- **Copying query data into local state**: the copy never updates. Read the query result directly, or derive from it.
- **Unstable query keys**: a key built from a new object each render is fine (the library hashes it), but a key that includes a timestamp refetches forever.
- **Forgetting `enabled`**: a query that depends on an id that isn't available yet should set `enabled: Boolean(id)` instead of calling the API with `undefined`.
- **Using it for data that never changes** on the server: a static config belongs in the bundle or a long `staleTime`.
- **Treating `isLoading` as the only state**: a query with cached data may be refetching in the background. Read `isPending` for "no data yet" and `isFetching` for "refreshing".

## Interview checklist

- Explain the difference between server state and client state, with an example of each.
- Explain query keys and why they must include every input the result depends on.
- Explain `staleTime` versus `gcTime`, and when a query refetches.
- Describe invalidation after a mutation, and when to use an optimistic update.
- Name two common mistakes that cause stale screens.
