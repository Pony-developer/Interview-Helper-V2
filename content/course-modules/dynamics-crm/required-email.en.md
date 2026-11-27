Enforce a rule on the server that a form script alone cannot guarantee: every contact must have an email address.

`ContactEmailPlugin` is registered on **Create** and **Update** of contact in **PreValidation (10)**. Write the body of `Execute`:

- **Update without `emailaddress1` in Target**: the email is not being changed, so do nothing and return.
- If the email is missing, `null`, empty or only spaces, throw `InvalidPluginExecutionException`:
  - on Create: `Email is required.`
  - on Update: `Email cannot be cleared.`
- Otherwise save the email **trimmed and in lower case** by putting it back into `Target`.

Do not change `Main` or `Run`. Expected output:

```text
== Create contact (stage 10)
  saved: emailaddress1=olena@contoso.com, lastname=Koval
== Create contact (stage 10)
  ERROR: Email is required.
== Create contact (stage 10)
  ERROR: Email is required.
== Update contact (stage 10)
  saved: jobtitle=Sales Manager
== Update contact (stage 10)
  ERROR: Email cannot be cleared.
== Update contact (stage 10)
  saved: emailaddress1=taras@contoso.com
```

Check the interesting lines: Iryna's email is three spaces, which counts as empty. Changing only the job title passes, because the update doesn't touch the email. Clearing the email (setting it to `null`) is rejected.

Hint: `string.IsNullOrWhiteSpace(email)` covers `null`, empty and spaces in one check. Check `context.MessageName == "Update" && !target.Contains("emailaddress1")` first and `return` early.
