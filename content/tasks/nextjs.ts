import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const ROUTER_STARTER = String.raw`export type Params = Record<string, string | string[]>;
export type Match = { route: string; params: Params };

/**
 * Matches a pathname against App Router route patterns such as
 * "/blog/[slug]", "/shop/[...path]", "/docs/[[...slug]]" and "/(marketing)/about".
 */
export function matchRoute(routes: string[], pathname: string): Match | null {
  // TODO: only exact static matches work so far
  return routes.includes(pathname) ? { route: pathname, params: {} } : null;
}
`;

const ROUTER_SOLUTION = String.raw`export type Params = Record<string, string | string[]>;
export type Match = { route: string; params: Params };

type Segment =
  | { kind: "static"; value: string }
  | { kind: "dynamic" | "catchAll" | "optionalCatchAll"; name: string };

/** Higher ranks are more specific and are tried first. */
const RANK = { static: 4, dynamic: 3, catchAll: 2, optionalCatchAll: 0 } as const;
const MISSING = 1; // a route that has already ended beats an optional catch-all

function parse(route: string): Segment[] {
  return route
    .split("/")
    .filter((s) => s && !(s.startsWith("(") && s.endsWith(")"))) // route groups aren't part of the URL
    .map((s): Segment => {
      let m: RegExpExecArray | null;
      if ((m = /^\[\[\.\.\.(\w+)\]\]$/.exec(s))) return { kind: "optionalCatchAll", name: m[1] };
      if ((m = /^\[\.\.\.(\w+)\]$/.exec(s))) return { kind: "catchAll", name: m[1] };
      if ((m = /^\[(\w+)\]$/.exec(s))) return { kind: "dynamic", name: m[1] };
      return { kind: "static", value: s };
    });
}

function compare(a: Segment[], b: Segment[]) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const ra = a[i] ? RANK[a[i].kind] : MISSING;
    const rb = b[i] ? RANK[b[i].kind] : MISSING;
    if (ra !== rb) return rb - ra;
  }
  return 0;
}

function match(segments: Segment[], parts: string[]): Params | null {
  const params: Params = {};
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.kind === "catchAll" || seg.kind === "optionalCatchAll") {
      const rest = parts.slice(i);
      if (seg.kind === "catchAll" && rest.length === 0) return null;
      if (rest.length) params[seg.name] = rest;
      return params; // a catch-all is always the last segment
    }
    const part = parts[i];
    if (part === undefined) return null;
    if (seg.kind === "static" && seg.value !== part) return null;
    if (seg.kind === "dynamic") params[seg.name] = part;
  }
  return parts.length === segments.length ? params : null;
}

export function matchRoute(routes: string[], pathname: string): Match | null {
  let parts: string[];
  try {
    parts = pathname.split(/[?#]/)[0].split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return null; // malformed percent-encoding
  }
  const candidates = routes.map((route) => ({ route, segments: parse(route) })).sort((x, y) => compare(x.segments, y.segments));
  for (const { route, segments } of candidates) {
    const params = match(segments, parts);
    if (params) return { route, params };
  }
  return null;
}
`;

const ROUTER_INDEX = String.raw`import "./styles.css";
import { matchRoute } from "./src/router";

const routes = ["/", "/blog/[slug]", "/blog/new", "/shop/[...path]", "/docs/[[...slug]]", "/(marketing)/about"];
const paths = ["/", "/blog/new", "/blog/hello-world", "/shop/shoes/red", "/docs", "/about", "/missing"];

document.getElementById("app")!.innerHTML =
  "<h1>App Router matcher</h1><table><tr><th>Path</th><th>Route</th><th>Params</th></tr>" +
  paths
    .map((p) => {
      const m = matchRoute(routes, p);
      return "<tr><td>" + p + "</td><td>" + (m ? m.route : "404") + "</td><td>" + (m ? JSON.stringify(m.params) : "") + "</td></tr>";
    })
    .join("") +
  "</table>";
`;

const ROUTER_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { matchRoute } from "../src/router";

const routes = [
  "/",
  "/blog",
  "/blog/[slug]",
  "/blog/new",
  "/users/[id]/posts/[postId]",
  "/shop/[...path]",
  "/docs/[[...slug]]",
  "/(marketing)/about",
];

describe("matchRoute", () => {
  it("matches static routes", () => {
    expect(matchRoute(routes, "/")).toEqual({ route: "/", params: {} });
    expect(matchRoute(routes, "/blog")).toEqual({ route: "/blog", params: {} });
  });
  it("fills dynamic segments", () => {
    expect(matchRoute(routes, "/blog/hello-world")).toEqual({ route: "/blog/[slug]", params: { slug: "hello-world" } });
    expect(matchRoute(routes, "/users/7/posts/42")).toEqual({ route: "/users/[id]/posts/[postId]", params: { id: "7", postId: "42" } });
  });
  it("prefers static segments over dynamic ones, whatever the order", () => {
    expect(matchRoute(routes, "/blog/new")).toEqual({ route: "/blog/new", params: {} });
  });
  it("collects catch-all segments, which need at least one part", () => {
    expect(matchRoute(routes, "/shop/shoes/red/42")).toEqual({ route: "/shop/[...path]", params: { path: ["shoes", "red", "42"] } });
    expect(matchRoute(routes, "/shop")).toBe(null);
  });
  it("lets optional catch-alls match zero parts", () => {
    expect(matchRoute(routes, "/docs")).toEqual({ route: "/docs/[[...slug]]", params: {} });
    expect(matchRoute(routes, "/docs/getting-started/install")).toEqual({
      route: "/docs/[[...slug]]",
      params: { slug: ["getting-started", "install"] },
    });
  });
  it("ignores route groups in the URL", () => {
    expect(matchRoute(routes, "/about")).toEqual({ route: "/(marketing)/about", params: {} });
  });
  it("ignores trailing slashes, query strings and hashes, and decodes segments", () => {
    expect(matchRoute(routes, "/blog/hello/?ref=home#top")).toEqual({ route: "/blog/[slug]", params: { slug: "hello" } });
    expect(matchRoute(routes, "/blog/caf%C3%A9")).toEqual({ route: "/blog/[slug]", params: { slug: "café" } });
  });
  it("returns null when nothing matches", () => {
    expect(matchRoute(routes, "/missing")).toBe(null);
    expect(matchRoute(routes, "/blog/a/b")).toBe(null);
  });
});
`;

export default defineTasks([
  quiz(
    "next-page-file",
    ["nextjs"],
    1,
    45,
    ["Which file is the page?", "Який файл є сторінкою?"],
    ["In the App Router, which file renders the UI for the URL `/dashboard`?", "Який файл в App Router рендерить інтерфейс для URL `/dashboard`?"],
    [
      ["`app/dashboard/page.tsx`", "`app/dashboard/page.tsx`"],
      ["`app/dashboard.tsx`", "`app/dashboard.tsx`"],
      ["`app/dashboard/index.tsx`", "`app/dashboard/index.tsx`"],
      ["`app/dashboard/route.tsx`", "`app/dashboard/route.tsx`"],
    ],
    "a",
    [
      "Folders define URL segments and `page.tsx` makes a segment publicly routable. `layout.tsx`, `loading.tsx` and `error.tsx` in the same folder wrap it. `route.ts` would define an API endpoint for that URL instead of a page; `index.tsx` and `dashboard.tsx` are Pages Router conventions.",
      "Папки задають сегменти URL, а `page.tsx` робить сегмент публічно доступним. `layout.tsx`, `loading.tsx` і `error.tsx` у тій самій папці його обгортають. `route.ts` натомість визначив би API-ендпоінт для цього URL; `index.tsx` і `dashboard.tsx` є домовленостями Pages Router.",
    ],
  ),
  quiz(
    "next-use-client",
    ["nextjs", w("react")],
    2,
    60,
    ["Hooks in the App Router", "Хуки в App Router"],
    [
      "`app/components/Counter.tsx` uses `useState` and an `onClick` handler, and the build fails saying `useState` only works in Client Components. What's the fix?",
      "`app/components/Counter.tsx` використовує `useState` та обробник `onClick`, і збірка падає з повідомленням, що `useState` працює лише в клієнтських компонентах. Як виправити?",
    ],
    [
      ["Add `\"use client\"` at the top of `Counter.tsx`", "Додати `\"use client\"` на початку `Counter.tsx`"],
      ["Add `\"use client\"` to the root `layout.tsx`", "Додати `\"use client\"` у кореневий `layout.tsx`"],
      ["Make `Counter` an `async` function", "Зробити `Counter` функцією `async`"],
      ["Rename the file to `Counter.client.tsx`", "Перейменувати файл на `Counter.client.tsx`"],
    ],
    "a",
    [
      "Components in `app/` are Server Components by default and can't hold state or handle events. `\"use client\"` at the top of a module makes it, and everything it imports, part of the client bundle. Put it on the small interactive component, not on a layout, or you'd ship the whole tree as client JavaScript.",
      "Компоненти в `app/` за замовчуванням серверні й не можуть мати стан чи обробляти події. `\"use client\"` на початку модуля робить його та все, що він імпортує, частиною клієнтського бандла. Ставте директиву на невеликий інтерактивний компонент, а не на макет, інакше все дерево піде в браузер як клієнтський JavaScript.",
    ],
  ),
  quiz(
    "next-async-params",
    ["nextjs", w("async-javascript")],
    2,
    90,
    ["Reading route params", "Читання параметрів маршруту"],
    ["In a recent Next.js version, how should `app/blog/[slug]/page.tsx` read the slug?", "Як у свіжій версії Next.js файлу `app/blog/[slug]/page.tsx` прочитати slug?"],
    [
      ["`export default async function Page({ params }) { const { slug } = await params; … }`", "`export default async function Page({ params }) { const { slug } = await params; … }`"],
      ["`export default function Page({ params }) { const { slug } = params; … }`", "`export default function Page({ params }) { const { slug } = params; … }`"],
      ["`const slug = useParams().slug` in the Server Component", "`const slug = useParams().slug` у серверному компоненті"],
      ["`const slug = window.location.pathname.split(\"/\")[2]`", "`const slug = window.location.pathname.split(\"/\")[2]`"],
    ],
    "a",
    [
      "`params` (and `searchParams`) are Promises in current Next.js, so a page awaits them. Synchronous access was deprecated in v15. `useParams` is a client hook, and `window` doesn't exist in Server Components.",
      "`params` (і `searchParams`) у поточному Next.js є промісами, тож сторінка на них чекає через `await`. Синхронний доступ застарів у v15. `useParams` є клієнтським хуком, а `window` у серверних компонентах не існує.",
    ],
  ),
  quiz(
    "next-env-secret",
    ["nextjs", w("web-security")],
    3,
    90,
    ["Secrets and the client bundle", "Секрети й клієнтський бандл"],
    [
      "A Client Component calls Stripe with `process.env.STRIPE_SECRET_KEY`, and the key is empty in the browser. What's going on, and what should you do?",
      "Клієнтський компонент викликає Stripe з `process.env.STRIPE_SECRET_KEY`, а в браузері ключ порожній. Що відбувається і що робити?",
    ],
    [
      ["Only `NEXT_PUBLIC_` variables are inlined into client code; keep the call on the server (Server Component, Server Action or Route Handler)", "У клієнтський код вбудовуються лише змінні `NEXT_PUBLIC_`; виконуйте виклик на сервері (серверний компонент, Server Action чи Route Handler)"],
      ["Rename it to `NEXT_PUBLIC_STRIPE_SECRET_KEY`", "Перейменувати на `NEXT_PUBLIC_STRIPE_SECRET_KEY`"],
      ["Read it in `useEffect`, where `process.env` is available", "Читати її в `useEffect`, де `process.env` доступний"],
      ["Restart the dev server; client env vars load lazily", "Перезапустити dev-сервер; змінні для клієнта завантажуються ліниво"],
    ],
    "a",
    [
      "At build time Next.js replaces `process.env.NEXT_PUBLIC_*` in client code with the values and replaces other variables with empty strings, so secrets never leak into the bundle. Adding the prefix would publish the secret key to every visitor. Call Stripe from server code and mark such modules with `import \"server-only\"`.",
      "Під час збірки Next.js замінює `process.env.NEXT_PUBLIC_*` у клієнтському коді значеннями, а інші змінні порожніми рядками, тож секрети ніколи не потрапляють у бандл. Префікс опублікував би секретний ключ для кожного відвідувача. Викликайте Stripe із серверного коду й позначайте такі модулі через `import \"server-only\"`.",
    ],
  ),
  quiz(
    "next-loading-streaming",
    ["nextjs", w("web-performance")],
    3,
    90,
    ["What `loading.tsx` does", "Що робить `loading.tsx`"],
    ["You add `app/dashboard/loading.tsx` next to a page that awaits a slow query. What changes?", "Ви додаєте `app/dashboard/loading.tsx` поруч зі сторінкою, що чекає на повільний запит. Що зміниться?"],
    [
      ["The page is wrapped in a Suspense boundary: the layout and the loading UI stream immediately, and the page content streams in when the query finishes", "Сторінку обгорнуто межею Suspense: макет і UI завантаження передаються одразу, а вміст сторінки надходить, коли запит завершиться"],
      ["The query is cached for 60 seconds", "Запит кешується на 60 секунд"],
      ["The page becomes a Client Component that fetches in `useEffect`", "Сторінка стає клієнтським компонентом, що отримує дані в `useEffect`"],
      ["Nothing until you also add `export const dynamic = \"force-static\"`", "Нічого, поки не додати ще й `export const dynamic = \"force-static\"`"],
    ],
    "a",
    [
      "`loading.tsx` is shorthand for wrapping the segment's page in `<Suspense fallback={<Loading />}>`. The server sends the shell first and streams the rest over the same response, so users see something useful immediately and navigation stays responsive. Finer-grained `<Suspense>` boundaries let independent parts stream separately.",
      "`loading.tsx` є скороченням для обгортання сторінки сегмента в `<Suspense fallback={<Loading />}>`. Сервер спершу надсилає каркас, а решту передає потоком у тій самій відповіді, тож користувачі одразу бачать щось корисне, а навігація лишається чуйною. Дрібніші межі `<Suspense>` дають незалежним частинам надходити окремо.",
    ],
  ),
  quiz(
    "next-server-action-auth",
    ["nextjs", w("web-security")],
    4,
    120,
    ["Securing a Server Action", "Захист Server Action"],
    ["The delete button is rendered only for admins. Is `deletePost` secure?", "Кнопку видалення показують лише адміністраторам. Чи безпечний `deletePost`?"],
    [
      ["No: a Server Action is a public POST endpoint; check the user's role and validate `id` inside the action", "Ні: Server Action є публічним POST-ендпоінтом; перевіряйте роль користувача й валідуйте `id` всередині дії"],
      ["Yes: Server Actions can only be called from components that render them", "Так: Server Actions можна викликати лише з компонентів, які їх рендерять"],
      ["Yes, because the action ID is secret and random", "Так, бо ідентифікатор дії секретний і випадковий"],
      ["No, but adding `\"use client\"` to the button fixes it", "Ні, але додавання `\"use client\"` до кнопки це виправить"],
    ],
    "a",
    [
      "Anyone who can load a page that references the action can call it with any arguments, so hiding UI is not access control. Treat every action like an API route: authenticate, authorise (ownership or role), validate input with a schema, and only then mutate. Checks in `proxy.ts` or layouts don't run for every action call.",
      "Будь-хто, хто може завантажити сторінку, що посилається на дію, може викликати її з будь-якими аргументами, тож приховування UI не є контролем доступу. Ставтеся до кожної дії як до API-маршруту: автентифікуйте, авторизуйте (власність чи роль), валідуйте дані схемою і лише потім змінюйте дані. Перевірки в `proxy.ts` чи макетах не виконуються для кожного виклику дії.",
    ],
    { code: "async function deletePost(id: string) {\n  \"use server\";\n  await db.post.delete({ where: { id } });\n}\n\n{isAdmin && (\n  <form action={deletePost.bind(null, post.id)}>\n    <button>Delete</button>\n  </form>\n)}", codeLanguage: "tsx" },
  ),
  quiz(
    "next-revalidate-after-write",
    ["nextjs"],
    4,
    120,
    ["Stale data after a mutation", "Застарілі дані після зміни"],
    ["A Server Action renames a product, but `/products` still shows the old name because the page is cached. What should the action do after the write?", "Server Action перейменовує товар, але `/products` показує стару назву, бо сторінку закешовано. Що має зробити дія після запису?"],
    [
      ["Call `revalidatePath(\"/products\")` (or `updateTag`/`revalidateTag` for tagged data)", "Викликати `revalidatePath(\"/products\")` (або `updateTag`/`revalidateTag` для даних з тегами)"],
      ["Call `router.refresh()` inside the Server Action", "Викликати `router.refresh()` всередині Server Action"],
      ["Set `export const revalidate = 0` in the root layout", "Встановити `export const revalidate = 0` у кореневому макеті"],
      ["Return `{ cache: \"no-store\" }` from the action", "Повернути `{ cache: \"no-store\" }` з дії"],
    ],
    "a",
    [
      "On-demand revalidation invalidates exactly what the mutation affected: `revalidatePath` for a route, `revalidateTag` or `updateTag` for data you tagged when caching it (`updateTag` gives read-your-own-writes inside actions). `router.refresh()` is a client API, and disabling caching everywhere throws away the benefits of static rendering.",
      "Ревалідація на вимогу інвалідує саме те, на що вплинула зміна: `revalidatePath` для маршруту, `revalidateTag` чи `updateTag` для даних, яким ви дали тег під час кешування (`updateTag` дає змогу одразу бачити власні зміни в діях). `router.refresh()` є клієнтським API, а вимкнення кешу всюди позбавляє переваг статичного рендерингу.",
    ],
  ),
  quiz(
    "next-boundary-props",
    ["nextjs", w("react")],
    5,
    150,
    ["Crossing the client boundary", "Перетин клієнтської межі"],
    ["A Server Component renders `<Filters … />`, a Client Component. Which props can it pass? (Select all that apply.)", "Серверний компонент рендерить `<Filters … />`, клієнтський компонент. Які пропси він може передати? (Оберіть усі.)"],
    [
      ["`options={[{ id: 1, label: \"New\" }]}`", "`options={[{ id: 1, label: \"New\" }]}`"],
      ["`onChange={(v) => console.log(v)}`", "`onChange={(v) => console.log(v)}`"],
      ["`children={<ServerRenderedList />}`", "`children={<ServerRenderedList />}`"],
      ["`onSave={saveFilters}`, where `saveFilters` is a Server Action", "`onSave={saveFilters}`, де `saveFilters` є Server Action"],
      ["`formatter={new Intl.NumberFormat(\"en\")}`", "`formatter={new Intl.NumberFormat(\"en\")}`"],
    ],
    "acd",
    [
      "Props sent from server to client are serialised into the RSC payload. Plain data, JSX (already rendered on the server) and Server Actions (sent as references the client can call) work. Ordinary functions and class instances like `Intl.NumberFormat` can't be serialised: define the handler or create the formatter inside the Client Component instead.",
      "Пропси, що передаються з сервера на клієнт, серіалізуються в RSC payload. Звичайні дані, JSX (уже відрендерений на сервері) і Server Actions (передаються як посилання, які клієнт може викликати) працюють. Звичайні функції й екземпляри класів на кшталт `Intl.NumberFormat` серіалізувати не можна: оголосіть обробник або створіть форматер усередині клієнтського компонента.",
    ],
  ),
  practice({
    slug: "next-route-matcher",
    skills: ["nextjs", w("typescript"), w("arrays-strings")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["An App Router route matcher", "Зіставлення маршрутів App Router"],
    prompt: [
      "Implement `matchRoute(routes, pathname)` in `src/router.ts`, the way the Next.js App Router resolves URLs. It returns `{ route, params }` for the best match or `null`.\n\n- `[slug]` matches one segment: `params.slug = \"hello\"`.\n- `[...path]` (catch-all) matches **one or more** segments: `params.path = [\"a\", \"b\"]`.\n- `[[...slug]]` (optional catch-all) also matches **zero** segments, leaving the param out.\n- `(group)` folders are route groups and aren't part of the URL.\n- Specificity decides, segment by segment, regardless of the order of `routes`: static > dynamic > catch-all > optional catch-all.\n- Ignore trailing slashes, the query string and the hash; decode percent-encoded segments.",
      "Реалізуйте `matchRoute(routes, pathname)` у `src/router.ts` так, як App Router у Next.js розпізнає URL. Функція повертає `{ route, params }` для найкращого збігу або `null`.\n\n- `[slug]` відповідає одному сегменту: `params.slug = \"hello\"`.\n- `[...path]` (catch-all) відповідає **одному чи більше** сегментам: `params.path = [\"a\", \"b\"]`.\n- `[[...slug]]` (необов'язковий catch-all) відповідає також **нулю** сегментів, і тоді параметра немає.\n- Папки `(group)` є групами маршрутів і не входять в URL.\n- Перевагу визначає специфічність, сегмент за сегментом, незалежно від порядку `routes`: статичний > динамічний > catch-all > необов'язковий catch-all.\n- Ігноруйте кінцеві слеші, рядок запиту й хеш; декодуйте сегменти з процентним кодуванням.",
    ],
    files: { "/src/router.ts": ROUTER_STARTER, "/index.ts": ROUTER_INDEX },
    visibleFiles: ["/src/router.ts", "/index.ts"],
    activeFile: "/src/router.ts",
    tests: ROUTER_TESTS,
    solution: { "/src/router.ts": ROUTER_SOLUTION },
    explanation: [
      "Parsing each pattern into typed segments separates the rules from the matching. Sorting candidates by a per-segment rank makes `/blog/new` win over `/blog/[slug]` no matter how the list is ordered, which is how Next.js resolves conflicts. Catch-alls consume the remaining parts (requiring at least one unless optional), groups are dropped before matching, and the pathname is normalised and decoded once up front.",
      "Розбір кожного шаблону на типізовані сегменти відокремлює правила від зіставлення. Сортування кандидатів за рангом кожного сегмента робить так, що `/blog/new` переважає `/blog/[slug]` незалежно від порядку списку; так Next.js і розв'язує конфлікти. Catch-all забирає решту частин (вимагаючи щонайменше одну, якщо він не необов'язковий), групи відкидаються до зіставлення, а шлях нормалізується й декодується один раз на початку.",
    ],
  }),
]);
