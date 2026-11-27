A native N:N relationship has no lookup on either table. Dataverse keeps a hidden **intersect table** with one row per link and only the two ids, and every query across the relationship goes through it. FetchXML does this with two `link-entity` elements; in SQL it is two joins.

The practice database has a custom table `new_project` (primary name column `new_name`), `contact`, and the intersect table `new_project_contact` of the N:N relationship between them. `statecode` is `0` for Active and `1` for Inactive on both tables. Open **Practice database** above the editor to see the rows.

Write the SQL query that lists every **active** project with its **active** members, in columns:

- `project`: the project name,
- `members`: the number of active contacts linked to it,
- `names`: their full names in alphabetical order, separated by `, `, or `-` when there are none.

Order by `project`. Expected output:

```text
     project     | members |                    names
-----------------+---------+---------------------------------------------
 CRM rollout     |       2 | Olena Koval, Taras Melnyk
 Data migration  |       3 | Daria Lysenko, Maksym Kravets, Taras Melnyk
 Portal redesign |       0 | -
(3 rows)
```

Check the interesting rows: Iryna Bondar is linked to "CRM rollout" but is inactive, so she is neither counted nor named. "Portal redesign" has no links at all but still appears. "Legacy cleanup" is inactive and is left out.

Hint: `LEFT JOIN` the intersect table, then `LEFT JOIN` contact with the `statecode` filter in its `ON` clause, so inactive contacts become `NULL` instead of removing the project. `string_agg(column, ', ' ORDER BY column)` builds the list and skips `NULL` values.
