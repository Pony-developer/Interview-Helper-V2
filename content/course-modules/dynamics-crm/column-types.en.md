The column type decides how a value is stored, how the SDK and the Web API hand it to your code, and what the platform can compute for you. Most data bugs in Dynamics projects come from a few types: choices, dates, currency and the computed columns.

## Choice columns

A **choice** (an *option set* in the SDK) stores an **integer**, not the label. Custom options get values from your publisher's option value prefix, so a publisher with prefix `10000` produces `100000000`, `100000001` and so on.

```csharp
account["new_tier"] = new OptionSetValue(100000001);          // write
var tier = account.GetAttributeValue<OptionSetValue>("new_tier")?.Value;  // read
```

The Web API returns the integer too; ask for labels with `Prefer: odata.include-annotations="OData.Community.Display.V1.FormattedValue"`.

- A **global** choice is shared by many columns (the same "Region" list on account and lead); a **local** choice belongs to one column.
- Labels are translatable and can be changed at any time. **Values must never change**: they are in the data, in code, in flows and in reports. Never delete an option and re-add it with the same label.
- **Choices** (multi-select) store several values (`OptionSetValueCollection`). They are harder to filter, group and report on, so use them only for simple tagging.
- **Yes/No** is a two-option choice stored as a boolean.

## Status and status reason

Every table has `statecode` (Active / Inactive; for an opportunity Open / Won / Lost) and `statuscode`, the **status reason**. Each status reason belongs to exactly one state, so you set them together:

```csharp
var close = new Entity("new_project", id);
close["statecode"] = new OptionSetValue(1);       // Inactive
close["statuscode"] = new OptionSetValue(2);      // Completed (a reason of Inactive)
service.Update(close);
```

Some tables have their own messages instead: opportunities are closed with `WinOpportunityRequest` and `LoseOpportunityRequest`, cases with `CloseIncidentRequest`. Status reason **transitions** can restrict which reason may follow which.

## Date and time

Dataverse stores dates in **UTC**. A column's **behaviour** decides what users and code see:

| Behaviour | Stored | Shown | Use for |
| --- | --- | --- | --- |
| User local | UTC | Converted to each user's time zone | Meetings, deadlines, timestamps |
| Date only | Date, no time | As entered, no conversion | Birthdays, contract start dates |
| Time zone independent | As entered | As entered, no conversion | Hotel check-in at 14:00 local time |

The classic bug: a birthday stored as *User local* at midnight in Kyiv shows as the previous day for a user in New York. The SDK returns *User local* values in UTC (`DateTimeKind.Utc`); converting to the user's time zone is the client's job. A *User local* column can later be changed to one of the other behaviours once, but existing values are not converted automatically (`ConvertDateAndTimeBehaviorRequest` does that job).

## Currency

A currency column is stored as `Money` in the record's **transaction currency** (`transactioncurrencyid`). Dataverse adds a twin in the organisation's **base currency**:

```text
estimatedvalue_base = estimatedvalue / exchangerate
```

The `exchangerate` is copied onto the record when it is created or its currency or money values change. It is **not** live: updating the rate on the currency record does not re-price old records until they are saved again. Reports that add up amounts across currencies must use the `_base` columns.

## Lookups

A lookup is an `EntityReference` in the SDK: a table logical name plus a GUID. The Web API reads it as `_parentcustomerid_value` and writes it with a binding:

```json
{ "parentcustomerid_account@odata.bind": "/accounts(00000000-0000-0000-0000-000000000001)" }
```

## Columns the platform computes

- **Calculated** columns: a formula over the row's own columns and its N:1 parents, evaluated **when the record is read**, so the value is always current.
- **Formula** columns: the Power Fx successor of calculated columns, also evaluated on read.
- **Rollup** columns: an aggregate (`SUM`, `COUNT`, `MIN`, `MAX`, `AVG`) over **child records** of a 1:N relationship, with optional filters ("sum of open opportunities"). They are calculated **asynchronously** by a system job (by default every hour after the first mass calculation), so a plug-in that just created a child cannot read the new total in the same transaction. Users can recalculate one on the form; code calls `CalculateRollupFieldRequest`. Each rollup has companion columns `<name>_date` (last calculated) and `<name>_state`. There is a limit per table and per environment.
- **Autonumber** columns: a string built from a format such as `INV-{SEQNUM:5}-{DATETIMEUTC:yyyyMMdd}-{RANDSTRING:3}`. The sequence is guaranteed unique but may have gaps.

When a value must be exact at the moment of a transaction (for example an invoice total that a plug-in validates), compute it in a plug-in instead of relying on a rollup.

## File and image columns

**File** and **Image** columns store binary content in file storage (backed by Azure Blob Storage), not in the database. They have a maximum size, are uploaded and downloaded in chunks for large files (`InitializeFileBlocksUpload`, `UploadBlock`, `CommitFileBlocksUpload`), and count against **file capacity**. An image column can be the table's primary image, with an automatic thumbnail.

## In an interview

- Explain why a choice is stored as an integer and why its values must never change.
- Describe the three date behaviours and the "birthday a day early" bug.
- Explain the `_base` currency columns and why the exchange rate is not live.
- Compare calculated, formula and rollup columns, and say why rollups are not transactional.
