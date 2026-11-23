Model-driven apps expose a JavaScript object model, the **Client API**, to scripts that run on forms, grids and commands. Knowing its shape saves you from guessing and from the unsupported shortcuts that break with updates.

## Two entry points

Every handler receives one of two things:

- **`executionContext`**: passed to form and grid **event handlers** (when you tick *Pass execution context as first parameter*). It knows which event fired and gives you the form.
- **`primaryControl`** (or `selectedControl`): passed to **command** scripts, configured in the command's parameters. On a form command, `primaryControl` *is* the form context.

```javascript
function onLoad(executionContext) {
  const formContext = executionContext.getFormContext();
}

function onCommand(primaryControl) {
  const formContext = primaryControl;
}
```

## The form context

```text
formContext
├── data
│   ├── entity              the record: getId(), getEntityName(), getPrimaryAttributeValue(), save(), getIsDirty(), attributes
│   ├── process             the business process flow
│   ├── refresh(save)       re-read the record from the server
│   └── save(options)
├── ui
│   ├── tabs / sections     layout
│   ├── controls            every control on the form
│   ├── quickForms          quick view forms
│   ├── process             the business process flow's UI
│   ├── formSelector        switch between forms
│   ├── setFormNotification / clearFormNotification
│   ├── getFormType()       Create, Update, Read only…
│   └── close(), refreshRibbon()
├── getAttribute(name)      shortcut to data.entity.attributes.get(name)
└── getControl(name)        shortcut to ui.controls.get(name)
```

**Attributes** are the data (one per column, even if it appears twice on the form). **Controls** are the visible elements bound to attributes, plus subgrids, web resources, iframes, quick views and timeline. Change a value on the attribute; change visibility, labels and notifications on the control.

## The Xrm namespace

`Xrm` is global and offers services that are not tied to one form:

| Namespace | For |
| --- | --- |
| `Xrm.WebApi` | CRUD, queries and messages against Dataverse (promises) |
| `Xrm.Navigation` | Open forms, URLs, web resources, alert/confirm/error dialogs, `navigateTo` |
| `Xrm.Utility` | Global context, progress indicator, lookup dialog, metadata, resource strings |
| `Xrm.App` | App-level notifications, side panes |
| `Xrm.Device` | Camera, location, file picking on mobile |
| `Xrm.Encoding` | HTML and XML encoding helpers |

`Xrm.Utility.getGlobalContext()` returns the **global context**: `userSettings` (user id, name, language, roles, time zone), `organizationSettings`, `getClientUrl()`, `client.getClient()` and `getFormFactor()`.

## The grid context

On a subgrid's events, or from `formContext.getControl("Contacts")`, you get a **grid control**: `getGrid()` gives rows and selected rows, `refresh()` reloads it, `getViewSelector()` reads and changes the view. The advanced module uses it.

## Deprecated: Xrm.Page

`Xrm.Page` was a global shortcut to "the" form. It is deprecated: it points at the wrong form in quick views, grids and dialogs, and it hides dependencies. Every new script takes the form context from the execution context or `primaryControl`. Treat any `Xrm.Page` you find as technical debt to replace.

## In an interview

- Explain how a handler gets the form context, in events and in commands.
- Draw the main parts of the form context.
- Explain the difference between attributes and controls.
- Name the `Xrm` namespaces and what each is for.
