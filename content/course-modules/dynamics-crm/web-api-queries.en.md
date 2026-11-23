Reading lists of rows is most of what clients do with the Web API. OData query options cover selection, filtering, joins, sorting, paging and even aggregation.

## Query options

```http
GET [org]/api/data/v9.2/contacts
    ?$select=fullname,emailaddress1
    &$filter=statecode eq 0 and emailaddress1 ne null
    &$expand=parentcustomerid_account($select=name)
    &$orderby=fullname asc
    &$top=50
```

| Option | Does |
| --- | --- |
| `$select` | Columns to return. Always use it. |
| `$filter` | Conditions: `eq ne gt ge lt le`, `and or not`, `contains()`, `startswith()`, `endswith()` |
| `$orderby` | Sorting, `asc` / `desc` |
| `$top` | Limit the number of rows |
| `$expand` | Include related rows through navigation properties |
| `$count=true` | Add `@odata.count` with the total (up to 5,000) |
| `$apply` | Aggregation and grouping |

`ne null` and `eq null` test for empty values, the OData way of saying `IS NOT NULL` / `IS NULL`.

## Filtering on lookups and related rows

```text
$filter=_parentcustomerid_value eq 00000000-0000-0000-0000-000000000001     by lookup id
$filter=parentcustomerid_account/name eq 'Contoso'                          by a column of the related row
$filter=contact_customer_accounts/any(c: c.statecode eq 0)                  accounts that have an active contact
$filter=Microsoft.Dynamics.CRM.LastXDays(PropertyName='createdon',PropertyValue=7)
$filter=Microsoft.Dynamics.CRM.In(PropertyName='industrycode',PropertyValues=['7','9'])
```

Dataverse adds **query functions** (`LastXDays`, `Today`, `Above`, `Under`, `In`, `Between`…) for conditions that plain OData cannot express.

## Expanding

- **Single-valued** navigation properties (a lookup) expand into an object: `$expand=parentcustomerid_account($select=name)`. Rows without a parent still come back, with `null`, like a **LEFT JOIN**.
- **Collection-valued** ones (a 1:N relationship) expand into an array, with their own `$select`, `$filter`, `$orderby` and `$top`: `$expand=contact_customer_accounts($select=fullname;$filter=statecode eq 0)`.

Expanding saves round trips, but every expanded collection costs server time; select few columns.

## FetchXML through the Web API

For queries OData cannot express (complex link-entities, aggregates with groupings), send FetchXML, URL-encoded:

```javascript
const fetchXml = `<fetch aggregate="true"><entity name="opportunity">
  <attribute name="estimatedvalue" alias="total" aggregate="sum" />
  <attribute name="ownerid" alias="owner" groupby="true" /></entity></fetch>`;
const result = await Xrm.WebApi.retrieveMultipleRecords("opportunity", "?fetchXml=" + encodeURIComponent(fetchXml));
```

## Paging

The server returns at most 5,000 rows per page (fewer if you ask). Ask for a page size and follow the next link:

```javascript
let url = `${base}/contacts?$select=fullname&$filter=statecode eq 0`;
const rows = [];
while (url) {
  const response = await fetch(url, { headers: { ...headers, Prefer: "odata.maxpagesize=500" } });
  const page = await response.json();
  rows.push(...page.value);
  url = page["@odata.nextLink"];          // absent on the last page
}
```

`Xrm.WebApi.retrieveMultipleRecords(table, options, maxPageSize)` returns `nextLink` too; pass it back as the options to get the next page. Do not build `$skip` offsets: the Web API does not support them for Dataverse tables.

## In an interview

- Write an OData query with `$select`, `$filter`, `$expand` and `$orderby`.
- Filter by a lookup id and by a column of the related row.
- Explain single- vs collection-valued `$expand`.
- Show how to read all pages of a result.
