Middle and senior interviews often include an open task: "How would you build…?". There is no single right answer. The interviewer watches how you clarify the requirement, which platform features you reach for before code, and whether you think about security, volume and failure.

## A method for any scenario

1. **Clarify.** Who uses it, how often, how many records, from where (forms, imports, integrations), what happens on failure.
2. **Model the data.** Tables, relationships, keys, ownership.
3. **Choose where each rule runs.** Configuration first (business rules, columns, flows), code where you need a transaction, volume or full control.
4. **Cover security.** Roles, business units, column security, the identity integrations run as.
5. **Cover failure and scale.** Retries, idempotency, limits, monitoring.
6. **Deliver.** Solutions, environments, tests.

Talk through the steps aloud; the reasoning is what is being scored.

## Scenario 1: Unique invoice numbers

*"Invoices need numbers like INV-2026-00042, unique, without gaps if possible."*

- **Clarify**: Are gaps allowed? Is the number per year? Per legal entity?
- **Simplest**: an **autonumber column** with `INV-{DATETIMEUTC:yyyy}-{SEQNUM:5}`. Unique, but may have gaps and does not restart each year.
- **If gaps or yearly restarts are not allowed**: a counter table with one row per year and series. A **PreOperation plug-in on Create** of the invoice updates the counter row first (which locks it until the transaction commits), reads the value, and sets the number on `Target`. Concurrent saves queue up on the lock instead of getting duplicates, and a rolled-back save also rolls back the counter.
- **Not**: a form script or an asynchronous flow; both can produce duplicates under concurrency.

## Scenario 2: Sync accounts to an ERP

*"Every account change must reach the ERP; the ERP is sometimes down."*

- **Clarify**: Which columns? One-way or two-way? How fast? Who wins on a conflict?
- **Design**: register a **service endpoint** (or an asynchronous plug-in) on Create and Update of account with filtering attributes, posting the change to an **Azure Service Bus queue**. An **Azure Function** consumes the queue and calls the ERP with retries; poison messages go to the **dead-letter queue** with alerts.
- **Inbound**: the ERP sends changes back through an API that **upserts by alternate key** (the ERP customer number), idempotently.
- **Loops**: mark changes made by the integration user so they are not sent back, or compare values before sending.
- **Monitoring**: Application Insights on the Function, a dashboard of queue length and dead letters.

## Scenario 3: Approval of large discounts

*"Discounts above 15% need the sales director's approval before the quote can be sent."*

- **Data**: a discount column and an approval status on the quote, with an approval history table if auditors need one.
- **Rule on the server**: a **synchronous plug-in** on the quote blocks activating or sending it while a discount above 15% is not approved, whatever the source.
- **Process**: a **cloud flow** with the *Approvals* connector starts when the discount crosses the threshold (select columns + filter rows), asks the director in Teams or Outlook, and writes the result back.
- **Security**: only the director's role can set the status to approved, enforced by **column security** on the status column or by the flow's identity.
- **UX**: a business rule or form script shows a notification on the quote while approval is pending.

## Scenario 4: A customer portal

*"Customers must see their open cases and add comments."*

- **Power Pages** on the same Dataverse: contacts sign in, **table permissions** limit them to cases where they are the customer (contact or parent account scope), and a basic form lets them add notes.
- Alternative: a custom web app calling the Web API through a backend with an application user — more work, needed only when Power Pages cannot meet the requirements.
- **Never** give external users direct Dataverse licences or call the Web API from the browser with a shared credential.

## What interviewers listen for

- You asked about volume and failure before designing.
- You used platform features (autonumber, alternate keys, column security, flows) before writing code.
- Rules that must always hold are enforced on the server.
- Integrations are asynchronous, idempotent, retried and monitored.
- You can name what would change if the numbers were ten times bigger.
