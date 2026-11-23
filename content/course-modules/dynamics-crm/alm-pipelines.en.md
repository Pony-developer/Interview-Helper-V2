**Application lifecycle management (ALM)** is how changes get from an idea to production safely and repeatably. In Dataverse that means environments, source control and automated pipelines built around solutions.

## Environments

A typical setup:

- **Development**: one per developer or per feature team, where unmanaged solutions are edited. Separate environments stop people overwriting each other's form changes.
- **Build / validation**: optional, used by the pipeline to import the packed solution and run checks.
- **Test / UAT**: managed solutions only, close to production in data and configuration.
- **Production**: managed only, no direct customisation. **Managed Environments** add governance: sharing limits, enforced solution checks, in-product pipelines.

## Source control is the source of truth

A solution `.zip` is a blob that is hard to review. Unpack it into readable files:

```text
pac auth create --environment https://contoso-dev.crm4.dynamics.com
pac solution clone --name ContosoSales          # first time: creates a local project
pac solution sync                               # later: pulls changes from the environment
pac solution pack --zipfile out/ContosoSales.zip --packagetype Both
```

Each table, form and view becomes its own XML file, so a pull request shows exactly what changed. Plug-in and PCF source code lives in the same repository, and the build compiles it into the solution.

## Pipelines

Common options:

- **Azure DevOps** with the Power Platform Build Tools.
- **GitHub Actions** for Power Platform.
- **Power Platform Pipelines**: in-product pipelines that makers can run without writing YAML.

A typical pipeline:

1. Developers commit the unpacked solution (`pac solution sync`) together with plug-in and PCF code.
2. **Build**: compile plug-ins and PCF controls, pack a **managed** solution, run the **solution checker** (static analysis of plug-ins, scripts and customisations).
3. **Deploy to test**: import as an upgrade with a **deployment settings file** that supplies environment variable values and connection references for that environment.
4. Run tests, approve, and deploy **the same artifact** to production.

```text
pac solution import --path out/ContosoSales_managed.zip --settings-file settings/test.json --stage-and-upgrade
```

## Moving data

Solutions move metadata, not rows. Reference data (product catalogue, configuration tables, queues) is moved with the **Configuration Migration tool** (`pac data export` / `pac data import`), a package for the **Package Deployer**, or an integration. Give reference rows stable GUIDs or alternate keys so imports can run again safely.

## Practical rules

- Split work into a few solutions by area (core data model, sales features, integrations) with clear dependencies, rather than one giant solution or dozens of tiny ones.
- Raise the version on every build so each environment shows what is installed.
- Never fix things directly in test or production; fix in development and deploy again.
- Keep secrets out of solutions: use *secret* environment variables backed by Azure Key Vault.

## In an interview

- Describe your environment strategy and why production only receives managed solutions.
- Explain how you keep solutions in source control and what `pac solution clone`, `sync` and `pack` do.
- Walk through a CI/CD pipeline and where the solution checker and deployment settings fit.
- Explain how reference data moves between environments.
