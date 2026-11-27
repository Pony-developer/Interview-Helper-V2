A dashboard list shows the active contacts of active accounts in Kyiv. Its FetchXML:

```xml
<fetch>
  <entity name="contact">
    <attribute name="fullname" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
    <link-entity name="account" from="accountid" to="parentcustomerid" alias="a" link-type="inner">
      <attribute name="name" alias="account" />
      <filter>
        <condition attribute="statecode" operator="eq" value="0" />
        <condition attribute="address1_city" operator="eq" value="Kyiv" />
      </filter>
      <order attribute="name" />
    </link-entity>
    <order attribute="fullname" />
  </entity>
</fetch>
```

Write the SQL query that returns the same data, with the columns `account` (the account's name) first and `fullname` second, ordered by account and then by full name. Expected output:

```text
 account |   fullname
---------+---------------
 Contoso | Olena Koval
 Contoso | Taras Melnyk
 Litware | Daria Lysenko
(3 rows)
```

Check the rows that are missing: Iryna Bondar works at Contoso but is inactive. Andrii Shevchenko lives in Kyiv, but his account, Northwind, is inactive. Petro Hnatiuk has no account at all, and the link is **inner**.

Hint: `link-entity` with `link-type="inner"` is a `JOIN account a ON a.accountid = c.parentcustomerid`. The filter inside the link-entity applies to the account's columns.
