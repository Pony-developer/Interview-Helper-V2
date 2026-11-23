`Connection` — вигадане з'єднання з базою даних. Під час створення воно друкує `open <name>`. Допишіть його реалізацію `IDisposable`:

- `Dispose()` друкує `close <name>` і додає одиницю до статичного лічильника `ClosedCount`. Повторний виклик `Dispose()` не має робити **нічого**: ні другого рядка, ні другого підрахунку;
- `Query(string sql)` повертає `<name>: <sql>`. Після звільнення з'єднання він натомість кидає `ObjectDisposedException`.

`Main` не змінюйте. Він використовує з'єднання в блоках `using`, двічі звільняє одне з'єднання і залишає один блок `using` із винятком. Очікуваний вивід:

```text
open main
main: select 1
close main
open temp
close temp
temp is disposed
open report
report: select 3
close report
report failed
Total closed: 3
```

Зверніть увагу: `close report` іде **перед** `report failed`. Блок `using` звільняє з'єднання, поки виняток виходить назовні, ще до того, як виконається `catch` у `Main`.

Підказка: заведіть поле `bool disposed`. `new ObjectDisposedException(name)` приймає назву звільненого об'єкта.
