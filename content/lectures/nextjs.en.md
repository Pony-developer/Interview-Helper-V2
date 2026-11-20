---
skill: nextjs
title: "Next.js App Router: routing, Server Components and data"
summary: "File-based routing with layouts and special files, dynamic segments, Server vs Client Components and the \"use client\" boundary, data fetching and caching, Server Actions, Route Handlers and proxy, and the security rules that come with them."
readingMinutes: 9
---

Next.js is a React framework that adds routing, server rendering, data fetching and a build pipeline. Modern apps use the **App Router** (the `app/` directory), built on React Server Components. Older apps use the Pages Router (`pages/`, `getServerSideProps`); know it exists, but interviews now focus on the App Router.

## Routing is the file system

```
app/
  layout.tsx            ← root layout (wraps every page, keeps state across navigation)
  page.tsx              ← "/"
  dashboard/
    layout.tsx          ← nested layout for /dashboard/*
    page.tsx            ← "/dashboard"
    loading.tsx         ← Suspense fallback while the segment loads
    error.tsx           ← error boundary (a Client Component)
  blog/[slug]/page.tsx  ← "/blog/hello-world", params: { slug }
  shop/[...path]/       ← catch-all: "/shop/a/b" → { path: ["a", "b"] }
  docs/[[...slug]]/     ← optional catch-all: also matches "/docs"
  (marketing)/about/    ← route group: organises files, not in the URL
  api/users/route.ts    ← Route Handler (GET, POST, …)
```

A folder becomes a URL segment only when it has a `page.tsx` (or `route.ts`). Static segments win over dynamic ones, so `blog/new` beats `blog/[slug]`. In current versions `params` and `searchParams` are **Promises**: `const { slug } = await params`. Navigate with `<Link href="/blog">`, which prefetches and does client-side transitions.

## Server and Client Components

Components in `app/` are **Server Components** by default. They run only on the server, can be `async`, can read the database or secrets directly, and ship **no JavaScript** to the browser.

A file starting with `"use client"` marks a **Client Component** boundary. Client Components are prerendered on the server and hydrated in the browser, and they're the only place you can use state, effects, event handlers and browser APIs.

```tsx
// app/products/page.tsx (Server Component)
export default async function Products() {
  const products = await db.product.findMany();
  return <ProductList products={products} />; // a Client Component
}
```

Rules of the boundary:

- Push `"use client"` as far down the tree as possible (a button, not the page).
- Props crossing into a Client Component must be **serialisable**: plain data, JSX, Promises, and Server Actions are fine; ordinary functions and class instances are not.
- A Client Component can't import a Server Component, but it can render one passed as `children`.
- Only env variables prefixed `NEXT_PUBLIC_` reach the browser. Put `import "server-only"` in modules that must never be bundled for the client.

## Data fetching and caching

Fetch data where it's needed, in Server Components, with `async`/`await`; requests in parallel components don't block each other, and wrapping slow parts in `<Suspense>` (or adding `loading.tsx`) **streams** the rest of the page first. Caching is explicit in recent versions: `fetch` isn't cached by default, and you opt in with the `"use cache"` directive (with Cache Components enabled) or route options such as `export const revalidate = 3600`. Pages without request-time data can be prerendered at build time.

## Mutations: Server Actions

```tsx
async function createPost(formData: FormData) {
  "use server";
  const user = await requireUser(); // always check on the server
  const title = z.string().min(1).parse(formData.get("title"));
  await db.post.create({ data: { title, authorId: user.id } });
  revalidatePath("/blog"); // or updateTag / revalidateTag
}
// <form action={createPost}>…</form>
```

A Server Action is a function the client can call over the network. Next.js exposes it as a **public POST endpoint**, so authenticate, authorise and validate inside the action, not just by hiding the button. After writing, invalidate the cached pages or data so users see the change.

## Route Handlers and proxy

- `app/api/**/route.ts` exports functions named after HTTP methods for webhooks, public APIs or non-React clients.
- `proxy.ts` (called `middleware.ts` before Next.js 16) runs before routing for redirects, rewrites, locale detection and cheap auth checks. Keep it fast, and don't rely on it as the only authorisation layer.

## Interview checklist

- Map URLs to files, including dynamic, catch-all and optional catch-all segments and route groups.
- Explain Server vs Client Components, what `"use client"` does, and what may cross the boundary.
- Describe streaming with `loading.tsx` and `<Suspense>`.
- Write a Server Action that validates input, checks authorisation and revalidates.
- Explain why secrets stay safe in Server Components and how `NEXT_PUBLIC_` works.
