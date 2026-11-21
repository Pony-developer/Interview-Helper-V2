import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

const lines = (...l: string[]) => l.join("\n");

export default defineTasks([
  quiz(
    "promise-finally-passthrough",
    ["promise-internals", w("event-loop", 0.4)],
    2,
    90,
    ["What finally passes through", "Що передає finally далі"],
    ["What does `.finally(cb)` do with the value or error of the promise it is attached to?", "Що робить `.finally(cb)` зі значенням або помилкою промісу, до якого його прикріплено?"],
    [
      ["It always replaces the value with `undefined`", "Завжди замінює значення на `undefined`"],
      ["It passes the original value or error on to the next handler, unless `cb` throws or returns a rejected promise", "Передає початкове значення або помилку далі, якщо тільки `cb` не викине помилку або не поверне відхилений проміс"],
      ["It runs `cb` only when the promise fulfills", "Запускає `cb` лише коли проміс виконано успішно"],
      ["It turns a rejection into a fulfilled promise", "Перетворює відхилення на успішно виконаний проміс"],
    ],
    "b",
    [
      "`finally` is for cleanup. Its callback receives no argument and its return value is ignored, so the settled value or error flows through unchanged. The exceptions are a thrown error or a rejected promise returned from the callback, which replaces the outcome.",
      "`finally` призначений для очищення. Його колбек не отримує аргументів, а результат ігнорується, тож завершене значення або помилка передаються далі без змін. Винятки: помилка, що викинута в колбеку, або відхилений проміс, що ним повернено, замінюють результат.",
    ],
  ),

  quiz(
    "promise-then-non-function-passthrough",
    ["promise-internals"],
    1,
    60,
    ["then with a non-function argument", "then з аргументом, що не є функцією"],
    ["What does this log?", "Що виведе цей код?"],
    [
      ["undefined", "undefined"],
      ["1", "1"],
      ["A TypeError, because null is not a function", "TypeError, бо null не є функцією"],
      ["Nothing, the chain never settles", "Нічого, ланцюжок ніколи не завершується"],
    ],
    "b",
    [
      "When `then` receives something that is not a function, it is ignored and the value passes through to the next link. So the chain prints 1. This is why `.then(null)` is harmless but also useless.",
      "Коли `then` отримує не функцію, він ігнорується, а значення передається далі по ланцюжку. Тому ланцюжок виводить 1. Тому `.then(null)` безпечний, але й марний.",
    ],
    { code: "Promise.resolve(1).then(null).then((v) => console.log(v));", codeLanguage: "js" },
  ),

  quiz(
    "promise-rejection-skips-then",
    ["promise-internals", w("error-handling", 0.4)],
    1,
    60,
    ["Which callback runs after a rejection", "Який колбек виконається після відхилення"],
    ["What does this log?", "Що виведе цей код?"],
    [
      ["A", "A"],
      ["B", "B"],
      ["A and then B", "A, потім B"],
      ["Nothing", "Нічого"],
    ],
    "b",
    [
      "A rejection skips every `then` callback until it reaches a handler for errors (`catch`, or the second argument of `then`). Here the `then` callback is skipped and `catch` runs, so only B is printed.",
      "Відхилення пропускає кожен колбек `then`, доки не дійде до обробника помилок (`catch` або другого аргументу `then`). Тут колбек `then` пропускається, а виконується `catch`, тож виводиться лише B.",
    ],
    { code: lines(
      "Promise.reject(new Error(\"boom\"))",
      "  .then(() => console.log(\"A\"))",
      "  .catch(() => console.log(\"B\"));",
    ), codeLanguage: "js" },
  ),

  quiz(
    "promise-resolve-with-promise-timing",
    ["promise-internals", w("event-loop", 0.5)],
    3,
    120,
    ["Resolving with another promise adds ticks", "Резолв іншим промісом додає тіки"],
    ["In which order does this Node.js script print the numbers?", "У якому порядку цей скрипт Node.js виводить числа?"],
    [
      ["1, 2, 3, 4, 5", "1, 2, 3, 4, 5"],
      ["1, 3, 2, 4, 5", "1, 3, 2, 4, 5"],
      ["1, 3, 4, 2, 5", "1, 3, 4, 2, 5"],
      ["2, 1, 3, 4, 5", "2, 1, 3, 4, 5"],
    ],
    "c",
    [
      "Resolving a promise with another promise is not instant. Adopting the inner promise takes a job to call its `then`, and then one more job to settle the outer promise. The chain of three `then` calls advances one step per job, so 2 lands after 4. Each `then` is a separate microtask; the exact order depends on when each is queued, which is why interviewers use this case.",
      "Резолв промісу іншим промісом не відбувається миттєво. Перейняття внутрішнього промісу займає одну чергову задачу на виклик його `then`, а потім ще одну, щоб завершити зовнішній проміс. Ланцюжок із трьох `then` просувається по одному кроку за задачу, тож 2 з'являється після 4. Кожен `then` це окрема мікрозадача, і порядок залежить від того, коли вона ставиться в чергу.",
    ],
    { code: lines(
      "Promise.resolve().then(() => console.log(\"1\"));",
      "new Promise((resolve) => resolve(Promise.resolve())).then(() => console.log(\"2\"));",
      "Promise.resolve()",
      "  .then(() => console.log(\"3\"))",
      "  .then(() => console.log(\"4\"))",
      "  .then(() => console.log(\"5\"));",
    ), codeLanguage: "js" },
  ),

  quiz(
    "node-nexttick-vs-promise",
    ["event-loop", "nodejs"],
    2,
    90,
    ["process.nextTick against a promise", "process.nextTick проти промісу"],
    ["In Node.js, which line prints first?", "У Node.js яка строка виводиться першою?"],
    [
      ["promise", "promise"],
      ["tick", "tick"],
      ["They always alternate, so the order is random", "Вони завжди чергуються, тож порядок випадковий"],
      ["It depends on the speed of the machine", "Залежить від швидкості комп'ютера"],
    ],
    "b",
    [
      "Node drains the `process.nextTick` queue before the promise microtask queue, and both run after the current synchronous script. So `tick` prints first, every time, when both are scheduled from the main module. `nextTick` is Node-only, which is why it does not exist in the browser.",
      "Node спершу виконує чергу `process.nextTick`, а вже потім мікрозадачі промісів. Обидві виконуються після поточного синхронного скрипта. Тому `tick` виводиться першим завжди, якщо обидва поставлено в чергу з головного модуля. `nextTick` існує лише в Node, тому в браузері його немає.",
    ],
    { code: lines(
      "Promise.resolve().then(() => console.log(\"promise\"));",
      "process.nextTick(() => console.log(\"tick\"));",
    ), codeLanguage: "js" },
  ),

  quiz(
    "queuemicrotask-order",
    ["event-loop"],
    2,
    90,
    ["queueMicrotask in the queue", "queueMicrotask у черзі"],
    ["Which output is correct for this script?", "Який вивід правильний для цього скрипта?"],
    [
      ["s, t, m, p", "s, t, m, p"],
      ["s, m, p, t", "s, m, p, t"],
      ["s, p, m, t", "s, p, m, t"],
      ["m, s, p, t", "m, s, p, t"],
    ],
    "b",
    [
      "`s` is synchronous, so it prints first. `queueMicrotask` and the promise callback are both microtasks, and they run in the order they were queued, so `m` comes before `p`. The timer is a macrotask and runs last. `queueMicrotask` is a direct way to add a microtask without wrapping a promise.",
      "`s` синхронний, тож виводиться першим. `queueMicrotask` і колбек промісу це мікрозадачі, які виконуються в порядку постановки в чергу, тому `m` раніше за `p`. Таймер це макрозадача і йде останнім. `queueMicrotask` це прямий спосіб додати мікрозадачу без обгортки в проміс.",
    ],
    { code: lines(
      "console.log(\"s\");",
      "setTimeout(() => console.log(\"t\"), 0);",
      "queueMicrotask(() => console.log(\"m\"));",
      "Promise.resolve().then(() => console.log(\"p\"));",
    ), codeLanguage: "js" },
  ),
]);
