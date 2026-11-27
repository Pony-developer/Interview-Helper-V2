A rollup column is an aggregate over child records that the platform stores on the parent. Writing the same aggregate in SQL shows exactly what the rollup definition means, including its filters and the base currency.

The practice database has two Dataverse tables with their real logical names, cut down to a few columns: `account` and `opportunity`. `opportunity.parentaccountid` is the lookup to the account. Opportunities are in different currencies: `estimatedvalue` is in the opportunity's own currency, and `exchangerate` says how many units of that currency equal one US dollar, the base currency. Open **Practice database** above the editor to see the rows.

The sales team wants two rollup columns on account:

- **Open opportunities**: `COUNT` of related opportunities where `statecode = 0` (Open).
- **Open pipeline (base)**: `SUM` of `estimatedvalue_base` of the same opportunities, where `estimatedvalue_base = estimatedvalue / exchangerate`.

Write the SQL query that returns these values for every **active** account, in columns `account`, `open_opportunities` and `pipeline_base`. Round `pipeline_base` to 2 decimals and show `0.00`, not `NULL`, for an account without open opportunities. Order by `pipeline_base` from largest to smallest, then by `account`. Expected output:

```text
     account     | open_opportunities | pipeline_base
-----------------+--------------------+---------------
 Contoso         |                  2 |     170000.00
 Fabrikam        |                  2 |     100000.00
 Litware         |                  1 |      20000.00
 Adventure Works |                  0 |          0.00
(4 rows)
```

Check the interesting rows: the EUR and UAH amounts are converted to dollars, so 45,000 EUR at 0.9 counts as 50,000. Won and lost opportunities are not counted. "Fabrikam upgrade" is open but has no estimated value: it is counted, but adds nothing to the sum. Northwind is inactive, so it is not in the result although it has an open opportunity.

Hint: the opportunity filter belongs in the `ON` clause of a `LEFT JOIN`, as in the FetchXML practice. `sum` over no rows is `NULL`, so wrap it in `coalesce`.
