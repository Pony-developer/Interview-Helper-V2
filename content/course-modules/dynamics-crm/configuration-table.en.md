The demo activity in this module reads settings from a **configuration table**. Designing that table well matters, because many projects end up with exactly this pattern.

## The table

Create a custom table in your solution:

| Property | Value |
| --- | --- |
| Display name | Configuration |
| Logical name | `contoso_configuration` |
| Ownership | **Organization** (settings belong to everyone, not to a user) |
| Primary name column | `contoso_key` (Key), single line of text, required |

Columns:

| Column | Logical name | Type | Notes |
| --- | --- | --- | --- |
| Key | `contoso_key` | Text (100) | Primary name, e.g. `invoice.prefix` |
| Value | `contoso_value` | Multiple lines of text | The setting, as text or JSON |
| Description | `contoso_description` | Multiple lines of text | What it is for and who owns it |
| Status | `statecode` | (built in) | Inactive rows are ignored |

## Make keys unique

Two rows with the same key make every reader guess. Add an **alternate key** on `contoso_key`: the platform then rejects duplicates, and integrations or deployment scripts can **upsert** settings by key. Readers should still be defensive (the practice throws on duplicates), because inactive rows and old data exist.

## Security

- Organization-owned tables have only None or Organization depth. Give **Read** to the roles of users whose workflows and plug-ins read settings (or read them as SYSTEM in code).
- Give **Create, Write, Delete** only to an admin role.
- Do **not** store secrets here: anyone with Read sees them. Use secure step configuration or secret environment variables backed by Azure Key Vault.

## Moving settings between environments

Rows are data, not solution components. Options:

- the **Configuration Migration tool** (`pac data export` / `pac data import`), keyed by the alternate key;
- a deployment script that upserts the rows;
- **environment variables** instead, for values that differ per environment and must be part of ALM.

A common split: technical, per-environment values in environment variables; business-owned lists and rules in the configuration table.

## An app for admins

Add the table to an admin model-driven app with a simple view (Key, Value, Status) and form. Turn on **auditing** for the table, so you can see who changed a setting and when, which is the first question after something breaks.

## Reading it

From a plug-in or activity, query by key and status:

```csharp
var query = new QueryByAttribute("contoso_configuration") { ColumnSet = new ColumnSet("contoso_value") };
query.AddAttributeValue("contoso_key", key);
query.AddAttributeValue("statecode", 0);   // active only
var rows = service.RetrieveMultiple(query).Entities;
```

Cache the results for a few minutes in plug-ins that run often.

## In an interview

- Design a configuration table: ownership, columns, keys, security.
- Explain why secrets do not belong in it.
- Explain how its rows reach test and production.
- Compare a configuration table with environment variables.
