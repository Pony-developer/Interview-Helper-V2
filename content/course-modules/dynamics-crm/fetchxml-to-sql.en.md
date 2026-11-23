Under every FetchXML query there is SQL. Translating one by hand is a common interview exercise, and it shows that you understand what link-entity and its filters really do.

The practice database has two Dataverse tables with their real logical names, cut down to a few columns: `account` and `contact`. `statecode` is `0` for Active and `1` for Inactive; `contact.parentcustomerid` is the lookup to the account. Open **Practice database** above the editor to see the rows.

A view in the app uses this FetchXML:

```xml
<fetch aggregate="true">
  <entity name="account">
    <attribute name="name" alias="account" groupby="true" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
    <link-entity name="contact" from="parentcustomerid" to="accountid" link-type="outer" alias="c">
      <attribute name="contactid" alias="contacts" aggregate="countcolumn" />
      <filter>
        <condition attribute="statecode" operator="eq" value="0" />
      </filter>
    </link-entity>
    <order alias="contacts" descending="true" />
    <order alias="account" />
  </entity>
</fetch>
```

Write the SQL query that returns the same result: every **active** account with the number of its **active** contacts, in columns `account` and `contacts`, ordered by `contacts` from most to fewest, then by `account`. Expected output:

```text
     account     | contacts
-----------------+----------
 Contoso         |        2
 Fabrikam        |        1
 Litware         |        1
 Adventure Works |        0
(4 rows)
```

Notice Adventure Works: it has no contacts, but the link is **outer**, so it stays with a count of 0. And Contoso has three contacts, but only two of them are active.

Hint: the filter inside the outer link-entity belongs in the `ON` clause of a `LEFT JOIN`. If you put it in `WHERE`, Adventure Works disappears. `count(column)` counts only non-NULL values.
