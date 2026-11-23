Time to be the platform. The program has a tiny model of the SDK (`Entity`, `InvalidPluginExecutionException`, `IPlugin`), a `Database` with transactions, and five plug-ins registered on Create of account, in no particular order. Write `Pipeline.Execute(context)`, which runs the Create message the way Dataverse does:

1. Order the registered steps by **stage**, then by **rank**.
2. Run the **PreValidation** steps. They run outside the transaction.
3. Start the transaction with `db.Begin()`.
4. Run the **PreOperation** steps. They may change `context.Target`.
5. The main operation: save the record with `db.Insert(context.Target)`.
6. Run the **PostOperation** steps (all of them are synchronous here).
7. `db.Commit()` and return `true`.

Before running a step, print two spaces, the stage and the step name, for example `  PreOperation AccountNumber`, then call `step.Plugin.Execute(context)`.

If a step throws an `InvalidPluginExecutionException`, stop at once: print `  ERROR <message>`, call `db.Rollback()` **if a transaction is open** (`db.InTransaction`), and return `false`. Rollback removes everything inserted in the transaction, including the task that the follow-up plug-in created.

Do not change the plug-ins or `Main`. Expected output:

```text
== Contoso
  PreValidation RequireName
  PreOperation AccountNumber
  PreOperation NormalizeName
  INSERT account accountnumber=ACC-1001 name=Contoso
  PostOperation FollowUpTask
  INSERT task subject=Call Contoso
  PostOperation CreditLimit
  COMMIT
  saved: True
== No name
  PreValidation RequireName
  ERROR Account name is required.
  saved: False
== Fabrikam
  PreValidation RequireName
  PreOperation AccountNumber
  PreOperation NormalizeName
  INSERT account accountnumber=ACC-1002 creditlimit=250000 name=Fabrikam
  PostOperation FollowUpTask
  INSERT task subject=Call Fabrikam
  PostOperation CreditLimit
  ERROR A credit limit over 100000 needs approval.
  ROLLBACK
  saved: False
== Northwind
  PreValidation RequireName
  PreOperation AccountNumber
  PreOperation NormalizeName
  INSERT account accountnumber=NW-7 name=Northwind
  PostOperation FollowUpTask
  INSERT task subject=Call Northwind
  PostOperation CreditLimit
  COMMIT
  saved: True
Rows: 4
  account accountnumber=ACC-1001 name=Contoso
  task subject=Call Contoso
  account accountnumber=NW-7 name=Northwind
  task subject=Call Northwind
```

Look at what the output teaches:

- "No name" fails in PreValidation: nothing was locked or written, so there is no rollback, and no account number was used.
- Fabrikam fails in a synchronous PostOperation step **after** the insert, so the account and its task are rolled back. The number ACC-1002 is not given back, like a database sequence.
- The name is trimmed in PreOperation, so the trimmed value is what gets saved.

Hint: `steps.OrderBy(s => (int)s.Stage).ThenBy(s => s.Rank)` sorts the steps; LINQ's ordering is stable. A helper `Run(Step step, PluginContext context)` that prints and executes keeps `Execute` short, and one `try`/`catch` around the whole sequence handles every stage.
