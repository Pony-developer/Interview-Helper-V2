## Завдання

`Permission` — enum з атрибутом `[Flags]`. Реалізуйте чотири допоміжні методи через порозрядні оператори:

- **`Grant(current, extra)`** додає прапорці `extra`.
- **`Revoke(current, removed)`** прибирає прапорці `removed`, решту залишає.
- **`HasAll(current, required)`** дає `true`, лише якщо встановлено **кожен** прапорець з `required` (тож `HasAll(x, Permission.Editor)` вимагає і Read, і Write).
- **`Describe(current)`** перелічує встановлені однобітові прапорці в порядку Read, Write, Delete, Share через `", "`; повертає `"None"`, коли нічого не встановлено. (Не покладайтеся тут на `ToString()`: для Read | Write він надрукує складену назву `Editor`.)

Очікуваний результат:

```
Read, Write, Share
True
False
Read, Share
None
Read, Write, Delete, Share
Editor
```
