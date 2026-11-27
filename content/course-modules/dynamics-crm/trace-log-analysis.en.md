Users complain that saving is slow and some saves fail. Logging to the plug-in trace log was switched to *All* for a while, and now you have one row per plug-in execution. Find the steps worth looking at.

The practice database has the table `plugintracelog`, cut down to a few of its real columns: the plug-in class (`typename`), the message (`messagename`), the table (`primaryentity`), the duration in milliseconds (`performanceexecutionduration`) and the exception text (`exceptiondetails`, `NULL` or empty when the execution succeeded). Open **Practice database** above the editor to see the rows.

Group the executions by plug-in, message and table, and return the groups that are **slow** (average duration of 1,000 ms or more) or that **failed at least once**, with columns:

- `plugin`: the type name,
- `message`: the message and the table separated by a space, such as `Update account`,
- `runs`: the number of executions,
- `avg_ms`: the average duration rounded to a whole number,
- `max_ms`: the longest duration,
- `failures`: executions with a non-empty `exceptiondetails`.

Order by `failures` from most to fewest, then by `avg_ms` from slowest. Expected output:

```text
              plugin               |      message       | runs | avg_ms | max_ms | failures
-----------------------------------+--------------------+------+--------+--------+----------
 Contoso.Plugins.ErpSync           | Update account     |    3 |   1667 |   3000 |        1
 Contoso.Plugins.ContactValidation | Create contact     |    3 |     50 |     60 |        1
 Contoso.Plugins.InvoiceTotals     | Create new_invoice |    3 |   2200 |   2600 |        0
(3 rows)
```

Check the interesting rows: the same `ContactValidation` class appears once, for Create, because its Update step is fast and never failed. An empty string in `exceptiondetails` (on an AccountPreUpdate row) is not a failure.

Hint: `count(*) FILTER (WHERE ...)` counts the rows of a group that match a condition, and `coalesce(exceptiondetails, '') <> ''` treats `NULL` and empty alike. Repeat the conditions in `HAVING`, because output aliases cannot be used there.
