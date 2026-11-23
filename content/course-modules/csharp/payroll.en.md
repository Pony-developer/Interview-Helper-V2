A company keeps its staff in **one list**, and every kind of employee is paid in its own way. The abstract class `Employee` is ready: it has a `Name`, an abstract method `MonthlyPay()` and a virtual property `Role` (the default is `staff`), and its `ToString()` prints `Ann (staff): 3000`. The comparer `ByPay` and the helpers `Total` and `Top` are written for the base type only, and know nothing about the kinds.

**Write three derived classes**, each with a constructor that passes the name to the base class:

| Class | Constructor | `MonthlyPay()` | `Role` |
|---|---|---|---|
| `Developer` | `(name, salary)` | the salary | not overridden (`staff`) |
| `Manager` | `(name, salary, reports)` | the salary plus **100** for each report | `manager` |
| `Intern` | `(name, hours, rate)` | `hours * rate` | `intern` |

All the money is `int`. Do not change `Employee` or `Main`. Expected output:

```text
Ann (staff): 3000
Bob (manager): 4500
Cy (intern): 1200
Di (staff): 3500
Total: 12200
Top: Bob
Bob Di Ann Cy
```

The lines in order: the four employees in the order of the list, printed through their own `ToString()`; the total of all the pays; the name of the best paid employee; and the names after the list is sorted by pay, the **highest first**.

Hint: `Role` is `public override string Role => "manager";`. A derived class that does not override a virtual member **inherits** the default: this is why `Developer` needs no `Role`. Notice that `Total`, `Top` and `ByPay` work with a **new** kind of employee without any change: a `Contractor` class would be enough.
