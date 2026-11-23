Customisations are not copied between environments by hand. They travel in **solutions**: packages of components that you export from development and import into test and production.

## What a solution contains

A solution lists **components**: tables, columns, relationships, forms, views, apps, web resources, plug-in assemblies and their steps, flows, security roles, environment variables and more. Data rows are not components; reference data has to be moved separately.

Add only what you changed. When you add a standard table such as `account`, do not include all of its subcomponents: add the specific columns, forms and views you touched. Otherwise your solution claims the whole table and every import overwrites it.

## Publishers

Every solution belongs to a **publisher**. The publisher's **prefix** (`contoso_`) goes in front of the names of every table and column you create, and its choice value prefix keeps your option values from clashing with other vendors'. Create your own publisher on day one; never ship components from the default publisher.

## Managed and unmanaged

- An **unmanaged** solution is the editable form you work on in development. Importing it just adds its components to the environment; deleting the solution later leaves them behind.
- A **managed** solution is the sealed form for test and production. It installs as a **layer**, cannot be edited (except where its managed properties allow it), can be **upgraded** to a new version, and uninstalling it removes its components and their data.

The rule: develop unmanaged in development, deploy managed everywhere else.

## Layers

The platform builds what a user sees by stacking layers for each component:

1. The **system** layer (the platform's defaults).
2. **Managed** layers, one per managed solution that touches the component, in the order they were installed.
3. The **unmanaged active** layer on top: any direct edit in that environment.

The top layer wins for most properties (forms are merged). This is why an "emergency fix" made directly in production keeps hiding every later deployment: it lives in the active layer above your managed solution. The **Solution layers** view shows the stack for a component, and *Remove active customizations* deletes the unmanaged layer.

## Versions, updates and upgrades

Solutions have a four-part version (`1.4.0.12`). When you import a newer managed version you choose:

- **Upgrade** (the default): the new version replaces the old one, and components that are no longer in the solution are deleted.
- **Stage for upgrade**: import side by side, migrate data, then apply the upgrade.
- **Update**: overwrite components but delete nothing. Leftovers stay behind, so use it rarely.

**Patches** (small deltas of a parent solution) exist, but most teams now ship small, frequent full versions instead.

## Configuration that differs per environment

- **Environment variables** hold values such as API URLs, feature flags or a mailbox address. The definition travels in the solution; each environment gets its own value.
- **Connection references** let flows and canvas apps point at a connection created per environment, instead of embedding one person's connection.

## In an interview

- Explain managed vs unmanaged and why production gets managed solutions only.
- Explain layering and what happens after someone edits production directly.
- Explain what a publisher prefix is for.
- Explain upgrade vs update, and how environment variables keep configuration out of the solution's code.
