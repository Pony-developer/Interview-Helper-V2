## Завдання

Два невеликі інструменти на атрибутах.

1. **`Log.Write(message, member, line)`** друкує `[member:line] message`. Два останні параметри мають `[CallerMemberName]` і `[CallerLineNumber]`, тож їх заповнює **компілятор** — назвою методу, що викликає, і рядком виклику. Вам лишається їх надрукувати.

2. **`Auditor.Report(Type type)`** через рефлексію перелічує **публічні методи екземпляра, оголошені в самому типі** (не успадковані від `object`), відсортовані за назвою через `string.CompareOrdinal`. Для кожного методу надрукуйте:
   - `Name: category`, коли він має атрибут `[Audit]`, і додайте ` (sensitive)`, якщо `Sensitive` дорівнює true;
   - інакше `Name: not audited`.

   Підказки: `type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)` і `method.GetCustomAttribute<AuditAttribute>()`.

Очікуваний результат:

```
[Place:16] placing
[Charge:19] charging
[Ping:21] pong
[Run:26] done
Charge: payments (sensitive)
Ping: not audited
Place: orders
```
