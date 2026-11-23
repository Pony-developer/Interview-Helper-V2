Читання списків рядків — основна частина того, що клієнти роблять із Web API. Параметри запитів OData охоплюють вибір стовпців, фільтрацію, з'єднання, сортування, пагінацію й навіть агрегацію.

## Параметри запиту

```http
GET [org]/api/data/v9.2/contacts
    ?$select=fullname,emailaddress1
    &$filter=statecode eq 0 and emailaddress1 ne null
    &$expand=parentcustomerid_account($select=name)
    &$orderby=fullname asc
    &$top=50
```

| Параметр | Що робить |
| --- | --- |
| `$select` | Стовпці, які повернути. Використовуйте завжди. |
| `$filter` | Умови: `eq ne gt ge lt le`, `and or not`, `contains()`, `startswith()`, `endswith()` |
| `$orderby` | Сортування, `asc` / `desc` |
| `$top` | Обмежити кількість рядків |
| `$expand` | Додати пов'язані рядки через навігаційні властивості |
| `$count=true` | Додати `@odata.count` із загальною кількістю (до 5000) |
| `$apply` | Агрегація та групування |

`ne null` і `eq null` перевіряють порожні значення — це OData-спосіб сказати `IS NOT NULL` / `IS NULL`.

## Фільтрація за lookup і пов'язаними рядками

```text
$filter=_parentcustomerid_value eq 00000000-0000-0000-0000-000000000001     за id lookup
$filter=parentcustomerid_account/name eq 'Contoso'                          за стовпцем пов'язаного рядка
$filter=contact_customer_accounts/any(c: c.statecode eq 0)                  акаунти, що мають активний контакт
$filter=Microsoft.Dynamics.CRM.LastXDays(PropertyName='createdon',PropertyValue=7)
$filter=Microsoft.Dynamics.CRM.In(PropertyName='industrycode',PropertyValues=['7','9'])
```

Dataverse додає **функції запитів** (`LastXDays`, `Today`, `Above`, `Under`, `In`, `Between`…) для умов, яких звичайний OData не виражає.

## Розгортання ($expand)

- **Однозначні** навігаційні властивості (lookup) розгортаються в об'єкт: `$expand=parentcustomerid_account($select=name)`. Рядки без батьківського запису все одно повертаються, з `null`, як у **LEFT JOIN**.
- **Колекційні** (зв'язок 1:N) розгортаються в масив із власними `$select`, `$filter`, `$orderby` і `$top`: `$expand=contact_customer_accounts($select=fullname;$filter=statecode eq 0)`.

Розгортання економить звернення до сервера, але кожна розгорнута колекція коштує серверного часу; вибирайте мало стовпців.

## FetchXML через Web API

Для запитів, яких OData не виражає (складні link-entity, агрегати з групуванням), надсилайте FetchXML, закодований для URL:

```javascript
const fetchXml = `<fetch aggregate="true"><entity name="opportunity">
  <attribute name="estimatedvalue" alias="total" aggregate="sum" />
  <attribute name="ownerid" alias="owner" groupby="true" /></entity></fetch>`;
const result = await Xrm.WebApi.retrieveMultipleRecords("opportunity", "?fetchXml=" + encodeURIComponent(fetchXml));
```

## Пагінація

Сервер повертає щонайбільше 5000 рядків на сторінку (менше, якщо попросити). Задайте розмір сторінки й переходьте за посиланням на наступну:

```javascript
let url = `${base}/contacts?$select=fullname&$filter=statecode eq 0`;
const rows = [];
while (url) {
  const response = await fetch(url, { headers: { ...headers, Prefer: "odata.maxpagesize=500" } });
  const page = await response.json();
  rows.push(...page.value);
  url = page["@odata.nextLink"];          // відсутнє на останній сторінці
}
```

`Xrm.WebApi.retrieveMultipleRecords(table, options, maxPageSize)` теж повертає `nextLink`; передайте його назад як options, щоб отримати наступну сторінку. Не будуйте зсувів `$skip`: Web API не підтримує їх для таблиць Dataverse.

## На співбесіді

- Напишіть запит OData з `$select`, `$filter`, `$expand` і `$orderby`.
- Відфільтруйте за id lookup і за стовпцем пов'язаного рядка.
- Поясніть однозначний і колекційний `$expand`.
- Покажіть, як прочитати всі сторінки результату.
