Implement the decision the platform makes for every Dataverse trigger: does this change start this flow?

The program has a business unit tree, users, five flows with the trigger "When a row is added, modified or deleted", and a list of row events:

```text
Contoso            (Admin)
├── Sales          (Anna, Bohdan)
└── Service        (Chen)
```

Write `Triggers.ShouldFire(t, e)`. A trigger fires when **all** of these hold:

1. **Table**: `e.Table` equals `t.Table`.
2. **Change type**: the event's change is one of the trigger's flags (`(t.Change & e.Change) != 0`).
3. **Scope**, relative to the flow owner `t.Owner` and the row owner `e.RowOwner`:
   - `User`: the row owner is the flow owner;
   - `BusinessUnit`: the row owner is in the flow owner's business unit;
   - `ParentChildBusinessUnits`: the row owner is in the flow owner's unit or any unit below it;
   - `Organization`: any row.
4. **Select columns**: only for a `Modified` event and only when `t.SelectColumns` is not empty, at least one of `e.ChangedColumns` must be in it. Added and deleted rows ignore this setting.
5. **Filter rows**: when `t.FilterColumn` is set, `e.Row` must contain that column with a value equal to `t.FilterValue` (use `Equals(a, b)`).

You may add helper methods to `Triggers`. Do not change `Main`. Expected output:

```text
Anna adds a contact: Welcome email
Chen changes an account's phone: -
Chen creates an account: Credit check
Anna wins her deal: My won deals, Sales digest
Chen wins his deal: -
Anna renames a deal: Sales digest
Anna loses a deal: Sales digest
Bohdan deletes a deal: Sales digest, Archive copy
Chen deletes a deal: Archive copy
```

Check the interesting lines: changing the phone does not start "Credit check", because its select columns contain only `creditlimit`, but creating an account does, because select columns apply only to updates. "My won deals" ignores the rename (statecode did not change) and the lost deal (the filter wants statecode 1). Chen's deleted deal reaches "Archive copy", owned by Admin in the root unit with Parent: Child scope, but not "Sales digest", whose owner is in Sales.

Hint: compare business units by reference and walk up through `Parent` for the Parent: Child scope.
