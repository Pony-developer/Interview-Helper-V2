A kind employer wants to give every employee a raise of a given percentage, and then tell them how much they will earn in a year.

Two methods do the work, and both have problems:

- `Raise(salary, percent)` should return the salary increased by `percent` percent. Right now it always returns the old salary. Find the bug and fix it.
- `YearlyIncome(monthlySalary, bonus)` is a stub. It should return twelve monthly salaries plus the bonus.

Do not change `Main`. With a salary of 2000, a 15% raise and a bonus of 500, the program must print:

```text
New salary: 2300
Per year: 28100
```

Hint: `percent / 100` is an integer division. What is `15 / 100` for `int`? Change the order of the operations so that the division comes last.
