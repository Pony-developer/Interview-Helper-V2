Dataverse checks security on every request, from the UI, the API, plug-ins (with user context) and integrations alike. Explaining the model clearly is one of the most common interview topics.

## Business units

**Business units** (BUs) form a tree that usually follows the organisation: a root unit (named after the organisation), with children such as Sales, Service, Sales West. Every user belongs to exactly one business unit, and every user- or team-owned record has an **owning business unit**, normally the owner's.

Business units are a **security boundary**, not an org chart. Create them only where data must be separated, not for every department.

## Security roles and privileges

A **security role** is a set of privileges. For each table there are eight:

| Privilege | Allows |
| --- | --- |
| Create | Create records |
| Read | See records |
| Write | Change records |
| Delete | Delete records |
| Append | Attach this record to another one (set a lookup on it) |
| Append To | Let other records be attached to this one |
| Assign | Give the record to another owner |
| Share | Share the record with others |

Setting a contact's parent account needs **Append** on contact and **Append To** on account, plus Write on the contact. There are also miscellaneous privileges such as *Export to Excel* or *Bulk delete*.

## Depth

Each privilege in a role has a **depth** (access level):

| Depth | Records it covers |
| --- | --- |
| None | Nothing |
| User | Records the user owns, records owned by the user's teams, and records shared with them |
| Business Unit | Records owned in the user's business unit |
| Parent: Child Business Units | Records owned in the user's business unit and every unit below it |
| Organization | All records |

Example: a sales rep with User-level Read sees their own accounts; a team lead in Sales with Business Unit Read also sees the accounts of other people in Sales; a sales director with Parent: Child Read sees Sales and Sales West; an auditor with Organization Read sees everything.

Organization-owned tables only have None and Organization.

Users can have **several roles**; privileges add up, and the highest depth wins. Roles are defined per business unit (a copy of each role exists in every unit), and a user can only be given roles from their own unit, unless the environment uses the **modernized business units** feature, which lets you assign roles from other units and lets users own records in other units.

## How a request is checked

When a user reads an account, the platform checks: does any of the user's roles (or their teams' roles) grant Read on account, and does the depth reach this record's owner and owning unit? If not, is the record **shared** with the user or one of their teams? Only then is the row returned. For lists, the platform adds these conditions to the SQL query, so users never see rows they cannot read, and the counts in views respect security too.

## Plug-ins and security

- `CreateOrganizationService(context.UserId)` checks the privileges of the user the step runs as (the calling user by default, or the user selected on the step).
- `CreateOrganizationService(null)` runs as SYSTEM and **skips** security checks.
- `context.InitiatingUserId` is the real person who started the operation, even when the step is set to run as another user.
- External code can **impersonate** another user by setting `CallerId` on `ServiceClient` (or the `MSCRMCallerID` header in the Web API), if the calling application user has the *Act on behalf of another user* privilege.

## Design tips

- Start from the standard roles, copy them, and adjust. Do not edit the standard ones directly.
- Give each role a clear purpose (Sales Rep, Sales Manager, Integration - ERP), and combine them on users rather than building one huge role per person.
- Test with real user accounts, not as an administrator: most security bugs only appear for normal users.

## In an interview

- Explain business units, roles, privileges and depth with an example.
- Explain Append and Append To.
- Explain how several roles combine.
- Explain how plug-ins run with or without security checks, and what impersonation is.
