When you register an assembly you choose its **isolation mode**: how much the platform trusts your code. Online the answer is fixed, but the question still comes up in interviews and in old on-premises systems.

## Sandbox

**Sandbox** isolation runs plug-ins and custom workflow activities in separate worker processes with **partial trust**:

- no access to the file system, registry or event log;
- outbound network only over **HTTP and HTTPS**, to **host names** (not IP addresses, not localhost);
- no unmanaged code, no changing the process's security settings;
- a **2-minute** limit per execution;
- the assembly is stored in the **database**, so it travels with solutions and backups.

The platform monitors sandbox workers and recycles them if they misbehave, so one bad plug-in cannot take down the whole service. **Dynamics 365 online supports only sandbox.**

## None (full trust)

**None** means the code runs with full trust inside the platform's own processes. Only **on-premises** deployments allow it, and only a **deployment administrator** can register such assemblies. Full trust can read files, call any network address and use any .NET API, which is why it exists: old integrations that read a file share or call a local service.

| | Sandbox | None |
| --- | --- | --- |
| Online | Yes (only option) | No |
| On-premises | Yes | Yes, by deployment administrators |
| Trust | Partial | Full |
| Assembly location | Database | Database, disk or GAC |
| Crash impact | The sandbox worker | The platform process |

## Assembly location

On-premises can also store assemblies on **disk** or in the **GAC**, which then have to be copied to every server by hand. The **database** is the only option online and the recommended one everywhere.

## Living with the sandbox

- **Calling external services**: use `HttpClient` (or `WebClient`) to a DNS name, with short timeouts. Prefer handing work to Azure (Service Bus, webhooks, Azure Functions) through service endpoints, so the plug-in stays fast.
- **Secrets**: no reading certificates or config files from disk. Use secure configuration or secret environment variables.
- **Libraries**: some libraries use APIs that partial trust forbids (reflection on private members, file access, native code) and fail only at run time in the sandbox. Test them in a real environment early.
- **Migrating from on-premises**: assemblies registered with isolation "None" must be rewritten for the sandbox before moving online. Look for file I/O, IP addresses, direct SQL connections and registry access.

## In an interview

- Explain sandbox vs none and which one online supports.
- List the restrictions of the sandbox.
- Explain how a sandboxed plug-in should call an external system.
- Name what to check in an on-premises plug-in before moving it online.
