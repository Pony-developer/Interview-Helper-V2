Реалізуйте те, що робить платформа, коли ви видаляєте запис із пов'язаними дочірніми записами.

Програма моделює крихітну базу Dataverse. `Row` має таблицю, назву та значення своїх lookup (`Lookups`: стовпець lookup → батьківський рядок). `Relationship` — це зв'язок 1:N: рядки `ChildTable` вказують на рядок `ParentTable` через `LookupColumn`, а `Delete` — його поведінка видалення:

| Поведінка | Що стається з кожним дочірнім записом, коли видаляють батьківський |
| --- | --- |
| `Cascade` | Дочірній запис теж видаляється, і до нього застосовуються його власні зв'язки |
| `RemoveLink` | Lookup прибирається з дочірнього запису (`child.Lookups.Remove(column)`); запис лишається |
| `Restrict` | Усе видалення не вдається |

Напишіть `Database.Delete(row)`:

- Проходьте `Relationships` **у порядку списку**. Для кожного зв'язку, у якого `ParentTable` — таблиця рядка, дочірні записи — це рядки з `Rows` (у порядку списку) таблиці `ChildTable`, чий lookup `LookupColumn` вказує на цей рядок.
- Обробіть усі дочірні записи до видалення самого рядка, потім приберіть рядок із `Rows`.
- Записуйте кожну зміну в `Log`: `Unlink <table> <name> (<lookup column>)` і `Delete <table> <name>`.
- Видалення **все або нічого**, як транзакція платформи. Якщо будь-де в дереві (зокрема під каскадно видаленим дочірнім записом) трапився зв'язок `Restrict`, киньте `InvalidOperationException` з повідомленням `Cannot delete <root name>: <child table> <child name> still references <parent name> (<relationship name>)` і нічого не змінюйте та не записуйте в журнал.

Можна додавати допоміжні методи в `Database`. Не змінюйте `Main`. Очікуваний результат:

```text
== Delete Fabrikam
Error: Cannot delete Fabrikam: new_invoice INV-001 still references Portal (new_opportunity_invoice)
== Delete Contoso
  Unlink account Contoso East (parentaccountid)
  Unlink contact Olena Koval (parentcustomerid)
  Unlink contact Taras Melnyk (parentcustomerid)
  Delete task Send proposal
  Delete opportunity CRM rollout
  Delete opportunity Support contract
  Delete task Call Olena
  Delete account Contoso
== Remaining
  account Contoso East
  account Fabrikam
  contact Olena Koval
  contact Taras Melnyk
  contact Maksym Kravets -> parentcustomerid=Fabrikam
  opportunity Portal -> parentaccountid=Fabrikam
  task Kick-off -> regardingobjectid=Portal
  new_invoice INV-001 -> new_opportunityid=Portal
```

Перевірте цікаві рядки: видалення Fabrikam каскадно зачепило б угоду Portal, але на Portal досі посилається рахунок, тому видалення не вдається, і Maksym Kravets зберігає свій зв'язок, хоч його зв'язок лише `RemoveLink`. Задача Contoso «Send proposal» видаляється раніше за свою угоду, бо дочірні записи йдуть першими. Contoso East, дочірній акаунт, лише втрачає посилання на батька.

Підказка: зробіть два проходи. Рекурсивний `Check` іде лише по зв'язках `Cascade` і кидає виняток на `Restrict`; рекурсивний `Apply` вносить зміни. Збирайте дочірні записи вузла в список, перш ніж змінювати `Rows`, щоб не змінювати список під час його обходу.
