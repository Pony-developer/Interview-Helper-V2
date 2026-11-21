import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const JWT_STARTER = code`export type Claims = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  [key: string]: unknown;
};

/** Reads the payload of a JWT. It does NOT verify the signature, which needs the key. */
export function decodePayload(token: string): Claims {
  // TODO: base64url-decode the middle segment, decode UTF-8, parse JSON. Throw "Malformed token" on anything wrong.
  return {};
}

export type CheckOptions = { now: number; issuer?: string; audience?: string; clockSkew?: number };
export type CheckResult = { valid: true; claims: Claims } | { valid: false; reason: string };

/** Checks the claims of a token whose signature has already been verified. */
export function checkClaims(token: string, options: CheckOptions): CheckResult {
  // TODO: malformed, missing exp, expired, not yet valid, wrong issuer, wrong audience
  return { valid: true, claims: {} };
}
`;

const JWT_SOLUTION = code`export type Claims = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  [key: string]: unknown;
};

export function decodePayload(token: string): Claims {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[1] === "") throw new Error("Malformed token");
  // base64url uses - and _ instead of + and /, and the padding is optional.
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
  let json: string;
  let payload: unknown;
  try {
    // atob gives one character per byte; turning the bytes into %XX escapes and decoding them reads UTF-8.
    json = decodeURIComponent(Array.from(atob(base64), (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""));
    payload = JSON.parse(json);
  } catch {
    throw new Error("Malformed token");
  }
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) throw new Error("Malformed token");
  return payload as Claims;
}

export type CheckOptions = { now: number; issuer?: string; audience?: string; clockSkew?: number };
export type CheckResult = { valid: true; claims: Claims } | { valid: false; reason: string };

export function checkClaims(token: string, { now, issuer, audience, clockSkew = 30 }: CheckOptions): CheckResult {
  let claims: Claims;
  try {
    claims = decodePayload(token);
  } catch {
    return { valid: false, reason: "malformed" };
  }
  if (claims.exp === undefined) return { valid: false, reason: "missing exp" };
  if (now >= claims.exp + clockSkew) return { valid: false, reason: "expired" };
  if (claims.nbf !== undefined && now + clockSkew < claims.nbf) return { valid: false, reason: "not yet valid" };
  if (issuer !== undefined && claims.iss !== issuer) return { valid: false, reason: "wrong issuer" };
  if (audience !== undefined) {
    const audiences: unknown[] = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(audience)) return { valid: false, reason: "wrong audience" };
  }
  return { valid: true, claims };
}
`;

const JWT_INDEX = code`import "./styles.css";
import { checkClaims } from "./src/jwt";

const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, "");
const token = ["eyJhbGciOiJIUzI1NiJ9", b64({ sub: "u1", iss: "auth.example", exp: 2000 }), "signature"].join(".");
document.getElementById("app")!.innerHTML = '<h1>JWT claims</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = JSON.stringify(checkClaims(token, { now: 1000, issuer: "auth.example" }), null, 2);
`;

const JWT_TESTS = code`import { describe, it, expect } from "./test-kit";
import { checkClaims, decodePayload } from "../src/jwt";

// btoa only handles Latin-1, so encode UTF-8 first (the same trick a real decoder has to undo).
const utf8 = (s) => btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
const b64url = (obj) => utf8(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const token = (payload) => ["eyJhbGciOiJIUzI1NiJ9", b64url(payload), "signature"].join(".");

describe("decodePayload", () => {
  it("reads the payload, including UTF-8 text", () => {
    expect(decodePayload(token({ sub: "u1", name: "Оля" }))).toEqual({ sub: "u1", name: "Оля" });
  });
  it("rejects malformed tokens", () => {
    expect(() => decodePayload("abc")).toThrow("Malformed token");
    expect(() => decodePayload("a.@@@.c")).toThrow("Malformed token");
    expect(() => decodePayload(["h", utf8("not json"), "s"].join("."))).toThrow("Malformed token");
    expect(() => decodePayload(["h", utf8("[1,2]"), "s"].join("."))).toThrow("Malformed token");
  });
});

describe("checkClaims", () => {
  it("accepts a token within its lifetime", () => {
    expect(checkClaims(token({ exp: 2000 }), { now: 1000 }).valid).toBe(true);
  });
  it("expires at exp plus the clock skew (30 seconds by default)", () => {
    expect(checkClaims(token({ exp: 1000 }), { now: 1029 }).valid).toBe(true);
    expect(checkClaims(token({ exp: 1000 }), { now: 1030 })).toEqual({ valid: false, reason: "expired" });
    expect(checkClaims(token({ exp: 1000 }), { now: 999, clockSkew: 0 }).valid).toBe(true);
  });
  it("rejects tokens that aren't valid yet", () => {
    expect(checkClaims(token({ exp: 9000, nbf: 1000 }), { now: 960 })).toEqual({ valid: false, reason: "not yet valid" });
    expect(checkClaims(token({ exp: 9000, nbf: 1000 }), { now: 970 }).valid).toBe(true);
  });
  it("rejects tokens without an exp claim", () => {
    expect(checkClaims(token({ sub: "u1" }), { now: 1 })).toEqual({ valid: false, reason: "missing exp" });
  });
  it("checks the issuer", () => {
    const t = token({ iss: "auth.example", exp: 2000 });
    expect(checkClaims(t, { now: 1000, issuer: "auth.example" }).valid).toBe(true);
    expect(checkClaims(t, { now: 1000, issuer: "elsewhere" })).toEqual({ valid: false, reason: "wrong issuer" });
  });
  it("checks the audience, which may be a list", () => {
    const t = token({ aud: ["web", "api"], exp: 2000 });
    expect(checkClaims(t, { now: 1000, audience: "api" }).valid).toBe(true);
    expect(checkClaims(t, { now: 1000, audience: "mobile" })).toEqual({ valid: false, reason: "wrong audience" });
    expect(checkClaims(token({ aud: "web", exp: 2000 }), { now: 1000, audience: "web" }).valid).toBe(true);
  });
  it("reports malformed tokens instead of throwing", () => {
    expect(checkClaims("nope", { now: 1000 })).toEqual({ valid: false, reason: "malformed" });
  });
});
`;

export default defineTasks([
  quiz(
    "jwt-decode-is-not-verify",
    ["jwt", w("auth", 0.3)],
    2,
    75,
    ["Decoding is not verifying", "Декодування не є перевіркою"],
    ["Which statement about the payload of a JWT is true?", "Яке твердження про payload JWT правильне?"],
    [
      ["Anyone holding the token can read the payload, so it must never contain secrets; only the signature proves it wasn't changed", "Будь-хто, хто має токен, може прочитати payload, тож він ніколи не повинен містити секретів; лише підпис доводить, що його не змінили"],
      ["The payload is encrypted, so only the server can read it", "Payload зашифрований, тож лише сервер може його прочитати"],
      ["Changing the payload is harmless, because the server reads claims from the database instead", "Зміна payload безпечна, бо сервер бере claims з бази даних"],
      ["A token whose payload decodes correctly is always trustworthy", "Токен, чий payload правильно декодується, завжди надійний"],
    ],
    "a",
    [
      "A JWT is base64url-encoded, not encrypted, so the payload is readable by anyone. The signature is the only part that proves the issuer and that nothing was altered. Verify the signature first, and only then trust `exp`, `aud` and the other claims.",
      "JWT закодований у base64url, а не зашифрований, тож payload може прочитати будь-хто. Лише підпис доводить, хто видав токен і що його ніхто не змінював. Спершу перевірте підпис, і лише потім довіряйте `exp`, `aud` та іншим claims.",
    ],
  ),
  quiz(
    "jwt-claims-scope",
    ["jwt", w("auth", 0.3)],
    3,
    90,
    ["Why `aud` and `exp` matter", "Навіщо потрібні `aud` і `exp`"],
    ["A valid, signed token issued for the mobile app is presented to the admin API. Which claim should the admin API have checked to reject it?", "Дійсний підписаний токен, виданий для мобільного застосунку, пред'явлено до адмін-API. Яку claim адмін-API мав перевірити, щоб відхилити його?"],
    [
      ["`aud`, the audience the token was issued for", "`aud`, аудиторію, для якої видано токен"],
      ["`sub`, the user id", "`sub`, id користувача"],
      ["`iat`, the time of issue", "`iat`, час видачі"],
      ["Nothing: a valid signature is enough", "Нічого: достатньо дійсного підпису"],
    ],
    "a",
    [
      "A signature only proves who issued the token. `aud` says which service it's meant for, and checking it stops a token from one service being replayed against another. `exp` limits how long a leaked token stays useful.",
      "Підпис лише доводить, хто видав токен. `aud` вказує, для якого сервісу він призначений, і її перевірка не дає токену з одного сервісу бути використаним в іншому. `exp` обмежує, як довго витеклий токен залишається корисним.",
    ],
  ),
  practice({
    slug: "jwt-claims-check",
    skills: ["jwt", w("auth"), w("typescript")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Decode and check JWT claims", "Декодуйте і перевіряйте claims JWT"],
    prompt: [
      "Implement two functions in `src/jwt.ts`. This is the claims half of JWT handling: **the signature must be verified separately, with the key, before you trust anything you read here**.\n\n- `decodePayload(token)` reads the middle segment: base64url (with `-` and `_`, and optional padding) decoded as **UTF-8** JSON. Throw `Malformed token` for anything that isn't three segments with a JSON object as payload.\n- `checkClaims(token, { now, issuer, audience, clockSkew = 30 })` returns `{ valid: true, claims }` or `{ valid: false, reason }` with these reasons, checked in this order: `malformed`, `missing exp`, `expired` (when `now >= exp + clockSkew`), `not yet valid` (when `now + clockSkew < nbf`), `wrong issuer`, `wrong audience`. `aud` may be a string or a list.\n- All times are in seconds, like the claims.",
      "Реалізуйте дві функції в `src/jwt.ts`. Це частина роботи з claims у JWT: **підпис треба перевіряти окремо, з ключем, перш ніж довіряти чомусь із прочитаного тут**.\n\n- `decodePayload(token)` читає середній сегмент: base64url (з `-` і `_`, із необов'язковим доповненням), декодований як **UTF-8** JSON. Кидайте `Malformed token` для всього, що не є трьома сегментами з JSON-об'єктом як payload.\n- `checkClaims(token, { now, issuer, audience, clockSkew = 30 })` повертає `{ valid: true, claims }` або `{ valid: false, reason }` з цими причинами, у такому порядку перевірки: `malformed`, `missing exp`, `expired` (коли `now >= exp + clockSkew`), `not yet valid` (коли `now + clockSkew < nbf`), `wrong issuer`, `wrong audience`. `aud` може бути рядком або списком.\n- Усі часи в секундах, як у claims.",
    ],
    files: {
      "/src/jwt.ts": JWT_STARTER,
      "/index.ts": JWT_INDEX,
    },
    visibleFiles: ["/src/jwt.ts"],
    activeFile: "/src/jwt.ts",
    tests: JWT_TESTS,
    solution: { "/src/jwt.ts": JWT_SOLUTION },
    explanation: [
      "Decoding and verifying are different jobs. `decodePayload` only undoes the encoding, and anyone can produce a token with any payload they like, so the claims are just data until the signature checks out (with `crypto.subtle.verify` and the issuer's public key, in a real system). Once the signature is trusted, the claims decide whether this token applies here and now: `exp` and `nbf` bound its lifetime, with a small clock-skew allowance because servers' clocks disagree, `iss` says who issued it, and `aud` says who it's for. Rejecting a missing `exp` is the safe default, since a token without an expiry never stops working. Checking `aud` is what stops a token issued for one service from being replayed against another.",
      "Декодування і перевірка — різні роботи. `decodePayload` лише скасовує кодування, і будь-хто може створити токен з будь-яким payload, тож claims є просто даними, доки підпис не перевірено (у реальній системі через `crypto.subtle.verify` і публічний ключ видавця). Коли підпису довірено, claims визначають, чи підходить цей токен тут і зараз: `exp` і `nbf` обмежують його строк, з невеликим допуском на розбіжність годинників серверів, `iss` каже, хто видав, а `aud` — для кого він. Відхилення токена без `exp` — безпечний вибір за замовчуванням, бо токен без терміну дії не перестає працювати. Перевірка `aud` не дає токену, виданому для одного сервісу, бути використаним в іншому.",
    ],
  }),
]);
