Your first week on a Dynamics project is full of words that mean the same thing, or almost. Microsoft renamed many of them in 2020, but old names live on in the SDK, in job ads and in the heads of senior colleagues. This page is your phrasebook.

## Old name, new name

| You will hear | Today it is called | What it is |
| --- | --- | --- |
| Entity | **Table** | A kind of record: account, contact, invoice |
| Attribute, field | **Column** | One piece of data in a record: name, email, phone |
| Record | **Row** | One account, one contact |
| Option set, picklist | **Choice** | A drop-down list with fixed values |
| Multi-select option set | **Choices** | A list where you can pick several values |
| Two options | **Yes/No** | A true/false column |
| CDS, Common Data Service | **Dataverse** | The database and platform under it all |
| CRM, CE, Customer Engagement | **Dynamics 365** apps | Sales, Customer Service, Field Service… |
| Organization, org, instance | **Environment** | One Dataverse database with its apps |

In C# code you still write `Entity`, `Attributes` and `OptionSetValue`, because the SDK kept the old names. Both vocabularies are correct; use the new ones with business people and either with developers.

## Words about data

- **Lookup**: a column that points at another row, like the contact's *Company Name* pointing at an account.
- **Primary key**: the row's unique id, a GUID such as `5f3c1c2e-…`. Every table has one (`accountid`, `contactid`).
- **Primary name column**: the column shown as the row's name in lookups and lists (`name` on account, `fullname` on contact).
- **Status** (`statecode`) and **status reason** (`statuscode`): whether the row is active or inactive, and why.
- **Owner**: the user or team the row belongs to; security often depends on it.
- **Activity**: a task, email, phone call or appointment, shown on a record's timeline.

## Words about customising

- **Solution**: a package of your changes (tables, forms, code) that is moved between environments.
- **Publisher**: who made the solution; it gives your names a prefix such as `contoso_`.
- **Form**: the page where a user edits one row. **View**: a list of rows with chosen columns and filters.
- **Model-driven app**: an app made of tables, forms and views. **Canvas app**: an app you draw screen by screen.
- **Business rule**: simple no-code logic on a form, such as "make this field required when…".
- **Web resource**: a file (JavaScript, HTML, an image) stored in Dataverse, used for form scripts.

## Words about code

- **Plug-in**: C# code that runs on the server when something happens to a row (create, update, delete).
- **Step**: the registration that tells Dataverse when to run a plug-in: which message, table and stage.
- **Message**: the operation: `Create`, `Update`, `Delete`, `Assign`…
- **SDK**: the .NET library to work with Dataverse from C#. **Web API**: the REST API for any language.
- **FetchXML**: Dataverse's XML query language, used by views and by code.
- **Flow**: an automation built in Power Automate without code.

## Names in code

Every table and column has three names: a **display name** for people ("Credit Score"), a **schema name** ("contoso_CreditScore") and a **logical name** ("contoso_creditscore"). Code almost always uses the **logical name**, all in lower case. When your code says a column "does not exist", the first thing to check is that you used the logical name.

## Your first week checklist

- Get access to a **development environment** and open it at make.powerapps.com.
- Find the project's **solution** and its **publisher prefix**.
- Open the main tables, their forms and views, and note the logical names of key columns.
- Ask which customisations are code (plug-ins, scripts) and where the source code lives.
