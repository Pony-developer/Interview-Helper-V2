"Would you use a plug-in or a workflow here?" is one of the most common Dynamics interview questions. A good answer compares them on a few clear dimensions and ends with a recommendation.

## Side by side

| | Plug-in | Classic workflow (+ custom activities) | Power Automate cloud flow |
| --- | --- | --- | --- |
| Built by | Developer (C#) | Admin in a designer; developer for custom steps | Maker in a designer |
| Change needs | Build and deployment | Edit and activate | Edit and save |
| Stages | PreValidation, PreOperation, PostOperation | Before/after the save (real-time), after (background) | After the save |
| Change the record before it is saved | Yes, on the Target | Limited (real-time "before" events) | No |
| Synchronous / transactional | Yes | Real-time workflows: yes | No |
| Messages | Any message, including Retrieve, Associate, custom | Create, Update, Delete, status, owner, on demand | Dataverse triggers, schedules, many connectors |
| Waits, timeouts, long processes | No (2-minute limit) | Yes (background) | Yes (up to 30 days) |
| Calls to other systems | Possible but should be short | Through custom activities | Hundreds of connectors |
| Performance | Fastest | Slower, especially background | Slowest, separate service |
| Testing | Unit tests, profiler | Harder; activities unit-testable | Harder; run history |
| Future | Fully supported | Migration of background workflows to flows recommended | Recommended for automation |

## Choosing

- **Plug-in** when the rule must always hold, must run in the transaction, must change the record before saving, is complex, or must be fast: validation, calculated values, rules across tables.
- **Real-time workflow** when admins need to own a simple synchronous rule, and the organisation still uses them; consider a plug-in or business rule for new work.
- **Cloud flow** for notifications, approvals, integrations through connectors, scheduled jobs, and processes that wait for people.
- **Custom API** when logic must be shared by plug-ins, flows, apps and integrations.

## A sample answer

> "When a quote is approved, create an order and email the customer."
>
> I would create the order in a **synchronous PostOperation plug-in** on the quote's status change, because the order must exist in the same transaction and the logic is non-trivial. The **email** goes in a **cloud flow** triggered by the new order, because it can happen a few seconds later, uses an email connector and is something the business may want to change without a deployment.

Splitting one requirement between the right tools, and saying why, is what interviewers look for.

## Migrating old workflows

When modernising a system: move background workflows to cloud flows; move logic from custom activities into Custom APIs (callable from flows) or plug-ins; keep real-time workflows only where they are simple and supported. Migrate one process at a time, with the old one deactivated only when the new one is verified.

## In an interview

- Compare plug-ins, classic workflows and cloud flows on transaction, timing, ownership and testability.
- Explain when you would still write a custom workflow activity.
- Split a sample requirement between a plug-in and a flow and justify it.
