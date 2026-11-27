Dataverse is more than tables and an API. A set of built-in services covers needs that teams often try to rebuild in custom code: history, duplicates, search, incremental sync, special table types and storage. Knowing them saves weeks of work and comes up in architecture questions.

## Auditing

Auditing records who changed what and when, with the **old and new values**. It is switched on at three levels, and all three must be on: the **environment**, the **table** and each **column**. Audit also logs sign-ins, deletes, sharing and role changes if enabled.

- Users see the history on the record's *Audit history* tab.
- Code reads it with `RetrieveRecordChangeHistoryRequest` or by querying the `audit` table.
- Audit data uses **log capacity**; set a **retention period** so it does not grow forever.

Audit is for compliance and support ("who cleared this field?"). It is not a change feed for integrations: use change tracking for that.

## Duplicate detection

**Duplicate detection rules** define what makes two records duplicates (same email, same name and city). Published rules warn users when they save in the UI, and **duplicate detection jobs** scan existing data.

API calls **skip** duplicate detection by default. To apply it, a request has to ask:

```csharp
var create = new CreateRequest { Target = contact };
create.Parameters["SuppressDuplicateDetection"] = false;   // fail if a duplicate exists
service.Execute(create);
```

In the Web API, send the header `MSCRM.SuppressDuplicateDetection: false`. Integrations usually prefer **alternate keys and Upsert**, which make duplicates impossible instead of only detecting them.

## Dataverse search

**Dataverse search** (relevance search) indexes chosen tables in a separate search index and searches across all of them at once, with typo tolerance and ranking. Which columns are searchable is taken from each table's **Quick Find view**. Developers can call it through the search API. The index is updated shortly after changes, not inside the transaction.

## Change tracking

For incremental synchronisation, enable **change tracking** on a table. The first request returns all rows plus a **data token**; the next request with that token returns only rows **created, updated or deleted** since then:

- SDK: `RetrieveEntityChangesRequest` with `DataVersion`.
- Web API: the header `Prefer: odata.track-changes`, then follow the returned `@odata.deltaLink`.

Filtering on `modifiedon` looks similar, but it never tells you about deleted rows.

## Special table types

| Type | What it is | Use it for |
| --- | --- | --- |
| Standard | Rows in Dataverse's relational database | Almost everything |
| Elastic | Rows in Azure Cosmos DB behind the same API | Huge volumes, high write rates, rows that expire with a time to live; fewer relational features (no N:N relationships, for example) |
| Virtual | Data stays in the external source (SQL, SharePoint, OData) and is read through a data provider | Showing external data without copying it; no auditing, rollups or change tracking |

## Storage capacity

A tenant buys three kinds of capacity:

- **Database**: table rows and metadata.
- **File**: notes attachments, email attachments, file and image columns.
- **Log**: audit history and plug-in trace logs.

Bulk data cleanup frees capacity. Use **bulk delete** jobs (a FetchXML query run as a system job, once or on a schedule) to remove old rows, and **long-term retention** to move closed records to cheaper read-only storage.

## System jobs

Asynchronous work runs as **system jobs** (`asyncoperation`): asynchronous plug-ins, classic workflows, bulk delete, duplicate detection jobs, rollup calculations and imports. When something "didn't happen", the system jobs list with its status and error message is the first place to look. Failed and finished jobs should be cleaned up regularly; a bulk delete job for them is common.

## In an interview

- Explain the three levels at which auditing is turned on and what it costs.
- Explain why an integration creates duplicates despite duplicate detection rules.
- Describe incremental sync with change tracking and why `modifiedon` is not enough.
- Compare standard, elastic and virtual tables.
- Name the three kinds of capacity and what fills each.
