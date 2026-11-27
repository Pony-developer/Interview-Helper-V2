Побудуйте **ланцюжок погодження витрат** — такої самої форми, як middleware в ASP.NET Core чи конвеєр плагінів Dynamics.

Кожен `Approver` або ухвалює рішення, або викликає `PassOn(expense)`, що передає витрату наступному обробнику. Якщо наступного немає, `PassOn` повертає `Rejected: nobody can approve <сума>`. `SetNext` повертає переданий йому обробник, тож ланцюжок можна збудувати одним рядком: `a.SetNext(b).SetNext(c)`.

`ReceiptCheck` (відхиляє витрати без чека) і `TeamLead` (погоджує до 1 000) готові. Ваші завдання:

1. Напишіть **`Manager`**: погоджує суми до 10 000 включно з `Approved by manager`, інакше передає далі.
2. Напишіть **`Director`**: погоджує суми до 50 000 включно з `Approved by director`, інакше передає далі.
3. В **`Approval.BuildChain()`** з'єднайте їх у такому порядку й поверніть перший обробник: `ReceiptCheck` → `TeamLead` → `Manager` → `Director`.

Не змінюйте `Main`. Очікуваний вивід:

```text
Anna, 300: Approved by team lead
Bohdan, 5000: Approved by manager
Chen, 20000: Rejected: no receipt
Dana, 20000: Approved by director
Eva, 90000: Rejected: nobody can approve 90000
```

Подивіться на Chen і Dana: сума та сама, але витрата Chen зупиняється на першому ж обробнику. А витрата Eva «випадає» з кінця ланцюжка, тому кінець ланцюжка завжди потребує визначеної відповіді.

Підказка: обробники виглядають точно як `TeamLead`. Ланцюжок будується так: `var first = new ReceiptCheck(); first.SetNext(new TeamLead()).SetNext(...)...; return first;`.
