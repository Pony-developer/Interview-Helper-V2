## Task

The Senior design task: "Bids live in the bidding service, partners in the partners service. The first screen shows the number of partners per bid." The recommended design (see the system design lecture) is a **local read model** in the bidding service, fed by events from the partners service. Events arrive **at least once** and **not necessarily in order** — the model must still end up correct.

Complete `BidReadModel` (add the fields you need):

1. **`Apply(e)`**:
   - if an event with the same `Id` was already applied, ignore it and increase `Ignored`;
   - for the pair `(BidId, PartnerId)`, keep the state of the event with the **highest `Version`**; an event whose version is not newer than the one already applied for that pair is stale — ignore it and increase `Ignored`;
   - otherwise store the pair's `Added` flag and version.
2. **`PartnersCount(bidId)`** — how many pairs of that bid are currently "added".

Storing the state per pair (instead of doing `count++` / `count--`) is what makes duplicates and reordering harmless: in the test, `e5` (partner 201 removed, version 2) arrives before `e4` (added, version 1), and the late `e4` must not resurrect the partner.

Expected output:

```
e1 -> bid 1: 1, bid 2: 0
e2 -> bid 1: 2, bid 2: 0
e3 -> bid 1: 1, bid 2: 0
e1 -> bid 1: 1, bid 2: 0
e5 -> bid 1: 1, bid 2: 0
e4 -> bid 1: 1, bid 2: 0
e6 -> bid 1: 1, bid 2: 1
e7 -> bid 1: 2, bid 2: 1
e8 -> bid 1: 3, bid 2: 1
bid 3: 0, ignored: 2
```
