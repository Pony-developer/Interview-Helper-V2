import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code below contains template literals, which can't live inside String.raw: "~" stands for a backtick and "#{" for "${". */
const js = (source: string) => source.replace(/~/g, "`").replace(/#\{/g, "${");

const LINKS_STARTER = String.raw`/**
 * Returns the URL if it is safe to use as a link (http:, https:, mailto: or relative),
 * otherwise "about:blank".
 */
export function sanitizeUrl(input: string): string {
  // TODO
  return input.startsWith("javascript:") ? "about:blank" : input;
}

/** Builds <a> for a user-supplied label and URL that opens in a new tab. */
export function renderLink(label: string, href: string): HTMLAnchorElement {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = '<a href="' + sanitizeUrl(href) + '" target="_blank">' + label + "</a>";
  return wrapper.firstElementChild as HTMLAnchorElement;
}
`;

const LINKS_SOLUTION = String.raw`const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function sanitizeUrl(input: string): string {
  const trimmed = input.trim();
  try {
    // Let the URL parser decide the scheme, exactly as the browser will: it ignores case,
    // strips tabs/newlines and leading control characters. Relative URLs resolve against a dummy base.
    const url = new URL(trimmed, "https://app.invalid");
    return ALLOWED_PROTOCOLS.has(url.protocol) ? trimmed : "about:blank";
  } catch {
    return "about:blank";
  }
}

export function renderLink(label: string, href: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.textContent = label; // text, never HTML
  a.setAttribute("href", sanitizeUrl(href)); // an attribute value can't break out into markup
  a.setAttribute("target", "_blank");
  a.setAttribute("rel", "noopener noreferrer");
  return a;
}
`;

const LINKS_INDEX = String.raw`import "./styles.css";
import { renderLink } from "./src/links";

const profiles = [
  { name: "Ada", website: "https://ada.example" },
  { name: "<b>Mallory</b>", website: "javascript:alert(document.cookie)" },
  { name: "Bob", website: "/users/bob" },
];

const app = document.getElementById("app")!;
app.innerHTML = "<h1>Member links</h1>";
const list = document.createElement("ul");
for (const p of profiles) {
  const li = document.createElement("li");
  li.append(renderLink(p.name, p.website));
  list.append(li);
}
app.append(list);
`;

const LINKS_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { renderLink, sanitizeUrl } from "../src/links";

describe("sanitizeUrl", () => {
  it("keeps http, https, mailto and relative links", () => {
    expect(sanitizeUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(sanitizeUrl("  http://example.com  ")).toBe("http://example.com");
    expect(sanitizeUrl("mailto:team@example.com")).toBe("mailto:team@example.com");
    expect(sanitizeUrl("/settings#profile")).toBe("/settings#profile");
  });
  it("blocks script URLs in any spelling", () => {
    for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", " \n javascript:alert(1)", "java\tscript:alert(1)", "vbscript:msgbox(1)"]) {
      expect(sanitizeUrl(bad)).toBe("about:blank");
    }
  });
  it("blocks data URLs and unparsable input", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("about:blank");
    expect(sanitizeUrl("http://[oops")).toBe("about:blank");
  });
});

describe("renderLink", () => {
  it("renders the label as text, not HTML", () => {
    const a = renderLink("<b>Ada</b>", "https://ada.dev");
    expect(a.querySelector("b")).toBe(null);
    expect(a.textContent).toBe("<b>Ada</b>");
  });
  it("can't be broken out of the href attribute", () => {
    const a = renderLink("site", 'https://x.dev" onclick="alert(1)');
    expect(a.hasAttribute("onclick")).toBe(false);
  });
  it("uses the sanitised href and safe new-tab attributes", () => {
    const a = renderLink("click", "JavaScript:alert(1)");
    expect(a.getAttribute("href")).toBe("about:blank");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
`;

const HTML_STARTER = js(String.raw`/** Escapes text for use in HTML content and quoted attribute values. */
export function escapeHtml(value: unknown): string {
  // TODO
  return String(value);
}

/** Markup that is already safe (produced by the html tag). */
export class SafeHtml {
  constructor(private readonly value: string) {}
  toString() {
    return this.value;
  }
}

/**
 * Tagged template: html~<p>#{userInput}</p>~
 * Interpolated values are escaped, except SafeHtml (from nested html~~ calls).
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
  // TODO: escape values; support arrays, nested SafeHtml, and skip null/undefined/false
  let out = strings[0];
  values.forEach((value, i) => {
    out += String(value) + strings[i + 1];
  });
  return new SafeHtml(out);
}
`);

const HTML_SOLUTION = js(String.raw`const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

export class SafeHtml {
  constructor(private readonly value: string) {}
  toString() {
    return this.value;
  }
}

function render(value: unknown): string {
  if (value === null || value === undefined || value === false) return "";
  // Only real SafeHtml instances are trusted; an object with a toString() is not.
  if (value instanceof SafeHtml) return value.toString();
  if (Array.isArray(value)) return value.map(render).join("");
  return escapeHtml(value);
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
  let out = strings[0];
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1];
  });
  return new SafeHtml(out);
}
`);

const HTML_INDEX = js(String.raw`import "./styles.css";
import { html } from "./src/html";

const comments = [
  { author: "Ada", text: "Great article!" },
  { author: "Mallory", text: '<img src=x onerror="document.title=1">' },
  { author: 'Eve" onmouseover="alert(1)', text: "Hi" },
];

const page = html~
  <h1>Comments</h1>
  <ul>
    #{comments.map((c) => html~<li title="#{c.author}"><strong>#{c.author}</strong>: #{c.text}</li>~)}
  </ul>
~;
document.getElementById("app")!.innerHTML = page.toString();
`);

const HTML_TESTS = js(String.raw`import { describe, it, expect, screen } from "./test-kit";
import { SafeHtml, escapeHtml, html } from "../src/html";

describe("escapeHtml", () => {
  it("escapes the five special characters", () => {
    expect(escapeHtml(~<a href="x">Tom & 'Jerry'</a>~)).toBe("&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;");
  });
  it("converts non-strings", () => {
    expect(escapeHtml(42)).toBe("42");
  });
});

describe("html", () => {
  it("escapes interpolated text", () => {
    expect(html~<p>#{"<script>alert(1)</script>"}</p>~.toString()).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  });
  it("escapes quotes in attribute values", () => {
    const evil = '" onmouseover="alert(1)';
    expect(html~<a title="#{evil}">x</a>~.toString()).toBe('<a title="&quot; onmouseover=&quot;alert(1)">x</a>');
  });
  it("doesn't double-escape nested html and joins arrays", () => {
    const items = ["a&b", "<c>"];
    const out = html~<ul>#{items.map((i) => html~<li>#{i}</li>~)}</ul>~;
    expect(out instanceof SafeHtml).toBe(true);
    expect(out.toString()).toBe("<ul><li>a&amp;b</li><li>&lt;c&gt;</li></ul>");
  });
  it("renders nothing for null, undefined and false, but keeps 0", () => {
    expect(html~#{null}#{undefined}#{false}#{0}~.toString()).toBe("0");
  });
  it("doesn't trust lookalike objects", () => {
    const fake = { toString: () => "<b>x</b>" };
    expect(html~#{fake}~.toString()).toBe("&lt;b&gt;x&lt;/b&gt;");
  });
  it("renders the demo without injected elements", async () => {
    expect(await screen.findByText("Comments")).toBeDefined();
    expect(document.querySelector("#app img")).toBe(null);
    expect(document.querySelector("[onmouseover]")).toBe(null);
  });
});
`);

export default defineTasks([
  quiz(
    "sec-xss-what",
    ["web-security"],
    1,
    45,
    ["What XSS is", "Що таке XSS"],
    ["What is cross-site scripting (XSS)?", "Що таке міжсайтовий скриптинг (XSS)?"],
    [
      ["Attacker-controlled script running in your site's origin, with access to its DOM, storage and the user's session", "Скрипт зловмисника, що виконується у джерелі вашого сайту з доступом до DOM, сховища й сесії користувача"],
      ["Loading a script from another domain with a `<script src>` tag", "Завантаження скрипта з іншого домену тегом `<script src>`"],
      ["A request from one site to another that the server rejects", "Запит з одного сайту на інший, який сервер відхиляє"],
      ["Sharing CSS between sites", "Спільний CSS для кількох сайтів"],
    ],
    "a",
    [
      "XSS happens when untrusted input ends up executed as code in your page: stored in a database, reflected from a URL, or written into a DOM sink by your own JavaScript. Because it runs in your origin, the same-origin policy doesn't protect you; the attacker can do anything the user can.",
      "XSS стається, коли неперевірені дані зрештою виконуються як код на вашій сторінці: збережені в базі, відбиті з URL або записані у DOM-сток вашим же JavaScript. Оскільки він виконується у вашому джерелі, політика одного джерела не захищає; зловмисник може все, що може користувач.",
    ],
  ),
  quiz(
    "sec-react-href",
    ["web-security", w("react")],
    2,
    90,
    ["Is React escaping enough?", "Чи достатньо екранування React?"],
    ["Users can set a profile website. Is this component safe from XSS?", "Користувачі можуть вказати сайт у профілі. Чи безпечний цей компонент щодо XSS?"],
    [
      ["No: React escapes text, but a `javascript:` URL in `href` runs when clicked; allow only `http(s):` (and `mailto:`) URLs", "Ні: React екранує текст, але URL `javascript:` у `href` виконається при кліку; дозволяйте лише `http(s):` (і `mailto:`)"],
      ["Yes: React escapes every prop automatically", "Так: React автоматично екранує всі пропси"],
      ["No: `user.name` must be wrapped in `dangerouslySetInnerHTML`", "Ні: `user.name` треба обгорнути в `dangerouslySetInnerHTML`"],
      ["Yes, as long as the site uses HTTPS", "Так, якщо сайт працює через HTTPS"],
    ],
    "a",
    [
      "JSX escapes text and attribute values so they can't become markup, but an attribute that *is* a URL can still carry the `javascript:` scheme. React only logs a warning about it. Validate the protocol (parse with `new URL` and allow-list schemes) before rendering user-supplied links.",
      "JSX екранує текст і значення атрибутів, щоб вони не стали розміткою, але атрибут, який *є* URL, усе одно може містити схему `javascript:`. React лише виводить про це попередження. Перевіряйте протокол (розберіть через `new URL` і використайте білий список схем) перед рендером посилань від користувачів.",
    ],
    { code: "function Profile({ user }) {\n  return <a href={user.website}>{user.name}</a>;\n}", codeLanguage: "tsx" },
  ),
  quiz(
    "sec-samesite",
    ["web-security", w("http-rest")],
    2,
    60,
    ["The anti-CSRF cookie flag", "Прапорець cookie проти CSRF"],
    ["Which cookie attribute stops the browser from sending the session cookie on cross-site POST requests?", "Який атрибут cookie не дає браузеру надсилати сесійний cookie в міжсайтових POST-запитах?"],
    [
      ["`SameSite=Lax` (or `Strict`)", "`SameSite=Lax` (або `Strict`)"],
      ["`HttpOnly`", "`HttpOnly`"],
      ["`Secure`", "`Secure`"],
      ["`Max-Age=0`", "`Max-Age=0`"],
    ],
    "a",
    [
      "CSRF works because the browser attaches cookies to requests another site triggers. `SameSite=Lax` withholds the cookie on cross-site subrequests and POSTs (it's the default in modern browsers), and `Strict` also on cross-site navigations. `HttpOnly` hides the cookie from JavaScript and `Secure` limits it to HTTPS; neither affects cross-site sending.",
      "CSRF працює, бо браузер додає cookie до запитів, які ініціює інший сайт. `SameSite=Lax` не надсилає cookie в міжсайтових підзапитах і POST (це типове значення в сучасних браузерах), а `Strict` ще й при міжсайтових переходах. `HttpOnly` ховає cookie від JavaScript, а `Secure` обмежує його HTTPS; жоден не впливає на міжсайтове надсилання.",
    ],
  ),
  quiz(
    "sec-httponly-limits",
    ["web-security", w("browser-apis")],
    3,
    90,
    ["What `HttpOnly` protects", "Від чого захищає `HttpOnly`"],
    ["The session cookie is `HttpOnly`. An attacker finds an XSS bug. What can their script still do?", "Сесійний cookie має `HttpOnly`. Зловмисник знайшов XSS. Що його скрипт усе ще може зробити?"],
    [
      ["Send authenticated requests from the page as the user, though it can't read the cookie value itself", "Надсилати автентифіковані запити зі сторінки від імені користувача, хоча саме значення cookie прочитати не може"],
      ["Nothing: `HttpOnly` blocks all requests from injected scripts", "Нічого: `HttpOnly` блокує всі запити з вставлених скриптів"],
      ["Read the cookie through `document.cookie`", "Прочитати cookie через `document.cookie`"],
      ["Only read `localStorage`, not make requests", "Лише читати `localStorage`, але не робити запитів"],
    ],
    "a",
    [
      "`HttpOnly` stops scripts from reading the cookie, so it can't be exfiltrated and reused elsewhere. But `fetch` from the page still attaches it automatically, so the injected script can act as the user for as long as it runs. That's why preventing XSS (escaping, CSP) matters more than where the token lives.",
      "`HttpOnly` не дає скриптам читати cookie, тож його не можна викрасти й використати деінде. Але `fetch` зі сторінки все одно автоматично його додає, тож вставлений скрипт може діяти від імені користувача, поки виконується. Тому запобігання XSS (екранування, CSP) важливіше за місце зберігання токена.",
    ],
  ),
  quiz(
    "sec-csp-inline",
    ["web-security", w("http-rest")],
    3,
    120,
    ["Choosing a CSP", "Вибір CSP"],
    [
      "Your app loads all of its JavaScript from its own origin. Which `Content-Security-Policy` blocks an injected `<script>alert(1)</script>` and `<img onerror=…>` while still allowing your bundle?",
      "Ваш застосунок завантажує весь JavaScript зі свого джерела. Яка `Content-Security-Policy` заблокує вставлені `<script>alert(1)</script>` і `<img onerror=…>`, але дозволить ваш бандл?",
    ],
    [
      ["`script-src 'self'`", "`script-src 'self'`"],
      ["`script-src 'self' 'unsafe-inline'`", "`script-src 'self' 'unsafe-inline'`"],
      ["`default-src *`", "`default-src *`"],
      ["`img-src 'none'`", "`img-src 'none'`"],
    ],
    "a",
    [
      "Without `'unsafe-inline'`, CSP refuses inline `<script>` blocks and inline event-handler attributes, which is what most injected payloads use, while `'self'` still allows scripts from your origin. Adding `'unsafe-inline'` throws that protection away; use nonces or hashes for the few inline scripts you really need.",
      "Без `'unsafe-inline'` CSP відмовляється виконувати вбудовані блоки `<script>` і атрибути-обробники подій, а саме їх використовує більшість вставлених атак, тоді як `'self'` дозволяє скрипти з вашого джерела. Додавання `'unsafe-inline'` зводить цей захист нанівець; для кількох справді потрібних вбудованих скриптів використовуйте nonce або хеші.",
    ],
  ),
  quiz(
    "sec-cors-not-csrf",
    ["web-security", w("http-rest")],
    4,
    120,
    ["Does CORS stop this?", "Чи зупинить це CORS?"],
    [
      "Your API uses cookie sessions and sends **no** CORS headers. A malicious site auto-submits `<form method=\"POST\" action=\"https://api.example/transfer\">`. What happens?",
      "Ваш API використовує сесії в cookie і **не** надсилає жодних заголовків CORS. Шкідливий сайт автоматично відправляє `<form method=\"POST\" action=\"https://api.example/transfer\">`. Що станеться?",
    ],
    [
      ["The request is sent with the cookies (unless `SameSite` blocks them) and the server executes it; CORS only stops the attacker reading the response", "Запит надсилається з cookie (якщо їх не блокує `SameSite`), і сервер його виконує; CORS лише не дає зловмиснику прочитати відповідь"],
      ["The browser blocks the request because there are no CORS headers", "Браузер блокує запит, бо немає заголовків CORS"],
      ["The browser sends a preflight `OPTIONS` request, which fails, so nothing happens", "Браузер надсилає preflight-запит `OPTIONS`, який не вдається, тож нічого не відбувається"],
      ["The cookies are stripped because the form is on another origin", "Cookie прибираються, бо форма на іншому джерелі"],
    ],
    "a",
    [
      "A form POST is a \"simple\" request: no preflight, and it has always been allowed cross-site. The same-origin policy and CORS govern whether the *page* can read the response, not whether the request reaches the server. Defend state-changing endpoints with `SameSite` cookies, CSRF tokens, or by requiring a custom header or JSON content type, which forces a preflight.",
      "POST із форми є «простим» запитом: без preflight, і міжсайтово він дозволений завжди. Політика одного джерела й CORS визначають, чи може *сторінка* прочитати відповідь, а не чи дійде запит до сервера. Захищайте ендпоінти, що змінюють стан, cookie з `SameSite`, CSRF-токенами або вимогою власного заголовка чи JSON content type, що змушує робити preflight.",
    ],
  ),
  quiz(
    "sec-open-redirect",
    ["web-security", w("browser-apis")],
    4,
    150,
    ["Validating `?next=`", "Перевірка `?next=`"],
    ["After login the app redirects to `?next=`. Which check reliably allows only same-origin destinations?", "Після входу застосунок перенаправляє на `?next=`. Яка перевірка надійно дозволяє лише адреси того самого джерела?"],
    [
      ["`new URL(next, location.origin).origin === location.origin`", "`new URL(next, location.origin).origin === location.origin`"],
      ["`next.startsWith(\"/\")`", "`next.startsWith(\"/\")`"],
      ["`!next.includes(\"http\")`", "`!next.includes(\"http\")`"],
      ["`next.includes(location.hostname)`", "`next.includes(location.hostname)`"],
    ],
    "a",
    [
      "String checks miss the parser's tricks: `//evil.example` and `/\\evil.example` start with `/` but are protocol-relative URLs to another host; `https://evil.example/?x=app.example` contains your hostname. Resolving with the URL parser against your origin and comparing origins asks the same question the browser will. Then redirect to the parsed path, not the raw string.",
      "Рядкові перевірки не враховують трюків парсера: `//evil.example` і `/\\evil.example` починаються з `/`, але є протокол-відносними URL на інший хост; `https://evil.example/?x=app.example` містить ваше ім'я хоста. Розбір через URL-парсер відносно вашого джерела й порівняння origin ставить те саме питання, що й браузер. Далі перенаправляйте на розібраний шлях, а не на сирий рядок.",
    ],
  ),
  quiz(
    "sec-dom-sinks",
    ["web-security", w("dom-events")],
    5,
    150,
    ["Spot the XSS sinks", "Знайдіть XSS-стоки"],
    ["`input` comes straight from the URL. Which lines can execute attacker code? (Select all that apply.)", "`input` береться прямо з URL. Які рядки можуть виконати код зловмисника? (Оберіть усі.)"],
    [
      ["`el.innerHTML = input`", "`el.innerHTML = input`"],
      ["`el.textContent = input`", "`el.textContent = input`"],
      ["`location.href = input`", "`location.href = input`"],
      ["`el.setAttribute(\"title\", input)`", "`el.setAttribute(\"title\", input)`"],
      ["`el.insertAdjacentHTML(\"beforeend\", input)`", "`el.insertAdjacentHTML(\"beforeend\", input)`"],
    ],
    "ace",
    [
      "`innerHTML` and `insertAdjacentHTML` parse markup, so `<img src=x onerror=…>` runs. Assigning `location.href` executes a `javascript:` URL. `textContent` always inserts text, and setting a non-event, non-URL attribute like `title` with `setAttribute` stores a plain string. (Event attributes like `onclick`, and URL attributes like `href` or `src`, would be sinks.)",
      "`innerHTML` і `insertAdjacentHTML` розбирають розмітку, тож `<img src=x onerror=…>` виконається. Присвоєння `location.href` виконує URL `javascript:`. `textContent` завжди вставляє текст, а встановлення через `setAttribute` атрибута, що не є подією чи URL, як-от `title`, зберігає звичайний рядок. (Атрибути подій на кшталт `onclick` і URL-атрибути як `href` чи `src` були б стоками.)",
    ],
  ),
  practice({
    slug: "sec-safe-links",
    skills: ["web-security", w("dom-events"), w("typescript")],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Safe user-supplied links", "Безпечні посилання від користувачів"],
    prompt: [
      "Users can add a website to their profile. Make `src/links.ts` safe:\n\n**`sanitizeUrl(input)`** returns the trimmed input if it's an `http:`, `https:` or `mailto:` URL, or a relative URL. Anything else returns `\"about:blank\"`, including `javascript:` in any letter case or with tabs/newlines inside, `data:` and `vbscript:` URLs, and input the URL parser rejects. Hint: let `new URL(…, base)` decide the scheme instead of matching strings.\n\n**`renderLink(label, href)`** returns an `<a>` element that shows `label` as **text**, uses the sanitised URL, opens in a new tab and sets `rel=\"noopener noreferrer\"`. Build it with DOM APIs so no input can break out of an attribute.",
      "Користувачі можуть додати сайт у профіль. Зробіть `src/links.ts` безпечним:\n\n**`sanitizeUrl(input)`** повертає обрізаний від пробілів рядок, якщо це URL `http:`, `https:` чи `mailto:` або відносний URL. Будь-що інше повертає `\"about:blank\"`, зокрема `javascript:` у будь-якому регістрі чи з табуляціями/переносами всередині, URL `data:` і `vbscript:`, а також рядки, які відхиляє URL-парсер. Підказка: нехай схему визначає `new URL(…, base)`, а не порівняння рядків.\n\n**`renderLink(label, href)`** повертає елемент `<a>`, що показує `label` як **текст**, використовує очищений URL, відкривається в новій вкладці й має `rel=\"noopener noreferrer\"`. Будуйте його через DOM API, щоб жодні дані не могли вирватися з атрибута.",
    ],
    files: { "/src/links.ts": LINKS_STARTER, "/index.ts": LINKS_INDEX },
    visibleFiles: ["/src/links.ts", "/index.ts"],
    activeFile: "/src/links.ts",
    tests: LINKS_TESTS,
    solution: { "/src/links.ts": LINKS_SOLUTION },
    explanation: [
      "Blocklists of strings lose to the parser: browsers ignore case, strip tabs and newlines inside the scheme, and skip leading control characters. Parsing with `new URL` and allow-listing the resulting `protocol` checks exactly what the browser will execute. Building the element with `textContent` and `setAttribute` means the label is never parsed as HTML and the URL can't close the attribute quote.",
      "Чорні списки рядків програють парсеру: браузери ігнорують регістр, прибирають табуляції й переноси в схемі й пропускають керівні символи на початку. Розбір через `new URL` і білий список для отриманого `protocol` перевіряють саме те, що виконає браузер. Побудова елемента через `textContent` і `setAttribute` означає, що підпис ніколи не розбирається як HTML, а URL не може закрити лапки атрибута.",
    ],
  }),
  practice({
    slug: "sec-html-template",
    skills: ["web-security", w("javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["An auto-escaping html template tag", "Тег шаблону html з автоекрануванням"],
    prompt: [
      "Implement a tiny safe templating helper in `src/html.ts`:\n\n- **`escapeHtml(value)`** converts the value to a string and escapes `&`, `<`, `>`, `\"` and `'` (as `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`).\n- **`html`** is a tagged template that returns a `SafeHtml`. Every interpolated value is escaped, except:\n  - `SafeHtml` instances (from nested `html` calls) are inserted as-is, so they aren't double-escaped;\n  - arrays are rendered item by item and joined with no separator;\n  - `null`, `undefined` and `false` render as nothing (but `0` renders `0`).\n- Only real `SafeHtml` instances are trusted: an object that merely has a `toString()` must be escaped.",
      "Реалізуйте невеликий безпечний помічник шаблонів у `src/html.ts`:\n\n- **`escapeHtml(value)`** перетворює значення на рядок і екранує `&`, `<`, `>`, `\"` і `'` (як `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`).\n- **`html`** є тегованим шаблоном, що повертає `SafeHtml`. Кожне підставлене значення екранується, окрім:\n  - екземплярів `SafeHtml` (від вкладених викликів `html`): вони вставляються як є, без подвійного екранування;\n  - масивів: вони рендеряться поелементно й з'єднуються без роздільника;\n  - `null`, `undefined` і `false`: вони не рендеряться (але `0` дає `0`).\n- Довіряти можна лише справжнім екземплярам `SafeHtml`: об'єкт, що просто має `toString()`, треба екранувати.",
    ],
    files: { "/src/html.ts": HTML_STARTER, "/index.ts": HTML_INDEX },
    visibleFiles: ["/src/html.ts", "/index.ts"],
    activeFile: "/src/html.ts",
    tests: HTML_TESTS,
    solution: { "/src/html.ts": HTML_SOLUTION },
    explanation: [
      "A tagged template receives the literal parts and the values separately, so it can escape only what came from data. Escaping all five characters makes values safe both as text and inside quoted attributes. Marking trusted output with a class (checked with `instanceof`) lets nested templates compose without double-escaping, and lookalike objects can't forge that trust. This is the idea behind lit-html and JSX auto-escaping.",
      "Тегований шаблон отримує літеральні частини й значення окремо, тож може екранувати лише те, що прийшло з даних. Екранування всіх п'яти символів робить значення безпечними і як текст, і всередині атрибутів у лапках. Позначення довіреного результату класом (перевірка через `instanceof`) дає змогу вкладати шаблони без подвійного екранування, а об'єкти-імітації не можуть підробити цю довіру. На цій ідеї побудовані lit-html і автоекранування в JSX.",
    ],
  }),
]);
