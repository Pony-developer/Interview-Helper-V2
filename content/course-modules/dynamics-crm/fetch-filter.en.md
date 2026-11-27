A view called *Sales people with email* uses this FetchXML:

```xml
<fetch>
  <entity name="contact">
    <attribute name="fullname" />
    <attribute name="jobtitle" />
    <attribute name="emailaddress1" />
    <filter type="and">
      <condition attribute="statecode" operator="eq" value="0" />
      <condition attribute="jobtitle" operator="begins-with" value="Sales" />
      <condition attribute="emailaddress1" operator="not-null" />
    </filter>
    <order attribute="fullname" />
  </entity>
</fetch>
```

The practice database has the tables `account` and `contact` with their real logical names. Open **Practice database** above the editor to see the rows.

Write the SQL query that returns the same rows and columns. Expected output:

```text
     fullname      |       jobtitle       |    emailaddress1
-------------------+----------------------+----------------------
 Andrii Shevchenko | Sales Representative | andrii@northwind.com
 Maksym Kravets    | Sales Director       | maksym@fabrikam.com
 Olena Koval       | Sales Manager        | olena@contoso.com
(3 rows)
```

Hint: translate line by line. The three conditions in an `and` filter become three conditions joined with `AND`; `begins-with` becomes `LIKE 'Sales%'`, and `not-null` becomes `IS NOT NULL`.
