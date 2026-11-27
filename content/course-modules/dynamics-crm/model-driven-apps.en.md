A model-driven app is generated from metadata: you choose tables, forms and views, and the platform builds a responsive UI with navigation, search, grids and the command bar. Dynamics 365 Sales and Customer Service are model-driven apps too. Knowing what the platform gives you without code is what lets you say "we don't need a plug-in for that" in an interview.

## The app and its navigation

An **app module** lists which tables, forms, views, charts and dashboards users see. Its **site map** defines navigation: *areas* (the switcher at the bottom left), *groups* and *subareas* (the links). One environment can have many apps over the same tables, each for a different audience, and access to an app is granted through security roles. Apps are built in the app designer and are solution components.

## Forms

| Form type | Purpose |
| --- | --- |
| Main | The full record page: tabs, sections, columns, subgrids, the timeline |
| Quick create | A short form that opens in a side pane from a lookup or the + button |
| Quick view | Read-only parent data shown inside another form (the account's phone on a contact) |
| Card | A compact layout used in some grids and views |

A table can have several main forms, each assigned to **security roles**; users switch between the forms they may see, and a fallback form covers everyone else. On a form you can add **subgrids** of related records, **quick view** controls, the **timeline** of activities and notes, and custom controls such as PCF components.

## Views

A **view** is a saved FetchXML query plus a layout of columns. There are two kinds:

- **System views** (`savedquery`) are solution components that every user can see: the default public view, *Active Accounts*, the **Quick Find** view (its *find columns* decide what the search box looks in), the **Lookup** view used in lookup dialogs, and the **Associated** view used for related records.
- **Personal views** (`userquery`) belong to the user who created them in advanced find, and can be shared like records.

Views never bypass security: a user sees only the rows they are allowed to read.

## Charts and dashboards

**Charts** are built on top of a view (count of open opportunities by stage) and can drill down. **Dashboards** combine charts, lists and web resources; **interactive dashboards** add filtering and streams for service agents. For heavier reporting, Power BI reads Dataverse directly.

## Business rules

A **business rule** is declarative logic built in a designer, with conditions and actions:

- show or hide, enable or disable a column,
- set a column's value or default value,
- make a column required or recommended,
- show an error message on a column.

The **scope** decides where it runs. *Specific form* or *All forms* run in the browser only. **Entity** (table) scope also runs on the **server**, so it applies to records created by imports, the API and flows. Business rules work only with the table's own columns: they cannot read related records, the current user or call anything external. When that's not enough, it's time for script or code.

## Commands

The **command bar** buttons are customised with the modern command designer: a button's action and its visibility can be a **Power Fx** formula or a JavaScript function in a web resource.

## Choosing where logic goes

| Need | Tool |
| --- | --- |
| Show, hide, require or default a column on the form | Business rule (form scope) or form script |
| A value derived from the row or its parent | Calculated or formula column |
| An aggregate of child records, minutes of delay are fine | Rollup column |
| Notify, call a connector or an external API, approvals | Power Automate cloud flow (asynchronous) |
| Validate or change data in the same transaction, whatever the source | Synchronous plug-in |
| Heavy or long work after the save | Asynchronous plug-in or flow |
| A rich UI component | PCF control |

The key rule: **a rule that must hold for any data source belongs on the server** (entity-scope business rule, plug-in or real-time logic). Form scripts and form-scope rules are user convenience; an import or an integration never runs them. Classic background workflows still exist, but Microsoft recommends Power Automate flows for new asynchronous automation.

## In an interview

- Explain what a model-driven app is made of: app module, site map, forms, views, dashboards.
- Name the form types and when each is used.
- Explain the difference between system and personal views and what the Quick Find view controls.
- Explain business rule scopes and their limits.
- Choose between a business rule, a flow, a plug-in and a form script for a given requirement.
