import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "http-put-patch",
    ["http-rest"],
    2,
    60,
    ["PUT or PATCH?", "PUT чи PATCH?"],
    ["A client wants to change only a user's email and leave every other field untouched. Which request fits REST semantics?", "Клієнт хоче змінити лише email користувача, не чіпаючи інших полів. Який запит відповідає семантиці REST?"],
    [
      ["`PUT /users/42` with `{ \"email\": \"new@x.dev\" }`", "`PUT /users/42` з `{ \"email\": \"new@x.dev\" }`"],
      ["`PATCH /users/42` with `{ \"email\": \"new@x.dev\" }`", "`PATCH /users/42` з `{ \"email\": \"new@x.dev\" }`"],
      ["`POST /users/42/email/update`", "`POST /users/42/email/update`"],
      ["`GET /users/42?email=new@x.dev`", "`GET /users/42?email=new@x.dev`"],
    ],
    "b",
    [
      "`PUT` replaces the whole resource with the body, so sending only the email would, strictly, clear the other fields. `PATCH` applies a partial update. Changing state with `GET` is never acceptable: it must be safe, and it gets cached, prefetched and logged.",
      "`PUT` замінює весь ресурс тілом запиту, тож надсилання лише email, строго кажучи, очистило б інші поля. `PATCH` застосовує часткове оновлення. Змінювати стан через `GET` неприпустимо: він має бути безпечним, а ще його кешують, завантажують наперед і логують.",
    ],
  ),
  quiz(
    "http-if-match",
    ["http-rest"],
    4,
    90,
    ["Lost updates", "Втрачені оновлення"],
    ["Two editors load the same article and both save changes. The second save silently overwrites the first. Which HTTP mechanism prevents this?", "Двоє редакторів завантажують ту саму статтю й обидва зберігають зміни. Друге збереження мовчки перезаписує перше. Який механізм HTTP цьому запобігає?"],
    [
      ["Send `Cache-Control: no-store` with the save", "Надсилати `Cache-Control: no-store` під час збереження"],
      ["Send the article's `ETag` in `If-Match`; the server answers 412 Precondition Failed if it changed", "Надсилати `ETag` статті в `If-Match`; сервер відповідає 412 Precondition Failed, якщо вона змінилася"],
      ["Use `POST` instead of `PUT`", "Використовувати `POST` замість `PUT`"],
      ["Send `If-None-Match: *`", "Надсилати `If-None-Match: *`"],
    ],
    "b",
    [
      "This is optimistic concurrency control. The `ETag` identifies the version the editor loaded. With `If-Match`, the server applies the write only if the current version still matches, and otherwise returns 412, so the client can reload and merge. `If-None-Match: *` is the opposite guard: create only if the resource doesn't exist yet.",
      "Це оптимістичне керування конкурентністю. `ETag` ідентифікує версію, яку завантажив редактор. З `If-Match` сервер застосовує запис, лише якщо поточна версія досі збігається, інакше повертає 412, і клієнт може перезавантажити й об'єднати зміни. `If-None-Match: *` — протилежна умова: створити, лише якщо ресурсу ще немає.",
    ],
  ),
  quiz(
    "http-idempotency-key",
    ["http-rest"],
    5,
    120,
    ["Retrying a payment safely", "Безпечний повтор платежу"],
    ["`POST /payments` times out on the client. The client can't tell whether the server charged the card. How should the API let clients retry without double-charging?", "`POST /payments` завершується тайм-аутом на клієнті. Клієнт не знає, чи списав сервер кошти. Як API має дозволити повтори без подвійного списання?"],
    [
      ["Clients must never retry POST requests", "Клієнти ніколи не мають повторювати POST-запити"],
      ["Accept an `Idempotency-Key` header and return the stored result when the same key arrives again", "Приймати заголовок `Idempotency-Key` і повертати збережений результат, коли той самий ключ надходить знову"],
      ["Switch the endpoint to `GET`", "Перевести ендпоінт на `GET`"],
      ["Have the client wait 30 seconds before retrying", "Хай клієнт чекає 30 секунд перед повтором"],
    ],
    "b",
    [
      "The client generates a unique key per logical operation and sends it with every attempt. The server records the key with the outcome (atomically, handling concurrent duplicates) and replays the stored response for repeats, turning a non-idempotent POST into a safely retryable one. This is how payment APIs such as Stripe work. Waiting doesn't remove the ambiguity.",
      "Клієнт генерує унікальний ключ на кожну логічну операцію й надсилає його з кожною спробою. Сервер записує ключ разом із результатом (атомарно, з обробкою одночасних дублів) і повертає збережену відповідь на повтори — так неідемпотентний POST стає безпечним для повторів. Так працюють платіжні API, як-от Stripe. Очікування не прибирає невизначеності.",
    ],
  ),
  practice({
    slug: "http-paginate-link",
    skills: ["http-rest", { slug: "async-javascript", weight: 0.5 }],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Follow pagination links", "Перехід за посиланнями пагінації"],
    prompt: [
      "A REST API paginates with the `Link` header, as GitHub does:\n\n```http\nLink: <https://api.x.dev/items?page=2>; rel=\"next\", <https://api.x.dev/items?page=5>; rel=\"last\"\n```\n\nImplement:\n\n- `parseLink(header)`: returns a map from `rel` to URL. An empty or missing header gives `{}`.\n- `fetchAll(url, fetcher)`: requests each page with `fetcher(url)`, concatenates the JSON arrays, and follows `rel=\"next\"` until there is none. Throw an `Error` with the status (e.g. `HTTP 500`) for a non-ok response. To be safe, stop after 50 pages.",
      "REST API розбиває дані на сторінки через заголовок `Link`, як GitHub:\n\n```http\nLink: <https://api.x.dev/items?page=2>; rel=\"next\", <https://api.x.dev/items?page=5>; rel=\"last\"\n```\n\nРеалізуйте:\n\n- `parseLink(header)`: повертає відображення з `rel` у URL. Порожній чи відсутній заголовок дає `{}`.\n- `fetchAll(url, fetcher)`: запитує кожну сторінку через `fetcher(url)`, об'єднує JSON-масиви й переходить за `rel=\"next\"`, доки він є. Для неуспішної відповіді киньте `Error` зі статусом (наприклад, `HTTP 500`). Для безпеки зупиніться після 50 сторінок.",
    ],
    files: {
      "/src/paginate.ts":
        "export type PageResponse = {\n  ok: boolean;\n  status: number;\n  headers: { get(name: string): string | null };\n  json(): Promise<unknown>;\n};\nexport type Fetcher = (url: string) => Promise<PageResponse>;\n\nexport function parseLink(header: string | null): Record<string, string> {\n  // TODO\n  return {};\n}\n\nexport async function fetchAll<T>(url: string, fetcher: Fetcher): Promise<T[]> {\n  // TODO: follow rel=\"next\"\n  const response = await fetcher(url);\n  return (await response.json()) as T[];\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { fetchAll } from "./src/paginate";\nimport type { PageResponse } from "./src/paginate";\n\nconst pages: Record<string, { items: string[]; next?: string }> = {\n  "/items?page=1": { items: ["alpha", "beta"], next: "/items?page=2" },\n  "/items?page=2": { items: ["gamma"] },\n};\nconst fakeFetch = async (url: string): Promise<PageResponse> => ({\n  ok: true,\n  status: 200,\n  headers: { get: (name) => (name.toLowerCase() === "link" && pages[url].next ? "<" + pages[url].next + ">; rel=\\"next\\"" : null) },\n  json: async () => pages[url].items,\n});\nconst app = document.getElementById("app")!;\nfetchAll<string>("/items?page=1", fakeFetch).then((items) => {\n  app.innerHTML = "<h1>All items</h1><ul>" + items.map((i) => "<li>" + i + "</li>").join("") + "</ul>";\n});\n',
    },
    visibleFiles: ["/src/paginate.ts", "/index.ts"],
    activeFile: "/src/paginate.ts",
    tests:
      'import { describe, it, expect, fn } from "./test-kit";\nimport { fetchAll, parseLink } from "../src/paginate";\nimport type { PageResponse } from "../src/paginate";\n\nfunction server(pages: Record<string, { items?: number[]; link?: string; status?: number }>) {\n  return fn(async (url: string): Promise<PageResponse> => {\n    const page = pages[url];\n    const status = page?.status ?? (page ? 200 : 404);\n    return {\n      ok: status >= 200 && status < 300,\n      status,\n      headers: { get: (name: string) => (name.toLowerCase() === "link" ? page?.link ?? null : null) },\n      json: async () => page?.items ?? [],\n    };\n  });\n}\n\ndescribe("parseLink", () => {\n  it("maps rel to url", () => {\n    expect(parseLink(\'<https://a.dev/i?page=2>; rel="next", <https://a.dev/i?page=5>; rel="last"\')).toEqual({\n      next: "https://a.dev/i?page=2",\n      last: "https://a.dev/i?page=5",\n    });\n  });\n  it("tolerates extra whitespace and parameters", () => {\n    expect(parseLink(\'<https://a.dev/i?page=1&per_page=20>;  type="x";  rel="prev"\')).toEqual({ prev: "https://a.dev/i?page=1&per_page=20" });\n  });\n  it("returns an empty object without a header", () => {\n    expect(parseLink(null)).toEqual({});\n    expect(parseLink("")).toEqual({});\n  });\n});\n\ndescribe("fetchAll", () => {\n  it("follows next links and concatenates pages", async () => {\n    const fetcher = server({\n      "/i?p=1": { items: [1, 2], link: \'</i?p=2>; rel="next"\' },\n      "/i?p=2": { items: [3], link: \'</i?p=3>; rel="next", </i?p=1>; rel="first"\' },\n      "/i?p=3": { items: [4, 5], link: \'</i?p=1>; rel="first"\' },\n    });\n    expect(await fetchAll("/i?p=1", fetcher)).toEqual([1, 2, 3, 4, 5]);\n    expect(fetcher).toHaveBeenCalledTimes(3);\n  });\n  it("works for a single page", async () => {\n    expect(await fetchAll("/i?p=1", server({ "/i?p=1": { items: [7] } }))).toEqual([7]);\n  });\n  it("throws with the status for failed pages", async () => {\n    const fetcher = server({ "/i?p=1": { items: [1], link: \'</i?p=2>; rel="next"\' }, "/i?p=2": { status: 500 } });\n    await expect(fetchAll("/i?p=1", fetcher)).rejects.toThrow("500");\n  });\n  it("stops after 50 pages", async () => {\n    const fetcher = server({ "/loop": { items: [1], link: \'</loop>; rel="next"\' } });\n    const items = await fetchAll("/loop", fetcher);\n    expect(items).toHaveLength(50);\n  });\n});\n',
    solution: {
      "/src/paginate.ts":
        "export type PageResponse = {\n  ok: boolean;\n  status: number;\n  headers: { get(name: string): string | null };\n  json(): Promise<unknown>;\n};\nexport type Fetcher = (url: string) => Promise<PageResponse>;\n\nconst MAX_PAGES = 50;\n\nexport function parseLink(header: string | null): Record<string, string> {\n  const links: Record<string, string> = {};\n  if (!header) return links;\n  for (const part of header.split(\",\")) {\n    const url = /<([^>]*)>/.exec(part)?.[1];\n    const rel = /rel=\"?([^\";]+)\"?/.exec(part)?.[1];\n    if (url && rel) for (const name of rel.trim().split(/\\s+/)) links[name] = url;\n  }\n  return links;\n}\n\nexport async function fetchAll<T>(url: string, fetcher: Fetcher): Promise<T[]> {\n  const items: T[] = [];\n  let next: string | undefined = url;\n  for (let page = 0; next && page < MAX_PAGES; page++) {\n    const response = await fetcher(next);\n    if (!response.ok) throw new Error(\"HTTP \" + response.status + \" for \" + next);\n    items.push(...((await response.json()) as T[]));\n    next = parseLink(response.headers.get(\"link\")).next;\n  }\n  return items;\n}\n",
    },
    explanation: [
      "Split the header into comma-separated links, then pull the URL out of `<...>` and the `rel` value from its parameter (a `rel` can list several space-separated names). `fetchAll` is a loop, not recursion: request, check `ok`, append, then read the next URL from the response. The page cap protects against a server that links a page to itself. Splitting on commas is fine for typical APIs; a URL that contains a comma needs a real parser.",
      "Розбийте заголовок на посилання, розділені комами, потім витягніть URL з `<...>` і значення `rel` з його параметра (`rel` може містити кілька імен через пробіл). `fetchAll` — цикл, а не рекурсія: запит, перевірка `ok`, додавання, потім читання наступного URL з відповіді. Обмеження кількості сторінок захищає від сервера, що посилається сторінкою на саму себе. Розбиття за комами підходить для типових API; URL із комою потребує справжнього парсера.",
    ],
  }),
]);
