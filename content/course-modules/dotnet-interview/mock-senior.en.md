A scripted Senior interview: fewer definitions, more design, trade-offs and leadership.

---

**Interviewer:** Name the hardest problem you solved recently.

**Candidate:** "Checkout latency spikes every few minutes. Metrics showed p99 jumping from 200 ms to 3 s while CPU was low. Traces pointed to waiting, and `dotnet-counters` showed the thread-pool queue growing: a payment SDK made a synchronous HTTP call inside our async pipeline. Under bursts the pool starved. I wrapped the call behind an async client with `IHttpClientFactory` and a resilience pipeline, and added a concurrency limit. p99 went back under 300 ms. Afterwards I added an alert on thread-pool queue length and an analyzer rule against `.Result` in our solution."

> *Checks:* method (measure → hypothesis → fix → verify), depth, ownership, prevention.

---

**Interviewer:** How does async/await work under the hood? Why avoid `async void`?

**Candidate:** "The compiler generates a state machine struct; locals become fields. The method runs synchronously until the first await of an incomplete task; then the state machine is boxed, `MoveNext` is registered as a continuation, and an incomplete Task is returned. When the I/O completes, the continuation runs on the captured context or the pool. `async void` has no Task: callers can't await it and exceptions are raised on the context — in .NET Core that crashes the process. It's for event handlers only; for fire-and-forget I use a channel and a hosted service."

---

**Interviewer:** Why does the GC have three generations?

**Candidate:** "It's an engineering trade-off from the generational hypothesis: most objects die immediately (Gen 0, cheap and frequent), some live through one operation such as a request — Gen 1 buffers those so they aren't promoted too early into Gen 2, which is expensive to collect. More generations add bookkeeping — card tables, promotion copies — with diminishing returns; Mono's SGen used two. So it's tuning, not a law."

---

**Interviewer:** Design: bids live in a bidding service, partners in a partners service; the bid list shows a partner count per bid.

**Candidate:** "Calling the partners service per row is N+1 over the network and couples availability. I'd keep a local read model in the bidding service fed by `PartnerAdded/Removed` events from an outbox. I store state per (bid, partner) with a version, not a counter, so duplicates and reordering are harmless; the count is derived. The list is eventually consistent — fine for a list screen; the details page can call the partners service directly. I'd add a backfill job and a nightly reconciliation."

---

**Interviewer:** How would you implement a distributed lock? What can go wrong?

**Candidate:** "If we already have SQL Server, `sp_getapplock` tied to a transaction is simplest. With Redis: `SET key token NX PX ttl`, release with a compare-and-delete script. The problem is a paused owner — a long GC — waking after its lease expired and writing anyway. So the protected resource must check a fencing token, a monotonically increasing number from the lock service. And I'd first ask whether we need a lock at all — idempotent operations or a single-consumer queue partition often remove the need."

---

**Interviewer:** Microservices: when would you *not* use them?

**Candidate:** "For a small team or an unclear domain. You pay for network failures, eventual consistency, distributed tracing, per-service CI/CD and versioned contracts. I'd start with a modular monolith with strict module boundaries and separate schemas, and extract a service when there's a concrete reason: independent scaling, a different release cadence, or team ownership."

---

**Interviewer:** How do you organize CI/CD and secrets for .NET services in Azure?

**Candidate:** "On pull requests: build, unit and integration tests with Testcontainers, analyzers and dependency scanning. On merge: build the Docker image once with a multi-stage Dockerfile, tag it with the commit SHA, push to ACR, and promote the same image through environments with Bicep for infrastructure, migrations as a separate step, health checks and canary or slot swaps. Secrets live in Key Vault, accessed through managed identity; pipelines authenticate with OIDC federation, so there are no stored credentials."

---

**Interviewer:** A junior on your team keeps shipping code without tests. What do you do?

**Candidate:** "Talk first — maybe they don't know how to test that code, or deadlines push them. Pair on one feature writing tests together, make it easy (test helpers, examples), and agree as a team on a definition of done with reviews enforcing it. I'd also look for design problems that make the code hard to test."

> *Checks:* mentoring and influence — part of every Senior loop.

## Debrief

Senior answers start from the problem and the constraints, name the trade-offs explicitly, use measurements, and include the operational side (monitoring, rollout, failure modes) and the people side. The final exam mixes all Senior sections.
