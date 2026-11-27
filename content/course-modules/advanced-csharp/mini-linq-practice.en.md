## Task

Re-implement three LINQ operators as **iterators** to see deferred, streaming execution with your own eyes. Each one logs what it does.

1. **`MyWhere(predicate)`**: for each source item, print `where <item>`, then yield it if the predicate is true.
2. **`MySelect(selector)`**: for each source item, print `select <item>`, then yield the projected value.
3. **`MyTake(count)`**: yield the first `count` items and then **stop pulling** from the source (`yield break` right after the last one, without asking the source for another item).

Look at the expected output carefully:

- `query built` comes first: nothing runs when the query is created.
- `8` appears although it was inserted **after** the query was built: deferred execution sees the current list.
- Items flow one at a time through all three operators (`where 8`, `select 8`, `got 80`), and enumeration stops after two results, so 3–6 are never examined.
- `Count()` enumerates the query **again**, so all the logging repeats.

Expected output:

```
query built
where 8
select 8
got 80
where 1
where 2
select 2
got 20
where 8
select 8
where 1
where 2
select 2
count again: 2
```
