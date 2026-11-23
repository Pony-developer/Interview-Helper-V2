An HTML page embedded in a form runs in an **iframe**. It often needs to read form values, react when they change, or write back. And sometimes the page should open as a **dialog** instead. Both have supported patterns.

## From the form into the page: getContentWindow

The form script owns the connection. When the form loads, it gets the page's window and hands over what the page needs:

```javascript
// Form script (OnLoad)
async function onLoad(executionContext) {
  const fc = executionContext.getFormContext();
  const control = fc.getControl("WebResource_creditsummary");
  const pageWindow = await control.getContentWindow();
  pageWindow.setClientApiContext(Xrm, fc);
}
```

```javascript
// creditcheck.js, inside the HTML web resource
let formContext = null;

window.setClientApiContext = function (xrm, fc) {
  window.Xrm = xrm;
  formContext = fc;
  render();
  fc.getAttribute("creditlimit").addOnChange(render);    // react to form changes
};

function render() {
  const limit = formContext.getAttribute("creditlimit").getValue();
  document.getElementById("result").textContent = limit === null ? "No limit" : "Limit: " + limit;
}
```

`getContentWindow()` returns a promise that resolves when the page has loaded, so there is no race between the form and the iframe. The page then uses the **real form context**: it can read and set values, add OnChange handlers, show notifications. That is the documented replacement for the old habit of reading `parent.Xrm.Page` from inside the iframe.

Web resource and iframe controls also have `setSrc(url)` / `getSrc()` to change the page, for example passing a new `data` value after a field changes.

## From the page to the form

With the form context handed over, the page simply calls it: `formContext.getAttribute("contoso_rating").setValue(3)`. Keep the page's responsibilities clear: either the page edits form values (and the user saves), or it writes to Dataverse with `Xrm.WebApi` and tells the form to refresh with `formContext.data.refresh(false)`.

## Opening a page as a dialog

```javascript
// From a command or a form script
const pageInput = {
  pageType: "webresource",
  webresourceName: "contoso_/html/creditcheck.html",
  data: JSON.stringify({ accountId: fc.data.entity.getId() }),
};
const options = { target: 2, position: 1, width: { value: 600, unit: "px" }, height: { value: 400, unit: "px" }, title: "Credit check" };

await Xrm.Navigation.navigateTo(pageInput, options);
await fc.data.refresh(false);     // the dialog may have changed data: re-read it
```

- `target: 2` opens a modal dialog; `position: 1` centres it, `2` docks it on the side.
- The page reads `data` from its URL, as in the previous lecture.
- The promise resolves when the dialog closes. A simple way to return a result is for the page to save it to Dataverse (or `sessionStorage`) before closing, and for the caller to read it afterwards. Custom pages offer a richer way to return values.
- Inside a dialog, the page can close itself with `window.close()`.

## Messages between windows

When neither pattern fits (for example two web resources on one form talking to each other), `window.postMessage` with a check of `event.origin` works across iframes in a supported, explicit way. Avoid reaching into other frames' globals directly.

## In an interview

- Show how a form script passes `Xrm` and the form context to an embedded page.
- Explain why `getContentWindow` is better than `parent.Xrm` inside the page.
- Open an HTML web resource as a dialog with parameters.
- Explain how data flows back from a dialog to the form.
