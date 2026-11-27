Prepare a contact for `service.Create` with the right column types, as an integration or a plug-in would.

Write `Contacts.NewContact(firstName, lastName, email, accountId)` that returns a new `Entity("contact")` with:

| Column | Value |
| --- | --- |
| `firstname`, `lastname` | The names with spaces trimmed (`Trim()`) |
| `emailaddress1` | Trimmed and lower-cased; **only** when an email is given (not `null`, empty or spaces) |
| `preferredcontactmethodcode` | A choice: `new OptionSetValue(2)` (Email) when there is an email, otherwise `new OptionSetValue(1)` (Any) |
| `donotemail` | A Yes/No: `true` when there is no email, otherwise `false` |
| `parentcustomerid` | A lookup: `new EntityReference("account", accountId)`; **only** when `accountId` is not `Guid.Empty` |

`Main` prints each entity with its columns in alphabetical order. Do not change `Main`. Expected output:

```text
contact(00000000) donotemail=False emailaddress1=olena@contoso.com firstname=Olena lastname=Koval parentcustomerid=account(0000002a) preferredcontactmethodcode=2
contact(00000000) donotemail=True firstname=Taras lastname=Melnyk parentcustomerid=account(0000002a) preferredcontactmethodcode=1
contact(00000000) donotemail=True firstname=Petro lastname=Hnatiuk preferredcontactmethodcode=1
```

The id is all zeros because the row is not created yet: Dataverse assigns the id on Create.

Hint: `string.IsNullOrWhiteSpace(email)` answers "is there an email?" in one call. Leave a column out entirely instead of setting it to `null` when there is nothing to send.
