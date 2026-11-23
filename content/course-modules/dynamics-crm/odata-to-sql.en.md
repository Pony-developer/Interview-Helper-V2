Every OData query becomes SQL on the server. Translating one by hand shows that you understand what `$filter`, `ne null` and `$expand` really do.

The practice database has the cut-down Dataverse tables `account` and `contact` from the FetchXML practice (`statecode` 0 = Active). Open **Practice database** to see the rows.

A form script runs this Web API query:

```text
GET [org]/api/data/v9.2/contacts
    ?$select=fullname,emailaddress1
    &$expand=parentcustomerid_account($select=name)
    &$filter=statecode eq 0 and emailaddress1 ne null
    &$orderby=fullname
```

Write the SQL query that returns the same data: every **active** contact **with an email address**, with columns `fullname`, `emailaddress1` and `account` (the parent account's name), ordered by `fullname`. Expected output:

```text
     fullname      |    emailaddress1     |  account
-------------------+----------------------+-----------
 Andrii Shevchenko | andrii@northwind.com | Northwind
 Daria Lysenko     | daria@litware.com    | Litware
 Maksym Kravets    | maksym@fabrikam.com  | Fabrikam
 Olena Koval       | olena@contoso.com    | Contoso
 Petro Hnatiuk     | petro@example.com    | NULL
 Taras Melnyk      | taras@contoso.com    | Contoso
(6 rows)
```

Notice:

- **Petro** has no parent account but is still returned: expanding a single-valued navigation property is a **LEFT JOIN**, not an inner join.
- **Andrii**'s account, Northwind, is inactive, but the filter applies only to contacts, so he stays.
- `ne null` is OData for `IS NOT NULL`. In SQL, `emailaddress1 <> NULL` is never true.

Hint: `LEFT JOIN account a ON a.accountid = c.parentcustomerid`, and an `AS account` alias for the name.
