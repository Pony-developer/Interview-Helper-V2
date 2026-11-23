Roles and business units cover the broad rules. Teams, sharing, column security and hierarchy security handle the exceptions that every real organisation has.

## Teams

A **team** is a group of users. There are three kinds:

- **Owner team**: can **own records** and have **security roles**. Members get the team's privileges, and records owned by the team are visible to members with User-level depth. Every business unit has a default owner team containing all its users.
- **Access team**: has no roles and owns nothing. It gets access to specific records through sharing. Access team **templates** on a table add a ready-made team to each record (for example, "deal team" on opportunity), which users fill from a subgrid.
- **Microsoft Entra group team**: an owner or access team linked to a Microsoft Entra security group or Microsoft 365 group. Membership follows the group, so access is managed in one place.

Teams solve "people from different business units work on the same records" without moving users between units.

## Sharing

A user who has the **Share** privilege can share a record with another user or team, granting Read, Write, Delete, Append, Assign or Share on that one record. In code, sharing is the `GrantAccessRequest` (`ModifyAccessRequest`, `RevokeAccessRequest` to change or remove it).

Rules to remember:

- Sharing only works for people who have the privilege on the table **at least at User level**. Sharing a record with someone whose role has no Read on that table at all gives them nothing.
- Sharing can cascade to child records through the relationship's cascade settings.
- Every share is a row in the **PrincipalObjectAccess** (POA) table. Millions of shares make security checks slow. Sharing is for exceptions; if you share every record with a group, you need a team or a different business unit design instead.

## Column (field) security

Row access decides which **records** a user sees. **Column security** decides which **columns**: salary, national id, credit card details.

1. Enable column security on the column.
2. Create a **field security profile** that grants Read, Update and Create on it.
3. Add users or teams to the profile.

Everyone else sees the column as empty (or masked), on forms, in views, in exports and through the API. System administrators always have access. Do not hide sensitive columns with form scripts: the data is still in the API response.

## Hierarchy security

Some organisations need "managers see their reports' records" regardless of business units. **Hierarchy security** adds that:

- **Manager hierarchy**: based on the *Manager* field of users. A manager gets access to the records of their direct and indirect reports, down to a configured depth.
- **Position hierarchy**: based on positions (Sales Director → Regional Manager → Rep), independent of the manager field and of business units.

Managers get Read, Write, Append and Append To on their direct reports' records, and Read on the levels below.

## Ownership and assignment

Records owned by a user move with the user: if they change business unit, their records' owning unit changes too (or, with modernized business units, it can stay). **Assign** changes the owner, and cascades to related records according to the relationship settings. A user who leaves should have their records reassigned before they are disabled.

## Choosing the tool

| Requirement | Tool |
| --- | --- |
| A region's data separated from another's | Business units |
| A group of users from several units works on shared records | Owner team |
| A few people need access to one specific deal | Access team or sharing |
| Managers see their reports' records | Hierarchy security |
| Only HR sees salaries | Column security |

## In an interview

- Explain the three kinds of team and when you would use each.
- Explain sharing, its prerequisite, and why heavy sharing is a performance problem.
- Explain column security and why form scripts are not enough.
- Explain manager and position hierarchy security.
