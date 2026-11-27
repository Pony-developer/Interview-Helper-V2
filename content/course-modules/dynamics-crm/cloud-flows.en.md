Power Automate **cloud flows** are the low-code way to automate Dataverse: they react to data changes, call hundreds of connectors and need no deployment of code. Every Dynamics developer works next to flows, so an interviewer expects you to know what they can do, how they are triggered, and where they stop being the right tool.

## Anatomy of a flow

A flow is a **trigger** followed by **actions**. Each action's output can be used by later actions through **dynamic content** or **expressions** (a formula language in Workflow Definition Language: `concat()`, `addDays()`, `coalesce()`, `items('Apply_to_each')`). Flows run in the cloud, **asynchronously**, outside the Dataverse transaction.

## The Dataverse trigger

"When a row is added, modified or deleted" has these settings:

| Setting | What it does |
| --- | --- |
| Change type | Added, Modified, Deleted, or a combination |
| Table name | The table to watch |
| Scope | Whose rows start the flow: *User* (rows owned by the flow owner), *Business unit*, *Parent: Child business unit* or *Organization* |
| Select columns | For updates: start only when one of these columns changed. Without it, every save of the row starts a run |
| Filter rows | An OData filter on the row: `statecode eq 1 and estimatedvalue gt 10000` |
| Run as | Whose identity the Dataverse actions use: the flow owner, the row's owner, or the user who changed the row |

**Select columns** and **filter rows** are the two settings that keep a flow from running thousands of times for nothing. Add **trigger conditions** (expressions in the trigger's settings) for anything the filter cannot express.

Other triggers: *When an action is performed* (a Custom API or bound action ran), *When a flow step is run from a business process flow*, manual triggers, schedules, and triggers from other connectors (a new email, an HTTP request).

## Dataverse actions

- **Add a new row**, **Update a row**, **Delete a row**, **Get a row by ID**, **Upsert** through alternate keys.
- **List rows** with *Select columns*, *Filter rows* (OData), *Sort by*, *Expand query*, or a full **FetchXML query**. It returns up to 5,000 rows unless you turn on **pagination** in its settings, and it does not see rows the connection's user cannot read.
- **Relate rows** and **Unrelate rows** for N:N relationships.
- **Perform a bound action** or **Perform an unbound action**: call Custom APIs and messages such as `WinOpportunity`.
- **Upload or download a file or an image**.

Lookups are set with the entity set name and the id: `accounts(00000000-0000-0000-0000-000000000001)`. Choices are set with their integer values.

## Loops and conditions

- **Condition** and **Switch** branch on values.
- **Apply to each** loops over an array. It runs **one item at a time** unless you turn on *Concurrency control* (up to 50 in parallel), and then the order is no longer guaranteed.
- **Do until** repeats until a condition is true or a count or timeout is reached.
- **Compose**, **Select** and **Filter array** transform data without loops, which is faster and cheaper.

## Child flows and reuse

An instant flow with the *Manually trigger a flow* trigger and a *Respond to a PowerApp or flow* action can be called from other flows in the same solution as a **child flow**: the low-code equivalent of a shared function.

## Flows or classic workflows?

Classic background workflows still run, but Microsoft recommends cloud flows for new asynchronous automation. Classic **real-time** workflows run inside the transaction and have no flow equivalent; for that need, use a plug-in (or keep the real-time workflow). The **desktop flows** of Power Automate automate legacy UIs and are a different tool.

## In an interview

- Explain the settings of the Dataverse trigger, especially select columns, filter rows and scope.
- Say why a flow is asynchronous and what that means for validation.
- Explain the 5,000-row default of List rows and how to get more.
- Describe how you reuse logic with child flows.
