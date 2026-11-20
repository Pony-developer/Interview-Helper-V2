import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const CLIENT_TYPES = String.raw`export type ApiResponse = { status: number; body?: unknown };
export type Fetcher = (url: string, init: { headers: Record<string, string> }) => Promise<ApiResponse>;
export type AuthClientOptions = {
  fetcher: Fetcher;
  /** Exchanges the refresh cookie for a new access token. Rejects if the session is over. */
  refresh: () => Promise<string>;
  initialToken: string;
  onLogout?: () => void;
};
`;

const CLIENT_STARTER =
  CLIENT_TYPES +
  String.raw`
export function createAuthClient(options: AuthClientOptions) {
  let token = options.initialToken;
  return {
    get token() {
      return token;
    },
    // TODO: on 401, refresh the token (once for all concurrent requests) and retry
    async request(url: string): Promise<ApiResponse> {
      return options.fetcher(url, { headers: { Authorization: "Bearer " + token } });
    },
  };
}
`;

const CLIENT_SOLUTION =
  CLIENT_TYPES +
  String.raw`
export function createAuthClient({ fetcher, refresh, initialToken, onLogout }: AuthClientOptions) {
  let token = initialToken;
  let refreshing: Promise<string> | null = null;

  const send = (url: string, t: string) => fetcher(url, { headers: { Authorization: "Bearer " + t } });

  /** Single flight: every caller during a refresh shares the same promise. */
  function refreshOnce(): Promise<string> {
    if (!refreshing) {
      refreshing = refresh()
        .then(
          (next) => {
            token = next;
            return next;
          },
          (error) => {
            onLogout?.();
            throw error;
          },
        )
        .finally(() => {
          refreshing = null;
        });
    }
    return refreshing;
  }

  return {
    get token() {
      return token;
    },
    async request(url: string): Promise<ApiResponse> {
      const used = token;
      const first = await send(url, used);
      if (first.status !== 401) return first;
      // If someone already refreshed while this request was in flight, just retry with the new token.
      const next = token !== used ? token : await refreshOnce();
      const second = await send(url, next);
      if (second.status === 401) {
        onLogout?.();
        throw new Error("Unauthorized");
      }
      return second;
    },
  };
}
`;

const CLIENT_INDEX = String.raw`import "./styles.css";
import { createAuthClient } from "./src/client";

let valid = "t1";
setTimeout(() => (valid = "expired"), 0); // the first token expires right away
let refreshes = 0;
const client = createAuthClient({
  initialToken: "t1",
  fetcher: async (url, { headers }) => {
    await new Promise((r) => setTimeout(r, 10));
    return headers.Authorization === "Bearer " + valid ? { status: 200, body: url } : { status: 401 };
  },
  refresh: async () => {
    refreshes++;
    await new Promise((r) => setTimeout(r, 20));
    valid = "t" + (refreshes + 1);
    return valid;
  },
});

Promise.allSettled(["/me", "/orders", "/settings"].map((u) => client.request(u))).then((results) => {
  document.getElementById("app")!.innerHTML =
    "<h1>Token refresh</h1><p>Statuses: " +
    results.map((r) => (r.status === "fulfilled" ? r.value.status : "error")).join(", ") +
    '</p><p>Refresh calls: <output id="refreshes">' + refreshes + "</output></p>";
});
`;

const CLIENT_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createAuthClient } from "../src/client";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A fake API that accepts only the tokens in validTokens; delays per URL in ms. */
function api(validTokens, delays = {}) {
  const seen = [];
  const fetcher = async (url, { headers }) => {
    seen.push(url + " " + headers.Authorization);
    await sleep(delays[url] ?? 1);
    if (url === "/boom") return { status: 500 };
    return validTokens.has(headers.Authorization.replace("Bearer ", "")) ? { status: 200, body: url } : { status: 401 };
  };
  return { fetcher, seen };
}

function counter(fn) {
  const f = async (...args) => { f.calls++; return fn(...args); };
  f.calls = 0;
  return f;
}

describe("createAuthClient", () => {
  it("sends the bearer token", async () => {
    const { fetcher, seen } = api(new Set(["t1"]));
    const client = createAuthClient({ fetcher, refresh: async () => "x", initialToken: "t1" });
    expect(await client.request("/me")).toEqual({ status: 200, body: "/me" });
    expect(seen).toEqual(["/me Bearer t1"]);
  });
  it("refreshes on 401 and retries once with the new token", async () => {
    const { fetcher, seen } = api(new Set(["t2"]));
    const refresh = counter(async () => "t2");
    const client = createAuthClient({ fetcher, refresh, initialToken: "t1" });
    expect((await client.request("/me")).status).toBe(200);
    expect(refresh.calls).toBe(1);
    expect(client.token).toBe("t2");
    expect(seen).toEqual(["/me Bearer t1", "/me Bearer t2"]);
  });
  it("shares one refresh between concurrent 401s", async () => {
    const { fetcher } = api(new Set(["t2"]));
    const refresh = counter(async () => { await sleep(10); return "t2"; });
    const client = createAuthClient({ fetcher, refresh, initialToken: "t1" });
    const results = await Promise.all(["/a", "/b", "/c"].map((u) => client.request(u)));
    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(refresh.calls).toBe(1);
  });
  it("doesn't refresh again for a slow request that used the old token", async () => {
    const { fetcher } = api(new Set(["t2"]), { "/slow": 40 });
    const refresh = counter(async () => { await sleep(5); return "t2"; });
    const client = createAuthClient({ fetcher, refresh, initialToken: "t1" });
    const results = await Promise.all([client.request("/fast"), client.request("/slow")]);
    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(refresh.calls).toBe(1);
  });
  it("rejects every waiting request and logs out once when the refresh fails", async () => {
    const { fetcher } = api(new Set());
    let logouts = 0;
    const refresh = counter(async () => { await sleep(5); throw new Error("session expired"); });
    const client = createAuthClient({ fetcher, refresh, initialToken: "t1", onLogout: () => logouts++ });
    const settled = await Promise.allSettled([client.request("/a"), client.request("/b")]);
    expect(settled.map((s) => s.status)).toEqual(["rejected", "rejected"]);
    expect(settled[0].reason.message).toBe("session expired");
    expect(refresh.calls).toBe(1);
    expect(logouts).toBe(1);
  });
  it("gives up after one retry instead of looping", async () => {
    const { fetcher } = api(new Set());
    let logouts = 0;
    const refresh = counter(async () => "t2");
    const client = createAuthClient({ fetcher, refresh, initialToken: "t1", onLogout: () => logouts++ });
    await expect(client.request("/me")).rejects.toThrow("Unauthorized");
    expect(refresh.calls).toBe(1);
    expect(logouts).toBe(1);
  });
  it("passes other errors through without refreshing", async () => {
    const { fetcher } = api(new Set(["t1"]));
    const refresh = counter(async () => "t2");
    const client = createAuthClient({ fetcher, refresh, initialToken: "t1" });
    expect((await client.request("/boom")).status).toBe(500);
    expect(refresh.calls).toBe(0);
  });
});
`;

export default defineTasks([
  quiz(
    "auth-authn-vs-authz",
    ["auth"],
    1,
    45,
    ["Authentication vs authorisation", "Автентифікація проти авторизації"],
    ["A logged-in user opens `/admin/users` and the server responds `403 Forbidden`. Which step denied them?", "Користувач, що увійшов, відкриває `/admin/users`, а сервер відповідає `403 Forbidden`. Який крок йому відмовив?"],
    [
      ["Authorisation: the server knows who they are but they lack permission", "Авторизація: сервер знає, хто це, але бракує дозволу"],
      ["Authentication: the password was wrong", "Автентифікація: пароль був неправильний"],
      ["Encryption: TLS failed", "Шифрування: TLS не спрацював"],
      ["Validation: the URL was malformed", "Валідація: URL некоректний"],
    ],
    "a",
    [
      "Authentication establishes identity (\"who are you?\"); failures there are `401 Unauthorized`. Authorisation decides what an identified user may do; failures there are `403 Forbidden`. Both must be enforced on the server; the UI hiding an admin link is only a convenience.",
      "Автентифікація встановлює особу («хто ви?»); невдачі там дають `401 Unauthorized`. Авторизація вирішує, що може робити встановлений користувач; невдачі там дають `403 Forbidden`. Обидві треба забезпечувати на сервері; приховане в інтерфейсі посилання на адмінку є лише зручністю.",
    ],
  ),
  quiz(
    "auth-jwt-readable",
    ["auth", w("web-security")],
    2,
    90,
    ["What's inside a JWT", "Що всередині JWT"],
    ["A team puts `{ \"sub\": \"42\", \"role\": \"user\", \"ssn\": \"123-45-6789\" }` into a signed JWT because \"it's signed, so it's secure\". What's wrong?", "Команда кладе `{ \"sub\": \"42\", \"role\": \"user\", \"ssn\": \"123-45-6789\" }` у підписаний JWT, бо «він підписаний, отже безпечний». Що не так?"],
    [
      ["A signature prevents tampering, not reading: the payload is just base64url and anyone holding the token can decode it", "Підпис запобігає підробці, а не читанню: вміст є лише base64url, і будь-хто з токеном може його декодувати"],
      ["JWTs can't contain numbers", "JWT не можуть містити числа"],
      ["Signed JWTs are encrypted with the server key, so it's fine", "Підписані JWT зашифровані ключем сервера, тож усе гаразд"],
      ["The `sub` claim must be an email", "Твердження `sub` має бути email"],
    ],
    "a",
    [
      "A JWS-signed token proves the issuer created it and nobody changed it, but its header and payload are plain base64url-encoded JSON. Never put secrets or personal data in it. Keep claims minimal (an ID, roles, expiry), and validate signature, algorithm, `exp`, `iss` and `aud` on every request.",
      "Підписаний (JWS) токен доводить, що його створив видавець і ніхто не змінив, але заголовок і вміст є звичайним JSON у base64url. Ніколи не кладіть туди секрети чи особисті дані. Тримайте твердження мінімальними (ID, ролі, термін дії) й перевіряйте підпис, алгоритм, `exp`, `iss` і `aud` при кожному запиті.",
    ],
  ),
  quiz(
    "auth-token-storage",
    ["auth", w("web-security")],
    3,
    120,
    ["Where to store tokens", "Де зберігати токени"],
    ["An SPA stores a 30-day refresh token in `localStorage`. What's the main risk, and what's a better setup?", "SPA зберігає refresh-токен на 30 днів у `localStorage`. Який головний ризик і яке налаштування краще?"],
    [
      ["Any XSS can read and exfiltrate it for a month; keep refresh tokens in `HttpOnly; Secure; SameSite` cookies and short-lived access tokens in memory", "Будь-яка XSS може прочитати й викрасти його на місяць; тримайте refresh-токени в cookie `HttpOnly; Secure; SameSite`, а короткоживучі access-токени в пам'яті"],
      ["`localStorage` is cleared on every page load", "`localStorage` очищається при кожному завантаженні сторінки"],
      ["Other websites can read `localStorage`", "Інші сайти можуть читати `localStorage`"],
      ["There's no risk as long as the site uses HTTPS", "Ризику немає, якщо сайт використовує HTTPS"],
    ],
    "a",
    [
      "`localStorage` is per-origin (other sites can't read it) and persistent, but every script on your page can read it, so one XSS bug or compromised dependency steals a long-lived credential. An `HttpOnly` cookie can't be read by scripts, and an in-memory access token expires quickly. You still need XSS prevention and CSRF protection.",
      "`localStorage` прив'язаний до origin (інші сайти його не читають) і постійний, але кожен скрипт на вашій сторінці може його прочитати, тож одна XSS-вразливість чи зламана залежність краде довгоживучі облікові дані. Cookie з `HttpOnly` скрипти не читають, а access-токен у пам'яті швидко спливає. Захист від XSS і CSRF усе одно потрібен.",
    ],
  ),
  quiz(
    "auth-pkce",
    ["auth", w("http-rest")],
    3,
    120,
    ["Why PKCE", "Навіщо PKCE"],
    ["In the OAuth authorisation-code flow for a browser app, what does PKCE (`code_verifier` / `code_challenge`) protect against?", "Від чого в потоці OAuth authorization code для браузерного застосунку захищає PKCE (`code_verifier` / `code_challenge`)?"],
    [
      ["An attacker who intercepts the authorisation code can't exchange it, because they don't have the original `code_verifier`", "Зловмисник, що перехопив код авторизації, не може обміняти його, бо не має початкового `code_verifier`"],
      ["Brute-forcing the user's password", "Перебору пароля користувача"],
      ["XSS on the identity provider's login page", "XSS на сторінці входу постачальника ідентичності"],
      ["Token expiry", "Закінчення терміну дії токена"],
    ],
    "a",
    [
      "Public clients (SPAs, mobile apps) can't keep a client secret. PKCE binds the code to the app instance: it sends a hash of a random verifier when starting the flow and must present the verifier itself when redeeming the code. The separate `state` parameter protects against CSRF on the redirect. The old implicit flow is deprecated in favour of this.",
      "Публічні клієнти (SPA, мобільні застосунки) не можуть тримати клієнтський секрет. PKCE прив'язує код до екземпляра застосунку: на початку потоку той надсилає хеш випадкового верифікатора й мусить пред'явити сам верифікатор під час обміну коду. Окремий параметр `state` захищає від CSRF на перенаправленні. Старий implicit flow застарів на користь цього.",
    ],
  ),
  quiz(
    "auth-idor",
    ["auth", w("web-security")],
    4,
    120,
    ["Changing the ID in the URL", "Зміна ID в URL"],
    ["A logged-in user changes `/api/invoices/1041` to `/api/invoices/1042` and sees another customer's invoice. What's the vulnerability and fix?", "Користувач, що увійшов, змінює `/api/invoices/1041` на `/api/invoices/1042` і бачить рахунок іншого клієнта. Яка це вразливість і як виправити?"],
    [
      ["Insecure direct object reference (IDOR): check on the server that the invoice belongs to the current user (or their organisation) for every request", "Insecure direct object reference (IDOR): перевіряти на сервері при кожному запиті, що рахунок належить поточному користувачу (чи його організації)"],
      ["XSS: escape the invoice number", "XSS: екранувати номер рахунку"],
      ["Use random UUIDs instead of numbers and nothing else", "Використати випадкові UUID замість чисел, і нічого більше"],
      ["Hide the invoice ID from the URL with POST requests", "Сховати ID рахунку з URL за допомогою POST-запитів"],
    ],
    "a",
    [
      "Being authenticated isn't the same as being allowed to see this object. Every lookup must be scoped to the caller (`WHERE id = $1 AND customer_id = $2`, or row-level security). Unguessable IDs make enumeration harder but aren't authorisation, since IDs leak through links, logs and shared screens.",
      "Бути автентифікованим не означає мати право бачити цей об'єкт. Кожен пошук треба обмежувати викликачем (`WHERE id = $1 AND customer_id = $2` або row-level security). Невгадувані ID ускладнюють перебір, але не є авторизацією, бо ID витікають через посилання, журнали й спільні екрани.",
    ],
  ),
  quiz(
    "auth-refresh-rotation",
    ["auth"],
    4,
    150,
    ["Refresh token rotation", "Ротація refresh-токенів"],
    ["The server issues a new refresh token on every refresh and invalidates the old one. One day an **already used** refresh token is presented. What should happen?", "Сервер видає новий refresh-токен при кожному оновленні й анулює старий. Одного дня пред'являють **уже використаний** refresh-токен. Що має статися?"],
    [
      ["Treat it as likely theft: revoke the whole token family (session) so both the attacker and the user must log in again", "Вважати це ймовірною крадіжкою: відкликати всю «родину» токенів (сесію), щоб і зловмисник, і користувач мусили увійти знову"],
      ["Accept it, since it was valid before", "Прийняти його, бо раніше він був дійсним"],
      ["Issue a new token without logging anything", "Видати новий токен, нічого не записуючи"],
      ["Extend its lifetime", "Подовжити термін його дії"],
    ],
    "a",
    [
      "With rotation, each refresh token should be used exactly once. Reuse means two parties hold the same token: a copy was stolen. Since the server can't tell which party is legitimate, revoking the session family limits the damage. Rotation plus reuse detection is the recommended practice for refresh tokens held by browsers.",
      "З ротацією кожен refresh-токен має використовуватися рівно один раз. Повторне використання означає, що той самий токен мають дві сторони: копію викрали. Оскільки сервер не знає, хто законний, відкликання всієї родини сесії обмежує шкоду. Ротація з виявленням повторного використання є рекомендованою практикою для refresh-токенів у браузерах.",
    ],
  ),
  practice({
    slug: "auth-refresh-client",
    skills: ["auth", w("async-javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Single-flight token refresh", "Одноразове оновлення токена"],
    prompt: [
      "Access tokens expire after a few minutes. Implement `createAuthClient(options)` in `src/client.ts`, whose `request(url)` hides that from the app:\n\n- Send `Authorization: Bearer <token>` with every request; return non-401 responses as they are.\n- On `401`, call `options.refresh()` to get a new token and **retry once** with it.\n- **Single flight**: if several requests get a 401 at the same time, they share **one** refresh call.\n- If a request comes back 401 but the token was **already refreshed** while it was in flight, retry with the current token without refreshing again.\n- If `refresh()` rejects, every waiting request rejects with that error and `onLogout` is called once. If the retry is also 401, call `onLogout` and throw `Error(\"Unauthorized\")`: never loop.",
      "Access-токени спливають за кілька хвилин. Реалізуйте `createAuthClient(options)` у `src/client.ts`, чий `request(url)` приховує це від застосунку:\n\n- Надсилайте `Authorization: Bearer <token>` з кожним запитом; відповіді, що не є 401, повертайте як є.\n- На `401` викликайте `options.refresh()`, щоб отримати новий токен, і **повторіть один раз** із ним.\n- **Одноразовість (single flight)**: якщо кілька запитів одночасно отримали 401, вони ділять **один** виклик оновлення.\n- Якщо запит повернув 401, але токен **уже оновили**, поки запит був у дорозі, повторіть із поточним токеном без нового оновлення.\n- Якщо `refresh()` відхиляється, кожен запит, що чекає, відхиляється з цією помилкою, а `onLogout` викликається один раз. Якщо повтор теж дає 401, викличте `onLogout` і киньте `Error(\"Unauthorized\")`: жодних циклів.",
    ],
    files: { "/src/client.ts": CLIENT_STARTER, "/index.ts": CLIENT_INDEX },
    visibleFiles: ["/src/client.ts", "/index.ts"],
    activeFile: "/src/client.ts",
    tests: CLIENT_TESTS,
    solution: { "/src/client.ts": CLIENT_SOLUTION },
    explanation: [
      "Storing the in-flight refresh promise makes concurrent callers await the same refresh instead of starting their own (which, with rotating refresh tokens, would invalidate each other). Remembering which token each request used lets late 401s simply retry with the newer token. Clearing the promise in `finally` allows a future refresh, and capping retries at one prevents infinite loops when the session is truly over.",
      "Збереження промісу поточного оновлення змушує одночасних викликачів чекати на те саме оновлення, а не запускати власні (що з ротацією refresh-токенів анулювало б одне одного). Запам'ятовування токена, з яким пішов кожен запит, дає пізнім 401 просто повторити з новішим токеном. Очищення промісу у `finally` дозволяє майбутнє оновлення, а обмеження одним повтором запобігає нескінченним циклам, коли сесія справді завершилася.",
    ],
  }),
]);
