Form scripts are small JavaScript files that make model-driven forms smarter: show a field only when it matters, check a value as it is typed, fill in a default. You need only a part of JavaScript for them. This page covers that part.

## Variables and values

```javascript
const discount = 0.15;          // never reassigned
let label = "Normal";           // can change
label = "High";
```

Use `const` by default and `let` when the value changes. Avoid `var`: it ignores block scope and causes surprises.

Values you will meet: strings (`"Contoso"`), numbers (`42`, `0.15`), booleans (`true`), `null` (an empty field), `undefined` (something that was never set), arrays (`[1, 2, 3]`) and objects (`{ id: "…", name: "Contoso" }`).

## Comparing

Always use `===` and `!==`. The older `==` converts types (`"2" == 2` is `true`), which hides bugs.

```javascript
if (priority === 2) { … }                 // a choice value is a number
if (name !== null && name.length > 0) { … }
const title = name ?? "(no name)";        // default when null or undefined
const city = account?.address?.city;      // stop at null without an error
```

## Functions

```javascript
function onLoad(executionContext) {
    const formContext = executionContext.getFormContext();
    // …
}

const isBig = (amount) => amount > 100000;   // arrow function
```

The platform calls **your** function when a form event happens (OnLoad, OnSave, a column's OnChange) and passes an **execution context** as the first parameter if you tick *Pass execution context as first parameter*. From it you get the **form context**, the object you use for everything on the form.

## Namespaces

Many scripts from different teams can live on one form. If two define a global `onLoad`, the last one loaded wins. Put your functions into one object named after your company and table:

```javascript
var Contoso = Contoso || {};
Contoso.Account = {
    onLoad: function (executionContext) { … },
    onCreditLimitChange: function (executionContext) { … },
};
```

On the form you then register `Contoso.Account.onLoad` as the handler.

## Waiting for the server: Promises

Calls to Dataverse from a script, such as `Xrm.WebApi.retrieveRecord`, take time and return a **Promise**: a value that will arrive later. Use `async` and `await` to wait for it, and `try`/`catch` for errors:

```javascript
async function showParentPhone(executionContext) {
    const formContext = executionContext.getFormContext();
    const parent = formContext.getAttribute("parentcustomerid").getValue();
    if (!parent) return;

    try {
        const account = await Xrm.WebApi.retrieveRecord("account", parent[0].id, "?$select=telephone1");
        formContext.ui.setFormNotification("Company phone: " + account.telephone1, "INFO", "phone");
    } catch (error) {
        console.error(error.message);
    }
}
```

## Debugging in the browser

Press **F12** to open the developer tools. The **Console** shows `console.log` output and errors; the **Sources** tab finds your web resource (search for its name) so you can set breakpoints; the **Network** tab shows every call to `/api/data/`. Adding `debugger;` in your code stops there when the tools are open.

## TypeScript

Most teams write form scripts in **TypeScript** and compile them to JavaScript. With the `@types/xrm` package, the editor knows every `formContext` method and catches typos such as `getAtribute` before you deploy. Everything on this page is valid TypeScript too.
