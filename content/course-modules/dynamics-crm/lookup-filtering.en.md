Lookups are where users make the most mistakes: picking a contact from the wrong company, a product from a discontinued range. Scripts can narrow what a lookup offers and fill lookups for the user.

## Filtering with addPreSearch and addCustomFilter

```javascript
function onLoad(executionContext) {
  const fc = executionContext.getFormContext();
  fc.getControl("primarycontactid").addPreSearch(filterContacts);
}

function filterContacts(executionContext) {
  const fc = executionContext.getFormContext();
  const accountId = fc.data.entity.getId();
  if (!accountId) return;                                  // new record: nothing to filter by
  const filter =
    `<filter type="and">
       <condition attribute="parentcustomerid" operator="eq" value="${accountId}" />
       <condition attribute="statecode" operator="eq" value="0" />
     </filter>`;
  fc.getControl("primarycontactid").addCustomFilter(filter, "contact");
}
```

- `addPreSearch(handler)` registers a handler that runs **every time** the lookup is about to search.
- `addCustomFilter(fetchXmlFilter, entityLogicalName)` must be called **inside** that handler. It adds a FetchXML `<filter>` on top of the lookup view's own filter.
- The second argument matters for lookups to several tables (Customer, Regarding): it applies the filter only to that table.
- `removePreSearch(handler)` takes it off again, for example when a checkbox says "show all contacts".

The filter is a usability aid. Users can still set any value through the API or another form; if the rule is strict, enforce it in a plug-in.

## Custom views

When a filter is not enough (other columns, joins, a different sort), add a whole view:

```javascript
const viewId = "{00000000-0000-0000-0000-000000000001}";   // any unique GUID
const fetchXml = `<fetch><entity name="contact">
    <attribute name="fullname" /><attribute name="emailaddress1" />
    <filter><condition attribute="statecode" operator="eq" value="0" /></filter>
    <link-entity name="account" from="accountid" to="parentcustomerid">
      <filter><condition attribute="industrycode" operator="eq" value="7" /></filter>
    </link-entity>
  </entity></fetch>`;
const layoutXml = `<grid name="resultset" object="2" jump="fullname" select="1" icon="1" preview="1">
    <row name="result" id="contactid"><cell name="fullname" width="200" /><cell name="emailaddress1" width="200" /></row>
  </grid>`;
fc.getControl("primarycontactid").addCustomView(viewId, "contact", "Consulting contacts", fetchXml, layoutXml, true);
```

Lookups also have `setDefaultView(viewId)`, `setEntityTypes(["account"])` to restrict a multi-table lookup, and `getEntityTypes()`.

## Setting lookups from script

```javascript
// From a query result
const contacts = await Xrm.WebApi.retrieveMultipleRecords("contact",
  `?$select=fullname&$filter=_parentcustomerid_value eq ${accountId} and statecode eq 0&$top=1`);
if (contacts.entities.length) {
  const c = contacts.entities[0];
  fc.getAttribute("primarycontactid").setValue([{ id: c.contactid, name: c.fullname, entityType: "contact" }]);
}

// Let the user pick with the standard lookup dialog
const picked = await Xrm.Utility.lookupObjects({ entityTypes: ["contact"], allowMultiSelect: false });
if (picked.length) fc.getAttribute("primarycontactid").setValue(picked);
```

Always set `name`: the form shows it without another request. Ids from `getId()` and lookups come with braces; FetchXML and the Web API accept both forms.

## Reacting to lookups

Pair filtering with OnChange: when the account changes, clear a contact that no longer belongs to it, and re-check the filter. Remember `fireOnChange()` if other logic should see the cleared value.

## In an interview

- Show how to filter a lookup by another field on the form.
- Explain why `addCustomFilter` must be called inside the PreSearch handler.
- Explain when to use `addCustomView` instead.
- Show how to set a lookup value correctly.
