import { defineTasks } from "@/lib/content/schema";
import { practice, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const HTTP_STARTER = code`export type ParsedRequest = {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string;
};

/** Parses a raw HTTP/1.1 request as it arrives on a socket. */
export function parseRequest(raw: string): ParsedRequest {
  // TODO: request line, query string, headers, and the body from content-length
  return { method: "", path: "", query: {}, headers: {}, body: "" };
}
`;

const HTTP_SOLUTION = code`export type ParsedRequest = {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string;
};

/** Query strings use + for spaces and percent-encoding for everything else. */
const decode = (text: string) => decodeURIComponent(text.replace(/\+/g, " "));

export function parseRequest(raw: string): ParsedRequest {
  const headEnd = raw.indexOf("\r\n\r\n");
  if (headEnd === -1) throw new Error("Incomplete request head");

  const [requestLine, ...headerLines] = raw.slice(0, headEnd).split("\r\n");
  const match = /^([A-Z]+) (\S+) (HTTP\/\d\.\d)$/.exec(requestLine);
  if (match === null) throw new Error("Bad request line");
  const [, method, target, version] = match;
  if (version !== "HTTP/1.1" && version !== "HTTP/1.0") throw new Error("Unsupported HTTP version");

  const question = target.indexOf("?");
  const path = question === -1 ? target : target.slice(0, question);
  const query: Record<string, string> = {};
  if (question !== -1) {
    for (const pair of target.slice(question + 1).split("&")) {
      if (pair === "") continue;
      const equals = pair.indexOf("=");
      const key = decode(equals === -1 ? pair : pair.slice(0, equals));
      query[key] = equals === -1 ? "" : decode(pair.slice(equals + 1));
    }
  }

  const headers: Record<string, string> = {};
  for (const line of headerLines) {
    const colon = line.indexOf(":");
    if (colon <= 0) throw new Error("Bad header: " + line);
    const name = line.slice(0, colon).toLowerCase(); // header names are case-insensitive
    const value = line.slice(colon + 1).trim();
    // Repeated headers are combined with a comma, as RFC 9110 describes.
    headers[name] = Object.prototype.hasOwnProperty.call(headers, name) ? headers[name] + ", " + value : value;
  }

  const rest = raw.slice(headEnd + 4);
  const declared = headers["content-length"];
  if (declared === undefined) return { method, path, query, headers, body: "" };
  if (!/^\d+$/.test(declared)) throw new Error("Bad content-length");
  const length = Number(declared);
  if (rest.length < length) throw new Error("Truncated body");
  // Bytes after the declared length belong to the next request on the connection.
  return { method, path, query, headers, body: rest.slice(0, length) };
}
`;

const HTTP_INDEX = code`import "./styles.css";
import { parseRequest } from "./src/http";

const raw = "GET /search?q=hello+world HTTP/1.1\r\nHost: example.com\r\n\r\n";
document.getElementById("app")!.innerHTML = '<h1>HTTP request</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = JSON.stringify(parseRequest(raw), null, 2);
`;

const HTTP_TESTS = code`import { describe, it, expect } from "./test-kit";
import { parseRequest } from "../src/http";

describe("parseRequest", () => {
  it("reads the method, path and decoded query string", () => {
    const req = parseRequest("GET /search?q=hello+world&lang=uk%20ua&flag HTTP/1.1\r\nHost: example.com\r\n\r\n");
    expect(req.method).toBe("GET");
    expect(req.path).toBe("/search");
    expect(req.query).toEqual({ q: "hello world", lang: "uk ua", flag: "" });
  });
  it("lowercases header names and trims values", () => {
    const req = parseRequest("GET / HTTP/1.1\r\nHost:   example.com \r\nAccept-Language: uk\r\n\r\n");
    expect(req.headers).toEqual({ host: "example.com", "accept-language": "uk" });
  });
  it("combines repeated headers with a comma", () => {
    const req = parseRequest("GET / HTTP/1.1\r\nAccept: text/html\r\nAccept: application/json\r\n\r\n");
    expect(req.headers.accept).toBe("text/html, application/json");
  });
  it("reads the body by content-length and ignores what follows it", () => {
    const req = parseRequest("POST /items HTTP/1.1\r\nContent-Length: 5\r\n\r\nhelloEXTRA");
    expect(req.method).toBe("POST");
    expect(req.body).toBe("hello");
  });
  it("has an empty body without content-length", () => {
    expect(parseRequest("POST /x HTTP/1.1\r\n\r\nabc").body).toBe("");
  });
  it("rejects a truncated body", () => {
    expect(() => parseRequest("POST /x HTTP/1.1\r\nContent-Length: 10\r\n\r\nabc")).toThrow("Truncated body");
  });
  it("rejects a bad request line and unsupported versions", () => {
    expect(() => parseRequest("GET/HTTP/1.1\r\n\r\n")).toThrow("Bad request line");
    expect(() => parseRequest("GET / HTTP/2.0\r\n\r\n")).toThrow("Unsupported HTTP version");
  });
  it("rejects an incomplete head and a header without a colon", () => {
    expect(() => parseRequest("GET / HTTP/1.1\r\nHost: example.com")).toThrow("Incomplete request head");
    expect(() => parseRequest("GET / HTTP/1.1\r\nBrokenHeader\r\n\r\n")).toThrow("Bad header");
  });
});
`;

export default defineTasks([
  practice({
    slug: "net-http-request-parser",
    skills: ["networking", w("http-rest"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Parse a raw HTTP request", "Розберіть сирий HTTP-запит"],
    prompt: [
      "A server receives bytes from a socket, and before any framework runs, something must split them into a request. Implement `parseRequest(raw)` in `src/http.ts` for HTTP/1.x text, where lines end with `\\r\\n` and the head ends with an empty line:\n\n- The request line is `METHOD target HTTP/1.1` (or `HTTP/1.0`). Anything else is `Bad request line`, and other versions are `Unsupported HTTP version`.\n- The query string after `?` is split on `&` and decoded: `+` means a space, and percent-escapes are decoded. A key without `=` gets the empty string.\n- Header names are lowercased and values trimmed. A header without a colon is `Bad header: …`. A repeated header is joined with `, `.\n- Without a head that ends in an empty line the request is `Incomplete request head`.\n- The body is read by `content-length`: no header means an empty body, a non-numeric value is `Bad content-length`, and fewer bytes than declared is `Truncated body`. Bytes after the declared length are ignored.",
      "Сервер отримує байти із сокета, і до будь-якого фреймворку хтось має розбити їх на запит. Реалізуйте `parseRequest(raw)` у `src/http.ts` для тексту HTTP/1.x, де рядки закінчуються на `\\r\\n`, а заголовки завершуються порожнім рядком:\n\n- Рядок запиту має вигляд `METHOD target HTTP/1.1` (або `HTTP/1.0`). Інше — це `Bad request line`, а інші версії — `Unsupported HTTP version`.\n- Рядок запиту після `?` ділиться по `&` і декодується: `+` означає пробіл, а відсоткове кодування декодується. Ключ без `=` отримує порожній рядок.\n- Назви заголовків переводяться в нижній регістр, значення обрізаються. Заголовок без двокрапки — це `Bad header: …`. Повторюваний заголовок з'єднується через `, `.\n- Без заголовків, що закінчуються порожнім рядком, запит — це `Incomplete request head`.\n- Тіло читається за `content-length`: без заголовка тіло порожнє, нечислове значення — `Bad content-length`, а байтів менше, ніж оголошено, — `Truncated body`. Байти після оголошеної довжини ігноруються.",
    ],
    files: {
      "/src/http.ts": HTTP_STARTER,
      "/index.ts": HTTP_INDEX,
    },
    visibleFiles: ["/src/http.ts"],
    activeFile: "/src/http.ts",
    tests: HTTP_TESTS,
    solution: { "/src/http.ts": HTTP_SOLUTION },
    explanation: [
      "HTTP/1.x is a text protocol on top of TCP, which delivers a byte stream with no message boundaries. The blank line that ends the head and the `Content-Length` header are how the receiver finds where the request stops, and it must not run into the next request on the same connection (keep-alive). The parser is strict on purpose: a request-smuggling attack depends on two servers disagreeing about where a body ends, so rejecting malformed lengths and truncated bodies is a security decision, not just validation. Header names are case-insensitive by specification, and repeated headers are combined rather than overwritten, so a value like `Accept` isn't lost. The `hasOwnProperty` check keeps a header named `constructor` from reading the prototype.",
      "HTTP/1.x — це текстовий протокол поверх TCP, який доставляє потік байтів без меж повідомлень. Порожній рядок, що завершує заголовки, і заголовок `Content-Length` — це те, як отримувач знаходить, де закінчується запит, і він не повинен заходити в наступний запит на тому самому з'єднанні (keep-alive). Розбирач навмисно суворий: атака з контрабандою запитів залежить від того, що два сервери по-різному розуміють, де закінчується тіло, тож відхилення некоректних довжин і обрізаних тіл — це рішення безпеки, а не лише перевірка. Назви заголовків за специфікацією не чутливі до регістру, а повторювані заголовки об'єднуються, а не перезаписуються, тож значення на кшталт `Accept` не губиться. Перевірка `hasOwnProperty` не дає заголовку з назвою `constructor` читати прототип.",
    ],
  }),
]);
