FetchXML looks intimidating the first time, but it is just SQL written as XML. Every view, chart and many plug-ins use it, so being able to read it quickly is a real everyday skill. This page translates it piece by piece.

## The smallest query

```xml
<fetch>
  <entity name="account">
    <attribute name="name" />
    <attribute name="address1_city" />
  </entity>
</fetch>
```

```sql
SELECT name, address1_city
FROM account
```

`<entity>` is the table (`FROM`), each `<attribute>` is a column (`SELECT`). Names are **logical names**.

## Filters

```xml
<filter type="and">
  <condition attribute="statecode" operator="eq" value="0" />
  <condition attribute="address1_city" operator="eq" value="Kyiv" />
</filter>
```

```sql
WHERE statecode = 0 AND address1_city = 'Kyiv'
```

A `<filter>` is `and` by default; `type="or"` joins its conditions with `OR`. Filters can be nested to mix them, like brackets in SQL.

| FetchXML operator | SQL |
| --- | --- |
| `eq`, `ne` | `=`, `<>` |
| `gt`, `ge`, `lt`, `le` | `>`, `>=`, `<`, `<=` |
| `null`, `not-null` | `IS NULL`, `IS NOT NULL` |
| `like` with `%` in the value | `LIKE` |
| `begins-with`, `ends-with` | `LIKE 'x%'`, `LIKE '%x'` |
| `in` with `<value>` children | `IN (…)` |
| `on`, `last-x-days`, `this-month`… | Date conditions the platform turns into date ranges |
| `eq-userid` | `= <the current user's id>` |

## Sorting and paging

```xml
<order attribute="name" />
<order attribute="createdon" descending="true" />
```

```sql
ORDER BY name, createdon DESC
```

`<fetch top="10">` means `LIMIT 10`; `<fetch count="50" page="2">` asks for the second page of 50.

## Joining with link-entity

```xml
<entity name="contact">
  <attribute name="fullname" />
  <link-entity name="account" from="accountid" to="parentcustomerid" alias="a" link-type="inner">
    <attribute name="name" alias="account" />
  </link-entity>
</entity>
```

```sql
SELECT contact.fullname, a.name AS account
FROM contact
JOIN account a ON a.accountid = contact.parentcustomerid
```

Read `from` and `to` as: **`from`** is the column of the **linked** table (account), **`to`** is the column of the **outer** table (contact). `link-type="inner"` is an `INNER JOIN` (rows without a match disappear); `link-type="outer"` is a `LEFT JOIN`.

## Counting and grouping

```xml
<fetch aggregate="true">
  <entity name="contact">
    <attribute name="address1_city" alias="city" groupby="true" />
    <attribute name="contactid" alias="contacts" aggregate="count" />
  </entity>
</fetch>
```

```sql
SELECT address1_city AS city, count(*) AS contacts
FROM contact
GROUP BY address1_city
```

With `aggregate="true"`, every attribute needs an `alias` and either `groupby="true"` or an aggregate (`count`, `countcolumn`, `sum`, `avg`, `min`, `max`).

## Getting FetchXML from a view

You don't have to write FetchXML by hand. In a model-driven app, open a view, use **Edit filters** to build the query, and choose **Download Fetch XML** in the classic Advanced Find, or use the **FetchXML Builder** tool in XrmToolBox. Then paste it into your code.

## Practise

The three practices after the quiz each show a FetchXML query. Your task is to write the SQL that returns the same rows. Start by reading the `<entity>`, then the attributes, the filter, the links and the order, exactly in that sequence.
