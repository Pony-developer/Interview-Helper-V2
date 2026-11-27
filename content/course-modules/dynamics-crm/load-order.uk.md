Визначте порядок, у якому міграція завантажує таблиці, разом із lookup, що мають чекати другого проходу.

`Main` описує сім таблиць та їхні lookup (`Lookup.Column` вказує на таблицю `Lookup.Target`). Кожна ціль — одна з цих семи таблиць. Напишіть `Migration.BuildPlan(tables)`, що повертає `Plan`:

- **Прохід 1** (`plan.Order`): кожна таблиця один раз, у порядку, в якому можна створювати її рядки. Будуйте його по одній таблиці: беріть **першу** з решти таблиць (у порядку вхідного списку), у якої задоволено кожен lookup. Lookup задоволено, коли його ціль уже завантажено, він вказує на саму таблицю (самопосилання) або його відкладено.
- **Самопосилання** завжди відкладаються: батьківський рядок може йти пізніше в тій самій таблиці.
- **Цикли**: якщо жодна з решти таблиць не готова, візьміть першу з них у порядку вхідного списку, відкладіть усі її lookup, цілі яких ще не завантажено, і завантажте її.
- **Прохід 2** (`plan.Deferred`): відкладені lookup у форматі `table.column`, згруповані за таблицями в порядку проходу 1, а в межах таблиці — в порядку оголошення lookup.

Не змінюйте `Main`. Очікуваний результат:

```text
Pass 1: create rows
  1. businessunit
  2. systemuser
  3. transactioncurrency
  4. account
  5. contact
  6. opportunity
  7. new_invoice
Pass 2: update deferred lookups
  businessunit.parentbusinessunitid
  account.parentaccountid
  account.primarycontactid
```

Перевірте цікаві рядки: `businessunit` іде першою, бо її єдиний lookup вказує на неї саму. Після `transactioncurrency` нічого не готове: account потребує contact, а contact — account. Account перший у вхідному списку, тож його lookup на contact відкладається, і account завантажується; lookup на systemuser і transactioncurrency лишаються в проході 1, бо ці таблиці вже завантажено.

Підказка: тримайте `HashSet<string>` завантажених таблиць і ще один для відкладених ключів `table.column`. `remaining.FirstOrDefault(t => t.Lookups.All(...))` знаходить наступну готову таблицю.
