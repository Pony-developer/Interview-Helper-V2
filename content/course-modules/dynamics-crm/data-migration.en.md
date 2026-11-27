Almost every Dynamics project starts by moving data from somewhere else: an older CRM, spreadsheets, an on-premises Dynamics, an ERP. Migrations fail on planning more often than on code, so interviewers ask how you would run one from start to finish.

## The phases

1. **Analyse the source**: which tables, how many rows, which are still in use, how dirty the data is.
2. **Map**: each source field to a Dataverse column, with transformations (code lists to choice values, user names to `systemuser` ids, free-text countries to a lookup).
3. **Extract to staging**: copy the source into a staging database where you can clean, de-duplicate and validate with SQL, without touching the source or Dataverse.
4. **Load** in the right order, with keys that make it repeatable.
5. **Reconcile**: prove that what arrived is what was sent.
6. **Rehearse**: run the full migration several times in a test environment and time it. The production run happens in a **cutover** window, often followed by a **delta load** of what changed since.

## The load order

A row can be created only after the rows its lookups point at exist. Order tables by their dependencies:

```text
businessunit → systemuser / team → transactioncurrency → account → contact → opportunity → invoice
```

**Cycles** are common: `account.primarycontactid` points at contact, and `contact.parentcustomerid` points at account. Break them with **two passes**: create accounts without the primary contact, create contacts, then update the accounts' `primarycontactid`. Self-references (parent account, parent business unit) are filled in the second pass too, because the parent may come later in the same table.

## Keys that make it repeatable

Migrations are re-run many times. Put the **legacy id** in a column with an **alternate key** (`contoso_legacyid`), and load with **Upsert**: the first run creates, every later run updates. Lookups are then set by key too, without first querying for GUIDs:

```csharp
contact["parentcustomerid"] = new EntityReference("account", "contoso_legacyid", "A-1042");
```

You can also set the primary key GUID yourself on Create, computed from the legacy id, so the same source row always gets the same id.

## Things the platform normally sets

| Need | How |
| --- | --- |
| Keep the original creation date | Set `overriddencreatedon` on Create; it is stored in `createdon` |
| Keep the original owner | Set `ownerid` to the mapped user or team on Create |
| Created by / modified by | Not settable: they show the migration user. Keep the legacy values in custom columns if they matter |
| Closed records | Create them active, then set `statecode`/`statuscode`, or use the table's close message (opportunities, cases) |
| Users who have left | Map their records to a team or a "former employee" user that stays disabled |

## Tools

- **Configuration Migration tool** (`pac data`): small reference and configuration data between environments, keeping GUIDs.
- **Import wizard / Excel import**: one-off small loads by business users.
- **Dataflows** (Power Query): repeatable loads from many sources without code.
- **Azure Data Factory** or **SSIS with KingswaySoft**: industrial ETL with mapping, lookups and scheduling.
- **Custom C# loaders** with `ServiceClient`: full control, bulk messages and parallelism.

## Clean before you load

Dirty data costs ten times more to fix after it is in Dataverse, with plug-ins and users touching it. In staging, normalise values (trim, lower-case emails, phone formats), find duplicates, check mandatory fields and orphaned references, and decide with the business which record of a duplicate group survives.

## In an interview

- Walk through the phases of a migration, from analysis to cutover.
- Explain how you order the load and how you break cycles.
- Explain why alternate keys and Upsert make a migration repeatable.
- Say how you keep the original creation date, owner and status.
