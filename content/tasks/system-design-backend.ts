import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const RING_STARTER = code`/** A stable 32-bit string hash: FNV-1a, then a final mixing step so similar names (a#1, a#2) land far apart. */
export function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** A consistent-hashing ring with virtual nodes. */
export function createRing(initialNodes: string[] = [], replicas = 100) {
  return {
    add(node: string): void {
      // TODO: place "replicas" points for the node on the ring
    },
    remove(node: string): void {
      // TODO
    },
    /** The node responsible for key, or null when the ring is empty. */
    get(key: string): string | null {
      return null; // TODO: the first point clockwise from hash(key), wrapping around
    },
    nodes(): string[] {
      return []; // TODO
    },
  };
}
`;

const RING_SOLUTION = code`/** A stable 32-bit string hash: FNV-1a, then a final mixing step so similar names (a#1, a#2) land far apart. */
export function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export function createRing(initialNodes: string[] = [], replicas = 100) {
  let points: Array<{ hash: number; node: string }> = [];
  const nodes = new Set<string>();

  const add = (node: string): void => {
    if (nodes.has(node)) return;
    nodes.add(node);
    // Each node gets many points, so load spreads evenly and a node's share is small when it joins or leaves.
    for (let i = 0; i < replicas; i++) points.push({ hash: hash(node + "#" + i), node });
    points.sort((a, b) => a.hash - b.hash || (a.node < b.node ? -1 : a.node > b.node ? 1 : 0));
  };

  const remove = (node: string): void => {
    if (!nodes.delete(node)) return;
    points = points.filter((p) => p.node !== node);
  };

  initialNodes.forEach(add);

  return {
    add,
    remove,
    get(key: string): string | null {
      if (points.length === 0) return null;
      const h = hash(key);
      // Binary search for the first point at or after h; past the end, wrap to the first point.
      let lo = 0;
      let hi = points.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (points[mid].hash < h) lo = mid + 1;
        else hi = mid;
      }
      return points[lo === points.length ? 0 : lo].node;
    },
    nodes(): string[] {
      return [...nodes].sort();
    },
  };
}
`;

const RING_INDEX = code`import "./styles.css";
import { createRing } from "./src/ring";

const ring = createRing(["cache-1", "cache-2", "cache-3"]);
document.getElementById("app")!.innerHTML = '<h1>Consistent hashing</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = "user:42 lives on " + ring.get("user:42");
`;

const RING_TESTS = code`import { describe, it, expect } from "./test-kit";
import { createRing } from "../src/ring";

const keys = Array.from({ length: 3000 }, (_, i) => "key-" + i);
const owners = (ring) => keys.map((k) => ring.get(k));

describe("createRing", () => {
  it("returns null for an empty ring", () => {
    expect(createRing().get("anything")).toBeNull();
  });
  it("always maps a key to the same node, which is in the ring", () => {
    const ring = createRing(["a", "b", "c"]);
    expect(ring.get("user:42")).toBe(ring.get("user:42"));
    expect(["a", "b", "c"]).toContain(ring.get("user:42"));
  });
  it("spreads keys across the nodes", () => {
    const counts = {};
    owners(createRing(["a", "b", "c"])).forEach((n) => (counts[n] = (counts[n] ?? 0) + 1));
    for (const node of ["a", "b", "c"]) expect(counts[node]).toBeGreaterThan(600);
  });
  it("moves only the keys that land on a newly added node", () => {
    const ring = createRing(["a", "b", "c"]);
    const before = owners(ring);
    ring.add("d");
    const after = owners(ring);
    const moved = keys.filter((_, i) => before[i] !== after[i]);
    expect(moved.length).toBeGreaterThan(0);
    expect(moved.length).toBeLessThan(keys.length / 2);
    keys.forEach((_, i) => {
      if (before[i] !== after[i]) expect(after[i]).toBe("d");
    });
  });
  it("moves only the keys of a removed node", () => {
    const ring = createRing(["a", "b", "c"]);
    const before = owners(ring);
    ring.remove("b");
    const after = owners(ring);
    keys.forEach((_, i) => {
      if (before[i] !== "b") expect(after[i]).toBe(before[i]);
      else expect(after[i]).not.toBe("b");
    });
  });
  it("ignores duplicate nodes and lists the nodes in order", () => {
    const ring = createRing(["b", "a"]);
    ring.add("a");
    expect(ring.nodes()).toEqual(["a", "b"]);
  });
});
`;

export default defineTasks([
  quiz(
    "sd-cap-partition",
    ["system-design", w("postgresql", 0.3)],
    3,
    90,
    ["What a partition forces", "Що вимагає розділ мережі"],
    ["During a network partition, a distributed database cannot guarantee every node answers with the latest write and every node always answers. What does CAP say it must give up?", "Під час розділу мережі розподілена база не може гарантувати, що кожен вузол відповідає найновішим записом і що кожен вузол завжди відповідає. Чим, за CAP, вона має пожертвувати?"],
    [
      ["Nothing: modern databases avoid the trade-off with faster networks", "Нічим: сучасні бази уникають цього компромісу завдяки швидшим мережам"],
      ["Partition tolerance, which is optional for every system", "Стійкість до розділів, яка є необов'язковою для кожної системи"],
      ["Either consistency or availability, for the requests affected by the partition", "Або узгодженість, або доступність для запитів, яких торкнувся розділ"],
      ["Latency, which CAP treats as a fixed cost", "Затримку, яку CAP розглядає як сталу вартість"],
    ],
    "c",
    [
      "With a partition, two sides can't reliably coordinate. A system either refuses or delays requests to stay consistent, or answers from possibly stale replicas to stay available. Partition tolerance isn't optional in a real network, which is why the practical choice is between C and A during a partition.",
      "За розділу дві сторони не можуть надійно узгоджуватися. Система або відхиляє чи затримує запити, щоб лишатися узгодженою, або відповідає з, можливо, застарілих реплік, щоб лишатися доступною. Стійкість до розділів у реальній мережі не є необов'язковою, тому практичний вибір за розділу — між C і A.",
    ],
  ),
  quiz(
    "sd-consistent-hashing",
    ["system-design", w("data-structures", 0.3)],
    3,
    90,
    ["Why consistent hashing", "Навіщо узгоджене хешування"],
    ["A cache is split across 10 servers with hash(key) mod 10. When one server is added, most keys change servers. What does consistent hashing change?", "Кеш розділено між 10 серверами через hash(key) mod 10. Коли додають один сервер, більшість ключів змінюють сервер. Що змінює узгоджене хешування?"],
    [
      ["Only about 1/N of the keys move when a node joins or leaves, because nodes and keys share one ring", "Під час додавання чи видалення вузла переміщується лише близько 1/N ключів, бо вузли і ключі розташовані на одному кільці"],
      ["Keys are encrypted, so servers can't compare them", "Ключі шифруються, тож сервери не можуть їх порівнювати"],
      ["Each key is stored on every server", "Кожен ключ зберігається на кожному сервері"],
      ["The hash function becomes faster", "Хеш-функція стає швидшою"],
    ],
    "a",
    [
      "With modular hashing, changing N reassigns almost every key. On a ring, each key belongs to the next node clockwise, so adding a node only takes over the keys between it and its predecessor. Virtual nodes spread that load evenly across the ring.",
      "За модульного хешування зміна N перепризначає майже всі ключі. На кільці кожен ключ належить наступному вузлу за годинниковою стрілкою, тож новий вузол забирає лише ключі між собою і своїм попередником. Віртуальні вузли рівномірно розподіляють це навантаження по кільцю.",
    ],
  ),
  quiz(
    "sd-cache-aside",
    ["system-design", w("redis", 0.3)],
    3,
    90,
    ["Cache-aside on a miss", "Cache-aside у разі промаху"],
    ["A product page uses the cache-aside pattern. What happens when a request misses the cache?", "Сторінка товару використовує шаблон cache-aside. Що відбувається, коли запит не знаходить дані в кеші?"],
    [
      ["The cache returns an error and the client retries later", "Кеш повертає помилку, і клієнт повторює запит пізніше"],
      ["The cache copies the whole database into memory", "Кеш копіює всю базу даних у пам'ять"],
      ["The write goes to the cache first and the database is updated later by a timer", "Запис спершу йде в кеш, а база оновлюється пізніше таймером"],
      ["The application loads the value from the database, then stores it in the cache for later requests", "Застосунок завантажує значення з бази даних, а потім зберігає його в кеші для наступних запитів"],
    ],
    "d",
    [
      "In cache-aside the application owns the logic: it reads the cache, falls back to the database on a miss, and writes the result back. Writes usually update the database and then delete or refresh the cached entry, so the cache doesn't keep serving the old value.",
      "У cache-aside логіку веде застосунок: він читає кеш, у разі промаху звертається до бази даних і записує результат назад. Записи зазвичай оновлюють базу, а потім видаляють або оновлюють запис у кеші, щоб кеш не віддавав старе значення.",
    ],
  ),
  quiz(
    "sd-idempotency-key",
    ["system-design", w("http-rest", 0.3)],
    3,
    90,
    ["Retrying a payment safely", "Безпечний повтор платежу"],
    ["A client sends POST /payments and gets a timeout, so it retries. How does the server avoid charging the customer twice?", "Клієнт надсилає POST /payments, отримує тайм-аут і повторює запит. Як сервер уникає подвійного списання?"],
    [
      ["It rejects every retried request with 409 Conflict, without checking anything", "Він відхиляє кожен повторний запит з 409 Conflict, нічого не перевіряючи"],
      ["It stores the client's idempotency key with the result, and returns the original result for a repeated key instead of charging again", "Він зберігає ідентифікатор ідемпотентності клієнта разом з результатом і для повторного ключа повертає початковий результат, а не списує знову"],
      ["It makes POST requests cacheable by the browser", "Він робить POST-запити кешованими браузером"],
      ["It increases the timeout so the first request always finishes", "Він збільшує тайм-аут, щоб перший запит завжди завершувався"],
    ],
    "b",
    [
      "The client can't know whether the first request was processed, so it must retry. An idempotency key makes the retry safe: the server remembers the outcome of the first attempt for that key and replays it, so the side effect happens once. Keys must be stored durably and expire after a sensible window.",
      "Клієнт не може знати, чи обробили перший запит, тому мусить повторити його. Ключ ідемпотентності робить повтор безпечним: сервер пам'ятає результат першої спроби для цього ключа і повертає його знову, тож побічний ефект відбувається один раз. Ключі мають зберігатися надійно і спливати через розумний проміжок часу.",
    ],
  ),
  quiz(
    "sd-at-least-once",
    ["system-design", w("message-queues", 0.3)],
    3,
    90,
    ["Duplicate messages", "Дубльовані повідомлення"],
    ["A message broker guarantees at-least-once delivery. What must a consumer design for?", "Брокер повідомлень гарантує доставку принаймні один раз. Для чого має проєктувати споживача?"],
    [
      ["Messages arriving in exactly the order they were sent", "Повідомлення, що приходять точно в порядку відправки"],
      ["Messages never being redelivered, so no checks are needed", "Повідомлення, які ніколи не доставляються повторно, тож перевірки не потрібні"],
      ["Processing that is idempotent, so handling the same message twice has the same effect as handling it once", "Ідемпотентну обробку, щоб обробка того самого повідомлення двічі мала той самий ефект, що й один раз"],
      ["Only one consumer per queue, to avoid duplicates", "Лише одного споживача на чергу, щоб уникнути дублікатів"],
    ],
    "c",
    [
      "A broker that waits for acknowledgements can redeliver a message whose ack was lost, so duplicates are normal, not a bug. Exactly-once processing across a network is not achievable in general, so the practical approach is at-least-once delivery combined with idempotent handlers, for example by storing processed message IDs.",
      "Брокер, що чекає підтверджень, може повторно доставити повідомлення, підтвердження якого загубилося, тож дублікати — це норма, а не помилка. Точної доставки один раз через мережу загалом не досягти, тому практичний підхід — доставка принаймні один раз разом з ідемпотентними обробниками, наприклад зі зберіганням ідентифікаторів оброблених повідомлень.",
    ],
  ),
  quiz(
    "sd-saga-compensation",
    ["system-design", w("microservices", 0.3)],
    4,
    120,
    ["Consistency across services", "Узгодженість між сервісами"],
    ["A booking needs a payment service and an inventory service. The payment succeeds but the inventory reservation fails. Why is a saga with a compensating action preferred over a distributed transaction here?", "Бронювання потребує сервісу платежів і сервісу складу. Платіж пройшов, але резервування на складі не вдалося. Чому тут віддають перевагу саги з компенсуючою дією, а не розподіленій транзакції?"],
    [
      ["Sagas avoid locks across services and undo completed steps explicitly (for example, a refund), so no service has to hold a lock while others respond", "Саги уникають блокувань між сервісами і явно відміняють виконані кроки (наприклад, повернення коштів), тож жодному сервісу не треба тримати блокування, поки чекають інші"],
      ["Sagas make the payment and the inventory reservation one atomic write", "Саги роблять платіж і резервування на складі одним атомарним записом"],
      ["Sagas remove the need for any error handling", "Саги прибирають потребу в будь-якій обробці помилок"],
      ["Distributed transactions don't exist in practice", "Розподілених транзакцій на практиці не існує"],
    ],
    "b",
    [
      "Two-phase commit across independent services holds locks while every participant votes, which blocks throughput and fails badly when a coordinator crashes. A saga breaks the work into local transactions, each committed on its own, and defines a compensating action for each step, such as refunding a payment when the reservation fails. The trade-off is that the system is briefly inconsistent and the compensation must be correct.",
      "Двофазний коміт між незалежними сервісами тримає блокування, поки кожен учасник голосує, що знижує пропускну здатність і погано ламається, коли координатор падає. Сага розбиває роботу на локальні транзакції, кожна з яких фіксується окремо, і визначає компенсуючу дію для кожного кроку, наприклад повернення платежу, коли резервування не вдалося. Ціна в тому, що система на короткий час неузгоджена, а компенсація має бути правильною.",
    ],
  ),
  quiz(
    "sd-circuit-breaker-open",
    ["system-design", w("monitoring", 0.3)],
    3,
    90,
    ["An open circuit", "Розімкнутий запобіжник"],
    ["A downstream recommendation service has been failing for most requests. What does a circuit breaker in the open state do?", "Сервіс рекомендацій, що працює повільно, більшість запитів виконує з помилками. Що робить запобіжник у розімкнутому стані?"],
    [
      ["It retries every request with exponential backoff until the service recovers", "Він повторює кожен запит з експоненційною затримкою, доки сервіс не відновиться"],
      ["It sends all traffic to a second copy of the same failing service", "Він надсилає весь трафік на другу копію того самого збійного сервісу"],
      ["It stops calling the service for a while and fails fast or returns a fallback, giving the service time to recover", "Він на деякий час припиняє звертатися до сервісу, швидко відмовляє або повертає запасну відповідь, даючи сервісу час відновитися"],
      ["It disables logging for the failing calls", "Він вимикає журналювання для збійних викликів"],
    ],
    "c",
    [
      "A breaker stops the damage from spreading: callers stop waiting on a dead dependency, threads and connections are freed, and the struggling service isn't buried under retries. After a timeout it lets a few trial requests through (half-open) and closes again only if they succeed. Retrying every request, as one option suggests, does the opposite and amplifies the load.",
      "Запобіжник не дає збою поширюватися: викликачі перестають чекати на мертву залежність, звільняються потоки й з'єднання, а сервіс, що не справляється, не завалюють повторами. Після тайм-ауту він пропускає кілька пробних запитів (half-open) і замикається знову, лише якщо вони успішні. Повторювати кожен запит, як пропонує один з варіантів, означає робити навпаки і посилювати навантаження.",
    ],
  ),
  quiz(
    "sd-hot-shard",
    ["system-design", w("postgresql", 0.3)],
    3,
    90,
    ["Choosing a shard key", "Вибір ключа шардування"],
    ["Which shard key most likely creates a hot shard for a write-heavy events table?", "Який ключ шардування найімовірніше створить «гарячий» шард для таблиці подій з великою кількістю записів?"],
    [
      ["A timestamp that always increases, so every new event lands on the newest shard", "Часова мітка, яка завжди зростає, тож кожна нова подія потрапляє на найновіший шард"],
      ["A hash of the event ID, spread evenly across the shards", "Хеш ідентифікатора події, рівномірно розподілений між шардами"],
      ["A user ID hashed with a salt", "Ідентифікатор користувача, хешований із сіллю"],
      ["A tenant ID combined with a hash of the event ID", "Ідентифікатор орендаря в поєднанні з хешем ідентифікатора події"],
    ],
    "a",
    [
      "Monotonic keys send all current writes to one range, so one shard does almost all the work while the others sit idle. Hashing spreads writes evenly, though it makes range queries across shards harder. Choosing a key means balancing write distribution against the queries you need to run.",
      "Монотонно зростаючі ключі надсилають усі поточні записи в один діапазон, тож один шард робить майже всю роботу, а інші простоюють. Хешування рівномірно розподіляє записи, хоча ускладнює запити за діапазоном між шардами. Вибір ключа — це баланс між рівномірністю записів і запитами, які треба виконувати.",
    ],
  ),
  quiz(
    "sd-quorum-overlap",
    ["system-design", w("redis", 0.3)],
    4,
    120,
    ["Quorum reads and writes", "Кворумні читання й записи"],
    ["A key is stored on N = 5 replicas. Writes wait for W = 3 acknowledgements and reads query R = 3 replicas. Why does a read see the latest successful write?", "Ключ зберігається на N = 5 репліках. Записи чекають W = 3 підтверджень, а читання запитують R = 3 репліки. Чому читання бачить останній успішний запис?"],
    [
      ["Because each write is sent to all five replicas at once, so any read is guaranteed to hit a fresh one", "Бо кожен запис одразу надсилається всім п'ятьом репліками, тож будь-яке читання гарантовано потрапить на свіжу"],
      ["Because R + W is greater than N, any set of three read replicas must overlap with the three that acknowledged the write", "Бо R + W більше за N, будь-які три репліки для читання мусять перетинатися з трьома, що підтвердили запис"],
      ["Because the replicas share one disk", "Бо репліки мають один спільний диск"],
      ["Because clients cache the latest value", "Бо клієнти кешують останнє значення"],
    ],
    "b",
    [
      "With five replicas, three acknowledged the write and any three read replicas must include at least one of them (3 + 3 > 5), so the read sees the newest value. The overlap guarantees freshness only while the write succeeded; a failed or partial write, and sloppy quorum options, weaken this, which is why the exact rules matter.",
      "За п'яти реплік три підтвердили запис, і будь-які три репліки для читання мусять містити принаймні одну з них (3 + 3 > 5), тож читання бачить найновіше значення. Перетин гарантує свіжість, лише якщо запис пройшов успішно; невдалий чи частковий запис і «нестрогі» кворуми це послаблюють, тому точні правила важливі.",
    ],
  ),
  quiz(
    "sd-fencing-token",
    ["system-design", w("concurrency", 0.3)],
    4,
    120,
    ["A leader that paused", "Лідер, що зупинився"],
    ["A lock service grants leadership to one worker, which then pauses for a long garbage collection. Another worker becomes leader and writes. What protects the storage from the paused worker's late write?", "Служба блокувань передає лідерство одному воркеру, який потім зупиняється на довгому збиранні сміття. Інший воркер стає лідером і пише дані. Що захищає сховище від пізнього запису зупиненого воркера?"],
    [
      ["Nothing needs protection: the old leader knows it lost leadership", "Нічого захищати не потрібно: старий лідер знає, що втратив лідерство"],
      ["A fencing token, a number that increases with each grant, which the storage checks and rejects when it's older than the last one seen", "Токен огородження — число, що зростає з кожною видачею, яке сховище перевіряє і відхиляє, якщо воно менше за останнє побачене"],
      ["A longer lease, so the paused worker never loses it", "Довша оренда, щоб зупинений воркер ніколи її не втрачав"],
      ["Sorting the writes by the local clock of each worker", "Сортування записів за локальним годинником кожного воркера"],
    ],
    "b",
    [
      "A lock can expire while its holder is paused, and the holder can't tell. A fencing token makes stale writes detectable at the resource itself: every grant carries a larger number, and the storage rejects requests carrying an older one. Clocks can't provide this, which is why the check belongs at the resource rather than in the lock service.",
      "Блокування може закінчитися, поки його власник зупинений, і власник цього не помітить. Токен огородження робить застарілі записи видимими на самому ресурсі: кожна видача несе більше число, а сховище відхиляє запити зі старішим. Годинники такого не забезпечують, тому перевірка має бути на ресурсі, а не в службі блокувань.",
    ],
  ),
  practice({
    slug: "sd-consistent-hash-ring",
    skills: ["system-design", w("data-structures"), w("typescript")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["A consistent-hashing ring", "Кільце узгодженого хешування"],
    prompt: [
      "Caches and sharded databases must map keys to servers so that adding or removing a server moves only a small share of the keys. Implement `createRing(initialNodes, replicas = 100)` in `src/ring.ts` with a stable hash (`hash` is provided):\n\n- Each node is placed on the ring as `replicas` points, named `node + \"#\" + i`, so load is spread evenly. Points are kept sorted by hash.\n- `get(key)` returns the node owning the first point at or after `hash(key)`, wrapping around to the first point. It returns `null` for an empty ring.\n- `add(node)` and `remove(node)` change the ring; adding a node that is already present does nothing. `nodes()` lists the nodes, sorted.\n- When a node is added, only keys that move should move, and they must all move to the new node. When a node is removed, only its keys may move.",
      "Кеші та шардовані бази даних мають зіставляти ключі із серверами так, щоб додавання чи видалення сервера переміщувало лише невелику частку ключів. Реалізуйте `createRing(initialNodes, replicas = 100)` у `src/ring.ts` зі стабільним хешем (`hash` надано):\n\n- Кожен вузол розміщується на кільці як `replicas` точок з назвами `node + \"#\" + i`, щоб навантаження розподілялося рівномірно. Точки тримаються відсортованими за хешем.\n- `get(key)` повертає вузол, якому належить перша точка від `hash(key)` за годинниковою стрілкою, з переходом на початок кільця. Для порожнього кільця — `null`.\n- `add(node)` і `remove(node)` змінюють кільце; додавання вузла, що вже є, нічого не змінює. `nodes()` повертає вузли відсортованими.\n- Коли додають вузол, переміщуватися мають лише ключі, що переходять до нього, і всі вони мають перейти до нового вузла. Коли вузол видаляють, переміщуватися можуть лише його ключі.",
    ],
    files: {
      "/src/ring.ts": RING_STARTER,
      "/index.ts": RING_INDEX,
    },
    visibleFiles: ["/src/ring.ts"],
    activeFile: "/src/ring.ts",
    tests: RING_TESTS,
    solution: { "/src/ring.ts": RING_SOLUTION },
    explanation: [
      "Modular hashing reassigns almost every key when the server count changes, because `hash mod N` depends on N. On a ring both keys and servers hash onto the same circle, and a key belongs to the next server clockwise, so a change only affects the arc between the new or removed server and its neighbour. Virtual nodes (many points per server) smooth out the arcs, so one server doesn't own a disproportionate share. Sorting the points once on change keeps `get` at O(log n) with a binary search. Production systems add weights per server and replicate each key to the next few distinct nodes on the ring. The hash function matters too: plain FNV-1a placed names like \"a#1\" and \"a#2\" close together, which skewed the load until a final mixing step was added.",
      "Модульне хешування перепризначає майже всі ключі, коли змінюється кількість серверів, бо `hash mod N` залежить від N. На кільці і ключі, і сервери хешуються на те саме коло, а ключ належить наступному серверу за годинниковою стрілкою, тож зміна впливає лише на дугу між новим чи видаленим сервером і його сусідом. Віртуальні вузли (багато точок на сервер) вирівнюють дуги, тож один сервер не отримує непропорційної частки. Сортування точок під час зміни тримає `get` на O(log n) через бінарний пошук. У продакшені сервери мають ваги, а кожен ключ реплікується на кілька наступних різних вузлів кільця. Хеш також важливий: звичайний FNV-1a розміщував близькі назви на кшталт \"a#1\" і \"a#2\" поруч, через що навантаження перекошувалося, доки не додали фінальний крок змішування.",
    ],
  }),
]);
