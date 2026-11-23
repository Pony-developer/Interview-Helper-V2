"Dynamics CRM" is what most job ads still call it, but the product has been renamed several times. Knowing the names and how the pieces fit together is the first thing an interviewer checks.

## From Dynamics CRM to Dataverse

- **Dynamics CRM** (2011, 2013, 2015, 2016) was a customer relationship management product you installed on your own servers or used online.
- In 2016 Microsoft split it into the **Dynamics 365** apps: Sales, Customer Service, Field Service, Marketing (now Customer Insights - Journeys) and Project Operations. Together they are still called **Customer Engagement (CE)**.
- The platform under those apps became a product of its own: first the Common Data Service, now **Microsoft Dataverse**.
- **Dynamics 365 Finance and Supply Chain** (formerly AX) is a different product with its own X++ language. When a job ad says "Dynamics CRM developer", it means the CE side and Dataverse.

On-premises Dynamics 365 (version 9) still exists, but almost all new work is online.

## Power Platform

Dataverse is the data layer of the **Power Platform**:

- **Power Apps**: model-driven apps (forms, views and dashboards generated from Dataverse metadata), canvas apps (pixel-placed screens with Power Fx) and Power Pages (external websites).
- **Power Automate**: flows that react to events and call hundreds of connectors.
- **Power BI** for reporting and **Copilot Studio** for agents and chatbots.

Dynamics 365 Sales is, technically, a set of model-driven apps plus tables, logic and licences on top of Dataverse. A custom app you build uses the same platform, so everything in this course applies to both.

## What Dataverse gives you

- **Tables** with typed columns and relationships, described by metadata that you can read through the API.
- **Security**: business units, security roles, teams, sharing and column security, enforced on every call.
- **Business logic**: business rules, classic workflows, flows, and **plug-ins** written in C#.
- **APIs**: the OData v4 **Web API** for any language and the **SDK for .NET** (`IOrganizationService`).
- **Platform services**: auditing, duplicate detection, search, file storage, business process flows, and **solutions** to move customisations between environments.

## Environments

An **environment** is a container with one Dataverse database, its apps and its customisations, inside a Microsoft Entra tenant. A project normally has at least development, test and production environments. Sandbox environments can be copied, reset and restored; production ones are protected. Environments are created and managed in the Power Platform admin center.

## A developer's toolbox

| Tool | What it is for |
| --- | --- |
| Power Apps maker portal (make.powerapps.com) | Tables, forms, views, apps, solutions |
| Power Platform CLI (`pac`) | Auth, solutions, PCF controls, plug-in scaffolding, code generation |
| Plug-in Registration Tool | Registering assemblies, steps, images and service endpoints |
| Visual Studio / VS Code | C# plug-ins, TypeScript for form scripts and PCF |
| XrmToolBox | Community tools: FetchXML Builder, metadata browsers, bulk updates |
| `Microsoft.PowerPlatform.Dataverse.Client` | `ServiceClient` for console apps and Azure Functions |

Plug-ins target **.NET Framework 4.6.2** and reference `Microsoft.CrmSdk.CoreAssemblies`, because they run in the platform's sandbox. External apps use the modern `Dataverse.Client` package on current .NET.

## In an interview

- Say what Dataverse is and how the Dynamics 365 apps relate to it.
- Name the main Power Platform products and the difference between model-driven and canvas apps.
- Explain what an environment is and why a project has several.
- Know which tools you would use for plug-ins, solutions and queries.
