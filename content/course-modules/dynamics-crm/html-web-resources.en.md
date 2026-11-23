Before PCF controls and custom pages, **HTML web resources** were the way to add custom UI to Dynamics: a small HTML page, stored in Dataverse, shown inside a form, a dashboard or a dialog. Many systems still use them, and they remain handy for simple pages.

## Web resource types

Web resources are files stored as solution components: **HTML**, **JavaScript**, **CSS**, **XML**, images (**PNG, JPG, GIF, ICO, SVG**), **XSL** and **RESX**. They are served from `[org]/WebResources/<name>`, so an HTML page can load its own scripts and styles with relative paths:

```text
contoso_/html/creditcheck.html
contoso_/html/creditcheck.js
contoso_/html/creditcheck.css
```

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="creditcheck.css">
  <script src="creditcheck.js"></script>
</head>
<body>
  <div id="result">Loading…</div>
</body>
</html>
```

Use virtual folders in the names (`contoso_/html/…`) so relative paths keep working and your files are grouped.

## Where they appear

- **On a form**: insert a *Web resource* control, choose the page, and set its options: whether to pass the record's id and table name, a custom `data` parameter, border and scrolling, and whether it is visible by default.
- **On dashboards** and in the **site map** (as a page in the app's navigation), referenced as `$webresource:contoso_/html/report.html`.
- **In dialogs**: opened with `Xrm.Navigation.navigateTo` (next lecture).

## Parameters

When the form option *Pass record object-type code and unique identifier as parameters* is on, the page's URL contains `id`, `typename`, `orgname`, `userlcid` and `orglcid`. Your own values go into a **single** parameter called **`data`**; anything else is dropped. Encode several values in it as a query string or JSON:

```javascript
const params = new URLSearchParams(location.search);
const recordId = params.get("id");                          // "{GUID}"
const data = JSON.parse(params.get("data") || "{}");        // { mode: "summary" }
```

## Getting the context and calling Dataverse

A standalone page (site map, dashboard) can include the platform's context script and call the Web API from the same origin, with the user's session:

```html
<script src="../../ClientGlobalContext.js.aspx"></script>
```

```javascript
const ctx = GetGlobalContext();
const url = ctx.getClientUrl() + "/api/data/v9.2/accounts(" + recordId.replace(/[{}]/g, "") + ")?$select=name,creditlimit";
const response = await fetch(url, { headers: { Accept: "application/json", "OData-Version": "4.0", "OData-MaxVersion": "4.0" } });
const account = await response.json();
```

The page runs on the Dataverse domain, so the browser sends the user's authentication automatically: no tokens in your code, and the user's security applies. For a page embedded on a form, the supported way to reach `Xrm` and the form is to have the form script hand them over, which the next lecture shows.

## Security and quality

- Treat every value you put into HTML as untrusted: use `textContent`, or `Xrm.Encoding.htmlEncode`, never string-built `innerHTML` with record data.
- Do not embed secrets: the file is readable by every user who can open it.
- Keep pages small and accessible; use the app's fonts and colours so they do not look foreign.

## In an interview

- Name the web resource types and how HTML pages reference their scripts.
- Explain the parameters a form passes to an embedded page, and the `data` parameter.
- Show how a standalone page gets its context and calls the Web API.
- Name two security rules for HTML web resources.
