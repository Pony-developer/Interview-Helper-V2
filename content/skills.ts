import { defineSkills, type SkillCategory, type SkillDef } from "@/lib/content/schema";

/**
 * Skill catalogue. Used by the multiselect, the keyword matcher and the on-device LLM normaliser.
 * `aliases` are matched case-insensitively on word boundaries; `caseSensitiveAliases` only as written
 * (for short or ambiguous tokens such as "Go", "React" or "Swift").
 */
function s(
  slug: string,
  name: string,
  category: SkillCategory,
  aliases: string[] = [],
  extra: Partial<Omit<SkillDef, "slug" | "name" | "category" | "aliases">> = {},
): SkillDef {
  return { slug, name, category, aliases, ...extra };
}

const core = { codeable: true, popularity: 90 };

export const skills = defineSkills([
  // ── Core skills with full content ───────────────────────────────────────────
  s("javascript", "JavaScript", "languages", ["javascript", "js", "es6", "es2015", "ecmascript", "es next", "vanilla js", "джаваскрипт"], {
    ...core,
    popularity: 100,
    description: {
      en: "The language of the web: types, coercion, objects, functions and the runtime model.",
      uk: "Мова вебу: типи, приведення типів, об'єкти, функції та модель виконання.",
    },
  }),
  s("typescript", "TypeScript", "languages", ["typescript", "ts", "тайпскрипт"], {
    ...core,
    popularity: 98,
    description: {
      en: "Static types for JavaScript: generics, narrowing, utility and conditional types.",
      uk: "Статична типізація для JavaScript: дженерики, звуження типів, утилітні та умовні типи.",
    },
  }),
  s("react", "React", "frontend-frameworks", ["reactjs", "react.js", "react js", "react hooks", "react 18", "react 19"], {
    ...core,
    popularity: 99,
    caseSensitiveAliases: ["React", "REACT"],
    description: {
      en: "Components, hooks, rendering, reconciliation and data flow in React.",
      uk: "Компоненти, хуки, рендеринг, узгодження (reconciliation) і потік даних у React.",
    },
  }),
  s("angular", "Angular", "frontend-frameworks", ["angular", "angular 2+", "angular2", "angular 14", "angular 15", "angular 16", "angular 17", "angular 18", "angular 19", "angular cli"], {
    ...core,
    popularity: 85,
    description: {
      en: "Components, templates, dependency injection, change detection and modules in Angular.",
      uk: "Компоненти, шаблони, впровадження залежностей, виявлення змін і модулі в Angular.",
    },
  }),
  s("html", "HTML", "web-platform", ["html", "html5", "semantic html", "семантична верстка", "верстка"], {
    ...core,
    popularity: 92,
    description: {
      en: "Semantic markup, forms, document structure and the browser's parsing model.",
      uk: "Семантична розмітка, форми, структура документа та модель розбору в браузері.",
    },
  }),
  s("css", "CSS", "styling", ["css", "css3", "flexbox", "css grid", "responsive layout"], {
    ...core,
    popularity: 92,
    description: {
      en: "Cascade, specificity, box model, Flexbox, Grid and responsive layouts.",
      uk: "Каскад, специфічність, блокова модель, Flexbox, Grid і адаптивна верстка.",
    },
  }),
  s("dom-events", "DOM & Events", "web-platform", ["dom", "dom manipulation", "dom api", "event delegation", "event bubbling", "browser events"], {
    ...core,
    popularity: 70,
    description: {
      en: "Querying and updating the DOM, event propagation, delegation and default actions.",
      uk: "Пошук і зміна DOM, поширення подій, делегування та дії за замовчуванням.",
    },
  }),
  s("async-javascript", "Async JavaScript", "javascript-core", ["promises", "async/await", "async await", "asynchronous javascript", "асинхронність"], {
    ...core,
    popularity: 80,
    description: {
      en: "Promises, async/await, combinators, error handling and concurrency patterns.",
      uk: "Проміси, async/await, комбінатори, обробка помилок і патерни конкурентності.",
    },
  }),
  s("event-loop", "Event Loop", "javascript-core", ["event loop", "microtasks", "macrotasks", "task queue", "call stack", "цикл подій", "мікрозадачі"], {
    ...core,
    popularity: 70,
    description: {
      en: "The call stack, tasks and microtasks, timers, rendering and how to predict execution order.",
      uk: "Стек викликів, задачі й мікрозадачі, таймери, рендеринг і як передбачити порядок виконання.",
    },
  }),
  s("type-coercion", "Types & Coercion", "javascript-core", ["type coercion", "type conversion", "implicit coercion", "loose equality", "приведення типів"], {
    ...core,
    popularity: 65,
    description: {
      en: "Primitive types, implicit and explicit conversion, ToPrimitive, == vs === and comparison rules.",
      uk: "Примітивні типи, неявне й явне перетворення, ToPrimitive, == проти === і правила порівняння.",
    },
  }),
  s("closures-scope", "Closures & Scope", "javascript-core", ["closures", "closure", "lexical scope", "scope chain", "hoisting", "замикання"], {
    ...core,
    popularity: 70,
    description: {
      en: "Lexical scope, closures, hoisting, `this` binding and the temporal dead zone.",
      uk: "Лексична область видимості, замикання, підняття (hoisting), прив'язка `this` і TDZ.",
    },
  }),
  s("es-modules", "ES Modules", "javascript-core", ["es modules", "esm", "es6 modules", "commonjs", "module bundling", "import/export"], {
    ...core,
    popularity: 55,
    description: {
      en: "import/export semantics, live bindings, dynamic import and CommonJS interop.",
      uk: "Семантика import/export, живі прив'язки, динамічний імпорт і сумісність із CommonJS.",
    },
  }),
  s("arrays-strings", "Arrays & Strings", "javascript-core", ["array methods", "string manipulation", "map filter reduce", "array manipulation"], {
    ...core,
    popularity: 65,
    description: {
      en: "Idiomatic array and string manipulation: map, filter, reduce, slicing and immutability.",
      uk: "Ідіоматична робота з масивами й рядками: map, filter, reduce, зрізи та незмінність.",
    },
  }),
  s("algorithms", "Algorithms", "cs-fundamentals", ["algorithms", "algorithmic", "алгоритми", "алгоритмів", "problem solving", "leetcode"], {
    codeable: true,
    popularity: 80,
    description: {
      en: "Algorithmic problem solving: the umbrella for searching, sorting, recursion and complexity.",
      uk: "Розв'язання алгоритмічних задач: пошук, сортування, рекурсія та складність.",
    },
  }),
  s("searching-algorithms", "Searching Algorithms", "cs-fundamentals", ["binary search", "linear search", "search algorithms", "two pointers", "бінарний пошук"], {
    ...core,
    popularity: 60,
    description: {
      en: "Linear and binary search, two pointers, search on answers and invariants.",
      uk: "Лінійний і бінарний пошук, два вказівники, пошук за відповіддю та інваріанти.",
    },
  }),
  s("sorting-algorithms", "Sorting Algorithms", "cs-fundamentals", ["sorting", "sorting algorithms", "quicksort", "merge sort", "сортування"], {
    ...core,
    popularity: 60,
    description: {
      en: "Comparison sorts, stability, complexity and JavaScript's Array.prototype.sort.",
      uk: "Сортування порівнянням, стабільність, складність і Array.prototype.sort у JavaScript.",
    },
  }),
  s("recursion", "Recursion", "cs-fundamentals", ["recursion", "recursive", "backtracking", "рекурсія"], {
    ...core,
    popularity: 55,
    description: {
      en: "Base cases, recursive decomposition, memoisation and backtracking.",
      uk: "Базові випадки, рекурсивна декомпозиція, мемоізація та пошук із поверненням.",
    },
  }),
  s("data-structures", "Data Structures", "cs-fundamentals", ["data structures", "структури даних", "linked list", "linked lists", "hash map", "hash table", "hash tables", "stacks and queues", "binary tree", "binary trees"], {
    ...core,
    popularity: 75,
    description: {
      en: "Arrays, hash maps, stacks, queues, linked lists, trees, heaps and graphs.",
      uk: "Масиви, хеш-таблиці, стеки, черги, зв'язні списки, дерева, купи та графи.",
    },
  }),
  s("big-o", "Big-O Complexity", "cs-fundamentals", ["big o", "big-o", "time complexity", "space complexity", "complexity analysis", "асимптотична складність"], {
    ...core,
    popularity: 60,
    description: {
      en: "Asymptotic time and space complexity and how to reason about it.",
      uk: "Асимптотична складність за часом і пам'яттю та як її оцінювати.",
    },
  }),
  s("browser-apis", "Browser APIs & Storage", "web-platform", ["web apis", "browser apis", "localstorage", "sessionstorage", "indexeddb", "fetch api", "service worker", "intersection observer"], {
    ...core,
    popularity: 60,
    description: {
      en: "Fetch, storage, workers, observers and other platform APIs.",
      uk: "Fetch, сховища, воркери, спостерігачі та інші API платформи.",
    },
  }),
  s("http-rest", "HTTP & REST", "web-platform", ["http", "https", "rest api", "rest apis", "restful", "restful api", "http/2", "cors", "http status codes"], {
    caseSensitiveAliases: ["REST"],
    ...core,
    codeable: false,
    popularity: 85,
    description: {
      en: "HTTP methods, status codes, caching, CORS and RESTful API design.",
      uk: "HTTP-методи, коди стану, кешування, CORS і проєктування RESTful API.",
    },
  }),
  s("web-performance", "Web Performance", "web-platform", ["web performance", "performance optimization", "core web vitals", "lighthouse", "lazy loading", "code splitting", "оптимізація продуктивності"], {
    ...core,
    popularity: 65,
    description: {
      en: "Core Web Vitals, rendering pipeline, code splitting, caching and memoisation.",
      uk: "Core Web Vitals, конвеєр рендерингу, розділення коду, кешування та мемоізація.",
    },
  }),
  s("web-accessibility", "Web Accessibility", "web-platform", ["accessibility", "a11y", "wcag", "aria", "screen readers", "доступність"], {
    ...core,
    popularity: 55,
    description: {
      en: "WCAG, semantic HTML, ARIA, keyboard support and accessible names.",
      uk: "WCAG, семантичний HTML, ARIA, підтримка клавіатури та доступні імена.",
    },
  }),
  s("unit-testing", "Unit Testing", "testing", ["unit testing", "unit tests", "unit-tests", "testing library", "react testing library", "test coverage", "юніт-тести", "модульні тести"], {
    ...core,
    popularity: 80,
    description: {
      en: "Test structure, assertions, mocks, test doubles and testing UI behaviour.",
      uk: "Структура тестів, перевірки, моки, тестові дублери й тестування поведінки UI.",
    },
  }),
  s("git", "Git", "practices", ["git", "git flow", "gitflow", "version control", "rebase", "merge conflicts"], {
    codeable: false,
    popularity: 90,
    description: {
      en: "Commits, branches, merging vs rebasing, history rewriting and collaboration flows.",
      uk: "Коміти, гілки, merge проти rebase, переписування історії та командні процеси.",
    },
  }),
  s("rxjs", "RxJS", "state-and-data", ["rxjs", "reactive extensions", "observables", "reactive programming"], {
    ...core,
    popularity: 65,
    description: {
      en: "Observables, operators, subjects, higher-order mapping and unsubscription.",
      uk: "Observable, оператори, Subject, відображення вищого порядку та відписка.",
    },
  }),
  s("state-management", "State Management", "state-and-data", ["state management", "global state", "flux", "керування станом"], {
    ...core,
    popularity: 70,
    description: {
      en: "Local vs global state, reducers, selectors, immutability and derived data.",
      uk: "Локальний і глобальний стан, редʼюсери, селектори, незмінність і похідні дані.",
    },
  }),
  s("nodejs", "Node.js", "backend", ["node.js", "nodejs", "node js"], {
    ...core,
    popularity: 90,
    caseSensitiveAliases: ["Node"],
    description: {
      en: "The Node.js runtime: modules, streams, the event loop and the standard library.",
      uk: "Середовище Node.js: модулі, потоки, цикл подій і стандартна бібліотека.",
    },
  }),

  s("regex", "Regular Expressions", "javascript-core", ["regex", "regexp", "regular expressions", "regular expression", "регулярні вирази"], {
    ...core,
    popularity: 55,
    description: {
      en: "Pattern syntax, flags, groups and lookarounds, replace and matchAll, escaping input and avoiding catastrophic backtracking.",
      uk: "Синтаксис шаблонів, прапорці, групи й перевірки вперед і назад, replace і matchAll, екранування даних і уникнення катастрофічного бектрекінгу.",
    },
  }),
  s("web-workers", "Web Workers", "web-platform", ["web workers", "web worker", "dedicated worker", "comlink", "offscreencanvas", "sharedarraybuffer"], {
    ...core,
    popularity: 45,
    description: {
      en: "Running JavaScript off the main thread: postMessage and structured clone, transferables, worker pools, RPC and shared memory.",
      uk: "Виконання JavaScript поза головним потоком: postMessage і структуроване клонування, transferable-об'єкти, пули worker, RPC і спільна пам'ять.",
    },
  }),

  s("this-prototypes", "this & Prototypes", "javascript-core", ["this keyword", "this binding", "prototypes", "prototype chain", "prototypal inheritance", "object prototypes", "call apply bind"], {
    ...core,
    popularity: 60,
    description: {
      en: "How this is bound (default, implicit, explicit, new, arrow), the prototype chain, delegation and what class really does.",
      uk: "Як прив'язується this (типово, неявно, явно, new, стрілочні), ланцюжок прототипів, делегування і що насправді робить class.",
    },
  }),
  s("js-values-grammar", "Values & Grammar", "javascript-core", ["floating point", "ieee 754", "number precision", "bigint", "automatic semicolon insertion", "operator precedence"], {
    ...core,
    popularity: 45,
    description: {
      en: "Numbers and precision, BigInt, -0, strings and arrays as values, native wrappers, ASI, precedence and statements vs expressions.",
      uk: "Числа й точність, BigInt, -0, рядки й масиви як значення, нативні обгортки, ASI, пріоритет операторів і інструкції проти виразів.",
    },
  }),
  s("iterators-generators", "Iterators & Generators", "javascript-core", ["generators", "generator functions", "iterators", "iteration protocol", "async generators", "for await"], {
    ...core,
    popularity: 45,
    description: {
      en: "The iteration protocol, generator functions, two-way yield, delegation, cleanup with return, async generators and coroutines.",
      uk: "Протокол ітерації, функції-генератори, двобічний yield, делегування, очищення через return, асинхронні генератори й корутини.",
    },
  }),
  s("js-metaprogramming", "Symbols, Proxy & Reflect", "javascript-core", ["proxy", "proxies", "reflect api", "symbols", "metaprogramming", "property descriptors", "object.defineproperty"], {
    ...core,
    popularity: 40,
    description: {
      en: "Property descriptors, getters and setters, freezing, Symbols and well-known symbols, Proxy traps and invariants, and Reflect.",
      uk: "Дескриптори властивостей, гетери й сетери, заморожування, символи й загальновідомі символи, пастки й інваріанти Proxy та Reflect.",
    },
  }),
  s("modern-js-syntax", "Modern JS Syntax", "javascript-core", ["destructuring", "spread operator", "rest parameters", "default parameters", "template literals", "optional chaining", "nullish coalescing", "es2020"], {
    ...core,
    popularity: 70,
    description: {
      en: "Destructuring, spread and rest, default parameters and their scope, template and tagged literals, optional chaining, ?? and logical assignment.",
      uk: "Деструктуризація, spread і rest, параметри за замовчуванням та їхня область видимості, шаблонні й теговані літерали, optional chaining, ?? і логічне присвоєння.",
    },
  }),
  s("js-classes", "JavaScript Classes", "javascript-core", ["es6 classes", "javascript classes", "class fields", "private fields", "static blocks", "mixins"], {
    ...core,
    popularity: 60,
    description: {
      en: "Class syntax in depth: fields and their initialisation order, #private members, static members and blocks, accessors, extends and super, mixins and pitfalls.",
      uk: "Класи в деталях: поля та порядок їхньої ініціалізації, #приватні члени, статичні члени й блоки, аксесори, extends і super, міксини та підводні камені.",
    },
  }),
  s("js-collections", "Map, Set & Weak Collections", "javascript-core", ["map and set", "weakmap", "weakset", "weakref", "finalizationregistry", "typed arrays", "arraybuffer"], {
    ...core,
    popularity: 50,
    description: {
      en: "Map and Set semantics (SameValueZero, insertion order), the new Set methods, WeakMap/WeakSet/WeakRef and garbage collection, typed arrays and ArrayBuffer.",
      uk: "Семантика Map і Set (SameValueZero, порядок вставлення), нові методи Set, WeakMap/WeakSet/WeakRef і збирання сміття, типізовані масиви та ArrayBuffer.",
    },
  }),
  s("js-engine-performance", "JS Engines, Memory & Benchmarking", "javascript-core", ["v8", "jit compilation", "hidden classes", "inline caching", "garbage collection", "memory leaks", "benchmarking", "microbenchmarks"], {
    ...core,
    popularity: 45,
    description: {
      en: "How engines run JavaScript (parsing, JIT tiers, hidden classes, inline caches, deopts), garbage collection and memory leaks, and how to benchmark honestly.",
      uk: "Як рушії виконують JavaScript (розбір, рівні JIT, приховані класи, inline-кеші, деоптимізації), збирання сміття й витоки пам'яті та як чесно вимірювати швидкодію.",
    },
  }),
  s("promise-internals", "Promises in Depth", "javascript-core", ["promise internals", "promise/a+", "thenables", "zalgo", "callback hell", "inversion of control", "promisify"], {
    ...core,
    popularity: 55,
    description: {
      en: "Why callbacks lose trust, how promises fix it, the resolution procedure and thenables, chaining and error propagation, unhandled rejections and writing a promise from scratch.",
      uk: "Чому колбеки втрачають довіру, як проміси це виправляють, процедура розв'язання й thenable-об'єкти, ланцюжки й поширення помилок, необроблені відхилення і написання промісу з нуля.",
    },
  }),
  s("error-handling", "Error Handling", "javascript-core", ["error handling", "exception handling", "try catch", "custom errors", "unhandled rejections"], {
    ...core,
    popularity: 75,
    description: {
      en: "Error types and causes, custom errors, try/catch/finally semantics, errors in async code, global handlers, and designing what to throw, return or retry.",
      uk: "Типи помилок і їхні причини, власні помилки, семантика try/catch/finally, помилки в асинхронному коді, глобальні обробники і як вирішити, що кидати, повертати чи повторювати.",
    },
  }),
  s("scope-strict-mode", "Scope Model & Strict Mode", "javascript-core", ["strict mode", "use strict", "global scope", "globalthis", "lexical environment"], {
    ...core,
    popularity: 45,
    description: {
      en: "How the engine resolves names: compile-time scopes, lookups, the global object vs the global scope, function declarations in blocks, eval and with, and everything strict mode changes.",
      uk: "Як рушій знаходить імена: області видимості під час компіляції, пошук, глобальний об'єкт проти глобальної області, оголошення функцій у блоках, eval і with та все, що змінює строгий режим.",
    },
  }),
  s("async-cancellation", "Cancellation & Async Control Flow", "javascript-core", ["abortcontroller", "abortsignal", "cancellation", "race conditions", "request cancellation"], {
    ...core,
    popularity: 45,
    description: {
      en: "AbortController and AbortSignal, timeouts, stale-response race conditions, latest-wins and queued flows, cancellable async work, and channels for coordinating producers and consumers.",
      uk: "AbortController і AbortSignal, тайм-аути, стани гонитви з застарілими відповідями, сценарії «перемагає останній» і черги, асинхронна робота зі скасуванням і канали для координації виробників і споживачів.",
    },
  }),
  s("unicode-strings", "Strings & Unicode", "javascript-core", ["unicode", "utf-8", "utf-16", "emoji handling", "string encoding", "intl.segmenter"], {
    ...core,
    popularity: 45,
    description: {
      en: "UTF-16 code units vs code points vs grapheme clusters, surrogate pairs, normalisation, the u and v regex flags, locale-aware comparison and encoding text to bytes.",
      uk: "Кодові одиниці UTF-16, кодові точки й кластери графем, сурогатні пари, нормалізація, прапорці регулярних виразів u і v, порівняння з урахуванням локалі й кодування тексту в байти.",
    },
  }),
  s("transpiling-polyfills", "Transpiling, Polyfills & Feature Detection", "javascript-core", ["polyfills", "polyfill", "core-js", "browserslist", "transpiling", "feature detection"], {
    ...core,
    popularity: 50,
    description: {
      en: "Syntax vs APIs, how transpilers and polyfills work, browserslist targets, writing spec-compliant polyfills, feature detection instead of user-agent sniffing, and the cost of shipping both.",
      uk: "Синтаксис проти API, як працюють транспілятори й поліфіли, цілі browserslist, написання поліфілів за специфікацією, визначення можливостей замість аналізу user-agent і ціна постачання обох.",
    },
  }),
  s("main-thread-scheduling", "Main-Thread Scheduling", "javascript-core", ["requestanimationframe", "requestidlecallback", "long tasks", "time slicing", "scheduler.yield", "cooperative scheduling"], {
    ...core,
    popularity: 45,
    description: {
      en: "Keeping the main thread responsive: long tasks and INP, chunking and yielding, requestAnimationFrame vs timers vs idle callbacks, task priorities, and batching DOM reads and writes.",
      uk: "Як тримати головний потік чутливим: довгі задачі й INP, розбиття роботи й поступка потоку, requestAnimationFrame проти таймерів і idle-колбеків, пріоритети задач і групування читань і записів DOM.",
    },
  }),
  s("immutability-copying", "Values, References & Immutability", "javascript-core", ["immutability", "deep clone", "deep copy", "structuredclone", "value vs reference", "structural sharing"], {
    ...core,
    popularity: 60,
    description: {
      en: "Primitives vs references, how assignment and arguments really work, shallow vs deep copies and structuredClone's limits, immutable update patterns, structural sharing and freezing.",
      uk: "Примітиви проти посилань, як насправді працюють присвоєння й аргументи, поверхневі й глибокі копії та обмеження structuredClone, шаблони незмінних оновлень, структурне спільне використання й заморожування.",
    },
  }),
  s("dates-time", "Dates, Time Zones & Temporal", "javascript-core", ["date handling", "time zones", "timezones", "temporal api", "date-fns", "dayjs", "luxon", "moment.js"], {
    ...core,
    popularity: 60,
    description: {
      en: "How Date really stores time, parsing and month pitfalls, UTC vs local time, time zones and DST, formatting with Intl, date arithmetic, and the Temporal API.",
      uk: "Як Date насправді зберігає час, пастки розбору й місяців, UTC проти локального часу, часові пояси й перехід на літній час, форматування через Intl, арифметика дат і Temporal API.",
    },
  }),
  s("json-serialization", "JSON & Serialization", "javascript-core", ["json", "json.stringify", "json.parse", "serialization", "serialisation", "json schema"], {
    ...core,
    popularity: 65,
    description: {
      en: "Exactly what JSON.stringify keeps and drops, toJSON, replacers and revivers, BigInt and dates, cycles, safe parsing of untrusted input, and validating data at the boundary.",
      uk: "Що саме зберігає й відкидає JSON.stringify, toJSON, функції replacer і reviver, BigInt і дати, цикли, безпечний розбір ненадійних даних і валідація даних на межі системи.",
    },
  }),
  s("module-pattern", "Module Pattern & Encapsulation", "javascript-core", ["module pattern", "revealing module pattern", "iife", "factory functions", "information hiding"], {
    ...core,
    popularity: 45,
    description: {
      en: "Encapsulating state with closures: IIFEs, the revealing module and factory patterns, singletons, privacy with closures vs #private vs WeakMap vs Symbol, and how modules replaced them.",
      uk: "Інкапсуляція стану через замикання: IIFE, шаблони revealing module і фабрики, синглтони, приватність через замикання, #private, WeakMap чи Symbol і як модулі прийшли їм на зміну.",
    },
  }),
  s("event-emitters", "Events & Pub/Sub", "javascript-core", ["event emitter", "eventemitter", "event bus", "publish subscribe", "custom events"], {
    ...core,
    popularity: 55,
    description: {
      en: "The publish/subscribe model: Node's EventEmitter and the DOM's EventTarget, synchronous dispatch, once and removal during emit, the error event, leaks, and turning events into promises.",
      uk: "Модель публікації й підписки: EventEmitter у Node і EventTarget у DOM, синхронна доставка, once і видалення під час emit, подія error, витоки й перетворення подій на проміси.",
    },
  }),

  // ── Languages ───────────────────────────────────────────────────────────────
  s("python", "Python", "languages", ["python", "python3", "python 3", "пайтон"], { popularity: 90 }),
  s("java", "Java", "languages", ["java", "java 8", "java 11", "java 17", "java 21", "jvm"], { popularity: 85 }),
  s("csharp", "C#", "languages", ["c#", "csharp", "c sharp"], { popularity: 80 }),
  s("cpp", "C++", "languages", ["c++", "cpp", "c++17", "c++20", "stl"], { popularity: 65 }),
  s("c", "C", "languages", ["c language", "ansi c", "embedded c", "c programming"], { popularity: 40 }),
  s("go", "Go", "languages", ["golang"], { popularity: 70, caseSensitiveAliases: ["Go"] }),
  s("rust", "Rust", "languages", ["rustlang"], { popularity: 45, caseSensitiveAliases: ["Rust"] }),
  s("kotlin", "Kotlin", "languages", ["kotlin"], { popularity: 55 }),
  s("swift", "Swift", "languages", ["swift 5"], { popularity: 50, caseSensitiveAliases: ["Swift"] }),
  s("php", "PHP", "languages", ["php", "php 8", "php8"], { popularity: 65 }),
  s("ruby", "Ruby", "languages", ["ruby"], { popularity: 35 }),
  s("scala", "Scala", "languages", ["scala"], { popularity: 30 }),
  s("dart", "Dart", "languages", [], { popularity: 35, caseSensitiveAliases: ["Dart"] }),
  s("elixir", "Elixir", "languages", ["elixir"], { popularity: 15 }),
  s("r-lang", "R", "languages", ["r language", "r programming", "rstudio"], { popularity: 20 }),
  s("objective-c", "Objective-C", "languages", ["objective-c", "objective c", "objc"], { popularity: 15 }),
  s("bash", "Bash / Shell", "languages", ["bash", "shell scripting", "zsh", "powershell"], { popularity: 50 }),
  s("solidity", "Solidity", "languages", ["solidity"], { popularity: 15 }),
  s("haskell", "Haskell", "languages", ["haskell"], { popularity: 10 }),
  s("clojure", "Clojure", "languages", ["clojure", "clojurescript"], { popularity: 8 }),
  s("fsharp", "F#", "languages", ["f#", "fsharp"], { popularity: 8 }),
  s("lua", "Lua", "languages", ["lua"], { popularity: 10 }),
  s("perl", "Perl", "languages", ["perl"], { popularity: 8 }),
  s("groovy", "Groovy", "languages", ["groovy"], { popularity: 10 }),

  // ── Web platform ────────────────────────────────────────────────────────────
  s("web-components", "Web Components", "web-platform", ["web components", "custom elements", "shadow dom", "lit-element"], { popularity: 30 }),
  s("websockets", "WebSockets", "web-platform", ["websocket", "websockets", "socket.io", "server-sent events", "sse"], {
    codeable: true,
    popularity: 45,
    description: {
      en: "Real-time transports (WebSocket, SSE, polling), reconnection with backoff, message ordering, security and scaling.",
      uk: "Транспорти реального часу (WebSocket, SSE, опитування), перепідключення з наростанням затримки, порядок повідомлень, безпека й масштабування.",
    },
  }),
  s("pwa", "Progressive Web Apps", "web-platform", ["pwa", "progressive web app", "progressive web apps"], {
    popularity: 30,
    description: {
      en: "Web app manifest, service worker lifecycle and updates, caching strategies, offline support, install and push.",
      uk: "Маніфест вебзастосунку, життєвий цикл і оновлення service worker, стратегії кешування, офлайн-підтримка, встановлення й push.",
    },
  }),
  s("seo", "SEO", "web-platform", ["seo", "search engine optimization", "structured data"], { popularity: 35 }),
  s("canvas-webgl", "Canvas & WebGL", "web-platform", ["canvas", "webgl", "three.js", "threejs", "pixijs", "svg animation"], { popularity: 20 }),
  s("i18n", "Internationalisation", "web-platform", ["i18n", "internationalization", "internationalisation", "localization", "l10n"], { popularity: 25 }),
  s("graphql", "GraphQL", "web-platform", ["graphql", "apollo client", "apollo server", "apollo graphql"], {
    codeable: true,
    popularity: 55,
    description: {
      en: "Schemas and types, queries and mutations, resolvers, N+1 and DataLoader, errors and client caching.",
      uk: "Схеми й типи, запити й мутації, резолвери, N+1 і DataLoader, помилки й кешування на клієнті.",
    },
  }),
  s("grpc", "gRPC", "web-platform", ["grpc", "protobuf", "protocol buffers"], { popularity: 25 }),
  s("oauth", "OAuth & OpenID Connect", "security", ["oauth", "oauth2", "oauth 2.0", "openid connect", "oidc", "sso", "single sign-on"], { popularity: 40 }),
  s("jwt", "JWT", "security", ["jwt", "json web token", "json web tokens"], { popularity: 40 }),

  // ── Frontend frameworks & libraries ─────────────────────────────────────────
  s("vue", "Vue.js", "frontend-frameworks", ["vue", "vue.js", "vuejs", "vue 3", "vue 2", "composition api"], {
    codeable: true,
    popularity: 75,
    description: {
      en: "Reactivity with ref and reactive, computed and watchers, directives, props and emits, and the Composition API.",
      uk: "Реактивність через ref і reactive, computed і спостерігачі, директиви, props і emits та Composition API.",
    },
  }),
  s("angularjs", "AngularJS (1.x)", "frontend-frameworks", ["angularjs", "angular.js", "angular 1"], { popularity: 15 }),
  s("svelte", "Svelte", "frontend-frameworks", ["svelte", "sveltekit"], { popularity: 30 }),
  s("nextjs", "Next.js", "frontend-frameworks", ["next.js", "nextjs", "next js", "app router"], {
    codeable: true,
    popularity: 80,
    description: {
      en: "The React framework: App Router, Server and Client Components, data fetching, caching and Server Actions.",
      uk: "React-фреймворк: App Router, серверні й клієнтські компоненти, отримання даних, кешування та Server Actions.",
    },
  }),
  s("nuxt", "Nuxt", "frontend-frameworks", ["nuxt", "nuxt.js", "nuxtjs"], { popularity: 35 }),
  s("remix", "Remix", "frontend-frameworks", ["remix run", "remix.run"], { popularity: 15, caseSensitiveAliases: ["Remix"] }),
  s("gatsby", "Gatsby", "frontend-frameworks", ["gatsby", "gatsbyjs"], { popularity: 15 }),
  s("solidjs", "SolidJS", "frontend-frameworks", ["solidjs", "solid.js", "solid js"], { popularity: 12 }),
  s("astro", "Astro", "frontend-frameworks", ["astro.build"], { popularity: 15, caseSensitiveAliases: ["Astro"] }),
  s("jquery", "jQuery", "frontend-frameworks", ["jquery"], { popularity: 30 }),
  s("ember", "Ember.js", "frontend-frameworks", ["ember", "ember.js", "emberjs"], { popularity: 8 }),
  s("backbone", "Backbone.js", "frontend-frameworks", ["backbone.js", "backbonejs"], { popularity: 5 }),
  s("react-native", "React Native", "mobile", ["react native", "react-native", "expo"], { popularity: 60 }),
  s("electron", "Electron", "frontend-frameworks", ["electron", "electron.js"], { popularity: 20 }),
  s("ionic", "Ionic", "mobile", ["ionic", "capacitor"], { popularity: 15 }),
  s("storybook", "Storybook", "build-tooling", ["storybook"], { popularity: 35 }),
  s("react-router", "React Router", "frontend-frameworks", ["react router", "react-router"], { popularity: 45 }),
  s("tanstack-query", "TanStack Query", "state-and-data", ["react query", "react-query", "tanstack query", "tanstack"], { popularity: 45 }),
  s("swr", "SWR", "state-and-data", ["swr"], { popularity: 15 }),
  s("d3", "D3.js", "frontend-frameworks", ["d3", "d3.js", "d3js", "data visualization", "chart.js", "highcharts", "echarts"], { popularity: 25 }),
  s("material-ui", "Material UI", "styling", ["material ui", "material-ui", "mui", "angular material"], { popularity: 45 }),
  s("ant-design", "Ant Design", "styling", ["ant design", "antd"], { popularity: 20 }),
  s("chakra-ui", "Chakra UI", "styling", ["chakra ui", "chakra-ui"], { popularity: 12 }),
  s("shadcn-ui", "shadcn/ui", "styling", ["shadcn", "shadcn/ui", "radix ui", "radix"], { popularity: 25 }),
  s("primeng", "PrimeNG", "styling", ["primeng", "primereact", "primevue"], { popularity: 12 }),

  // ── State & data ────────────────────────────────────────────────────────────
  s("redux", "Redux", "state-and-data", ["redux", "redux toolkit", "rtk", "rtk query", "redux-saga", "redux saga", "redux-thunk"], {
    codeable: true,
    popularity: 75,
    description: {
      en: "A predictable store: actions, pure reducers, middleware and thunks, Redux Toolkit and memoised selectors.",
      uk: "Передбачуваний стор: дії, чисті редʼюсери, middleware і thunk, Redux Toolkit і мемоізовані селектори.",
    },
  }),
  s("mobx", "MobX", "state-and-data", ["mobx", "mobx-state-tree"], { popularity: 25 }),
  s("zustand", "Zustand", "state-and-data", ["zustand", "jotai", "recoil"], { popularity: 25 }),
  s("ngrx", "NgRx", "state-and-data", ["ngrx", "ngxs", "akita", "ngrx store", "ngrx signals"], { popularity: 45 }),
  s("angular-signals", "Angular Signals", "state-and-data", ["angular signals"], { popularity: 30 }),
  s("pinia", "Pinia / Vuex", "state-and-data", ["pinia", "vuex"], { popularity: 30 }),

  // ── Styling ─────────────────────────────────────────────────────────────────
  s("sass", "Sass / SCSS", "styling", ["sass", "scss", "less", "stylus", "postcss"], { popularity: 60 }),
  s("tailwind", "Tailwind CSS", "styling", ["tailwind", "tailwindcss", "tailwind css"], {
    popularity: 60,
    description: {
      en: "Utility-first styling, variants, theme tokens, how class scanning works, reuse and class merging.",
      uk: "Утилітарні стилі, варіанти, токени теми, як працює сканування класів, повторне використання й злиття класів.",
    },
  }),
  s("bootstrap", "Bootstrap", "styling", ["bootstrap", "bootstrap 5"], { popularity: 35 }),
  s("css-in-js", "CSS-in-JS", "styling", ["css-in-js", "styled-components", "styled components", "emotion", "css modules"], { popularity: 40 }),
  s("responsive-design", "Responsive Design", "styling", ["responsive design", "adaptive design", "mobile-first", "cross-browser", "кросбраузерна верстка", "адаптивна верстка", "pixel perfect"], {
    popularity: 55,
    description: {
      en: "Mobile-first media queries, fluid Grid/Flexbox layouts, container queries, responsive images and viewport units.",
      uk: "Медіазапити mobile-first, гнучкі макети на Grid/Flexbox, контейнерні запити, адаптивні зображення й одиниці вікна.",
    },
  }),
  s("animations", "CSS & UI Animations", "styling", ["css animations", "framer motion", "gsap", "web animations"], { popularity: 20 }),
  s("figma", "Figma", "practices", ["figma", "sketch", "zeplin", "adobe xd"], { popularity: 50 }),

  // ── Build tooling ───────────────────────────────────────────────────────────
  s("webpack", "Webpack", "build-tooling", ["webpack", "module federation"], { popularity: 55 }),
  s("vite", "Vite", "build-tooling", ["vite", "vitejs"], {
    popularity: 45,
    description: {
      en: "Native-ESM dev server and HMR, production builds, tree shaking, code splitting, caching and environment variables.",
      uk: "Dev-сервер на нативних ESM і HMR, продакшен-збірки, tree shaking, розбиття коду, кешування й змінні оточення.",
    },
  }),
  s("babel", "Babel", "build-tooling", ["babel", "babeljs"], { popularity: 25 }),
  s("esbuild", "esbuild / SWC", "build-tooling", ["esbuild", "swc", "rollup", "parcel", "turbopack"], { popularity: 20 }),
  s("eslint", "ESLint & Prettier", "build-tooling", ["eslint", "prettier", "tslint", "stylelint", "linting"], { popularity: 45 }),
  s("npm", "npm / Yarn / pnpm", "build-tooling", ["npm", "yarn", "pnpm", "package managers"], { popularity: 45 }),
  s("monorepo", "Monorepos", "build-tooling", ["monorepo", "nx", "turborepo", "lerna", "nx workspace"], { popularity: 30 }),
  s("micro-frontends", "Micro-frontends", "build-tooling", ["micro-frontends", "micro frontends", "microfrontends", "single-spa"], { popularity: 30 }),

  // ── CS fundamentals ─────────────────────────────────────────────────────────
  s("dynamic-programming", "Dynamic Programming", "cs-fundamentals", ["dynamic programming", "динамічне програмування"], {
    codeable: true,
    popularity: 35,
    description: {
      en: "Overlapping subproblems, memoisation and tabulation, coin change, knapsack and edit distance.",
      uk: "Підзадачі, що перекриваються, мемоізація й табуляція, розмін монет, рюкзак і відстань редагування.",
    },
  }),
  s("graphs", "Graph Algorithms", "cs-fundamentals", ["graph algorithms", "bfs", "dfs", "dijkstra", "topological sort"], {
    codeable: true,
    popularity: 30,
    description: {
      en: "BFS and DFS, cycle detection, topological sorting, connected components and Dijkstra's shortest paths.",
      uk: "BFS і DFS, виявлення циклів, топологічне сортування, компоненти зв'язності й найкоротші шляхи Дейкстри.",
    },
  }),
  s("oop", "Object-Oriented Programming", "cs-fundamentals", ["oop", "object-oriented programming", "object oriented programming", "ооп", "inheritance", "polymorphism", "encapsulation"], {
    codeable: true,
    popularity: 75,
    description: {
      en: "Encapsulation, inheritance, polymorphism and abstraction with classes, and when to prefer composition.",
      uk: "Інкапсуляція, успадкування, поліморфізм і абстракція з класами, і коли краще обрати композицію.",
    },
  }),
  s("functional-programming", "Functional Programming", "cs-fundamentals", ["functional programming", "pure functions", "currying"], {
    codeable: true,
    popularity: 40,
    description: {
      en: "Pure functions, immutability, higher-order functions, composition, currying and lazy sequences.",
      uk: "Чисті функції, незмінність, функції вищого порядку, композиція, каррування й ліниві послідовності.",
    },
  }),
  s("design-patterns", "Design Patterns", "cs-fundamentals", ["design patterns", "gof", "патерни проєктування"], {
    codeable: true,
    popularity: 65,
    description: {
      en: "Observer, Strategy, Decorator, Adapter, Proxy, Command, middleware chains and dependency injection in practice.",
      uk: "Observer, Strategy, Decorator, Adapter, Proxy, Command, ланцюжки middleware і впровадження залежностей на практиці.",
    },
  }),
  s("solid", "SOLID", "cs-fundamentals", ["solid principles", "yagni"], {
    codeable: true,
    popularity: 65,
    caseSensitiveAliases: ["SOLID", "DRY", "KISS"],
    description: {
      en: "Single responsibility, open/closed, Liskov substitution, interface segregation and dependency inversion in practice.",
      uk: "Єдиний обов'язок, відкритість/закритість, підстановка Лісков, розділення інтерфейсів та інверсія залежностей на практиці.",
    },
  }),
  s("system-design", "System Design", "cs-fundamentals", ["system design", "software architecture", "architecture design", "scalability", "high load", "high-load", "distributed systems"], {
    codeable: true,
    popularity: 60,
    description: {
      en: "Frontend system design interviews: requirements, architecture, data model, APIs, performance and resilience.",
      uk: "Співбесіди з проєктування фронтенду: вимоги, архітектура, модель даних, API, продуктивність і стійкість.",
    },
  }),
  s("concurrency", "Concurrency & Multithreading", "cs-fundamentals", ["concurrency", "multithreading", "parallelism", "багатопотоковість"], { popularity: 40 }),
  s("networking", "Networking Basics", "cs-fundamentals", ["tcp/ip", "tcp", "udp", "dns", "networking", "osi model"], { popularity: 35 }),
  s("operating-systems", "Operating Systems", "cs-fundamentals", ["operating systems", "memory management"], { popularity: 15 }),
  s("clean-code", "Clean Code", "practices", ["clean code", "clean architecture", "refactoring", "code quality", "чистий код"], { popularity: 55 }),

  // ── Backend ─────────────────────────────────────────────────────────────────
  s("express", "Express", "backend", ["express.js", "expressjs", "express js"], { popularity: 60, caseSensitiveAliases: ["Express"] }),
  s("nestjs", "NestJS", "backend", ["nestjs", "nest.js", "nest js"], { popularity: 55 }),
  s("fastify", "Fastify", "backend", ["fastify", "koa", "hapi"], { popularity: 20 }),
  s("deno", "Deno / Bun", "backend", ["deno"], { popularity: 10, caseSensitiveAliases: ["Bun"] }),
  s("django", "Django", "backend", ["django", "django rest framework", "drf"], { popularity: 50 }),
  s("flask", "Flask", "backend", ["flask"], { popularity: 30 }),
  s("fastapi", "FastAPI", "backend", ["fastapi"], { popularity: 35 }),
  s("spring", "Spring Boot", "backend", ["spring boot", "spring framework", "spring mvc", "spring cloud", "spring data"], { popularity: 60, caseSensitiveAliases: ["Spring"] }),
  s("hibernate", "Hibernate / JPA", "backend", ["hibernate", "jpa"], { popularity: 35 }),
  s("dotnet", ".NET", "backend", [".net", "dotnet", ".net core", "asp.net", "asp.net core", ".net 6", ".net 8"], { popularity: 65 }),
  s("entity-framework", "Entity Framework", "backend", ["entity framework", "ef core"], { popularity: 35 }),
  s("laravel", "Laravel", "backend", ["laravel"], { popularity: 35 }),
  s("symfony", "Symfony", "backend", ["symfony"], { popularity: 20 }),
  s("rails", "Ruby on Rails", "backend", ["ruby on rails", "ror"], { popularity: 20 }),
  s("gin", "Gin / Echo", "backend", ["gin framework", "gin-gonic", "echo framework"], { popularity: 15 }),
  s("microservices", "Microservices", "backend", ["microservices", "microservice architecture", "мікросервіси", "event-driven", "event driven architecture"], { popularity: 60 }),
  s("rest-api-design", "API Design", "backend", ["api design", "openapi", "swagger", "api development"], { popularity: 50 }),
  s("rabbitmq", "RabbitMQ", "backend", ["rabbitmq", "amqp"], { popularity: 35 }),
  s("kafka", "Kafka", "backend", ["kafka", "apache kafka"], { popularity: 45 }),
  s("message-queues", "Message Queues", "backend", ["message queue", "message queues", "message broker", "sqs", "sns", "pub/sub", "nats"], { popularity: 35 }),
  s("celery", "Celery", "backend", ["celery"], { popularity: 15 }),
  s("serverless", "Serverless", "devops-cloud", ["serverless", "aws lambda", "lambda functions", "azure functions", "cloud functions"], { popularity: 40 }),

  // ── Databases ───────────────────────────────────────────────────────────────
  s("sql", "SQL", "databases", ["sql", "t-sql", "pl/sql", "sql queries", "relational databases", "rdbms"], {
    codeable: true,
    popularity: 85,
    description: {
      en: "Queries, joins, NULL logic, aggregation, indexes, transactions and parameterised queries.",
      uk: "Запити, з'єднання, логіка NULL, агрегація, індекси, транзакції та параметризовані запити.",
    },
  }),
  s("postgresql", "PostgreSQL", "databases", ["postgresql", "postgres", "psql"], { popularity: 75 }),
  s("mysql", "MySQL", "databases", ["mysql", "mariadb"], { popularity: 55 }),
  s("mssql", "SQL Server", "databases", ["ms sql", "mssql", "sql server", "microsoft sql server"], { popularity: 40 }),
  s("oracle", "Oracle DB", "databases", ["oracle", "oracle db", "oracle database"], { popularity: 20 }),
  s("sqlite", "SQLite", "databases", ["sqlite"], { popularity: 15 }),
  s("mongodb", "MongoDB", "databases", ["mongodb", "mongo", "mongoose"], { popularity: 60 }),
  s("redis", "Redis", "databases", ["redis", "memcached"], { popularity: 55 }),
  s("elasticsearch", "Elasticsearch", "databases", ["elasticsearch", "elastic search", "opensearch", "elk"], { popularity: 40 }),
  s("cassandra", "Cassandra", "databases", ["cassandra", "scylladb"], { popularity: 10 }),
  s("dynamodb", "DynamoDB", "databases", ["dynamodb"], { popularity: 25 }),
  s("firebase", "Firebase", "databases", ["firebase", "firestore"], { popularity: 35 }),
  s("supabase", "Supabase", "databases", ["supabase"], { popularity: 15 }),
  s("prisma", "Prisma", "databases", ["prisma", "drizzle", "drizzle orm"], { popularity: 30 }),
  s("typeorm", "TypeORM / Sequelize", "databases", ["typeorm", "sequelize", "knex", "mikro-orm"], { popularity: 30 }),
  s("clickhouse", "ClickHouse", "databases", ["clickhouse"], { popularity: 15 }),
  s("data-warehouses", "Data Warehouses", "databases", ["snowflake", "bigquery", "redshift", "data warehouse"], { popularity: 20 }),
  s("nosql", "NoSQL", "databases", ["nosql", "document database", "key-value store"], { popularity: 35 }),

  // ── DevOps & cloud ──────────────────────────────────────────────────────────
  s("docker", "Docker", "devops-cloud", ["docker", "docker compose", "docker-compose", "containers", "containerization"], { popularity: 80 }),
  s("kubernetes", "Kubernetes", "devops-cloud", ["kubernetes", "k8s", "eks", "aks", "gke", "openshift"], { popularity: 60 }),
  s("helm", "Helm", "devops-cloud", ["helm", "helm charts"], { popularity: 25 }),
  s("terraform", "Terraform", "devops-cloud", ["terraform", "infrastructure as code", "iac", "pulumi", "cloudformation"], { popularity: 45 }),
  s("ansible", "Ansible", "devops-cloud", ["ansible", "chef", "puppet"], { popularity: 25 }),
  s("ci-cd", "CI/CD", "devops-cloud", ["ci/cd", "ci cd", "continuous integration", "continuous delivery", "continuous deployment"], { popularity: 75 }),
  s("github-actions", "GitHub Actions", "devops-cloud", ["github actions"], { popularity: 40 }),
  s("gitlab-ci", "GitLab CI", "devops-cloud", ["gitlab ci", "gitlab-ci", "gitlab ci/cd"], { popularity: 35 }),
  s("jenkins", "Jenkins", "devops-cloud", ["jenkins", "teamcity", "circleci", "travis ci", "bamboo"], { popularity: 35 }),
  s("aws", "AWS", "devops-cloud", ["aws", "amazon web services", "ec2", "s3", "cloudfront", "ecs", "rds"], { popularity: 80 }),
  s("azure", "Azure", "devops-cloud", ["azure", "microsoft azure", "azure devops"], { popularity: 55 }),
  s("gcp", "Google Cloud", "devops-cloud", ["gcp", "google cloud", "google cloud platform"], { popularity: 45 }),
  s("vercel", "Vercel / Netlify", "devops-cloud", ["vercel", "netlify", "cloudflare pages", "cloudflare workers"], { popularity: 25 }),
  s("nginx", "Nginx", "devops-cloud", ["nginx", "apache http server", "reverse proxy", "load balancer"], { popularity: 40 }),
  s("linux", "Linux", "devops-cloud", ["linux", "unix", "ubuntu", "debian", "centos"], { popularity: 70 }),
  s("monitoring", "Monitoring & Observability", "devops-cloud", ["prometheus", "grafana", "datadog", "new relic", "sentry", "observability", "monitoring", "opentelemetry"], { popularity: 45 }),
  s("logging", "Logging", "devops-cloud", ["logging", "kibana", "logstash", "splunk"], { popularity: 25 }),
  s("argo-cd", "Argo CD / GitOps", "devops-cloud", ["argo cd", "argocd", "gitops", "flux cd"], { popularity: 15 }),
  s("cdn", "CDN & Caching", "devops-cloud", ["cdn", "edge caching", "cloudflare", "caching strategies"], { popularity: 30 }),

  // ── Testing ─────────────────────────────────────────────────────────────────
  s("jest", "Jest", "testing", ["jest"], { popularity: 70 }),
  s("vitest", "Vitest", "testing", ["vitest"], { popularity: 30 }),
  s("mocha", "Mocha / Chai", "testing", ["mocha", "chai", "sinon"], { popularity: 20 }),
  s("jasmine-karma", "Jasmine / Karma", "testing", ["jasmine", "karma"], { popularity: 30 }),
  s("cypress", "Cypress", "testing", ["cypress"], { popularity: 50 }),
  s("playwright", "Playwright", "testing", ["playwright"], {
    popularity: 45,
    description: {
      en: "End-to-end testing: locators, auto-waiting and web-first assertions, auth state, network mocking and flaky tests.",
      uk: "Наскрізне тестування: локатори, автоочікування й web-first перевірки, стан автентифікації, імітація мережі й нестабільні тести.",
    },
  }),
  s("selenium", "Selenium", "testing", ["selenium", "webdriver", "webdriverio", "selenide"], { popularity: 40 }),
  s("e2e-testing", "E2E Testing", "testing", ["e2e", "end-to-end testing", "end to end testing", "e2e tests", "integration testing", "integration tests"], { popularity: 50 }),
  s("tdd", "TDD / BDD", "testing", ["tdd", "test-driven development", "bdd", "cucumber", "gherkin"], { popularity: 40 }),
  s("api-testing", "API Testing", "testing", ["postman", "api testing", "rest assured", "insomnia", "soapui"], { popularity: 40 }),
  s("load-testing", "Load Testing", "testing", ["load testing", "performance testing", "jmeter", "k6", "gatling", "locust"], { popularity: 20 }),
  s("manual-qa", "Manual QA", "testing", ["manual testing", "manual qa", "test cases", "test design", "регресійне тестування", "bug reports"], { popularity: 40 }),
  s("pytest", "pytest", "testing", ["pytest", "unittest"], { popularity: 25 }),
  s("junit", "JUnit / TestNG", "testing", ["junit", "testng", "mockito"], { popularity: 30 }),

  // ── Mobile ──────────────────────────────────────────────────────────────────
  s("flutter", "Flutter", "mobile", ["flutter"], { popularity: 45 }),
  s("ios", "iOS Development", "mobile", ["ios", "ios development", "uikit", "xcode", "cocoapods"], { popularity: 45 }),
  s("swiftui", "SwiftUI", "mobile", ["swiftui"], { popularity: 30 }),
  s("android", "Android Development", "mobile", ["android", "android sdk", "android development"], { popularity: 50 }),
  s("jetpack-compose", "Jetpack Compose", "mobile", ["jetpack compose", "jetpack", "compose ui"], { popularity: 30 }),
  s("xamarin", "Xamarin / MAUI", "mobile", ["xamarin", ".net maui", "maui"], { popularity: 10 }),

  // ── Data & ML ───────────────────────────────────────────────────────────────
  s("machine-learning", "Machine Learning", "data-ml", ["machine learning", "deep learning", "neural networks", "машинне навчання"], { popularity: 45, caseSensitiveAliases: ["ML"] }),
  s("llm", "LLMs & Generative AI", "data-ml", ["llm", "llms", "generative ai", "genai", "openai", "langchain", "rag", "prompt engineering", "chatgpt"], { popularity: 45 }),
  s("pandas", "pandas / NumPy", "data-ml", ["pandas", "numpy", "scipy"], { popularity: 35 }),
  s("pytorch", "PyTorch", "data-ml", ["pytorch"], { popularity: 25 }),
  s("tensorflow", "TensorFlow", "data-ml", ["tensorflow", "keras"], { popularity: 25 }),
  s("scikit-learn", "scikit-learn", "data-ml", ["scikit-learn", "sklearn"], { popularity: 20 }),
  s("spark", "Apache Spark", "data-ml", ["spark", "apache spark", "pyspark", "databricks", "hadoop"], { popularity: 25 }),
  s("airflow", "Airflow / ETL", "data-ml", ["airflow", "apache airflow", "etl", "elt", "dbt", "data pipelines"], { popularity: 25 }),
  s("bi-tools", "BI Tools", "data-ml", ["power bi", "tableau", "looker", "metabase"], { popularity: 20 }),
  s("data-analysis", "Data Analysis", "data-ml", ["data analysis", "data analytics", "статистика", "statistics", "a/b testing"], { popularity: 30 }),
  s("computer-vision", "Computer Vision", "data-ml", ["computer vision", "opencv", "image processing"], { popularity: 15 }),
  s("nlp", "NLP", "data-ml", ["nlp", "natural language processing", "spacy", "hugging face", "transformers"], { popularity: 15 }),

  // ── Security ────────────────────────────────────────────────────────────────
  s("web-security", "Web Security", "security", ["web security", "owasp", "xss", "csrf", "sql injection", "content security policy", "csp", "безпека"], {
    codeable: true,
    popularity: 45,
    description: {
      en: "XSS and safe output, CSP, CSRF and cookies, CORS, token storage and other frontend security risks.",
      uk: "XSS і безпечний вивід, CSP, CSRF і cookie, CORS, зберігання токенів та інші ризики безпеки фронтенду.",
    },
  }),
  s("auth", "Authentication & Authorisation", "security", ["authentication", "authorization", "authorisation", "rbac", "access control", "автентифікація", "авторизація"], {
    codeable: true,
    popularity: 50,
    description: {
      en: "Sessions vs JWTs, token storage and refresh, OAuth/OIDC with PKCE, RBAC/ABAC and IDOR prevention.",
      uk: "Сесії проти JWT, зберігання й оновлення токенів, OAuth/OIDC з PKCE, RBAC/ABAC і запобігання IDOR.",
    },
  }),
  s("cryptography", "Cryptography Basics", "security", ["cryptography", "encryption", "hashing", "tls", "ssl", "pki"], { popularity: 20 }),
  s("penetration-testing", "Penetration Testing", "security", ["penetration testing", "pentest", "pentesting", "burp suite"], { popularity: 10 }),

  // ── Practices ───────────────────────────────────────────────────────────────
  s("agile", "Agile / Scrum", "practices", ["agile", "scrum", "kanban", "sprint planning"], { popularity: 70 }),
  s("code-review", "Code Review", "practices", ["code review", "code reviews", "pull requests", "код рев'ю", "code-review"], { popularity: 50 }),
  s("jira", "Jira & Confluence", "practices", ["jira", "confluence", "youtrack", "trello", "clickup"], { popularity: 45 }),
  s("github", "GitHub / GitLab / Bitbucket", "practices", ["github", "gitlab", "bitbucket"], { popularity: 50 }),
  s("english", "English", "practices", ["english", "upper-intermediate", "upper intermediate", "intermediate english", "fluent english", "spoken english", "англійська", "англійської", "англійською", "англійська мова"], { popularity: 85 }),
  s("mentoring", "Mentoring & Leadership", "practices", ["mentoring", "mentorship", "team lead", "tech lead", "leadership", "менторинг"], { popularity: 30 }),
  s("documentation", "Technical Writing", "practices", ["technical documentation", "technical writing"], { popularity: 20 }),
  s("ux-ui", "UX/UI Fundamentals", "practices", ["ux", "ui/ux", "ux/ui", "user experience", "usability", "design systems", "design system"], { popularity: 40 }),
]);

/** Skills that have lectures and exercises (in the content/ folder). */
export const CORE_SKILL_SLUGS = [
  "javascript",
  "typescript",
  "react",
  "angular",
  "html",
  "css",
  "dom-events",
  "async-javascript",
  "closures-scope",
  "es-modules",
  "arrays-strings",
  "searching-algorithms",
  "sorting-algorithms",
  "recursion",
  "data-structures",
  "big-o",
  "browser-apis",
  "http-rest",
  "web-performance",
  "web-accessibility",
  "unit-testing",
  "git",
  "rxjs",
  "state-management",
  "nodejs",
  "redux",
  "oop",
  "design-patterns",
  "web-security",
  "nextjs",
  "event-loop",
  "type-coercion",
  "sql",
  "graphql",
  "solid",
  "functional-programming",
  "dynamic-programming",
  "graphs",
  "vue",
  "regex",
  "web-workers",
  "responsive-design",
  "tailwind",
  "vite",
  "websockets",
  "pwa",
  "system-design",
  "auth",
  "playwright",
  "this-prototypes",
  "js-values-grammar",
  "iterators-generators",
  "js-metaprogramming",
  "modern-js-syntax",
  "js-classes",
  "js-collections",
  "js-engine-performance",
  "promise-internals",
  "error-handling",
  "scope-strict-mode",
  "async-cancellation",
  "unicode-strings",
  "transpiling-polyfills",
  "main-thread-scheduling",
  "immutability-copying",
  "dates-time",
  "json-serialization",
  "module-pattern",
  "event-emitters",
] as const;
