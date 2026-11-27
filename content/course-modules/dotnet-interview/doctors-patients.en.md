## Task

"Design a database of doctors and patients in SQL. Write a query that returns doctors with more than N patients."

The schema is already designed for you (look at the setup script): `doctors` and `patients` are linked many-to-many through `appointments` — a patient can visit several doctors, and the same doctor several times.

Write a query that returns the doctors who have **more than 2 different patients**:

- columns `name`, `specialty`, `patients` (the number of **distinct** patients);
- a patient who visited the same doctor twice counts once (careful: one doctor has 3 appointments but only 2 patients);
- sorted by `patients` from most to fewest, then by `name`.

Hint: `JOIN`, `GROUP BY`, `count(DISTINCT …)` and `HAVING` — a condition on an aggregate cannot go into `WHERE`.

Expected result:

```
      name      | specialty  | patients
----------------+------------+----------
 Iryna Bondar   | Cardiology |        4
 Maria Hnatiuk  | Surgery    |        3
 Olha Tkachenko | Pediatrics |        3
(3 rows)
```
