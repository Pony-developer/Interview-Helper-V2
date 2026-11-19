import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "node-blocking",
    ["nodejs"],
    1,
    60,
    ["Blocking the event loop", "Блокування циклу подій"],
    ["An Express route runs a CPU-heavy loop for 2 seconds. What happens to other incoming requests meanwhile?", "Маршрут Express виконує CPU-важкий цикл 2 секунди. Що в цей час відбувається з іншими вхідними запитами?"],
    [
      ["They wait: the single JavaScript thread is busy", "Вони чекають: єдиний потік JavaScript зайнятий"],
      ["Node automatically runs them on other threads", "Node автоматично виконує їх в інших потоках"],
      ["They are rejected with 503", "Їх відхиляють з кодом 503"],
      ["Nothing, async/await prevents blocking", "Нічого, async/await запобігає блокуванню"],
    ],
    "a",
    [
      "JavaScript callbacks run on one thread, so a long synchronous computation stalls every other request and timer. Move CPU work to worker threads, another service or a job queue.",
      "Колбеки JavaScript виконуються в одному потоці, тож довге синхронне обчислення зупиняє всі інші запити й таймери. Виносьте CPU-роботу у worker threads, інший сервіс або чергу задач.",
    ],
  ),
  quiz(
    "node-microtask-order",
    ["nodejs", w("async-javascript")],
    3,
    120,
    ["nextTick and promises", "nextTick і проміси"],
    ["What do the first two lines printed by this script say?", "Що виведуть перші два рядки цього скрипта?"],
    [
      ["`nextTick` then `promise`", "`nextTick`, потім `promise`"],
      ["`promise` then `nextTick`", "`promise`, потім `nextTick`"],
      ["`timeout` then `nextTick`", "`timeout`, потім `nextTick`"],
      ["The order is random", "Порядок випадковий"],
    ],
    "a",
    [
      "After the current operation completes, Node drains the `process.nextTick` queue first, then the promise microtask queue, and only then moves on to timers and `setImmediate` (whose relative order in the main module can vary).",
      "Після завершення поточної операції Node спершу вичерпує чергу `process.nextTick`, потім чергу мікрозадач промісів, і лише тоді переходить до таймерів і `setImmediate` (їхній взаємний порядок у головному модулі може відрізнятися).",
    ],
    { code: "setTimeout(() => console.log(\"timeout\"), 0);\nsetImmediate(() => console.log(\"immediate\"));\nPromise.resolve().then(() => console.log(\"promise\"));\nprocess.nextTick(() => console.log(\"nextTick\"));", codeLanguage: "js" },
  ),
  quiz(
    "node-streams",
    ["nodejs"],
    2,
    90,
    ["Large files", "Великі файли"],
    ["You need to gzip a 5 GB log file on a server with 1 GB of RAM. What's the right approach?", "Треба стиснути gzip-ом файл журналу на 5 ГБ на сервері з 1 ГБ пам'яті. Який підхід правильний?"],
    [
      ["Stream it: `pipeline(createReadStream, createGzip(), createWriteStream)`", "Обробити потоково: `pipeline(createReadStream, createGzip(), createWriteStream)`"],
      ["`fs.readFile` the whole file, then `zlib.gzipSync`", "Прочитати весь файл через `fs.readFile`, потім `zlib.gzipSync`"],
      ["Split it into 5 `readFileSync` calls", "Розбити на 5 викликів `readFileSync`"],
      ["Increase the Node heap to 6 GB", "Збільшити купу Node до 6 ГБ"],
    ],
    "a",
    [
      "Streams process chunks with constant memory, and `pipeline` handles backpressure and error propagation. Reading the whole file would exceed memory, and synchronous zlib would block the event loop.",
      "Потоки обробляють частини даних зі сталим обсягом пам'яті, а `pipeline` обробляє зворотний тиск і передає помилки. Читання всього файлу перевищило б пам'ять, а синхронний zlib заблокував би цикл подій.",
    ],
  ),
  quiz(
    "node-unhandled-rejection",
    ["nodejs"],
    3,
    120,
    ["Unhandled rejections", "Необроблені відхилення"],
    ["In current Node.js versions, what happens by default when a promise rejects and nobody handles it?", "Що за замовчуванням відбувається в сучасних версіях Node.js, коли проміс відхиляється й ніхто цього не обробляє?"],
    [
      ["The process logs the error and exits with a non-zero code", "Процес записує помилку в журнал і завершується з ненульовим кодом"],
      ["Nothing, the rejection is silently ignored", "Нічого, відхилення тихо ігнорується"],
      ["The promise is retried automatically", "Проміс автоматично повторюється"],
      ["Only a deprecation warning is printed", "Друкується лише попередження про застарілість"],
    ],
    "a",
    [
      "Since Node 15 the default `--unhandled-rejections=throw` mode turns an unhandled rejection into an uncaught exception, which crashes the process. Always `await` inside `try/catch` or attach `.catch`.",
      "Починаючи з Node 15 типовий режим `--unhandled-rejections=throw` перетворює необроблене відхилення на неперехоплений виняток, що завершує процес. Завжди використовуйте `await` усередині `try/catch` або додавайте `.catch`.",
    ],
  ),
  quiz(
    "node-scaling-cores",
    ["nodejs", w("system-design")],
    4,
    150,
    ["Using all cores", "Використання всіх ядер"],
    ["A Node API runs on an 8-core machine but CPU usage never exceeds ~12%. What's the standard way to use the whole machine?", "Node API працює на 8-ядерній машині, але завантаження CPU не перевищує ~12%. Який стандартний спосіб використати всю машину?"],
    [
      ["Run several stateless processes (cluster, PM2 or containers) behind a load balancer", "Запустити кілька процесів без стану (cluster, PM2 або контейнери) за балансувальником навантаження"],
      ["Set `UV_THREADPOOL_SIZE=8`", "Встановити `UV_THREADPOOL_SIZE=8`"],
      ["Use more `async` functions", "Використати більше `async`-функцій"],
      ["Switch to `setImmediate` everywhere", "Скрізь перейти на `setImmediate`"],
    ],
    "a",
    [
      "Each Node process runs JavaScript on one core, so you scale horizontally with multiple processes. Keep them stateless (sessions and caches in Redis or a database) so any instance can serve any request. The libuv thread pool size only affects certain I/O and crypto work.",
      "Кожен процес Node виконує JavaScript на одному ядрі, тож масштабуються горизонтально, кількома процесами. Тримайте їх без стану (сесії й кеші в Redis чи базі даних), щоб будь-який екземпляр міг обслужити будь-який запит. Розмір пулу потоків libuv впливає лише на певні операції вводу-виводу й криптографії.",
    ],
  ),
]);
