This practice combines four ideas from the last lectures: **configuration**, **shared variables**, **depth** and **running as SYSTEM**.

Two steps are registered on **Update** of **account**:

- `CaptureOldLimitPlugin` (given) runs in **PreOperation** and puts the old credit limit from the pre-image into `context.SharedVariables["oldCreditLimit"]` as a `decimal` (0 when there was none).
- `CreditLimitAuditPlugin` (yours) runs in **PostOperation**, synchronously, with the threshold in its **unsecure configuration**.

Write both parts of `CreditLimitAuditPlugin`:

**Constructor**: store the threshold in the `threshold` field. Parse `unsecureConfig` with `decimal.Parse(…, CultureInfo.InvariantCulture)`; when it is empty or whitespace, use `100000`.

**`Execute`**:

1. Get the context, tracing service and service factory from the service provider.
2. If `context.Depth > 1`, trace `Skipped at depth <depth>` and return: the audit is only for changes made directly by people.
3. If the Target does not contain `creditlimit`, trace `Credit limit not changed` and return.
4. Read the old limit from the shared variable and the new one from the Target (`Money`, `null` means 0). If the increase (new − old) is below the threshold, trace `Change of <increase> is below <threshold>` and return.
5. Otherwise create an `annotation` (a note) **as SYSTEM** (`CreateOrganizationService(null)`), so users cannot edit or delete the audit trail:
   - `subject`: `Credit limit raised`;
   - `notetext`: `<old> -> <new> by <full name>`, where the full name is the `fullname` of the **initiating user** (`context.InitiatingUserId`), retrieved from `systemuser`;
   - `objectid`: an `EntityReference` to the account.
6. Trace `Audit note created`.

Use `tracing.Trace("…{0}…", value)` with placeholders for the traces with values. Do not change `Main` or the other plug-in. Expected output:

```text
== Anna raises Contoso to 100000
  trace: Audit note created
== Anna raises Contoso to 120000
  trace: Change of 20000 is below 50000
== Anna changes Contoso's phone
  trace: Credit limit not changed
== A plug-in raises Contoso to 500000
  trace: Skipped at depth 2
== Ivan sets Fabrikam to 60000
  trace: Audit note created
Notes:
  Credit limit raised | Contoso | owner SYSTEM | 20000 -> 100000 by Anna Shevchenko
  Credit limit raised | Fabrikam | owner SYSTEM | 0 -> 60000 by Ivan Petrenko
```

The notes are owned by SYSTEM because they were created by a SYSTEM service, yet they still name the real person, read from `InitiatingUserId`. Fabrikam had no limit, so the PreOperation step shared 0.

Hint: `(decimal)context.SharedVariables["oldCreditLimit"]` reads the shared value. `target.GetAttributeValue<Money>("creditlimit")` returns `null` for a cleared limit, so check it before reading `.Value`.
