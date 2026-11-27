A flow built in "My flows" belongs to one person and lives in one environment. Real projects treat flows like code: they live in solutions, move through pipelines, use service accounts, handle errors and respect limits.

## Solution-aware flows

Create flows **inside a solution**. Only then are they exported, versioned and deployed with the rest of the customisations. A solution-aware flow depends on two kinds of components that make it portable:

- **Connection references** point at a connector (Dataverse, Outlook, SQL), not at a specific connection. On import, the target environment maps each reference to its own connection, usually one owned by a **service account** or a service principal, so no flow is tied to a developer's personal sign-in.
- **Environment variables** hold settings that differ between environments: an API URL, a mailbox, a team id, a feature switch. The flow reads the variable; a deployment settings file (`pac solution create-settings`) supplies values at import.

After import, flows that use connection references are turned on automatically if every reference has a connection; otherwise they stay off until someone fixes the connections.

## Ownership

A flow runs with its owner's connections and licences. When that person leaves and their account is disabled, their flows stop. Use a service account or a service principal as the owner of production flows and add a team as **co-owners**.

## Error handling

Each action has **Configure run after**: it runs after the previous step *is successful*, *has failed*, *is skipped* or *has timed out*. A **scope** groups actions, which gives the try/catch pattern:

```text
Scope "Try"      → the real work
Scope "Catch"    → run after Try has failed or has timed out:
                   log the error (result('Try')), notify, Terminate with status Failed
Scope "Finally"  → run after Catch in every state
```

Actions also have a **retry policy**: by default, failed HTTP-style calls are retried a few times with exponential back-off. Set it to *none* for calls that must not be repeated, and make the other side idempotent for calls that may be.

## Concurrency and ordering

- **Trigger concurrency** (off by default) lets several runs of the same flow work at once. With it, two updates of the same row can be processed in parallel and finish in any order.
- **Apply to each** concurrency has the same trade-off inside one run.
- A flow is triggered **after** the transaction commits, so it can see a later version of the row than the one that triggered it. Re-read the row if you need current data.

## Limits

- Every Dataverse action counts as a request against the connection user's **request limits** (Power Platform requests per licence per 24 hours) and the Dataverse **service protection limits**.
- A run lasts at most 30 days; actions have their own time-outs.
- Loops have caps (Apply to each up to 100,000 items, Do until counts and timeouts).
- Large volumes are slow: a flow that updates 50,000 rows one by one takes hours. Use a dataflow, a bulk delete job, `UpdateMultiple` from code, or a plug-in instead.

## Flow or plug-in?

| Prefer a flow | Prefer a plug-in |
| --- | --- |
| Notifications, approvals, Teams and email | Validation that must block the save |
| Calls to other services through connectors | Changes that must be in the same transaction |
| Logic that business users maintain | Logic that runs on every create or update, from any source, at high volume |
| A few runs per minute is fine | Milliseconds matter |

Many solutions combine them: a plug-in validates and sets data synchronously; a flow sends the email and updates the other system afterwards.

## Monitoring

Each flow has a **run history** with the inputs and outputs of every action (turn on *Secure inputs/outputs* for secrets). The Power Platform admin center and the flow's **analytics** show failures across runs. Failed runs of important flows should alert someone: the Catch scope can post to a Teams channel or create a record in a log table.

## In an interview

- Explain connection references and environment variables, and why a solution-aware flow needs them.
- Describe the try/catch pattern with scopes and run after.
- Explain why flows can run out of order and see newer data than the trigger.
- Choose between a flow and a plug-in for a given requirement.
