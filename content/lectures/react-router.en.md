---
skill: react-router
title: "React Router: routes, nested layouts and data loading"
summary: "How client-side routing maps URLs to component trees, nested routes and outlets, route params and search params, loaders and actions in data routers, protecting routes, lazy loading, and the mistakes that break navigation."
readingMinutes: 9
---

React Router maps the URL to a tree of components, so the browser can change the page without a full reload. Single-page applications rely on it for every link, back button and deep link. Modern versions also load data for each route before it renders, which moves a lot of fetching logic out of components.

## Declaring routes

```tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "orders/:orderId", element: <Order /> },
    ],
  },
]);
```

A route's `element` renders when its path matches. **Nested routes** render inside their parent's `<Outlet />`, so a shared layout (header, sidebar) stays mounted while the child route changes. `index` marks the default child at the parent's exact path.

## Params and search params

- **Path params** (`:orderId`) are part of the URL's path and are read with `useParams()`. Use them for identity: `/orders/42`.
- **Search params** (`?status=open`) describe a view of the data and are read with `useSearchParams()`. Use them for filters, sorting and pagination, so the view can be shared and survives a reload.

Parsing search params yourself is error-prone: values are always strings, and missing or invalid ones need defaults. Validate them at the route boundary.

## Loaders and actions

In a data router, a route can declare a **loader** that fetches its data before rendering, and an **action** that handles form submissions:

```tsx
{
  path: "orders/:orderId",
  loader: ({ params }) => fetchOrder(params.orderId),
  element: <Order />,
}
```

The component reads the result with `useLoaderData()`. Navigation waits for the loader, so the page never renders half-empty, and parallel data needs for nested routes load together. After an action runs, the loaders of affected routes revalidate automatically, which keeps screens in sync without manual refetching. Loaders also get the chance to redirect or show an error page for a missing record.

## Navigation and protected routes

Use `<Link to="…">` for in-app links so the browser isn't reloaded, and `useNavigate()` for navigation after an event. A protected route is a layout route whose element checks the session and renders `<Navigate to="/login" />` when it's missing, optionally remembering the requested URL to return to after login. Check access on the server too: a hidden route is not a secured one.

## Lazy loading

Routes can load their component code on demand with `lazy`, so the first page doesn't download the whole application. Split at route boundaries first, because that's where users actually navigate.

## Common mistakes

- Using `<a href>` for internal links, which reloads the whole app and loses client state.
- Keeping filters in component state, so a shared URL or a reload shows different data.
- Reading search params without defaults, so a missing `page` produces `NaN`.
- Fetching data in `useEffect` in every component when a loader would fetch it once per navigation.
- Treating a client-side route guard as security.

## Interview checklist

- Explain how nested routes and `<Outlet />` keep a layout mounted during navigation.
- Decide when a value belongs in a path param, a search param or component state.
- Explain how a loader makes a page render with its data, and how actions revalidate loaders.
- Describe a protected route and why server-side checks are still required.
- Name the mistakes that make navigation feel broken.
