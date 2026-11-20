import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const LOADER_STARTER = String.raw`export type BatchFn<K, V> = (keys: readonly K[]) => Promise<readonly (V | Error)[]>;

/**
 * Batches and caches loads, like the DataLoader library used to fix N+1 queries in GraphQL resolvers.
 */
export class DataLoader<K, V> {
  constructor(private readonly batchFn: BatchFn<K, V>, private readonly options: { maxBatchSize?: number } = {}) {}

  load(key: K): Promise<V> {
    // TODO: this calls the batch function once per key
    return this.batchFn([key]).then((results) => {
      const value = results[0];
      if (value instanceof Error) throw value;
      return value as V;
    });
  }

  loadMany(keys: readonly K[]): Promise<V[]> {
    return Promise.all(keys.map((key) => this.load(key)));
  }

  clear(key: K): this {
    return this;
  }
}
`;

const LOADER_SOLUTION = String.raw`export type BatchFn<K, V> = (keys: readonly K[]) => Promise<readonly (V | Error)[]>;

type Pending<V> = { resolve: (value: V) => void; reject: (error: unknown) => void };

export class DataLoader<K, V> {
  private cache = new Map<K, Promise<V>>();
  private queue = new Map<K, Pending<V>>(); // a Map deduplicates keys and keeps first-request order
  private scheduled = false;

  constructor(private readonly batchFn: BatchFn<K, V>, private readonly options: { maxBatchSize?: number } = {}) {}

  load(key: K): Promise<V> {
    const cached = this.cache.get(key);
    if (cached) return cached;
    const promise = new Promise<V>((resolve, reject) => this.queue.set(key, { resolve, reject }));
    this.cache.set(key, promise);
    if (!this.scheduled) {
      this.scheduled = true;
      // Wait for the current task (and its microtasks) so resolvers awaiting other data join the batch.
      setTimeout(() => this.dispatch(), 0);
    }
    return promise;
  }

  loadMany(keys: readonly K[]): Promise<V[]> {
    return Promise.all(keys.map((key) => this.load(key)));
  }

  clear(key: K): this {
    this.cache.delete(key);
    return this;
  }

  private dispatch() {
    this.scheduled = false;
    const entries = [...this.queue.entries()];
    this.queue.clear();
    const size = this.options.maxBatchSize ?? Infinity;
    for (let i = 0; i < entries.length; i += size) void this.runBatch(entries.slice(i, i + size));
  }

  private async runBatch(batch: [K, Pending<V>][]) {
    const fail = (key: K, pending: Pending<V>, error: unknown) => {
      this.cache.delete(key); // don't cache failures, so a later load can retry
      pending.reject(error);
    };
    const keys = batch.map(([key]) => key);
    let results: readonly (V | Error)[];
    try {
      results = await this.batchFn(keys);
      if (!Array.isArray(results) || results.length !== keys.length) {
        throw new Error("batchFn must return an array with one result per key");
      }
    } catch (error) {
      for (const [key, pending] of batch) fail(key, pending, error);
      return;
    }
    batch.forEach(([key, pending], i) => {
      const result = results[i];
      if (result instanceof Error) fail(key, pending, result);
      else pending.resolve(result);
    });
  }
}
`;

const LOADER_INDEX = String.raw`import "./styles.css";
import { DataLoader } from "./src/dataloader";

// Simulates resolving Post.author for a list of posts.
let queries = 0;
const users = new DataLoader<number, string>(async (ids) => {
  queries++;
  return ids.map((id) => "User " + id);
});
const posts = [
  { title: "Hello", authorId: 1 },
  { title: "Batching", authorId: 2 },
  { title: "Caching", authorId: 1 },
  { title: "N+1", authorId: 3 },
];
Promise.all(posts.map(async (p) => ({ ...p, author: await users.load(p.authorId) }))).then((rows) => {
  document.getElementById("app")!.innerHTML =
    "<h1>Posts</h1><ul>" + rows.map((r) => "<li>" + r.title + " by " + r.author + "</li>").join("") + '</ul><p>Database queries: <output id="queries">' + queries + "</output></p>";
});
`;

const LOADER_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { DataLoader } from "../src/dataloader";

function makeLoader(options) {
  const calls = [];
  const loader = new DataLoader(async (keys) => {
    calls.push([...keys]);
    return keys.map((k) => (k < 0 ? new Error("bad " + k) : "user" + k));
  }, options);
  return { loader, calls };
}

describe("DataLoader", () => {
  it("batches loads from the same tick into one call", async () => {
    const { loader, calls } = makeLoader();
    const out = await Promise.all([loader.load(1), loader.load(2), loader.load(3)]);
    expect(out).toEqual(["user1", "user2", "user3"]);
    expect(calls).toEqual([[1, 2, 3]]);
  });
  it("also batches loads made after awaits in the same task", async () => {
    const { loader, calls } = makeLoader();
    const viaAwait = async (id) => { await null; await null; return loader.load(id); };
    await Promise.all([viaAwait(1), viaAwait(2), loader.load(3)]);
    expect(calls).toEqual([[3, 1, 2]]);
  });
  it("deduplicates keys and caches results", async () => {
    const { loader, calls } = makeLoader();
    const [a, b] = await Promise.all([loader.load(1), loader.load(1)]);
    expect(a).toBe("user1");
    expect(b).toBe("user1");
    expect(await loader.load(1)).toBe("user1");
    expect(calls).toEqual([[1]]);
  });
  it("reloads a key after clear()", async () => {
    const { loader, calls } = makeLoader();
    await loader.load(1);
    loader.clear(1);
    await loader.load(1);
    expect(calls).toEqual([[1], [1]]);
  });
  it("loads many keys in one batch", async () => {
    const { loader, calls } = makeLoader();
    expect(await loader.loadMany([4, 5])).toEqual(["user4", "user5"]);
    expect(calls).toEqual([[4, 5]]);
  });
  it("rejects only keys whose result is an Error, without caching the failure", async () => {
    const { loader, calls } = makeLoader();
    const settled = await Promise.allSettled([loader.load(1), loader.load(-1)]);
    expect(settled[0]).toEqual({ status: "fulfilled", value: "user1" });
    expect(settled[1].status).toBe("rejected");
    expect(settled[1].reason.message).toBe("bad -1");
    await loader.load(-1).catch(() => {});
    expect(calls).toEqual([[1, -1], [-1]]);
  });
  it("rejects the whole batch when batchFn fails or returns the wrong length", async () => {
    const short = new DataLoader(async (keys) => keys.slice(1));
    const settled = await Promise.allSettled([short.load("a"), short.load("b")]);
    expect(settled.map((s) => s.status)).toEqual(["rejected", "rejected"]);
    const down = new DataLoader(async () => { throw new Error("db down"); });
    await expect(down.load("x")).rejects.toThrow("db down");
  });
  it("splits batches by maxBatchSize", async () => {
    const { loader, calls } = makeLoader({ maxBatchSize: 2 });
    await Promise.all([1, 2, 3, 4, 5].map((k) => loader.load(k)));
    expect(calls).toEqual([[1, 2], [3, 4], [5]]);
  });
  it("renders the demo with a single query", async () => {
    expect((await screen.findByText("1")).id).toBe("queries");
  });
});
`;

export default defineTasks([
  quiz(
    "gql-what-it-solves",
    ["graphql"],
    1,
    45,
    ["What GraphQL is for", "Для чого потрібен GraphQL"],
    ["A mobile screen makes four REST calls and uses only a few fields from each response. What does GraphQL offer here?", "Мобільний екран робить чотири REST-виклики й використовує лише кілька полів із кожної відповіді. Що тут пропонує GraphQL?"],
    [
      ["The client asks for exactly the fields and related data it needs, in one request", "Клієнт просить саме ті поля й пов'язані дані, які йому потрібні, одним запитом"],
      ["Automatic HTTP caching of every response by URL", "Автоматичне HTTP-кешування кожної відповіді за URL"],
      ["Faster databases", "Швидші бази даних"],
      ["Binary responses instead of JSON", "Двійкові відповіді замість JSON"],
    ],
    "a",
    [
      "GraphQL lets the client describe the shape of the data, so there's no over-fetching (unused fields) and no under-fetching (extra round trips for related data). It doesn't make the database faster, it usually returns JSON, and HTTP caching is actually harder because queries are typically POSTed to one endpoint.",
      "GraphQL дає клієнту змогу описати форму даних, тож немає зайвих полів і немає додаткових запитів за пов'язаними даними. Він не робить базу швидшою, зазвичай повертає JSON, а HTTP-кешування навіть складніше, бо запити зазвичай надсилають через POST на один ендпоінт.",
    ],
  ),
  quiz(
    "gql-schema-nullability",
    ["graphql"],
    2,
    60,
    ["Reading `[Post!]!`", "Як читати `[Post!]!`"],
    ["What does the field type `posts: [Post!]!` guarantee?", "Що гарантує тип поля `posts: [Post!]!`?"],
    [
      ["The list itself is never null, and none of its items is null (it can be empty)", "Сам список ніколи не null, і жоден його елемент не null (список може бути порожнім)"],
      ["The list always has at least one post", "Список завжди містить щонайменше один допис"],
      ["The list may be null, but its items can't be", "Список може бути null, але його елементи ні"],
      ["Items may be null, but the list can't be", "Елементи можуть бути null, але список ні"],
    ],
    "a",
    [
      "`!` after a type means non-null. The inner `!` applies to each item, the outer one to the list. An empty list `[]` is still a valid non-null list. `[Post]` (no `!`) would allow both a `null` list and `null` items.",
      "`!` після типу означає «не null». Внутрішній `!` стосується кожного елемента, зовнішній самого списку. Порожній список `[]` теж є дійсним ненульовим списком. `[Post]` (без `!`) дозволив би і `null` замість списку, і `null` серед елементів.",
    ],
  ),
  quiz(
    "gql-errors-200",
    ["graphql", w("http-rest")],
    2,
    90,
    ["Errors with status 200", "Помилки зі статусом 200"],
    ["A GraphQL request returns HTTP `200`. What should the client still check?", "Запит GraphQL повернув HTTP `200`. Що клієнт усе одно має перевірити?"],
    [
      ["The `errors` array: GraphQL can return partial `data` alongside errors with status 200", "Масив `errors`: GraphQL може повернути часткові `data` разом із помилками зі статусом 200"],
      ["Nothing: 200 means every field resolved", "Нічого: 200 означає, що всі поля розв'язано"],
      ["The `Retry-After` header", "Заголовок `Retry-After`"],
      ["Whether the response is HTML", "Чи не є відповідь HTML"],
    ],
    "a",
    [
      "In GraphQL a request can partly succeed: fields that resolved appear in `data`, and failures are listed in `errors` with a `path` to the failing field, typically with HTTP 200. Status codes mostly signal transport problems (malformed request, auth at the gateway). Always handle `errors`, and decide per screen whether partial data is usable.",
      "У GraphQL запит може вдатися частково: розв'язані поля з'являються в `data`, а невдачі перелічені в `errors` зі шляхом (`path`) до поля, зазвичай зі статусом HTTP 200. Коди статусу здебільшого сигналізують про проблеми транспорту (неправильний запит, автентифікація на шлюзі). Завжди обробляйте `errors` і вирішуйте для кожного екрана, чи придатні часткові дані.",
    ],
    { code: '{\n  "data": { "user": { "name": "Ada", "billing": null } },\n  "errors": [{ "message": "Billing service unavailable", "path": ["user", "billing"] }]\n}', codeLanguage: "json" },
  ),
  quiz(
    "gql-n-plus-one",
    ["graphql", w("sql")],
    3,
    120,
    ["The N+1 problem", "Проблема N+1"],
    ["This query lists 50 posts. With the resolvers below, how many database queries run, and what's the usual fix?", "Цей запит повертає 50 дописів. Скільки запитів до бази виконається з такими резолверами і як це зазвичай виправляють?"],
    [
      ["51 (1 for posts + 1 per author); batch author lookups with a DataLoader", "51 (1 за дописами + по 1 на автора); пакетувати пошук авторів через DataLoader"],
      ["2, because GraphQL joins related tables automatically", "2, бо GraphQL автоматично з'єднує пов'язані таблиці"],
      ["1, because resolvers share one transaction", "1, бо резолвери ділять одну транзакцію"],
      ["50; add an index on `users.id`", "50; додати індекс на `users.id`"],
    ],
    "a",
    [
      "GraphQL runs `Post.author` once per post, and each call queries the database separately: 1 + N queries. DataLoader collects the `load(id)` calls made while resolving one level, deduplicates the ids, and runs a single `WHERE id IN (…)` query, with a per-request cache. An index makes each query faster but doesn't reduce their number.",
      "GraphQL виконує `Post.author` для кожного допису, і кожен виклик окремо звертається до бази: 1 + N запитів. DataLoader збирає виклики `load(id)`, зроблені під час розв'язання одного рівня, прибирає дублікати й виконує один запит `WHERE id IN (…)` з кешем на запит. Індекс пришвидшує кожен запит, але не зменшує їхню кількість.",
    ],
    {
      code: "const resolvers = {\n  Query: {\n    posts: () => db.query(\"SELECT * FROM posts LIMIT 50\"),\n  },\n  Post: {\n    author: (post) => db.query(\"SELECT * FROM users WHERE id = $1\", [post.authorId]),\n  },\n};",
      codeLanguage: "ts",
    },
  ),
  quiz(
    "gql-variables",
    ["graphql", w("web-security")],
    3,
    90,
    ["Passing user input", "Передача даних користувача"],
    ["Why use variables instead of building the query string with user input?", "Чому варто використовувати змінні, а не будувати текст запиту з даних користувача?"],
    [
      ["Input can't change the query's structure, the server validates types, and the query text stays constant (cacheable, persistable)", "Дані не можуть змінити структуру запиту, сервер перевіряє типи, а текст запиту лишається сталим (його можна кешувати й зберігати)"],
      ["Variables are encrypted in transit", "Змінні шифруються під час передачі"],
      ["Interpolated queries are always rejected by the server", "Сервер завжди відхиляє запити з підставленими значеннями"],
      ["Variables make the response smaller", "Змінні зменшують відповідь"],
    ],
    "a",
    [
      "Splicing input into the query text is the GraphQL version of injection: a crafted value can add fields or arguments. Variables are sent separately as JSON and checked against the declared types (`$id: ID!`). Because the text never changes, clients can use persisted queries (sending only a hash) and servers can cache parsed documents.",
      "Вставлення даних у текст запиту є GraphQL-версією ін'єкції: підготовлене значення може додати поля чи аргументи. Змінні надсилаються окремо як JSON і перевіряються за оголошеними типами (`$id: ID!`). Оскільки текст не змінюється, клієнти можуть використовувати збережені запити (надсилаючи лише хеш), а сервери кешувати розібрані документи.",
    ],
    { code: "// ✗\nconst query = `{ user(id: \"${input}\") { name } }`;\n\n// ✓\nconst query = `query User($id: ID!) { user(id: $id) { name } }`;\nfetch(\"/graphql\", { method: \"POST\", body: JSON.stringify({ query, variables: { id: input } }) });", codeLanguage: "ts" },
  ),
  quiz(
    "gql-null-bubbling",
    ["graphql"],
    4,
    120,
    ["Null propagation", "Поширення null"],
    ["The resolver for `User.name` throws. What does the client receive for this query?", "Резолвер `User.name` кидає помилку. Що отримає клієнт на цей запит?"],
    [
      ["`data.user` is `null`, and `errors` has an entry with path `[\"user\", \"name\"]`", "`data.user` дорівнює `null`, а `errors` містить запис зі шляхом `[\"user\", \"name\"]`"],
      ["`data.user.name` is `null` and `email` is returned", "`data.user.name` дорівнює `null`, а `email` повертається"],
      ["`data` is `null` and the whole request fails", "`data` дорівнює `null`, і весь запит не вдається"],
      ["`data.user.name` is an empty string", "`data.user.name` є порожнім рядком"],
    ],
    "a",
    [
      "`name` is non-null, so it can't be replaced by `null`. The `null` propagates to the nearest nullable parent, which is `user: User`, so the whole user (including `email`) is `null`. If `user` were also non-null, it would bubble up to `data`. Choosing nullability is a trade-off between strong guarantees and resilience to partial failures.",
      "`name` є обов'язковим, тож його не можна замінити на `null`. `null` піднімається до найближчого батька, що допускає null, тобто `user: User`, тож увесь користувач (разом з `email`) стає `null`. Якби `user` теж був обов'язковим, null піднявся б до `data`. Вибір обов'язковості є компромісом між сильними гарантіями й стійкістю до часткових збоїв.",
    ],
    { code: "type Query { user(id: ID!): User }\ntype User {\n  id: ID!\n  name: String!\n  email: String\n}\n\n# query\n{ user(id: \"1\") { name email } }", codeLanguage: "graphql" },
  ),
  quiz(
    "gql-normalized-cache",
    ["graphql", w("state-management")],
    4,
    150,
    ["The cache after a mutation", "Кеш після мутації"],
    [
      "With Apollo Client, a `renameProject` mutation returns `{ id, name }` and every screen shows the new name. A `createProject` mutation succeeds, but the new project doesn't appear in the project list. Why?",
      "В Apollo Client мутація `renameProject` повертає `{ id, name }`, і кожен екран показує нову назву. Мутація `createProject` виконується успішно, але новий проєкт не з'являється в списку. Чому?",
    ],
    [
      ["The normalised cache updates objects by `__typename:id`, but it can't know which lists a new object belongs to; update the list (`cache.modify`/`update`) or refetch it", "Нормалізований кеш оновлює об'єкти за `__typename:id`, але не може знати, до яких списків належить новий об'єкт; оновіть список (`cache.modify`/`update`) або перезавантажте його"],
      ["Mutations never touch the cache", "Мутації ніколи не змінюють кеш"],
      ["The list query must use `fetchPolicy: \"cache-only\"`", "Запит списку має використовувати `fetchPolicy: \"cache-only\"`"],
      ["New objects are cached only after a page reload", "Нові об'єкти кешуються лише після перезавантаження сторінки"],
    ],
    "a",
    [
      "Every object is stored once under its `__typename` and `id`, and queries hold references to it, so returning the updated `{ id, name }` refreshes every view of that project. A brand-new object has no references yet: deciding that it belongs at the top of \"my projects\" is application logic. Add it in the mutation's `update` function, or use `refetchQueries` for the affected list.",
      "Кожен об'єкт зберігається один раз за своїм `__typename` та `id`, а запити тримають посилання на нього, тож повернення оновленого `{ id, name }` оновлює кожне відображення цього проєкту. Зовсім новий об'єкт ще не має посилань: рішення, що він має з'явитися на початку «моїх проєктів», є логікою застосунку. Додайте його у функції `update` мутації або використайте `refetchQueries` для відповідного списку.",
    ],
  ),
  quiz(
    "gql-query-cost",
    ["graphql", w("web-security")],
    5,
    150,
    ["Expensive queries", "Дорогі запити"],
    ["Which measures protect a public GraphQL API from abusive, deeply nested queries? (Select all that apply.)", "Які заходи захищають публічний GraphQL API від зловмисних, глибоко вкладених запитів? (Оберіть усі.)"],
    [
      ["Limit query depth and estimated complexity/cost before executing", "Обмежувати глибину запиту й оцінену складність/вартість до виконання"],
      ["Cap list sizes and require pagination arguments", "Обмежувати розміри списків і вимагати аргументи пагінації"],
      ["Accept only persisted (allow-listed) queries from your own clients", "Приймати лише збережені (з білого списку) запити від власних клієнтів"],
      ["Rate-limit by number of HTTP requests only", "Обмежувати частоту лише за кількістю HTTP-запитів"],
      ["Switch from POST to GET", "Перейти з POST на GET"],
    ],
    "abc",
    [
      "One GraphQL request can ask for millions of nodes (`posts { author { posts { author { … } } } }`), so counting requests alone doesn't bound the work. Reject queries that are too deep or too costly before execution, cap and paginate lists, and, for first-party apps, allow only known persisted queries. GET vs POST changes caching, not cost.",
      "Один GraphQL-запит може попросити мільйони вузлів (`posts { author { posts { author { … } } } }`), тож підрахунок лише кількості запитів не обмежує обсяг роботи. Відхиляйте занадто глибокі чи дорогі запити до виконання, обмежуйте й пагінуйте списки, а для власних застосунків дозволяйте лише відомі збережені запити. GET чи POST впливає на кешування, а не на вартість.",
    ],
  ),
  practice({
    slug: "gql-dataloader",
    skills: ["graphql", w("async-javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Build a DataLoader", "Створіть DataLoader"],
    prompt: [
      "Resolving `Post.author` once per post causes N+1 database queries. Implement a `DataLoader` in `src/dataloader.ts`:\n\n- `load(key)` returns a promise of the value. All keys requested **before the next task** (schedule the batch with `setTimeout(…, 0)`, so loads made after `await`s in the current task still join) go to **one** `batchFn(keys)` call, in first-request order.\n- Duplicate keys are sent once, and results are **cached**: loading a cached key returns the same promise without a new batch. `clear(key)` forgets a key.\n- `batchFn` returns one result per key, in the same order. An `Error` in the results rejects **only** that key. If `batchFn` throws, or returns the wrong number of results, every key in that batch rejects.\n- Failed keys aren't cached, so they can be retried.\n- `options.maxBatchSize` splits large batches. `loadMany(keys)` loads several keys at once.",
      "Розв'язання `Post.author` окремо для кожного допису спричиняє N+1 запитів до бази. Реалізуйте `DataLoader` у `src/dataloader.ts`:\n\n- `load(key)` повертає проміс значення. Усі ключі, запитані **до наступної задачі** (плануйте пакет через `setTimeout(…, 0)`, щоб завантаження після `await` у поточній задачі теж приєднувалися), ідуть в **один** виклик `batchFn(keys)` у порядку першого запиту.\n- Дублікати ключів надсилаються один раз, а результати **кешуються**: завантаження закешованого ключа повертає той самий проміс без нового пакета. `clear(key)` забуває ключ.\n- `batchFn` повертає по одному результату на ключ у тому ж порядку. `Error` серед результатів відхиляє **лише** цей ключ. Якщо `batchFn` кидає помилку чи повертає неправильну кількість результатів, відхиляються всі ключі пакета.\n- Невдалі ключі не кешуються, тож їх можна повторити.\n- `options.maxBatchSize` ділить великі пакети. `loadMany(keys)` завантажує кілька ключів одразу.",
    ],
    files: { "/src/dataloader.ts": LOADER_STARTER, "/index.ts": LOADER_INDEX },
    visibleFiles: ["/src/dataloader.ts", "/index.ts"],
    activeFile: "/src/dataloader.ts",
    tests: LOADER_TESTS,
    solution: { "/src/dataloader.ts": LOADER_SOLUTION },
    explanation: [
      "`load` doesn't fetch; it registers a pending promise in a queue and schedules one dispatch for later. Because the dispatch waits for the next task, every resolver at the same level of the query, even after its own `await`s, has added its key by then. The cache stores promises (not values), so concurrent requests for the same key share one in-flight load. Mapping results back by position and rejecting per key keeps one bad id from failing the whole list.",
      "`load` нічого не завантажує одразу; він реєструє проміс, що очікує, у черзі й планує одне надсилання на потім. Оскільки надсилання чекає наступної задачі, кожен резолвер того самого рівня запиту, навіть після власних `await`, на той момент уже додав свій ключ. Кеш зберігає проміси (а не значення), тож одночасні запити того самого ключа ділять одне завантаження. Зіставлення результатів за позицією й відхилення окремих ключів не дає одному поганому id зіпсувати весь список.",
    ],
  }),
]);
