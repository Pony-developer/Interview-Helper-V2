The fastest way to understand Dataverse is to build something small. This walkthrough creates a "Project" table and a model-driven app around it in about half an hour, with no code. You need a development environment (a free Power Apps Developer Plan environment works).

## 1. Create a solution

1. Open **make.powerapps.com** and choose your environment at the top right.
2. Go to **Solutions** → **New solution**. Name it "Projects".
3. Under **Publisher**, choose **New publisher**: display name "Contoso", prefix `contoso`. Save it and select it.
4. Create the solution and open it. Everything from now on is created **inside this solution**.

## 2. Create a table

1. **New** → **Table** → **Table**. Display name "Project", plural "Projects".
2. The primary column is called "Name" by default; keep it.
3. Under **Advanced options**, keep ownership **User or team**, so projects have owners.
4. Save. Dataverse creates `contoso_project` with its id, name, owner, status and audit columns.

## 3. Add columns

Open the table and add (**New** → **Column**):

| Display name | Data type | Notes |
| --- | --- | --- |
| Start Date | Date only | A date without time |
| Budget | Currency | Amount with currency |
| Priority | Choice | New local choice with options Low, Normal, High; default Normal |
| Customer | Lookup | Related table: Account |
| Description | Multiple lines of text | |

Look at each column's **logical name** under *Advanced options*: `contoso_startdate`, `contoso_budget`, `contoso_priority`, `contoso_customer`. That is what code will use.

## 4. Design the form and a view

1. **Forms** → open the **Main** form. Drag the new columns onto it, put Customer and Priority near the top. **Save and publish**.
2. **Views** → open **Active Projects**. Add Customer, Priority and Budget as columns, sort by Start Date. **Save and publish**.

## 5. Add a business rule

On the table, open **Business rules** → **New**. Condition: *Priority equals High*. Action: *Set Business Required* on **Budget**. Save and **activate**. Now a high-priority project cannot be saved without a budget.

## 6. Build the app

1. In the solution: **New** → **App** → **Model-driven app**, name it "Project Hub".
2. **Add page** → **Dataverse table** → Project, and add Account too.
3. **Save** and **Publish**, then **Play**.

Create two projects, open an account and notice the **Projects** related tab: the lookup created a 1:N relationship automatically.

## 7. Look behind the scenes

- Open `https://<your-org>.crm.dynamics.com/api/data/v9.2/contoso_projects` in the browser: your rows as JSON from the Web API, with the logical names.
- In the solution, **Export** it as unmanaged: the zip contains XML that describes everything you built. That file is what moves to test and production.

## What you learned

You used the same building blocks as Dynamics 365 Sales: a publisher and solution, a table with typed columns, a lookup that created a relationship, a form, a view, a business rule and an app. Every later lesson adds code to exactly these pieces.
