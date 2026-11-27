Implement what the platform does when you delete a record with related children.

The program models a tiny Dataverse database. A `Row` has a table, a name and its lookup values (`Lookups`: lookup column → the parent row). A `Relationship` is a 1:N relationship: rows of `ChildTable` point at a `ParentTable` row through `LookupColumn`, and `Delete` is its delete behaviour:

| Behaviour | What happens to each child when the parent is deleted |
| --- | --- |
| `Cascade` | The child is deleted too, and its own relationships apply to it |
| `RemoveLink` | The lookup is removed from the child (`child.Lookups.Remove(column)`); the child stays |
| `Restrict` | The whole delete fails |

Write `Database.Delete(row)`:

- Go through `Relationships` **in list order**. For each one whose `ParentTable` is the row's table, its children are the rows in `Rows` (in list order) of `ChildTable` whose lookup `LookupColumn` points at this row.
- Handle all children before deleting the row itself, then remove the row from `Rows`.
- Log every change in `Log`: `Unlink <table> <name> (<lookup column>)` and `Delete <table> <name>`.
- The delete is **all or nothing**, like the platform's transaction. If a `Restrict` relationship is hit anywhere in the tree (also below a cascaded child), throw `InvalidOperationException` with the message `Cannot delete <root name>: <child table> <child name> still references <parent name> (<relationship name>)`, and change nothing and log nothing.

You may add helper methods to `Database`. Do not change `Main`. Expected output:

```text
== Delete Fabrikam
Error: Cannot delete Fabrikam: new_invoice INV-001 still references Portal (new_opportunity_invoice)
== Delete Contoso
  Unlink account Contoso East (parentaccountid)
  Unlink contact Olena Koval (parentcustomerid)
  Unlink contact Taras Melnyk (parentcustomerid)
  Delete task Send proposal
  Delete opportunity CRM rollout
  Delete opportunity Support contract
  Delete task Call Olena
  Delete account Contoso
== Remaining
  account Contoso East
  account Fabrikam
  contact Olena Koval
  contact Taras Melnyk
  contact Maksym Kravets -> parentcustomerid=Fabrikam
  opportunity Portal -> parentaccountid=Fabrikam
  task Kick-off -> regardingobjectid=Portal
  new_invoice INV-001 -> new_opportunityid=Portal
```

Check the interesting lines: deleting Fabrikam would cascade to the Portal opportunity, but an invoice still references Portal, so the delete fails, and Maksym Kravets keeps his link although his relationship is only `RemoveLink`. Contoso's task "Send proposal" is deleted before its opportunity, because children go first. Contoso East, a child account, loses only its parent link.

Hint: do it in two passes. A recursive `Check` follows only `Cascade` relationships and throws on `Restrict`; a recursive `Apply` makes the changes. Collect a node's children into a list before you change `Rows`, so you don't modify a list while iterating over it.
