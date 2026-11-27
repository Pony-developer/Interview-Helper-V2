A chart on the contact dashboard shows *Active contacts by city*. Its FetchXML:

```xml
<fetch aggregate="true">
  <entity name="contact">
    <attribute name="address1_city" alias="city" groupby="true" />
    <attribute name="contactid" alias="contacts" aggregate="count" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
    <order alias="contacts" descending="true" />
    <order alias="city" />
  </entity>
</fetch>
```

Write the SQL query that returns the same result, with columns `city` and `contacts`, ordered by the number of contacts from most to fewest, then by city. Expected output:

```text
 city  | contacts
-------+----------
 Kyiv  |        4
 Lviv  |        2
 Odesa |        1
(3 rows)
```

Kyiv has five contacts, but Iryna Bondar is inactive, so the chart counts four.

Hint: `groupby="true"` becomes `GROUP BY`, `aggregate="count"` becomes `count(*)`, and each `alias` becomes `AS`. In `ORDER BY` you can use the aliases.
