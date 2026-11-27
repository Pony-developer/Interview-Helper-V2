In C#, a Dataverse row is an `Entity`: a table name, an id, and a dictionary of columns called `Attributes`. Reading and writing those columns correctly is half of all plug-in code.

## What an Entity holds

```csharp
var account = new Entity("account");          // logical name of the table
account["name"] = "Contoso";                   // logical name of the column → value
account["numberofemployees"] = 500;
```

An entity only contains the columns that were **retrieved** or **set**. A retrieved account with `new ColumnSet("name")` has `name` and nothing else, even though the row in the database has a hundred columns. An empty column that was retrieved is **missing** from `Attributes` (the SDK leaves out nulls).

## Three ways to read a column

```csharp
var name1 = (string)account["name"];                        // 1. indexer
var name2 = account.GetAttributeValue<string>("name");      // 2. GetAttributeValue
if (account.Contains("name")) { /* … */ }                   // 3. check first
```

| Way | Column missing | Use it when |
| --- | --- | --- |
| `account["name"]` | Throws `KeyNotFoundException` | The column must be there |
| `GetAttributeValue<T>("name")` | Returns `default(T)`: `null`, `0` or `false` | Almost always |
| `Contains("name")` | Returns `false` | You need to know whether it was sent at all |

`Contains` matters in update plug-ins: the `Target` of an Update holds **only the changed columns**, so `Contains("creditlimit")` tells you whether the user changed the credit limit.

For value types, ask for a **nullable** type to tell "empty" from "zero": `GetAttributeValue<int?>("numberofemployees")` returns `null` when empty, while `GetAttributeValue<int>` would return `0`.

## The special types

| Column type | .NET type | Read | Write |
| --- | --- | --- | --- |
| Text | `string` | `GetAttributeValue<string>("name")` | `e["name"] = "Contoso"` |
| Whole number | `int` | `GetAttributeValue<int?>("numberofemployees")` | `e["numberofemployees"] = 500` |
| Decimal | `decimal` | `GetAttributeValue<decimal?>(…)` | `e["contoso_rate"] = 0.15m` |
| Currency | `Money` | `GetAttributeValue<Money>("creditlimit")?.Value` | `e["creditlimit"] = new Money(1000m)` |
| Choice | `OptionSetValue` | `GetAttributeValue<OptionSetValue>("industrycode")?.Value` | `e["industrycode"] = new OptionSetValue(7)` |
| Yes/No | `bool` | `GetAttributeValue<bool>("donotemail")` | `e["donotemail"] = true` |
| Date and time | `DateTime` | `GetAttributeValue<DateTime?>("createdon")` | `e["contoso_start"] = DateTime.UtcNow` |
| Lookup | `EntityReference` | `GetAttributeValue<EntityReference>("parentcustomerid")` | `e["parentcustomerid"] = new EntityReference("account", id)` |

The classic beginner mistakes: writing a plain `1000m` into a currency column, or a plain `7` into a choice column. Both fail with a type error; wrap them in `Money` and `OptionSetValue`.

## Setting a column to empty

To clear a column, set it to `null`: `account["telephone1"] = null;`. Removing it from `Attributes` does something different: the column is simply not sent, so it is left unchanged.

## Creating and updating

```csharp
var contact = new Entity("contact");
contact["lastname"] = "Koval";
contact["parentcustomerid"] = new EntityReference("account", accountId);
Guid id = service.Create(contact);

var change = new Entity("contact", id);       // id of the row to update
change["jobtitle"] = "Sales Manager";          // only the columns you change
service.Update(change);
```

Send **only the columns you change**. Updating a whole retrieved entity rewrites every column, starts every plug-in and flow registered on them, and can overwrite someone else's change.

## Lookups in detail

An `EntityReference` holds the **table** (`LogicalName`) and the **id**. When you read it, `Name` also contains the primary name of the referenced row, which saves a query when you only need to display it. A **Customer** lookup can point at an account or a contact, so check `LogicalName` before you use the id.
