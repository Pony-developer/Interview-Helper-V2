Beyond CRUD, the Web API exposes every Dataverse message as an OData **function** or **action**, and lets you send many operations together with **`$batch`**.

## Functions and actions

- A **function** has no side effects and is called with **GET**; parameters go in the URL.
- An **action** may change data and is called with **POST**; parameters go in the JSON body.
- Both can be **unbound** (global) or **bound** to a table or a record; bound ones are called through the record's URL with the `Microsoft.Dynamics.CRM.` namespace.

```http
GET  [org]/api/data/v9.2/WhoAmI
GET  [org]/api/data/v9.2/CalculateRollupField(Target=@t,FieldName=@f)?@t={'@odata.id':'accounts(<id>)'}&@f='contoso_totalorders'

POST [org]/api/data/v9.2/WinOpportunity
{ "Status": 3, "OpportunityClose": { "subject": "Won!", "opportunityid@odata.bind": "/opportunities(<id>)" } }

POST [org]/api/data/v9.2/accounts(<id>)/Microsoft.Dynamics.CRM.contoso_CheckCredit
{ "contoso_Amount": 25000 }
```

Your **Custom APIs** appear the same way: a function if *Is Function* is set, otherwise an action, bound if you chose a binding. The `$metadata` document lists every function and action with its parameters.

## Calling messages from form scripts

`Xrm.WebApi.online.execute` sends a request object that describes itself through `getMetadata`:

```javascript
const request = {
  entity: { entityType: "account", id: accountId },        // the bound record
  contoso_Amount: 25000,
  getMetadata: () => ({
    boundParameter: "entity",
    operationType: 0,                                       // 0 action, 1 function, 2 CRUD
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

It is verbose, so teams wrap common requests in small helpers, or generate them with tools.

## $batch

`$batch` sends many operations in **one HTTP request** in `multipart/mixed` format. Operations inside a **change set** form a **transaction**: they all succeed or all fail. Inside a change set, a request can refer to a row created earlier in the same set by its **Content-ID**:

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

Requests outside change sets run independently; `Prefer: odata.continue-on-error` keeps going after a failure. A batch holds up to 1,000 requests. `Xrm.WebApi.online.executeMultiple` builds batches from form scripts (an array inside the array is a change set).

## Errors, impersonation, limits

- Errors return a JSON body `{ "error": { "code": "0x…", "message": "…" } }` with 4xx/5xx status; a plug-in's `InvalidPluginExecutionException` message arrives here.
- `CallerObjectId: <Entra object id>` impersonates another user (with the right privilege).
- Service protection limits apply: on **429**, wait for `Retry-After`.

## In an interview

- Explain functions vs actions and bound vs unbound, with an example URL for each.
- Call a Custom API from a form script.
- Explain what a change set guarantees and how Content-ID references work.
- Explain how errors from plug-ins appear in Web API responses.
