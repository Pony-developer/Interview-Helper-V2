FakeXrmEasy is just a very complete in-memory `IOrganizationService`. Build a small one yourself. The program contains a model of the SDK (`Entity` with an `Id`, `ColumnSet`, `FaultException`), the interface `IOrganizationService`, and a piece of plug-in logic, `AccountPhoneSync`, that copies an account's phone to its contacts. Implement `FakeOrganizationService`:

- **`Create(entity)`**: store a **copy** of the entity, so later changes to the caller's object do not change the stored record. If the entity has no id (`Guid.Empty`), give it the next one: the first record gets `new Guid(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`, the second `new Guid(2, …)`, and so on. Return the id.
- **`Retrieve(entityName, id, columnSet)`**: return a **copy** of the record with only the requested columns that the record has (all of them when `columnSet.AllColumns` is true). Changing the returned entity must not change the stored one.
- **`Update(entity)`**: copy every attribute of `entity` into the stored record; other columns keep their values.
- **`Delete(entityName, id)`**: remove the record.
- **`RetrieveByAttribute(entityName, attribute, value)`**: copies (all columns) of the records of that table whose attribute equals `value` (use `Equals`), in creation order.

When `Retrieve`, `Update` or `Delete` cannot find a record with that table name **and** id, throw a `FaultException` with the same message the real service uses: `<entityName> With Id = <id> Does Not Exist`.

Do not change `AccountPhoneSync` or `Main`. Expected output:

```text
Created: 00000001-0000-0000-0000-000000000000
Retrieved: account(00000001) name=Contoso
Stored: account(00000001) name=Contoso telephone1=111
Contacts updated: 2
  Olena Koval 222
  Taras Melnyk 000
  Iryna Bondar 222
Account: account(00000001) name=Contoso telephone1=222
Retrieve deleted: contact With Id = 00000005-0000-0000-0000-000000000000 Does Not Exist
Delete twice: contact With Id = 00000005-0000-0000-0000-000000000000 Does Not Exist
Wrong table: contact With Id = 00000002-0000-0000-0000-000000000000 Does Not Exist
Contacts left: 2
```

The first lines check the copies: `Main` renames the account in its own object and in the retrieved copy, and the stored name must stay "Contoso". The last line checks that a deleted contact is gone. "Wrong table" passes the id of an account with the table name `contact`: a fake that looks only at the id would find the wrong record.

Hint: a `List<Entity>` keeps the creation order. A static helper `Copy(Entity source, ColumnSet columns)` serves `Create`, `Retrieve` and `RetrieveByAttribute`, and a helper `Find(entityName, id)` that throws the fault serves `Retrieve`, `Update` and `Delete`.
