Lookup-поля — це місце, де користувачі помиляються найчастіше: обирають контакт не з тієї компанії, товар зі знятої лінійки. Скрипти можуть звузити вибір lookup і заповнювати lookup за користувача.

## Фільтрація через addPreSearch і addCustomFilter

```javascript
function onLoad(executionContext) {
  const fc = executionContext.getFormContext();
  fc.getControl("primarycontactid").addPreSearch(filterContacts);
}

function filterContacts(executionContext) {
  const fc = executionContext.getFormContext();
  const accountId = fc.data.entity.getId();
  if (!accountId) return;                                  // новий запис: нема за чим фільтрувати
  const filter =
    `<filter type="and">
       <condition attribute="parentcustomerid" operator="eq" value="${accountId}" />
       <condition attribute="statecode" operator="eq" value="0" />
     </filter>`;
  fc.getControl("primarycontactid").addCustomFilter(filter, "contact");
}
```

- `addPreSearch(handler)` реєструє обробник, що виконується **щоразу**, коли lookup збирається шукати.
- `addCustomFilter(fetchXmlFilter, entityLogicalName)` треба викликати **всередині** цього обробника. Він додає FetchXML `<filter>` поверх власного фільтра подання lookup.
- Другий аргумент важливий для lookup на кілька таблиць (Customer, Regarding): він застосовує фільтр лише до цієї таблиці.
- `removePreSearch(handler)` знімає фільтр, наприклад коли прапорець каже «показати всі контакти».

Фільтр — це допомога користувачу. Через API чи іншу форму все одно можна задати будь-яке значення; якщо правило суворе, забезпечте його плагіном.

## Власні подання

Коли фільтра недостатньо (інші стовпці, з'єднання, інше сортування), додайте ціле подання:

```javascript
const viewId = "{00000000-0000-0000-0000-000000000001}";   // будь-який унікальний GUID
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

Lookup також мають `setDefaultView(viewId)`, `setEntityTypes(["account"])`, щоб обмежити lookup на кілька таблиць, і `getEntityTypes()`.

## Заповнення lookup зі скрипту

```javascript
// З результату запиту
const contacts = await Xrm.WebApi.retrieveMultipleRecords("contact",
  `?$select=fullname&$filter=_parentcustomerid_value eq ${accountId} and statecode eq 0&$top=1`);
if (contacts.entities.length) {
  const c = contacts.entities[0];
  fc.getAttribute("primarycontactid").setValue([{ id: c.contactid, name: c.fullname, entityType: "contact" }]);
}

// Дати користувачу обрати у стандартному діалозі lookup
const picked = await Xrm.Utility.lookupObjects({ entityTypes: ["contact"], allowMultiSelect: false });
if (picked.length) fc.getAttribute("primarycontactid").setValue(picked);
```

Завжди задавайте `name`: форма показує його без додаткового запиту. Id з `getId()` і lookup приходять у фігурних дужках; FetchXML і Web API приймають обидві форми.

## Реакція на lookup

Поєднуйте фільтрацію з OnChange: коли змінюється акаунт, очищайте контакт, що йому більше не належить, і перевіряйте фільтр знову. Пам'ятайте про `fireOnChange()`, якщо інша логіка має побачити очищене значення.

## На співбесіді

- Покажіть, як фільтрувати lookup за іншим полем на формі.
- Поясніть, чому `addCustomFilter` треба викликати всередині обробника PreSearch.
- Поясніть, коли натомість використати `addCustomView`.
- Покажіть, як правильно задати значення lookup.
