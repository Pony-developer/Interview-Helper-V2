Work out the order in which a migration loads its tables, including the lookups that must wait for a second pass.

`Main` describes seven tables and their lookups (`Lookup.Column` points at the table `Lookup.Target`). Every target is one of the seven tables. Write `Migration.BuildPlan(tables)` that returns a `Plan`:

- **Pass 1** (`plan.Order`): every table once, in the order their rows can be created. Build it one table at a time: take the **first** remaining table (in the input order) whose every lookup is satisfied. A lookup is satisfied when its target is already loaded, it points at the table itself (a self-reference), or it has been deferred.
- **Self-references** are always deferred: the parent row may come later in the same table.
- **Cycles**: if no remaining table is ready, take the first remaining table in input order, defer all of its lookups whose targets are not loaded yet, and load it.
- **Pass 2** (`plan.Deferred`): the deferred lookups as `table.column`, grouped by table in pass 1 order, and within a table in the order the lookups are declared.

Do not change `Main`. Expected output:

```text
Pass 1: create rows
  1. businessunit
  2. systemuser
  3. transactioncurrency
  4. account
  5. contact
  6. opportunity
  7. new_invoice
Pass 2: update deferred lookups
  businessunit.parentbusinessunitid
  account.parentaccountid
  account.primarycontactid
```

Check the interesting lines: `businessunit` goes first because its only lookup points at itself. After `transactioncurrency`, nothing is ready: account needs contact, and contact needs account. Account is first in the input, so its lookup to contact is deferred and account is loaded; the lookups to systemuser and transactioncurrency stay in pass 1 because those tables are already loaded.

Hint: keep a `HashSet<string>` of loaded tables and one of deferred `table.column` keys. `remaining.FirstOrDefault(t => t.Lookups.All(...))` finds the next ready table.
