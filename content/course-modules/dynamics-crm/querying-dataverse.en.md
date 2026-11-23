Dataverse offers several ways to ask for rows. They all end up as SQL in the platform's database, with security filters added for the calling user.

## QueryExpression

A query built from objects. Easy to compose in code:

```csharp
var query = new QueryExpression("contact")
{
    ColumnSet = new ColumnSet("fullname", "emailaddress1"),
    Criteria = new FilterExpression(LogicalOperator.And)
};
query.Criteria.AddCondition("statecode", ConditionOperator.Equal, 0);
query.Criteria.AddCondition("emailaddress1", ConditionOperator.NotNull);

var link = query.AddLink("account", "parentcustomerid", "accountid", JoinOperator.Inner);
link.EntityAlias = "a";
link.Columns = new ColumnSet("name");
link.LinkCriteria.AddCondition("statecode", ConditionOperator.Equal, 0);
query.AddOrder("fullname", OrderType.Ascending);

EntityCollection result = service.RetrieveMultiple(query);
string accountName = (string)result.Entities[0].GetAttributeValue<AliasedValue>("a.name").Value;
```

Columns from a linked table come back as `AliasedValue` under `alias.column`.

## FetchXML

The same query as XML. FetchXML is what views store, what reports use and what the Web API accepts in `?fetchXml=`. **FetchXML Builder** in XrmToolBox writes it for you.

```xml
<fetch top="50">
  <entity name="contact">
    <attribute name="fullname" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
    <link-entity name="account" from="accountid" to="parentcustomerid" link-type="inner" alias="a">
      <attribute name="name" />
    </link-entity>
    <order attribute="fullname" />
  </entity>
</fetch>
```

`link-entity` is a join: `from` is the column in the linked table, `to` the column in the parent. `link-type="inner"` drops parent rows without a match; `link-type="outer"` keeps them (a LEFT JOIN). A `filter` inside an **outer** link-entity restricts which linked rows are joined, just like a condition in a LEFT JOIN's `ON` clause, so it does not remove parent rows. Newer link types such as `exists`, `any` and `not any` express "has at least one / has none" without duplicating parent rows.

## Aggregates

```xml
<fetch aggregate="true">
  <entity name="opportunity">
    <attribute name="estimatedvalue" alias="total" aggregate="sum" />
    <attribute name="ownerid" alias="owner" groupby="true" />
  </entity>
</fetch>
```

`aggregate` can be `count`, `countcolumn`, `sum`, `avg`, `min`, `max`; every non-aggregated attribute needs `groupby="true"`, and every attribute needs an alias. Aggregate queries stop with an error when more than 50,000 rows are involved; split them (by date range, for example) or use reporting tools for bigger sets.

## Other options

- **LINQ** over `OrganizationServiceContext` with early-bound classes, translated into QueryExpression. Readable, but not everything you can write in LINQ is supported.
- **Web API** OData: `GET contacts?$select=fullname&$filter=statecode eq 0&$expand=parentcustomerid_account($select=name)`.
- **Dataverse search** for full-text search across tables, and the read-only **TDS (SQL) endpoint** for reporting tools.

## Paging

`RetrieveMultiple` returns at most **5,000** rows per page. When `MoreRecords` is true, ask for the next page:

```csharp
query.PageInfo = new PagingInfo { Count = 5000, PageNumber = 1 };
while (true)
{
    var page = service.RetrieveMultiple(query);
    Process(page.Entities);
    if (!page.MoreRecords) break;
    query.PageInfo.PageNumber++;
    query.PageInfo.PagingCookie = page.PagingCookie;
}
```

The **paging cookie** lets the server continue from the last row instead of counting from the start. In FetchXML the same values go in the `page` and `paging-cookie` attributes; in the Web API you follow `@odata.nextLink`. Forgetting paging is the classic bug where a report or a migration silently processes only the first 5,000 rows.

## Performance tips

- Select only the columns you need; `new ColumnSet(true)` reads everything, including expensive calculated columns.
- Filter on indexed columns; avoid leading wildcards (`like '%abc'`).
- Prefer an aggregate query to retrieving rows and counting them in C#.
- Use `exists`/`any` link types instead of inner joins with `distinct="true"` when you only need to know that related rows exist.

## In an interview

- Write a QueryExpression and the equivalent FetchXML with a join and a filter.
- Explain inner vs outer link-entity and where an outer link's filter applies.
- Write a paging loop and explain the paging cookie.
- Explain the 50,000-row aggregate limit and how to work around it.
