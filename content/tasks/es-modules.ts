import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "esm-live-binding",
    ["es-modules"],
    2,
    90,
    ["Live bindings", "Живі прив'язки"],
    ["What does `main.js` log?", "Що виведе `main.js`?"],
    [
      ["`0`", "`0`"],
      ["`1`", "`1`"],
      ["`undefined`", "`undefined`"],
      ["It throws", "Кидає помилку"],
    ],
    "b",
    [
      "ES module imports are live, read-only bindings to the exporting module's variables. After `inc()` runs, `count` in `main.js` reflects the new value, 1. CommonJS would have copied the value 0.",
      "Імпорти ES-модулів є живими прив'язками лише для читання до змінних модуля, що експортує. Після `inc()` змінна `count` у `main.js` показує нове значення 1. CommonJS скопіював би значення 0.",
    ],
    { code: "// counter.js\nexport let count = 0;\nexport function inc() { count++; }\n\n// main.js\nimport { count, inc } from \"./counter.js\";\ninc();\nconsole.log(count);", codeLanguage: "js" },
  ),
  quiz(
    "esm-tree-shaking",
    ["es-modules", w("web-performance")],
    2,
    90,
    ["Why tree-shaking needs ESM", "Чому tree-shaking потребує ESM"],
    ["Why can bundlers tree-shake ES modules more reliably than CommonJS?", "Чому збирачі надійніше прибирають невикористаний код з ES-модулів, ніж із CommonJS?"],
    [
      ["Imports and exports are static, so usage is known without running code", "Імпорти й експорти статичні, тож використання відоме без запуску коду"],
      ["ES modules are always smaller", "ES-модулі завжди менші"],
      ["CommonJS can't export functions", "CommonJS не може експортувати функції"],
      ["Browsers remove unused exports at runtime", "Браузери прибирають невикористані експорти під час виконання"],
    ],
    "a",
    [
      "`import`/`export` must be top-level with literal specifiers, so a bundler can build the dependency graph statically and drop unused exports. `require` can be called conditionally with computed paths, and `module.exports` can be mutated at runtime.",
      "`import`/`export` мають бути на верхньому рівні з літеральними шляхами, тож збирач може статично побудувати граф залежностей і прибрати невикористані експорти. `require` можна викликати умовно з обчисленими шляхами, а `module.exports` змінювати під час виконання.",
    ],
  ),
  quiz(
    "esm-evaluate-once",
    ["es-modules"],
    3,
    90,
    ["Module evaluation", "Виконання модуля"],
    ["`config.js` logs \"loading config\" at the top level. Three different modules import it. How many times is it logged?", "`config.js` на верхньому рівні виводить \"loading config\". Три різні модулі його імпортують. Скільки разів це буде виведено?"],
    [
      ["Once", "Один раз"],
      ["Three times", "Тричі"],
      ["Zero times until a function is called", "Жодного разу, доки не викликано функцію"],
      ["It depends on import order", "Залежить від порядку імпортів"],
    ],
    "a",
    [
      "A module is evaluated once per module graph (realm), and every importer receives the same module instance. That's why module-level state behaves like a singleton.",
      "Модуль виконується один раз на граф модулів (realm), і кожен імпортер отримує той самий екземпляр. Тому стан на рівні модуля поводиться як синглтон.",
    ],
  ),
  quiz(
    "esm-dynamic-import",
    ["es-modules", w("web-performance")],
    3,
    120,
    ["Dynamic import", "Динамічний імпорт"],
    ["What does `import(\"./editor.js\")` return, and why use it?", "Що повертає `import(\"./editor.js\")` і навіщо його використовувати?"],
    [
      ["A promise of the module namespace; it enables loading code on demand (code splitting)", "Проміс простору імен модуля; дозволяє завантажувати код на вимогу (розділення коду)"],
      ["The default export synchronously", "Типовий експорт, синхронно"],
      ["A CommonJS `module.exports` object", "Об'єкт `module.exports` у стилі CommonJS"],
      ["Nothing; it's only valid in Node.js", "Нічого; він працює лише в Node.js"],
    ],
    "a",
    [
      "`import()` returns a promise for the module namespace object (`{ default, ...named }`). Bundlers turn it into a separate chunk, so heavy features like editors or charts load only when needed.",
      "`import()` повертає проміс об'єкта простору імен модуля (`{ default, ...named }`). Збирачі виносять його в окремий чанк, тож важкі функції, як-от редактори чи графіки, завантажуються лише за потреби.",
    ],
  ),
  quiz(
    "esm-circular",
    ["es-modules"],
    4,
    150,
    ["Circular imports", "Циклічні імпорти"],
    ["`a.js` imports `b.js`, and `b.js` imports `a.js`. `b.js` reads a `const` from `a.js` at its top level. What typically happens when you load `a.js` first?", "`a.js` імпортує `b.js`, а `b.js` імпортує `a.js`. `b.js` на верхньому рівні читає `const` з `a.js`. Що зазвичай станеться, якщо першим завантажити `a.js`?"],
    [
      ["Everything works because modules are cached", "Усе працює, бо модулі кешуються"],
      ["`b.js` runs first and hits a ReferenceError (TDZ), because `a.js` hasn't initialised its `const` yet", "`b.js` виконується першим і отримує ReferenceError (TDZ), бо `a.js` ще не ініціалізував свій `const`"],
      ["The bundler duplicates both modules", "Збирач дублює обидва модулі"],
      ["Node.js refuses to start", "Node.js відмовляється запускатися"],
    ],
    "b",
    [
      "Dependencies are evaluated before the importer, so `b.js` runs while `a.js` is still uninitialised. Reading a `let`/`const` export at that moment throws. Fix it by moving the shared value into a third module, or by only accessing it lazily inside functions.",
      "Залежності виконуються раніше за імпортера, тож `b.js` працює, поки `a.js` ще не ініціалізовано. Читання експорту `let`/`const` у цей момент кидає помилку. Виправлення: винесіть спільне значення в третій модуль або звертайтеся до нього ліниво, лише всередині функцій.",
    ],
  ),
]);
