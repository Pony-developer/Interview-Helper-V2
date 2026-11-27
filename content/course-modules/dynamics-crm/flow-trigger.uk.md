Реалізуйте рішення, яке платформа ухвалює для кожного тригера Dataverse: чи запускає ця зміна цей потік?

Програма має дерево бізнес-підрозділів, користувачів, п'ять потоків із тригером «When a row is added, modified or deleted» і список подій рядків:

```text
Contoso            (Admin)
├── Sales          (Anna, Bohdan)
└── Service        (Chen)
```

Напишіть `Triggers.ShouldFire(t, e)`. Тригер спрацьовує, коли виконуються **всі** умови:

1. **Таблиця**: `e.Table` дорівнює `t.Table`.
2. **Тип зміни**: зміна події є одним із прапорців тригера (`(t.Change & e.Change) != 0`).
3. **Scope** відносно власника потоку `t.Owner` і власника рядка `e.RowOwner`:
   - `User`: власник рядка — це власник потоку;
   - `BusinessUnit`: власник рядка в бізнес-підрозділі власника потоку;
   - `ParentChildBusinessUnits`: власник рядка в підрозділі власника потоку або в будь-якому підрозділі під ним;
   - `Organization`: будь-який рядок.
4. **Select columns**: лише для події `Modified` і лише коли `t.SelectColumns` не порожній, хоча б один із `e.ChangedColumns` має бути в ньому. Додані й видалені рядки ігнорують це налаштування.
5. **Filter rows**: коли задано `t.FilterColumn`, `e.Row` має містити цей стовпець зі значенням, що дорівнює `t.FilterValue` (використайте `Equals(a, b)`).

Можна додавати допоміжні методи в `Triggers`. Не змінюйте `Main`. Очікуваний результат:

```text
Anna adds a contact: Welcome email
Chen changes an account's phone: -
Chen creates an account: Credit check
Anna wins her deal: My won deals, Sales digest
Chen wins his deal: -
Anna renames a deal: Sales digest
Anna loses a deal: Sales digest
Bohdan deletes a deal: Sales digest, Archive copy
Chen deletes a deal: Archive copy
```

Перевірте цікаві рядки: зміна телефону не запускає «Credit check», бо його select columns містять лише `creditlimit`, а створення акаунта запускає, бо select columns стосуються лише оновлень. «My won deals» ігнорує перейменування (statecode не змінився) і програну угоду (фільтр чекає statecode 1). Видалена угода Chen доходить до «Archive copy», яким володіє Admin у кореневому підрозділі з областю Parent: Child, але не до «Sales digest», чий власник у Sales.

Підказка: порівнюйте бізнес-підрозділи за посиланням і для області Parent: Child піднімайтеся через `Parent`.
