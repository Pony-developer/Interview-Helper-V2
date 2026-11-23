Dynamics 365 is built to be configured. A large share of requirements can be met without writing a line of C#: new tables and columns, forms and views, business rules, formula and rollup columns, Power Automate flows, security roles. So the first question a good Dynamics developer asks is not "how do I code this?" but "**does this need code at all?**"

## What configuration does well

| Tool | Good for |
| --- | --- |
| Business rules | Show, hide, require, lock and default fields; simple validation |
| Formula, calculated and rollup columns | Values derived from other columns or child records |
| Power Automate flows | Notifications, approvals, calling other services through connectors |
| Business process flows | Guiding users through stages |
| Duplicate detection, auditing, security | Platform features you switch on |

Configuration is quicker to build, easier for others to change, and upgrades with the platform.

## When code is the right answer

Write a **plug-in** (server-side C#) when the rule:

- **must always hold**, whatever the source of the change: form, import, API, flow, another plug-in;
- must run **inside the transaction**, so the save and the rule succeed or fail together ("an order line cannot exceed the stock");
- needs **complex logic**: loops over related records, calculations across several tables, rules that business rules cannot express;
- must be **fast and synchronous**: flows run asynchronously and a user would see stale data;
- has to **change the record being saved** before it is written, without a second update;
- is **reused** by several apps and integrations through a **Custom API**.

Write **client-side code** (form scripts, PCF controls) when the need is about the user experience on a form, and remember it never protects the data on its own.

## The cost of code

Code is not free:

- it needs a developer to change it, a build and a deployment;
- it can slow down every save if it is synchronous and careless;
- it has to be tested, kept in source control and maintained through platform updates;
- a bug in it can block users from saving records at all.

## A rule of thumb

1. Can the platform do it out of the box? Use that.
2. Can a business rule, formula column or flow do it reliably? Use that.
3. Does it need to be transactional, always enforced, fast or complex? Write a plug-in.
4. Is it purely about what the user sees on a form? Write a form script or a PCF control.

In interviews, explaining *why* you chose a plug-in over a flow (or the other way round) is often worth more than the code itself.

## What this module covers

You will see how the platform is built and which web services it exposes, what **messages** plug-ins listen to and how the **event pipeline** runs them, then build a **Hello World** plug-in from an empty project to a registered step, read data from the record being saved, and create a related record with the organization service.
