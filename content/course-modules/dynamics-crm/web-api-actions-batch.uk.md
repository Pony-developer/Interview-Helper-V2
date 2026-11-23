Окрім CRUD, Web API надає кожне повідомлення Dataverse як OData **функцію** чи **дію** і дає змогу надсилати багато операцій разом через **`$batch`**.

## Функції та дії

- **Функція** не має побічних ефектів і викликається через **GET**; параметри йдуть в URL.
- **Дія** може змінювати дані й викликається через **POST**; параметри йдуть у тілі JSON.
- Обидві можуть бути **неприв'язаними** (глобальними) чи **прив'язаними** до таблиці чи запису; прив'язані викликають через URL запису з простором імен `Microsoft.Dynamics.CRM.`.

```http
GET  [org]/api/data/v9.2/WhoAmI
GET  [org]/api/data/v9.2/CalculateRollupField(Target=@t,FieldName=@f)?@t={'@odata.id':'accounts(<id>)'}&@f='contoso_totalorders'

POST [org]/api/data/v9.2/WinOpportunity
{ "Status": 3, "OpportunityClose": { "subject": "Won!", "opportunityid@odata.bind": "/opportunities(<id>)" } }

POST [org]/api/data/v9.2/accounts(<id>)/Microsoft.Dynamics.CRM.contoso_CheckCredit
{ "contoso_Amount": 25000 }
```

Ваші **Custom API** з'являються так само: функція, якщо задано *Is Function*, інакше дія; прив'язана, якщо ви обрали прив'язку. Документ `$metadata` перелічує всі функції й дії з їхніми параметрами.

## Виклик повідомлень зі скриптів форм

`Xrm.WebApi.online.execute` надсилає об'єкт запиту, що описує себе через `getMetadata`:

```javascript
const request = {
  entity: { entityType: "account", id: accountId },        // прив'язаний запис
  contoso_Amount: 25000,
  getMetadata: () => ({
    boundParameter: "entity",
    operationType: 0,                                       // 0 дія, 1 функція, 2 CRUD
    operationName: "contoso_CheckCredit",
    parameterTypes: {
      entity: { typeName: "mscrm.account", structuralProperty: 5 },
      contoso_Amount: { typeName: "Edm.Decimal", structuralProperty: 1 },
    },
  }),
};
const response = await Xrm.WebApi.online.execute(request);
const result = await response.json();                       // { contoso_Approved: true, … }
```

Це багатослівно, тож команди обгортають поширені запити в невеликі допоміжні функції або генерують їх інструментами.

## $batch

`$batch` надсилає багато операцій **одним HTTP-запитом** у форматі `multipart/mixed`. Операції всередині **change set** утворюють **транзакцію**: усі вдаються або всі скасовуються. Усередині change set запит може посилатися на рядок, створений раніше в тому самому наборі, через його **Content-ID**:

```text
POST [org]/api/data/v9.2/$batch
Content-Type: multipart/mixed; boundary=batch_1

--batch_1
Content-Type: multipart/mixed; boundary=changeset_1

--changeset_1
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: 1

POST [org]/api/data/v9.2/accounts HTTP/1.1
Content-Type: application/json

{ "name": "Contoso" }
--changeset_1
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: 2

POST [org]/api/data/v9.2/contacts HTTP/1.1
Content-Type: application/json

{ "lastname": "Koval", "parentcustomerid_account@odata.bind": "$1" }
--changeset_1--
--batch_1--
```

Запити поза change set виконуються незалежно; `Prefer: odata.continue-on-error` дає продовжити після помилки. Пакет містить до 1000 запитів. `Xrm.WebApi.online.executeMultiple` будує пакети зі скриптів форм (масив усередині масиву — це change set).

## Помилки, імперсонація, ліміти

- Помилки повертають тіло JSON `{ "error": { "code": "0x…", "message": "…" } }` зі статусом 4xx/5xx; сюди потрапляє повідомлення `InvalidPluginExecutionException` плагіна.
- `CallerObjectId: <object id в Entra>` діє від імені іншого користувача (з потрібним привілеєм).
- Діють ліміти захисту сервісу: на **429** чекайте `Retry-After`.

## На співбесіді

- Поясніть функції проти дій і прив'язані проти неприв'язаних, із прикладом URL для кожного.
- Викличте Custom API зі скрипту форми.
- Поясніть, що гарантує change set і як працюють посилання Content-ID.
- Поясніть, як помилки плагінів з'являються у відповідях Web API.
