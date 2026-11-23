To write good plug-ins you need a mental picture of what happens between a user clicking **Save** and a row landing in the database.

## The layers

```text
 Clients            model-driven apps · mobile · Outlook · Power Automate · integrations
                                      │  HTTPS (OAuth)
 Web services       Web API (OData v4)  ·  Organization service (used by the .NET SDK)
                                      │
 Platform           security checks · event execution pipeline
                    (plug-ins, business rules, real-time workflows) · metadata cache
                                      │
 Data               Azure SQL (rows) · file and image storage · search index
 ─────────────────────────────────────────────────────────────────────────────
 Background         asynchronous service: async plug-ins, workflows, system jobs
 Sandbox            isolated workers that run plug-in code
```

**Clients** never touch the database. Every client, including the app's own forms, goes through the **web services**. That is why server-side logic protects data from every source: there is no back door.

The **platform layer** handles each request: it checks the caller's privileges, loads metadata (what columns a table has, their types, the registered steps), and runs the **event execution pipeline**, where your plug-ins plug in. More about the pipeline later in this module.

The **data layer** is Azure SQL for table rows, plus storage for files and images, and a search index. You never write SQL against it directly; the platform generates queries from QueryExpression, FetchXML and Web API requests, and adds security filters.

## Synchronous and asynchronous work

- **Synchronous** logic runs inside the request while the user waits: synchronous plug-ins, real-time workflows, business rules.
- **Asynchronous** work is put in a queue as a **system job** and processed by the **asynchronous service**: asynchronous plug-ins, background workflows, bulk deletes, imports. Flows run in Power Automate, a separate service that reacts to Dataverse events.

## The sandbox

In Dynamics 365 online, plug-ins run in the **sandbox**: isolated worker processes, separated from the platform and from other customers. The sandbox:

- gives plug-ins no access to the file system, registry or event log;
- allows outbound HTTP/HTTPS calls only to host names (no IP addresses);
- stops any single execution after **2 minutes**;
- loads your assembly from the database, where registration stored it.

On-premises installations can also register plug-ins outside the sandbox ("isolation mode: none"), which is why older code sometimes does things that fail online.

## Online and on-premises

| | Online (Dataverse) | On-premises (v9) |
| --- | --- | --- |
| Hosting | Microsoft, in Azure, multi-tenant | Your servers: front-end, back-end and deployment roles |
| Updates | Continuous, twice-yearly release waves | You install updates |
| Plug-ins | Sandbox only | Sandbox or full trust |
| Authentication | Microsoft Entra ID (OAuth) | Active Directory, claims-based / IFD |
| Database access | None | Possible, but unsupported for writes |

Almost all new projects are online; knowing the on-premises differences helps when you inherit an old system or migrate one.

## Why it matters for plug-ins

- Your code runs in the **middle** of a request: slow code makes every save slow.
- It runs in a **shared** process and can be called **concurrently**: keep it stateless.
- It is part of a **transaction** when synchronous: an exception rolls back the save.
- It runs **for every client**, including imports and integrations, so it must handle data you did not expect from a form.

## In an interview

- Draw the layers from client to database and say where plug-ins run.
- Explain why no client can bypass server-side logic.
- Explain what the asynchronous service does.
- List the sandbox restrictions and the differences between online and on-premises.
