"Clone a popular social network" is on the DOU Senior list (practical task 16). The heart of it is the **news feed**. Here's how to walk through it.

## Requirements and scale

- Users follow other users; they post text and media; the home feed shows posts from people they follow, newest first (ranking is a later extension); infinite scroll.
- Assume 100M daily active users, each opening the feed 10 times a day → ~12k feed reads/s on average, peaks ×5; 50M new posts per day → ~600 writes/s; some accounts have 10M+ followers.
- Feed latency p99 < 300 ms; a new post may take a few seconds to appear (eventual consistency is fine).

## Data model

- `users`, `follows (follower_id, followee_id)` — sharded by user id.
- `posts (id, author_id, created_at, text, media_urls)` — sharded by author id; post ids sortable by time (Snowflake / GUID v7).
- Media in object storage (Blob/S3) behind a CDN; the post stores URLs.

## Two ways to build a feed

**Fan-out on write (push).** When Ann posts, a background worker inserts the post id into the precomputed feed of each of her followers (a Redis sorted set or a feed table per user, capped at ~1,000 entries).
- Reads are trivial and fast: take the top N ids, hydrate posts from a cache.
- Writes are expensive for celebrities (10M inserts per post), and feeds of inactive users are wasted work.

**Fan-out on read (pull).** When Bob opens the feed, read the latest posts of everyone he follows and **merge** them.
- Writes are cheap; nothing is precomputed.
- Reads are expensive for users following thousands of accounts.

**Hybrid (what large networks do):** push for normal authors, pull for celebrities (and for inactive users who come back): at read time, merge the precomputed feed with the latest posts of the few celebrities the user follows.

## The merge

Each source (a timeline) is already sorted newest first. Taking the newest N across k sources is a **k-way merge**: put the head of each timeline into a priority queue (a min/max-heap), repeatedly take the best and push the next post from the same timeline. Cost: O(N log k) instead of concatenating and sorting everything. Pagination uses a **cursor** (the time/id of the last post shown), not page numbers — new posts arriving at the top must not shift what the next page returns. The practice implements exactly this.

## Serving path

```text
client → CDN/API gateway → Feed service
   1. read feed ids (Redis sorted set, by cursor)            ~1 ms
   2. merge with celebrity timelines (cached)               ~5 ms
   3. hydrate posts + authors from cache (multi-get)        ~5 ms
   4. filter (blocked, deleted, privacy) and return page
write path: Post service → DB → outbox → queue → fan-out workers → feed caches
```

## Deep-dive topics

- **Ranking**: replace "newest first" with a scoring model (engagement, affinity, freshness) — usually a separate ranking service on top of candidate generation.
- **Counters** (likes, comments): sharded counters or async aggregation; approximate is acceptable.
- **Hot keys**: a celebrity's post gets millions of reads — replicate hot keys in the cache, use local in-memory caches, CDN for media.
- **Consistency**: a user should see their own post immediately (insert it into their own feed synchronously, or merge it client-side).
- **Deletes and privacy changes**: filter at read time; clean feeds lazily.
- **Back-pressure**: if fan-out workers fall behind, the queue grows — autoscale workers, degrade by switching more authors to pull.

## Other DOU design prompts in one line each

- **FTP / web server**: connection handling, protocol parsing, async I/O, limits, TLS (see the earlier system design lecture).
- **Image hosting with access rights**: object storage + CDN + signed URLs + async thumbnails.
- **Front office / back office**: separate apps and security perimeters over a shared domain; reporting read model.
- **Bids and partners counter**: a local read model fed by idempotent, versioned events (practice in this module).
