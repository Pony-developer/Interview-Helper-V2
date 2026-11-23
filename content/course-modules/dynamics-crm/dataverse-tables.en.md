Everything in Dataverse is described by **metadata**: tables, columns, relationships and keys. Forms, views, the API and security all read it, so a well-designed data model is the base of every Dynamics project.

## Tables

A **table** (called an *entity* in the SDK and older documentation) holds one kind of record.

- **Standard tables** come with the platform or the Dynamics apps: `account`, `contact`, `lead`, `opportunity`, `incident` (case), `systemuser`, `team`.
- **Custom tables** you create carry your publisher's prefix: `new_project`, `contoso_invoice`.
- **Activity tables** (`task`, `email`, `phonecall`, `appointment` and your own) share one timeline through `activitypointer`.
- **Virtual tables** show data from an external source without copying it; **elastic tables** suit huge volumes of simple rows.

Ownership is chosen when a table is created and cannot be changed later. **User or team owned** tables have an `ownerid` column and support every security depth. **Organization owned** tables (reference data such as product categories) are visible to everyone who has the privilege.

Every row has a GUID primary key (`accountid`), a primary name column (`name`), audit columns (`createdon`, `modifiedby`) and a state: `statecode` (Active, Inactive) with a `statuscode` reason (for example, Won or Lost on an opportunity).

## Three names for everything

| Name | Example | Used by |
| --- | --- | --- |
| Display name | Credit score | Forms and views; translatable |
| Schema name | `new_CreditScore` | Early-bound classes, Web API navigation properties |
| Logical name | `new_creditscore` | SDK `Entity`, FetchXML, plug-ins |

The Web API uses the **entity set name**, usually the plural logical name: `accounts`, `new_projects`. Mixing up these names is the most common beginner bug.

## Columns

- Text (single line, multiple lines), whole number, decimal, float.
- **Currency**: stored with a transaction currency and an automatically calculated base-currency twin (`revenue_base`).
- **Date and time** with a behaviour: *User local* (converted to each user's time zone), *Date only* or *Time zone independent*. Choose carefully, because changing it later is limited.
- **Choice** (a global or local option set, stored as an integer) and **Choices** (multi-select).
- **Yes/No**, **File**, **Image**, **Autonumber**.
- **Lookup** to one table, **Customer** (account or contact) and **Owner** (user or team).
- **Calculated**, **rollup** and **formula** (Power Fx) columns, which the platform computes for you.

## Relationships

- **One-to-many (1:N)**: an account has many contacts. The "many" side holds a lookup column (`contact.parentcustomerid`).
- **Many-to-many (N:N)**: contacts and marketing lists. Dataverse creates a hidden **intersect table**. If the link needs its own data (a role, a start date), model it as a custom table with two lookups instead.
- **Self-referential**: an account's parent account, which forms a hierarchy.

Each 1:N relationship has **cascade** settings for Assign, Share, Unshare, Reparent, Delete and Merge. *Parental* cascades everything (deleting an account deletes its child records), *Referential* only removes the link, *Restrict* blocks deleting a parent that still has children. Pick them deliberately: a parental relationship can make one delete or one reassignment touch thousands of rows.

## Keys

The GUID is the primary key, but external systems rarely know it. An **alternate key** on one or more columns (an ERP customer code, an employee number) makes those values unique and lets you address a record by them: `accounts(accountnumber='C-1042')`. Alternate keys enable **Upsert**: create the record if the key is new, update it otherwise. They are the backbone of most integrations.

## In an interview

- Explain the three names of a column and which one each API uses.
- Describe 1:N and N:N relationships and when an N:N should become a custom table.
- Explain cascade behaviour with a delete example.
- Explain why integrations use alternate keys and Upsert.
