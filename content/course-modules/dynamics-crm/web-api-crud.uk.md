**Web API** — це ендпоінт OData v4, яким може користуватися будь-який клієнт: скрипти форм через `Xrm.WebApi`, HTML-сторінки й інші застосунки через звичайний HTTP. Ця лекція — про створення, читання, оновлення й видалення рядків.

## Запити й заголовки

Базовий URL: `[org]/api/data/v9.2/`. Кожен запит надсилає:

```text
Accept: application/json
OData-MaxVersion: 4.0
OData-Version: 4.0
Content-Type: application/json; charset=utf-8      (коли є тіло)
```

З форми чи веб-ресурсу на тому самому домені виклик автентифікує сесія браузера. Інші застосунки надсилають `Authorization: Bearer <token>`.

## Створення

```http
POST [org]/api/data/v9.2/contacts
{
  "firstname": "Olena",
  "lastname": "Koval",
  "emailaddress1": "olena@contoso.com",
  "parentcustomerid_account@odata.bind": "/accounts(00000000-0000-0000-0000-000000000001)"
}
```

Відповідь — **204 No Content** з URL нового запису в заголовку **`OData-EntityId`**. Додайте `Prefer: return=representation`, щоб отримати **201** зі створеним рядком (стовпці обирайте через `$select` в URL).

Lookup задають через **`<навігаційна властивість>@odata.bind`**: ім'я однозначної навігаційної властивості (для поліморфних lookup воно містить таблицю: `parentcustomerid_account`, `parentcustomerid_contact`) і URL пов'язаного запису. **Глибока вставка** (deep insert) створює пов'язані рядки одним запитом, вкладаючи їх.

## Читання

```http
GET [org]/api/data/v9.2/contacts(<id>)?$select=fullname,emailaddress1,_parentcustomerid_value
Prefer: odata.include-annotations="*"
```

```json
{
  "contactid": "…",
  "fullname": "Olena Koval",
  "_parentcustomerid_value": "00000000-0000-0000-0000-000000000001",
  "_parentcustomerid_value@OData.Community.Display.V1.FormattedValue": "Contoso",
  "_parentcustomerid_value@Microsoft.Dynamics.CRM.lookuplogicalname": "account"
}
```

Id lookup повертаються як **`_<стовпець>_value`**. З налаштуванням `include-annotations` ви також отримуєте **відформатовані значення**: підписи choice, назви lookup, гроші й дати у форматі користувача.

## Оновлення та upsert

```http
PATCH [org]/api/data/v9.2/contacts(<id>)
If-Match: *
{ "telephone1": "+380 44 000 0000" }
```

`PATCH` за URL запису робить **upsert**: створює рядок, якщо такого id немає. `If-Match: *` перетворює його на лише оновлення (404, якщо немає); `If-None-Match: *` — на лише створення. Надсилайте лише змінені стовпці. Для оптимістичного конкурентного доступу надсилайте `@odata.etag` рядка в `If-Match`: оновлення впаде з 412, якщо хтось тим часом його змінив.

Очистити lookup: `DELETE [org]/api/data/v9.2/contacts(<id>)/parentcustomerid_account/$ref` або прив'язати його до `null`. Альтернативні ключі працюють в URL: `PATCH accounts(accountnumber='C-1042')`.

## Видалення

```http
DELETE [org]/api/data/v9.2/contacts(<id>)
```

## Те саме через Xrm.WebApi

```javascript
const { id } = await Xrm.WebApi.createRecord("contact", {
  firstname: "Olena", lastname: "Koval",
  "parentcustomerid_account@odata.bind": `/accounts(${accountId})`,
});
const contact = await Xrm.WebApi.retrieveRecord("contact", id, "?$select=fullname,_parentcustomerid_value");
await Xrm.WebApi.updateRecord("contact", id, { telephone1: "+380 44 000 0000" });
await Xrm.WebApi.deleteRecord("contact", id);
```

`Xrm.WebApi` сам додає заголовки й базовий URL, працює офлайн на мобільних, якщо таблиця доступна офлайн, і повертає проміси.

## На співбесіді

- Напишіть тіло POST-запиту, що задає lookup.
- Поясніть різницю між 204 і `Prefer: return=representation`.
- Поясніть `_column_value` і анотації відформатованих значень.
- Поясніть, як PATCH робить upsert і як `If-Match` це змінює.
