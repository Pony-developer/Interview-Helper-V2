---
skill: vite
title: "Vite and modern bundling: dev server, builds and code splitting"
summary: "Why bundlers exist, how Vite's native-ESM dev server and hot module replacement work, production builds with tree shaking, code splitting and content-hashed files, environment variables, aliases and plugins, and how Vite compares with webpack."
readingMinutes: 8
---

Browsers can load ES modules directly, so why bundle at all? Real apps have thousands of modules and npm packages written in CommonJS, TypeScript, JSX or Vue/Svelte files, plus CSS and images. A build tool transforms all of that, removes unused code, and produces a few optimised, cacheable files. **Vite** is the default build tool for most new frontend projects (React, Vue, Svelte, SolidJS, Astro and Vitest are built on it).

## Dev: unbundled, on-demand

Classic bundlers (webpack) build the whole app before the dev server can respond, so start-up time grows with the codebase. Vite serves source files as **native ES modules**:

1. The browser requests `/src/main.tsx`; Vite transforms just that file (TypeScript/JSX with esbuild) and returns it.
2. The browser follows its `import`s, requesting only the modules the current page needs.
3. **Dependencies** in `node_modules` are pre-bundled once (CommonJS → ESM, many small files → one) and cached, so `lodash-es` isn't 600 requests.

Start-up is near-instant and independent of app size.

## Hot module replacement (HMR)

When you save a file, Vite knows the module graph and replaces only the changed module and its HMR boundary (for example a React component, via React Fast Refresh), keeping application state. If no boundary accepts the update, the page reloads. CSS updates are swapped in place.

## Production builds

For production Vite bundles with **Rollup** (Rolldown, a Rust port, in newer versions), because shipping thousands of unbundled modules is slow on real networks. The build does:

- **Tree shaking**: unused exports are removed. It needs ES module syntax and code without hidden side effects; `"sideEffects": false` in a package's `package.json` lets bundlers drop unused files entirely.
- **Code splitting**: every dynamic `import()` becomes a separate chunk loaded on demand. Split by route and by heavy, rarely used features (editors, charts).
- **Minification** of JS and CSS, and asset handling (small files inlined, others copied with hashed names).
- **Content-hashed file names** (`index-3f9a1c.js`), so files can be cached "forever" (`Cache-Control: immutable`) while `index.html` stays short-lived and points to the new hashes after each deploy.

```js
const Settings = lazy(() => import("./routes/Settings")); // separate chunk
```

## Configuration essentials

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": "/src" } },
  server: { proxy: { "/api": "http://localhost:8080" } }, // avoid CORS in dev
  build: { sourcemap: true },
});
```

- **Environment variables**: only variables prefixed with `VITE_` are exposed to client code, as `import.meta.env.VITE_API_URL`. They're inlined at **build time**, so anything exposed this way is public; never put secrets there. `import.meta.env.MODE`, `DEV` and `PROD` are built in.
- **Static assets**: files in `public/` are served as-is at the root; imported assets get hashed URLs.
- **Plugins** follow Rollup's plugin interface plus Vite-specific hooks, for frameworks, SVG imports, PWA, legacy browser support and more.

## Vite vs webpack

| | Vite | webpack |
| --- | --- | --- |
| Dev server | Native ESM, on-demand transforms | Bundles everything first |
| Speed | Very fast start-up and HMR | Slower on large apps |
| Config | Small, convention-based | Very flexible, more verbose |
| Ecosystem | Rollup-compatible plugins | Huge loader/plugin ecosystem, Module Federation |

webpack (and its Rust successor Rspack) remains common in existing apps and in micro-frontend setups.

## Debugging the build

- Inspect bundle size with `rollup-plugin-visualizer` or `vite-bundle-visualizer`; look for duplicated or unexpectedly large dependencies.
- Watch for barrel files (`index.ts` re-exporting everything) that hinder tree shaking in some setups.
- Differences between dev and build usually come from CommonJS interop or environment variables; always test `vite build && vite preview` before deploying.

## Interview checklist

- Explain why we bundle for production even though browsers support ES modules.
- Describe how Vite's dev server and HMR work and why it starts fast.
- Explain tree shaking, code splitting with `import()`, and hashed file names for caching.
- Explain `VITE_` environment variables and why they're public.
- Compare Vite and webpack.
