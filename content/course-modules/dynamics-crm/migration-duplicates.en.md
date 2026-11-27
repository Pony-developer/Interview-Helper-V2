Before contacts are loaded into Dataverse, the migration team finds duplicates in staging, where SQL makes it cheap. The legacy CRM never trimmed or lower-cased its email addresses, so the same person appears several times with slightly different spellings.

The practice database has the staging table `stg_contact` with the legacy id, the full name, the email address (`emailaddress1`, as in Dataverse) and the legacy creation date. Open **Practice database** above the editor to see the rows.

Write the SQL query that finds every group of contacts sharing the same **normalised email** (trimmed and lower-cased), with columns:

- `email`: the normalised email,
- `records`: how many staging rows share it,
- `legacy_ids`: their legacy ids in ascending order, separated by `, `,
- `keep_id`: the legacy id of the **oldest** record (earliest `createdon`), which survives the merge.

Ignore rows without an email (`NULL` or blank). Return only groups with more than one row, ordered by `email`. Expected output:

```text
        email        | records | legacy_ids | keep_id
---------------------+---------+------------+---------
 maksym@fabrikam.com |       3 | 4, 5, 6    |       5
 olena@contoso.com   |       2 | 1, 2       |       1
(2 rows)
```

Check the interesting rows: `' Olena@Contoso.com '` and `'MAKSYM@FABRIKAM.COM'` match only after normalisation. The two Iryna Bondar rows have the same name but no email, so they are not reported. Maksym's oldest record is id 5, not the lowest id.

Hint: group by the normalised expression and filter groups with `HAVING`. `string_agg(legacy_id::text, ', ' ORDER BY legacy_id)` builds the list, and `(array_agg(legacy_id ORDER BY createdon))[1]` picks the first id by date.
