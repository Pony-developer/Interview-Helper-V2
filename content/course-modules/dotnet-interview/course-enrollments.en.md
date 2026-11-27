## Task

Questions 48–50: relational databases and JOINs. The setup creates `students`, `courses` and `enrollments` (with a `grade`, which may be NULL). Write **two queries**:

1. Every course with the number of enrolled students and their average grade rounded to one decimal place:
   - columns `title`, `students`, `avg_grade`;
   - courses without students must appear with `0` and an empty (NULL) average — use `LEFT JOIN` and `count(e.student_id)`;
   - `avg` skips NULL grades automatically;
   - sorted by `students` descending, then `title`.
2. The names of students who are not enrolled anywhere, sorted by name (`NOT EXISTS` or a `LEFT JOIN … WHERE … IS NULL`).

Expected result:

```
   title   | students | avg_grade
-----------+----------+-----------
 C# Basics |        3 |      85.0
 SQL       |        3 |      72.5
 Docker    |        1 |      80.0
 Azure     |        0 | NULL
(4 rows)

 name
------
 Ivan
(1 row)
```
