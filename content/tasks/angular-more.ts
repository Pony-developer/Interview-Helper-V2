import { defineTasks } from "@/lib/content/schema";
import { quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "ng-computed-signal",
    ["angular"],
    2,
    60,
    ["Computed signals", "Обчислювані сигнали"],
    ["What does the last line log?", "Що виведе останній рядок?"],
    [
      ["`2`", "`2`"],
      ["`10`", "`10`"],
      ["`undefined`", "`undefined`"],
      ["It throws: computed signals are read-only", "Кидає помилку: обчислювані сигнали лише для читання"],
    ],
    "b",
    [
      "`computed` tracks the signals it reads. When `count` changes, `double` is marked stale and recomputes lazily the next time it's read, so it returns 10. Computed signals are read-only, but reading them is always allowed.",
      "`computed` відстежує сигнали, які читає. Коли `count` змінюється, `double` позначається застарілим і ліниво перераховується при наступному читанні, тож повертає 10. Обчислювані сигнали лише для читання, але читати їх можна завжди.",
    ],
    { code: "const count = signal(1);\nconst double = computed(() => count() * 2);\ncount.set(5);\nconsole.log(double());" },
  ),
  quiz(
    "ng-outside-zone",
    ["angular"],
    4,
    90,
    ["Updates from outside Angular", "Оновлення ззовні Angular"],
    ["A chart library calls your callback, which sets `this.selected = point`, but the template doesn't update until you click somewhere. The app uses zone.js. What is the most likely cause and fix?", "Бібліотека графіків викликає ваш колбек, що встановлює `this.selected = point`, але шаблон оновлюється лише після кліку деінде. Застосунок використовує zone.js. Яка найімовірніша причина й виправлення?"],
    [
      ["The callback runs outside the Angular zone; wrap the update in `ngZone.run()` (or store it in a signal)", "Колбек виконується поза зоною Angular; обгорніть оновлення в `ngZone.run()` (або збережіть у сигнал)"],
      ["`selected` must be declared `public`", "`selected` має бути оголошено `public`"],
      ["Add `trackBy` to the template's loop", "Додайте `trackBy` до циклу в шаблоні"],
      ["Call `ngOnInit()` again after the update", "Викличте `ngOnInit()` ще раз після оновлення"],
    ],
    "a",
    [
      "zone.js triggers change detection when async work that started inside the Angular zone finishes. Libraries initialised outside the zone (often on purpose, with `runOutsideAngular`, for performance) call back without Angular knowing. Re-enter the zone with `ngZone.run()`, or update a signal, which schedules change detection by itself.",
      "zone.js запускає виявлення змін, коли завершується асинхронна робота, розпочата в зоні Angular. Бібліотеки, ініціалізовані поза зоною (часто навмисно, через `runOutsideAngular`, заради швидкодії), викликають колбеки без відома Angular. Поверніться в зону через `ngZone.run()` або оновіть сигнал — він сам запланує виявлення змін.",
    ],
  ),
  quiz(
    "ng-effect-batching",
    ["angular"],
    5,
    120,
    ["When effects run", "Коли виконуються ефекти"],
    ["The effect has already run once and logged `0`. A click handler then calls `a.set(1)` and `a.set(2)` back to back. What does the effect log next?", "Ефект уже виконався один раз і вивів `0`. Потім обробник кліку поспіль викликає `a.set(1)` і `a.set(2)`. Що ефект виведе далі?"],
    [
      ["`1`, then `2`", "`1`, потім `2`"],
      ["Only `2`", "Лише `2`"],
      ["Only `1`", "Лише `1`"],
      ["Nothing until the component is re-created", "Нічого, доки компонент не буде створено заново"],
    ],
    "b",
    [
      "Setting a signal only marks its dependents dirty. Effects are scheduled and run later, as part of change detection, not synchronously inside `set()`. By then the value is 2, so the effect runs once and logs `2`. Don't use effects to observe every intermediate value; they see the latest state.",
      "Встановлення сигналу лише позначає залежних як «брудних». Ефекти плануються й виконуються пізніше, у межах виявлення змін, а не синхронно всередині `set()`. На той момент значення вже 2, тож ефект виконається один раз і виведе `2`. Не використовуйте ефекти, щоб спостерігати кожне проміжне значення: вони бачать останній стан.",
    ],
    {
      code: "export class Demo {\n  a = signal(0);\n\n  constructor() {\n    effect(() => console.log(this.a()));\n  }\n\n  onClick() {\n    this.a.set(1);\n    this.a.set(2);\n  }\n}",
    },
  ),
]);
