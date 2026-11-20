---
skill: system-design
title: "Frontend system design interviews: a practical framework"
summary: "How to run a frontend system design interview: clarifying requirements, high-level architecture, component and state design, data model and API contracts, rendering strategy, performance, accessibility, offline and error handling, plus a worked example (a news feed)."
readingMinutes: 10
---

In a frontend system design interview you're asked to design something like "a news feed", "an autocomplete", "Google Docs" or "a photo gallery" in 45–60 minutes. There's no single right answer: interviewers look for a **structured approach**, sensible trade-offs, and depth where it matters. A reliable framework is **RADIO**: Requirements, Architecture, Data model, Interface (API), Optimisations.

## 1. Requirements (5–10 minutes)

Never start drawing immediately. Clarify:

- **Functional**: the core user flows. For a feed: view posts, infinite scroll, like, comment, create a post with images.
- **Non-functional**: devices (mobile web?), expected scale (posts per page, images), performance targets, offline support, accessibility, internationalisation, SEO needs.
- **Out of scope**: say explicitly what you won't cover (ranking algorithm, backend storage).

Write the agreed list down; it's your checklist for the rest of the interview.

## 2. Architecture

Sketch the main pieces and how data flows:

```
Server/API ⇄ Data layer (fetching, cache, normalisation)
                 ⇅
           Client store (UI state, optimistic updates)
                 ⇅
   View: <FeedPage> → <FeedList> → <Post> → <LikeButton>, <CommentBox>
```

Decide on the **rendering strategy** and say why: server-side rendering or static generation for SEO and fast first paint (public pages), client-side rendering for app-like authenticated views, streaming/partial hydration where both matter. Name the responsibilities of each component and where state lives: server data in a query cache, UI state locally, shared client state in a store, filters in the URL.

## 3. Data model

Describe the entities the client keeps and how they're normalised:

```ts
type Post = { id: string; authorId: string; text: string; media: Media[]; likeCount: number; likedByMe: boolean; createdAt: string };
type FeedState = { postIds: string[]; postsById: Record<string, Post>; usersById: Record<string, User>; cursor: string | null; status: "idle" | "loading" | "error" };
```

Normalising (entities by id plus lists of ids) means a liked post updates everywhere it appears.

## 4. Interface (API)

Define the contracts between client and server:

- `GET /feed?cursor=…&limit=20` → `{ posts, users, nextCursor }`. **Cursor-based pagination** is stable when new posts arrive; offset pagination duplicates or skips items.
- `POST /posts/:id/like` with **optimistic updates**: update the UI immediately, roll back on error.
- Real-time: new posts via SSE or WebSocket, shown as a "12 new posts" banner instead of shifting the list under the user's finger.
- REST vs GraphQL: mention the trade-off if relevant (over-fetching vs caching complexity).

## 5. Optimisations and deep dives

Pick the ones that matter for the product, and go deep:

- **Performance**: list virtualisation for long feeds, image `srcset`, lazy loading and fixed aspect ratios (no layout shift), code splitting (load the composer only when opened), prefetching the next page near the end, debounce/throttle for search and scroll.
- **Network**: caching and deduplication of requests, retries with backoff, request cancellation (`AbortController`) when inputs change.
- **Resilience**: loading skeletons, error states with retry, partial failures, offline queue for likes and comments.
- **Accessibility**: keyboard navigation through the feed, focus management after infinite loads, `aria-live` for new-content banners, alt text for media.
- **Security**: escaping user content (XSS), CSRF protection on mutations, upload validation.
- **i18n**: text expansion, RTL layouts, locale-aware dates and numbers.
- **Observability**: Web Vitals, error tracking, feature flags for gradual rollout.

## Common prompts and their key topics

| Prompt | Key topics |
| --- | --- |
| Autocomplete | debouncing, cancelling stale requests, caching results, keyboard navigation and ARIA combobox |
| News feed | cursor pagination, virtualisation, optimistic likes, real-time updates |
| Chat app | WebSockets, message ordering and IDs, offline queue, read receipts |
| Collaborative editor | conflict resolution (CRDTs or operational transforms), presence, undo |
| Image carousel / gallery | lazy loading, responsive images, preloading neighbours, swipe and keyboard support |
| Dashboard | data fetching strategy, polling vs push, chart performance, layout persistence |

## How to do well

- Drive the conversation, but check in: "Should I go deeper on pagination or move on?"
- State trade-offs explicitly ("virtualisation complicates find-in-page and accessibility; worth it above a few hundred items").
- Keep time for deep dives; don't spend 30 minutes on component trees.
- Tie every decision back to the requirements you wrote down at the start.

## Interview checklist

- Use a framework (RADIO) and clarify requirements first.
- Choose and justify a rendering strategy.
- Design normalised client state and a paginated API with cursors.
- Discuss optimistic updates, real-time updates and error states.
- Cover performance, accessibility and security for the chosen product.
