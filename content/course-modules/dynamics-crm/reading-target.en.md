Most plug-ins start by reading the record that is being saved: the **primary entity** of the message. Its data comes from three places: the **Target**, the **images** and, if all else fails, a **Retrieve**.

## Getting the Target safely

```csharp
if (!context.InputParameters.Contains("Target") || !(context.InputParameters["Target"] is Entity target))
    return;                                  // Delete has an EntityReference; some messages have no Target
if (target.LogicalName != "account")
    return;
```

`context.PrimaryEntityName` and `context.PrimaryEntityId` describe the same record. In **PreOperation of Create** the id is usually still empty (unless the caller supplied one); from PostOperation on, `context.PrimaryEntityId` and `context.OutputParameters["id"]` hold the new id.

## Reading columns

```csharp
string name        = target.GetAttributeValue<string>("name");                 // null if missing
int? employees     = target.GetAttributeValue<int?>("numberofemployees");      // nullable value type
Money creditLimit  = target.GetAttributeValue<Money>("creditlimit");           // creditLimit?.Value
OptionSetValue ind = target.GetAttributeValue<OptionSetValue>("industrycode"); // ind?.Value
EntityReference pc = target.GetAttributeValue<EntityReference>("primarycontactid"); // pc?.Id, pc?.LogicalName
DateTime? created  = target.GetAttributeValue<DateTime?>("createdon");         // always UTC
bool doNotEmail    = target.GetAttributeValue<bool>("donotemail");             // false if missing
```

- **`GetAttributeValue<T>`** returns `default(T)` when the column is missing or null. Use nullable types (`int?`, `DateTime?`) when "missing" and "zero" mean different things.
- **The indexer** `target["creditlimit"]` throws **`KeyNotFoundException`** when the column is not in the Target. That is the classic crash in an Update plug-in when the user changed some other column.
- **`Contains("column")`** is true when the column is in the request, **even if its value is null**: a user who clears a field sends the column with `null`. "Not in the Target" means *unchanged*; "in the Target with null" means *cleared*.

## Lookups have no names

An `EntityReference` in the Target usually has only `LogicalName` and `Id`; `Name` is often empty. To show or use the related record's data, retrieve it:

```csharp
var contact = service.Retrieve("contact", pc.Id, new ColumnSet("fullname", "emailaddress1"));
```

Similarly, `FormattedValues` (labels of choices, formatted money) are not filled on the Target; read labels from metadata or work with the numeric values.

## Update: the Target is not the record

For Update, the Target contains **only the changed columns**. To know the full state, register a **pre-image** (and in PostOperation, a **post-image**) with the columns you need, and combine:

```csharp
static T Current<T>(Entity target, Entity preImage, string column) =>
    target.Contains(column) ? target.GetAttributeValue<T>(column) : preImage.GetAttributeValue<T>(column);

var preImage = context.PreEntityImages.Contains("PreImage") ? context.PreEntityImages["PreImage"] : new Entity(target.LogicalName);
Money limit = Current<Money>(target, preImage, "creditlimit");
```

A Retrieve of the same record gives the same information but costs a database round trip on every save; images are cheaper and give you the *before* values, which a Retrieve in PostOperation cannot.

## Writing back

- In **PreValidation/PreOperation**, set columns on the Target: `target["description"] = …`. They are saved with the record.
- In **PostOperation**, the record is already saved: use `service.Update(new Entity(target.LogicalName, target.Id) { ["description"] = … })`, which starts a new Update message (watch for loops).

## In an interview

- Show how to read a string, money, choice and lookup from the Target.
- Explain the difference between `GetAttributeValue`, the indexer and `Contains`, including a cleared field.
- Explain why lookups in the Target have no name and what to do about it.
- Explain how to get the full record state in an Update plug-in.
