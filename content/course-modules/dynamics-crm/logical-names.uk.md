Код спілкується з Dataverse логічними іменами, а Web API — іменами наборів сутностей. Напишіть допоміжний клас, що перетворює відображуване ім'я на всі ці імена.

Maker portal будує схемне ім'я, прибираючи пробіли з відображуваного імені й додаючи префікс видавця. Багато команд ідуть далі й використовують **PascalCase**, щоб імена лишалися читабельними. Реалізуйте цю домовленість у класі `Names`:

- `SchemaName(displayName, prefix)`: розбийте відображуване ім'я на слова за пробілами, дефісами, підкресленнями й крапками; зробіть **першу літеру кожного слова великою**, решту залиште як є; з'єднайте слова й поставте попереду `prefix + "_"`. `"Credit Score"` → `contoso_CreditScore`.
- `LogicalName(displayName, prefix)`: схемне ім'я в **нижньому регістрі**. `"Credit Score"` → `contoso_creditscore`.
- `EntitySetName(displayName, prefix)`: множина логічного імені для URL Web API за спрощеним правилом англійської: закінчення `y` → замінити на `ies`; закінчення `s` → додати `es`; інакше додати `s`.

Не змінюйте `Main`. Очікуваний результат:

```text
Tables:
  Project -> contoso_Project | contoso_project | contoso_projects
  Delivery Address -> contoso_DeliveryAddress | contoso_deliveryaddress | contoso_deliveryaddresses
  Company -> contoso_Company | contoso_company | contoso_companies
  Business Process -> contoso_BusinessProcess | contoso_businessprocess | contoso_businessprocesses
Columns:
  Credit Score -> new_CreditScore | new_creditscore
  ERP customer code -> new_ERPCustomerCode | new_erpcustomercode
  e-mail 2 -> new_EMail2 | new_email2
```

Зверніть увагу: ім'я набору сутностей виводиться лише для таблиць, бо стовпці не мають власного URL.

Підказка: `displayName.Split(new[] { ' ', '-', '_', '.' }, StringSplitOptions.RemoveEmptyEntries)` дає слова, `char.ToUpperInvariant(word[0]) + word.Substring(1)` робить одне з великої літери, а `ToLowerInvariant()` і `EndsWith()` роблять решту.
