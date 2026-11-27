Every view in a model-driven app is a query underneath. Start with the simplest one: the *Active Accounts* view.

The practice database has two Dataverse tables with their real logical names, cut down to a few columns: `account` and `contact`. `statecode` is `0` for Active and `1` for Inactive. Open **Practice database** above the editor to see the rows.

Write a SQL query that returns the **name** and **city** (`address1_city`) of every **active** account, sorted by name from A to Z. Expected output:

```text
       name       | address1_city
------------------+---------------
 Adventure Works  | Odesa
 Alpine Ski House | Lviv
 Contoso          | Kyiv
 Fabrikam         | Lviv
 Litware          | Kyiv
(5 rows)
```

Northwind is missing on purpose: it is inactive.

Hint: you need three parts: `SELECT` the two columns `FROM account`, keep only the rows `WHERE statecode = 0`, and `ORDER BY name`.
