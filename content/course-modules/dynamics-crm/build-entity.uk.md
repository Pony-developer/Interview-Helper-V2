Підготуйте контакт для `service.Create` з правильними типами стовпців, як це зробила б інтеграція чи плагін.

Напишіть `Contacts.NewContact(firstName, lastName, email, accountId)`, що повертає новий `Entity("contact")` з:

| Стовпець | Значення |
| --- | --- |
| `firstname`, `lastname` | Імена без пробілів по краях (`Trim()`) |
| `emailaddress1` | Без пробілів і в нижньому регістрі; **лише** коли email задано (не `null`, не порожній і не з пробілів) |
| `preferredcontactmethodcode` | Choice: `new OptionSetValue(2)` (Email), коли є email, інакше `new OptionSetValue(1)` (Any) |
| `donotemail` | Yes/No: `true`, коли email немає, інакше `false` |
| `parentcustomerid` | Lookup: `new EntityReference("account", accountId)`; **лише** коли `accountId` не `Guid.Empty` |

`Main` виводить кожну сутність зі стовпцями в алфавітному порядку. Не змінюйте `Main`. Очікуваний результат:

```text
contact(00000000) donotemail=False emailaddress1=olena@contoso.com firstname=Olena lastname=Koval parentcustomerid=account(0000002a) preferredcontactmethodcode=2
contact(00000000) donotemail=True firstname=Taras lastname=Melnyk parentcustomerid=account(0000002a) preferredcontactmethodcode=1
contact(00000000) donotemail=True firstname=Petro lastname=Hnatiuk preferredcontactmethodcode=1
```

Id складається з нулів, бо рядок ще не створено: Dataverse призначає id під час Create.

Підказка: `string.IsNullOrWhiteSpace(email)` одним викликом відповідає на «чи є email?». Коли надсилати нічого, не додавайте стовпець зовсім, а не задавайте йому `null`.
