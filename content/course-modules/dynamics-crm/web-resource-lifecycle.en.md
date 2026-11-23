Web resources are simple files, but they live inside solutions, browsers and forms. A few lifecycle details explain most "it works for me" problems.

## Dependencies

A web resource can declare **dependencies** in its properties:

- **Web resource dependencies**: other web resources (shared JavaScript libraries, CSS, images, RESX) that must be present. For script libraries on forms, dependent libraries are also **loaded** before yours, which is the supported way to share a common library.
- **Attribute dependencies** (for form libraries and event handlers): columns the script reads, so the form designer warns before someone removes them.

Dependencies also make solutions safer: exporting a solution with a web resource but without its dependency produces a warning instead of a broken import.

## Publishing and caching

Saving a web resource is not enough; it has to be **published** before users get it (solution imports publish automatically). Browsers cache web resources aggressively; the platform adds a version token to their URLs that changes on publish, so after publishing, users get the new file on the next load.

When testing a change and still seeing the old behaviour: confirm it was published, then hard-refresh the browser or clear its cache. The AutoResponder trick from the best-practices module avoids this loop during development.

Relative references between your own files (`creditcheck.js` from `creditcheck.html`) are cached too; versioned file names or query strings are not needed, but keep files that change together in the same folder and solution.

## Size and content

- Web resources have a maximum size (5 MB by default, configurable in system settings). Large images or libraries hint that the content belongs elsewhere.
- Text-based web resources can be edited in the platform's editor, but source control and a build are the real source.
- Never put secrets in a web resource: every user who can load it can read it.

## Solutions and ALM

Web resources are ordinary solution components: add them to the solution, keep them in source control (unpacked with `pac solution clone`), deploy them managed. Unused web resources linger forever unless someone removes them; clean up when a feature is retired.

## When not to use an HTML web resource

| Need | Better choice |
| --- | --- |
| A custom input or display bound to a column or view | **PCF control** (typed, reusable, works in canvas apps too) |
| A full custom screen or dialog with data and logic | **Custom page** (a canvas page inside the model-driven app) |
| A simple page in navigation or a dialog, quick to build | HTML web resource is fine |
| A report or chart | Power BI embedded or a dashboard |

HTML web resources are not deprecated, but they run in an iframe, do not support mobile offline well, and need manual work for theming and accessibility. PCF controls and custom pages integrate better with the modern UI.

## In an interview

- Explain web resource dependencies and attribute dependencies.
- Explain why users may still see an old script after you saved a change.
- Name the alternatives to HTML web resources and when you would choose each.
- Explain how web resources move between environments.
