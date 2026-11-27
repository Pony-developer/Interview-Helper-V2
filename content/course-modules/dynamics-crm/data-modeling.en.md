Forms, views, security, plug-ins and integrations all sit on the data model, and some modelling decisions cannot be undone. Interviewers like modelling questions because they show whether you know the platform or just the C# around it.

## Start before the first table

1. Create a **publisher** with your prefix (`contoso_`) and a **solution** that uses it. Every table and column you create inside that solution gets the prefix. Columns created in the Default solution get `new_`, which is hard to clean up later.
2. Check the **standard tables** first. Account, contact, lead, opportunity, case, product and the activities already have security, forms, the timeline, Outlook integration and support in other apps and connectors. A custom "Customer" table next to account usually ends with two half-filled copies of the same data.

## What you cannot change later

| Decision | Can it change? |
| --- | --- |
| Display name, description, form and view layout | Yes, any time |
| Schema and logical name of a table or column | No |
| Table ownership (user or team / organization) | No |
| Whether a table is an activity | No |
| Column data type | Only a few conversions (for example single line to multiple lines of text) |
| Delete a column | Yes, but its data is gone for good |

Spend a few minutes on names and ownership; they are permanent.

## Choice or lookup?

Use a **choice** when the list is short and stable and developers own it: it ships in a solution, is translated and needs no join. Use a **lookup to a reference table** (often organization owned) when:

- business users maintain the list without a deployment,
- each value needs its own data (a category's manager, a country's VAT rate),
- the list is long or grows, or
- access to the values must be secured.

## Relationship patterns

- **1:N** is the default. The "many" side holds the lookup.
- **Native N:N** has a hidden intersect table with just the two ids. It is quick to set up, but the link has no columns of its own, it shows only as a subgrid, and plug-ins see it as the **Associate** and **Disassociate** messages, not Create and Update.
- **Manual N:N**: a custom table with two lookups (`contoso_projectmember` with `contoso_projectid` and `contoso_contactid`). Choose it as soon as the link needs data: a role, dates, a status, an owner, or auditing.
- **Self-referential** 1:N builds a **hierarchy** (parent account, manager). Mark it as the table's hierarchical relationship to get hierarchy views and the FetchXML operators `under` and `above`.
- **Connections** link any two records with a role ("Consultant for", "Partner of") when you need flexible relationships that you cannot predict at design time.

## Polymorphic lookups

Some lookups can point at several tables:

- **Customer**: account or contact (`parentcustomerid` on contact, `customerid` on opportunity and case).
- **Regarding**: any table enabled for activities (`regardingobjectid`).
- **Owner**: user or team (`ownerid`).
- Your own **multi-table lookups** when one column must reference several custom tables.

In code the value is an `EntityReference`, so always check its `LogicalName` before using the id.

## Activities

Make a custom table an **activity** when it is a time-bound interaction you want on the **timeline** of the regarding record: it gets subject, start and end, regarding, and **activity parties** (from, to, attendees). Activity tables are always user or team owned and appear together through `activitypointer`. A table that is not an interaction (an invoice, a contract) should stay a normal table.

## Delete behaviour

Choose each relationship's delete behaviour on purpose:

- **Cascade (parental)**: children are deleted with the parent. Right for parts that cannot exist alone (order lines).
- **Remove link (referential)**: the lookup on the children is cleared; they stay. Right for independent records (contacts of an account).
- **Restrict**: the parent cannot be deleted while children point at it. Right when the children are important records of their own (invoices).

The platform checks the whole tree first: if a Restrict is hit anywhere deep down, nothing at all is deleted.

## Don't copy what you can show

Copying parent columns into every child (the account's phone onto each opportunity) means the copies go stale the day the parent changes. Prefer:

- **quick view forms** to show parent data on the child's form,
- **calculated or formula columns** that read N:1 parent values,
- **rollup columns** for aggregates on the parent,
- and only then a plug-in that keeps a copy in sync, when you need the value for filtering, sorting or integration.

## Size and performance

- Dataverse manages SQL indexes for you. Alternate keys get a unique index, and the **find columns** of the Quick Find view are indexed, so keep them few and meaningful.
- Very wide tables (hundreds of columns) slow down every form and retrieve; split rarely used data into a related table.
- Large text belongs in multiple lines of text or file columns, not in many separate text columns.

## In an interview

- Explain why you create a publisher and solution before the first table.
- Name decisions that cannot be changed later.
- Say when you use a choice and when a lookup to a reference table.
- Compare native and manual N:N relationships, including the plug-in messages.
- Explain the three delete behaviours with an example of each.
