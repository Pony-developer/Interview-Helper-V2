## Task

The news-feed deep dive from the lecture: **fan-out on read** with cursor pagination. Each followed author's timeline is already sorted newest first. Complete **`Feed.Page(timelines, count, before)`**:

- return the newest `count` posts across all timelines that are **strictly older than `before`** (the cursor; `int.MaxValue` for the first page), newest first; posts with equal time are ordered by author (ordinal);
- do a **k-way merge** instead of concatenating and sorting everything: put the first eligible post of each timeline into a sorted structure (a `SortedSet` with a comparer works as a priority queue in C# 7 — make the comparer total, e.g. also compare the timeline index, so two candidates are never "equal"), repeatedly take the best one (`Min`), add it to the result, and push the next post from the same timeline;
- empty timelines are allowed.

The caller uses the time of the last post as the next cursor. That's why page 2 has to include **both** posts at time 60: a cursor of 60 means "older than 60".

Expected output:

```
page 1: b4@99, c2@97, a3@95
page 2: b3@80, a2@60, b2@60
page 3: c1@20, a1@10, b1@5
page 4: (end)
```
