Senior interviews almost always include an open design question. There is no single right answer: the interviewer watches how you clarify requirements, make trade-offs and go deeper where it matters.

## A framework for any design question

1. **Clarify requirements**: functional (what users do) and non-functional (users, requests per second, data size, latency, availability, consistency, security, budget). Write the numbers down.
2. **Estimate**: storage per year, peak RPS, bandwidth. It tells you whether one database is enough.
3. **API and data model**: the main endpoints/messages and entities.
4. **High-level architecture**: clients → CDN → load balancer / API gateway → services → databases, caches, queues, object storage.
5. **Deep dive** into the hardest part (the interviewer often picks it), then **scaling, failures and monitoring**: what breaks first, how you'd notice, how you'd recover.

## The DOU examples in brief

- **FTP server**: a control connection (commands: `USER`, `LIST`, `RETR`, `STOR`) and separate data connections (active vs passive mode); one async task per session (`TcpListener`, `Socket`, `PipeReader`), a per-user virtual root to prevent path traversal (`..`), streaming files instead of loading them, limits on connections and bandwidth, TLS (FTPS).
- **Web server**: accept loop on a socket, parse HTTP requests (keep-alive, chunked encoding, header limits), route to handlers or static files, a thread pool / async I/O, timeouts against slow clients, TLS, graceful shutdown — essentially what Kestrel does; mention the middleware pipeline.
- **Image hosting with access rights**: upload through the API → store originals in **object storage** (Azure Blob / S3) with metadata (owner, ACL, size, hash) in a database; generate thumbnails **asynchronously** via a queue + worker; serve through a **CDN**; access control with **short-lived signed URLs** (SAS tokens) checked against ACLs (private, link-only, public, shared with users/groups); deduplication by content hash; virus scanning; quotas.
- **Front office + back office**: separate applications (and often separate APIs/BFFs) over a shared domain: public-facing site optimized for scale and caching, internal admin with richer permissions (RBAC, audit log), different deployment and security perimeters (back office behind SSO/VPN), communication through the domain services or events; a reporting read model for the back office.
- **Social network clone (Instagram)**: users, follows, posts with media, feed, likes, comments. Media in object storage + CDN. The **feed** is the deep dive: *fan-out on write* (push a post id into each follower's precomputed feed in Redis — fast reads, expensive for celebrities) vs *fan-out on read* (merge followees' posts at read time), usually a hybrid. Counters via async aggregation; search with Elasticsearch; sharding by user id.

## The bids and partners counter

> A Bid holds a list of partners. Bids live in a bidding service, partners in a partners service. The first screen shows the bid list with the number of partners per bid. How do you store and display the counter?

Options:
1. **Call the partners service per bid** when rendering the list — N+1 remote calls, slow, and the list page fails when the partners service is down. Rejected.
2. **Batch call**: the bid service asks `GET /partners/counts?bidIds=1,2,3` once per page. Simple, always accurate, but still couples availability and adds latency; okay for low traffic.
3. **Denormalize the count into the bidding service** (recommended): the partners service publishes `PartnerAddedToBid` / `PartnerRemovedFromBid` events (via an outbox); the bidding service consumes them **idempotently** and maintains `PartnersCount` on the bid (or a local read-model table `BidPartnerIds`, and the count is derived from it, which makes duplicate events harmless). The list page then needs one local query. Trade-off: the count is **eventually consistent** (a short lag is usually acceptable for a list screen; the details page can show the live list).
4. A **BFF / composition layer** or a dedicated **read model** (CQRS) that subscribes to both services' events and serves the screen.

Talk about: idempotency (store partner ids, not just increment), ordering (add/remove arriving out of order → use versions or recompute), backfilling the initial counts, and reconciling drift with a periodic job.
