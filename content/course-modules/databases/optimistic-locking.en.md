Ann and Bob both opened the document "Release notes" when it was at **version 1**. Ann saves first; then Bob saves. With the naive `UPDATE`s in the editor, Bob silently overwrites Ann's work: a lost update.

Rewrite the script with **optimistic locking** using the `version` column:

1. **Ann saves** (she loaded version 1): set `body` to `Draft + Ann's changes`, increase `version` by one, but only if the version is still 1. Return `id, version`.
2. **Bob saves** (he also loaded version 1) the text `Draft + Bob's changes` the same way. His update must change **nothing**, because the version is now 2: `RETURNING` returns no rows, which is how the application detects the conflict.
3. **Bob reloads** the document: select its `body` and `version`.
4. **Bob saves the merged text** `Draft + Ann's and Bob's changes`, this time with the version he has just read.

Remember that a single quote inside a SQL string is written twice: `'Draft + Ann''s changes'`.

Expected output:

```text
 id | version
----+---------
  1 |       2
(1 row)

 id | version
----+---------
(0 rows)

         body          | version
-----------------------+---------
 Draft + Ann's changes |       2
(1 row)

 id | version
----+---------
  1 |       3
(1 row)

 id |     title     |              body               | version
----+---------------+---------------------------------+---------
  1 | Release notes | Draft + Ann's and Bob's changes |       3
(1 row)
```

Here the two "users" run one after another in a single script, but the same `UPDATE … WHERE version = …` works under real concurrency: the check and the write happen in one atomic statement.
