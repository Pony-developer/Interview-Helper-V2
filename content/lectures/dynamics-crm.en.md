---
skill: dynamics-crm
title: "Microsoft Dynamics 365 and Dataverse: data, security and customisation"
summary: "How Dataverse stores business data in tables with relationships, the Web API that applications use, solutions and environments for safe delivery, security roles and privilege depth, business rules and plug-ins, and when to choose a flow or code."
readingMinutes: 10
---

Microsoft Dynamics 365 is a family of business applications (sales, customer service, field service, finance) built on **Dataverse**, a cloud data platform. Dataverse stores business data in tables, enforces security per record, and exposes everything through an API. Most Dynamics work is configuring that platform and extending it carefully, rather than building an application from scratch.

## Tables, columns and relationships

A **table** (historically called an entity) holds one kind of record: accounts, contacts, opportunities, or your own custom table. Each row has **columns** of defined types: text, numbers, dates, choices (option sets), currency, and **lookups** that point to another table.

Relationships connect tables:

- **One-to-many (1:N)**: an account has many contacts. The "many" side holds a lookup column (the contact's parent account).
- **Many-to-many (N:N)**: a contact can belong to several marketing lists, and a list has many contacts. The platform stores the links in an intersect table.
- **Self-referencing**: a record points to another record in the same table, such as an account's parent account.

Use **alternate keys** when external systems need a stable identifier other than the GUID, such as an employee number or an ERP customer code.

## The Web API

Applications read and write Dataverse through an **OData v4 REST API**. Each table has an entity set name (plural and lowercase, such as `accounts`), and the base URL includes the API version, for example `…/api/data/v9.2/`. Version numbers change over time, so check Microsoft Learn for the current one.

- `GET accounts?$select=name,revenue&$filter=statecode eq 0&$top=10` reads rows, with projection, filtering, ordering and paging options.
- Results larger than a page come with an `@odata.nextLink` URL. Follow it until it is absent, rather than building `$skip` offsets yourself.
- `POST` creates a row; the new record's address comes back in the `OData-EntityId` header.
- Lookups are set with `@odata.bind`: `"parentcustomerid_account@odata.bind": "/accounts(<guid>)"`.
- `If-Match` with an ETag gives optimistic concurrency: an update fails if someone else changed the record first.

## Solutions and environments

Customisations (new tables, forms, workflows, plug-ins) are packaged in **solutions**. Work in a development environment, export the solution, and import it into test and then production. Use **managed** solutions for target environments: they install as a sealed layer that upgrades and uninstalls cleanly, and they stop people editing production directly. Keep solutions small and split by functional area so teams don't block one another.

## Security

Access is granted through **security roles**. A role combines privileges on each table (Create, Read, Write, Delete, Append, Append To) with a **depth**:

- **User**: records the user owns.
- **Business unit**: records in the user's business unit.
- **Parent: child business units**: records in the unit and everything below it.
- **Organisation**: all records.

A sales rep with User-depth Read sees only their accounts; a manager with Parent-child depth sees the team's. **Field-level security** hides or protects sensitive columns (salary, card numbers) even from users who can read the row. Security is enforced by the platform on every API call, so it protects integrations too.

## Business logic: rules, flows and plug-ins

Choose the lightest tool that works:

- **Business rules** are no-code conditions on a form: show a field, make it required, set a default. They run in the browser and on the server.
- **Power Automate flows** react to events (a record created, a status changed) and call other systems, with no code. Good for notifications and integrations, but harder to test and version at scale.
- **Plug-ins** are C# classes registered on a platform message such as Create or Update. A **pre-operation, synchronous** plug-in runs inside the transaction and can reject the change by throwing `InvalidPluginExecutionException`; a **post-operation, asynchronous** one runs later and can't block the save. Plug-ins are the right tool for complex validation and transactional rules, and the wrong tool for anything that can be a rule or a flow.

## Common mistakes

- Customising the default solution in production, which makes deployments unrepeatable.
- Granting System Administrator to integration accounts instead of a role with the minimum privileges.
- Writing plug-ins that call external services synchronously, which slows every save.
- Ignoring paging, so reports silently show only the first page.
- Building custom fields for data that a standard table already holds.

## Interview checklist

- Explain tables, columns and the three relationship types, and when to use an alternate key.
- Write a Web API query with `$select`, `$filter` and `$top`, and explain how to read every page.
- Explain how solutions move customisations from development to production.
- Explain privilege depth with an example of a rep and a manager.
- Choose between a business rule, a flow and a plug-in for a given requirement, and say why.
