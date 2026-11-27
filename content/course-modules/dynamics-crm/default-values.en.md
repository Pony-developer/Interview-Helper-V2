Write a PreOperation plug-in that tidies up and completes new accounts before they are saved.

`AccountDefaultsPlugin` is registered on **Create** and **Update** of account in **PreOperation (20)**. In this stage, whatever you put into `Target` is saved, so you never call `service.Update`. Write the body of `Execute`:

1. Get the context and the `Target` entity.
2. If `Target` has a `name`, save it with spaces trimmed.
3. If `Target` has a `creditlimit` (a `Money`) below 0, throw `InvalidPluginExecutionException` with the message `Credit limit cannot be negative.`
4. **Only on Create**:
   - no `creditlimit` → set `new Money(1000m)`;
   - no `address1_country` → set `"Ukraine"`.

Do not change `Main` or `Run`. Expected output:

```text
== Create account (stage 20)
  saved: address1_country=Ukraine, creditlimit=1000, name=Contoso
== Create account (stage 20)
  saved: address1_country=Poland, creditlimit=50000, name=Fabrikam
== Create account (stage 20)
  ERROR: Credit limit cannot be negative.
== Update account (stage 20)
  saved: telephone1=+380 44 123 4567
== Update account (stage 20)
  saved: name=Litware
```

Check the interesting lines: Fabrikam already has a credit limit and a country, so they stay. The phone update gets **no** defaults: on Update, a column missing from Target means "not changed", and adding a default would overwrite the account's real credit limit.

Hint: `target.GetAttributeValue<string>("name")` returns `null` when there is no name, and `target.Contains("creditlimit")` tells you whether the column was sent.
