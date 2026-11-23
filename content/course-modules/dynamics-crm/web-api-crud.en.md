The **Web API** is the OData v4 endpoint that every client can use: form scripts through `Xrm.WebApi`, HTML pages and other apps through plain HTTP. This lecture covers creating, reading, updating and deleting rows.

## Requests and headers

Base URL: `[org]/api/data/v9.2/`. Every request sends:

```text
Accept: application/json
OData-MaxVersion: 4.0
OData-Version: 4.0
Content-Type: application/json; charset=utf-8      (when there is a body)
```

From a form or a web resource on the same domain, the browser's session authenticates the call. Other apps send `Authorization: Bearer <token>`.

## Create

```http
POST [org]/api/data/v9.2/contacts
{
  "firstname": "Olena",
  "lastname": "Koval",
  "emailaddress1": "olena@contoso.com",
  "parentcustomerid_account@odata.bind": "/accounts(00000000-0000-0000-0000-000000000001)"
}
```

The response is **204 No Content** with the new record's URL in the **`OData-EntityId`** header. Add `Prefer: return=representation` to get **201** with the created row (use `$select` in the URL to choose its columns).

Lookups are set with **`<navigation property>@odata.bind`**: the single-valued navigation property name (for polymorphic lookups it includes the table: `parentcustomerid_account`, `parentcustomerid_contact`) and the related record's URL. A **deep insert** creates related rows in one request by nesting them.

## Retrieve

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

Lookup ids come back as **`_<column>_value`**. With the `include-annotations` preference you also get **formatted values**: choice labels, lookup names, formatted money and dates in the user's format.

## Update and upsert

```http
PATCH [org]/api/data/v9.2/contacts(<id>)
If-Match: *
{ "telephone1": "+380 44 000 0000" }
```

`PATCH` to a record URL **upserts**: it creates the row if the id does not exist. `If-Match: *` turns it into update-only (404 if missing); `If-None-Match: *` into create-only. Send only the changed columns. For optimistic concurrency, send the row's `@odata.etag` in `If-Match`: the update fails with 412 if someone changed it meanwhile.

Clear a lookup with `DELETE [org]/api/data/v9.2/contacts(<id>)/parentcustomerid_account/$ref`, or by binding it to `null`. Alternate keys work in the URL: `PATCH accounts(accountnumber='C-1042')`.

## Delete

```http
DELETE [org]/api/data/v9.2/contacts(<id>)
```

## The same with Xrm.WebApi

```javascript
const { id } = await Xrm.WebApi.createRecord("contact", {
  firstname: "Olena", lastname: "Koval",
  "parentcustomerid_account@odata.bind": `/accounts(${accountId})`,
});
const contact = await Xrm.WebApi.retrieveRecord("contact", id, "?$select=fullname,_parentcustomerid_value");
await Xrm.WebApi.updateRecord("contact", id, { telephone1: "+380 44 000 0000" });
await Xrm.WebApi.deleteRecord("contact", id);
```

`Xrm.WebApi` adds the headers and the base URL, works offline on mobile when the table is available offline, and returns promises.

## In an interview

- Write the body of a POST that sets a lookup.
- Explain the difference between 204 and `Prefer: return=representation`.
- Explain `_column_value` and formatted value annotations.
- Explain how PATCH upserts and how `If-Match` changes that.
