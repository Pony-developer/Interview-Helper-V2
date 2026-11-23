Form scripts run inside a big application you did not write. Debugging them well means using the browser's tools, a few model-driven tricks, and tests that run without a browser.

## Browser developer tools

Press **F12** on the form:

- **Sources**: find your web resource (search for its name, e.g. `account.js`), set breakpoints, step through, inspect `formContext`. A `debugger;` statement in the code breaks there whenever the tools are open.
- **Console**: errors from your handlers, and your own `console.log` while developing (remove them, or guard them, before shipping).
- **Network**: Web API calls with their URLs, status codes and responses; filter by `api/data`.

Minified bundles are hard to read: produce **source maps** in development builds so breakpoints work on your TypeScript.

## Swap the script without deploying: AutoResponder

A proxy such as **Fiddler** (its AutoResponder) or a browser extension that redirects requests can answer the request for `…/WebResources/contoso_/scripts/account.js` with **your local file**. You edit locally, refresh the form, and test against real data in a shared environment without uploading, publishing or affecting other users. It is the fastest feedback loop for client-side work.

## Turn things off to isolate a problem

Model-driven apps accept troubleshooting **URL flags**; for example adding `&flags=DisableFormHandlers=true` loads the form without its event handlers, which tells you quickly whether a problem comes from scripts or from the form itself. **Monitor** shows each handler, its library and how long it took, and its *form checker* reports script errors and slow handlers.

## Common bugs

- `Cannot read properties of null`: a field that is not on this form, or an empty value.
- A check that "sometimes" fails: an asynchronous call that the save does not wait for.
- Values compared wrongly: lookup ids with braces and upper case, choice values as numbers vs labels, dates in the user's time zone.
- The handler never runs: wrong function name or namespace in the event registration, missing "pass execution context", or the library is not added to the form.
- Changes not visible: the web resource was saved but not **published**, or the browser cached the old version.

## Unit tests with mocks

Scripts with logic deserve tests. With **Jest** and a mock of the Client API (the community library **xrm-mock** builds a fake `Xrm` and form context), you can test handlers in Node. A test looks roughly like this (check the library's README for the exact helper names):

```javascript
import { XrmMockGenerator } from "xrm-mock";
import { Contoso } from "../src/account";

beforeEach(() => {
  XrmMockGenerator.initialise();
  XrmMockGenerator.Attribute.createOptionSet("industrycode", 7);
  XrmMockGenerator.Attribute.createString("contoso_procurementcode", "");
});

test("shows the procurement code for public sector", () => {
  Contoso.Account.onLoad(XrmMockGenerator.getEventContext());
  expect(Xrm.Page.getControl("contoso_procurementcode").getVisible()).toBe(true);
});
```

(The mock exposes a page object for assertions; your production code still uses the form context.) Mock `Xrm.WebApi` calls with Jest to test asynchronous logic without a server. End-to-end UI tests with tools such as Playwright are slower and brittle on model-driven forms; keep them for a few critical journeys.

## In an interview

- Explain how you set a breakpoint in a web resource and read its Web API calls.
- Explain how AutoResponder-style redirection speeds up client-side development.
- List common reasons a form script does not run or misbehaves.
- Explain how you unit test form scripts.
