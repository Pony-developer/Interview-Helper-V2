import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 82–90 of the Senior list: algorithms and data structures. */
export const seniorAlgorithmsQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-algorithms-quiz",
  title: { en: "Algorithms and data structures", uk: "Алгоритми і структури даних" },
  questions: [
    question(
      "nontrivial-ds",
      ["Which data structure fits autocomplete by prefix?", "Яка структура даних підходить для автодоповнення за префіксом?"],
      [
        ["A stack", "Стек"],
        ["A queue", "Черга"],
        ["A linked list", "Зв'язний список"],
        ["A trie (prefix tree)", "Префіксне дерево (trie)"],
      ],
      "d",
    ),
    question(
      "crdt",
      ["What is a CRDT?", "Що таке CRDT?"],
      [
        [
          "A conflict-free replicated data type: replicas can be edited independently, even offline, and always merge into the same state without a central coordinator; used for collaborative editing (Yjs, Automerge)",
          "Conflict-free replicated data type: репліки можна редагувати незалежно, навіть офлайн, і вони завжди зливаються в той самий стан без центрального координатора; використовується для спільного редагування (Yjs, Automerge)",
        ],
        ["A CSS reset library", "Бібліотека скидання CSS-стилів"],
        ["A cryptographic hash function", "Криптографічна хеш-функція"],
        ["A React renderer", "Рендерер для React"],
      ],
      "a",
    ),
    question(
      "optimization-algorithms",
      ["Which techniques improve the performance of large frontend apps?", "Які прийоми покращують продуктивність великих фронтенд-застосунків?"],
      [
        ["Memoization and caching of expensive computations", "Мемоізація та кешування дорогих обчислень"],
        ["Nested loops over all the data on every keystroke", "Вкладені цикли по всіх даних на кожне натискання клавіші"],
        ["Debouncing and throttling frequent events", "Debounce і throttle для частих подій"],
        ["Virtualization (windowing) of large lists", "Віртуалізація великих списків"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "sorting-large",
      [
        "Which algorithm does V8 use for `Array.prototype.sort`, and why does it suit real-world data?",
        "Який алгоритм V8 використовує для `Array.prototype.sort` і чому він добре пасує до реальних даних?",
      ],
      [
        ["Bubble sort, because it is simple", "Сортування бульбашкою, бо воно просте"],
        [
          "TimSort: it is stable, O(n log n) in the worst case, and fast on partially sorted data",
          "TimSort: він стабільний, має O(n log n) у найгіршому випадку й швидкий на частково відсортованих даних",
        ],
        ["An unstable quicksort", "Нестабільне швидке сортування"],
        ["A random shuffle until the array is sorted", "Випадкове перемішування, доки масив не стане відсортованим"],
      ],
      "b",
    ),
    question(
      "dynamic-programming",
      ["Which is a real use of dynamic programming in frontend work?", "Що з цього — реальне застосування динамічного програмування у фронтенді?"],
      [
        ["Rendering a button", "Рендеринг кнопки"],
        ["A CSS `:hover` state", "Стан `:hover` у CSS"],
        [
          "Computing a diff between two texts or lists (longest common subsequence), or edit distance for fuzzy search",
          "Обчислення різниці між двома текстами чи списками (найдовша спільна підпослідовність) або відстані редагування для нечіткого пошуку",
        ],
        ["Sending a `fetch` request", "Надсилання запиту `fetch`"],
      ],
      "c",
    ),
    question(
      "balanced-trees",
      ["Why do AVL and red-black trees matter in practice?", "Чому AVL- і червоно-чорні дерева важливі на практиці?"],
      [
        [
          "They stay balanced on insert and delete, guaranteeing O(log n) operations; red-black trees back ordered maps in many standard libraries, such as Java's `TreeMap` and C++'s `std::map`",
          "Вони лишаються збалансованими під час вставлення й видалення, гарантуючи операції за O(log n); червоно-чорні дерева лежать в основі впорядкованих словників у багатьох стандартних бібліотеках, як-от `TreeMap` у Java і `std::map` у C++",
        ],
        ["They store images efficiently", "Вони ефективно зберігають зображення"],
        ["They give O(1) search", "Вони дають пошук за O(1)"],
        ["They are used only in CSS engines", "Їх використовують лише в CSS-рушіях"],
      ],
      "a",
    ),
    question(
      "deep-freeze",
      ["How do you deep-freeze an object in JavaScript?", "Як глибоко заморозити об'єкт у JavaScript?"],
      [
        ["`Object.freeze(obj)` already freezes all nested objects", "`Object.freeze(obj)` уже заморожує всі вкладені об'єкти"],
        ["Declare it with `const`", "Оголосити його через `const`"],
        ["Call `Object.seal(obj)`", "Викликати `Object.seal(obj)`"],
        [
          "Recursively call `Object.freeze` on the object and every nested object, skipping ones that are already frozen to handle cycles",
          "Рекурсивно викликати `Object.freeze` для об'єкта й кожного вкладеного об'єкта, пропускаючи вже заморожені, щоб упоратися з циклами",
        ],
      ],
      "d",
    ),
    question(
      "circular-json",
      ["How do you serialize an object that contains circular references?", "Як серіалізувати об'єкт, що містить циклічні посилання?"],
      [
        ["`JSON.stringify` handles cycles out of the box", "`JSON.stringify` обробляє цикли з коробки"],
        [
          "Use a `JSON.stringify` replacer with a `WeakSet` (or a `WeakMap` of ids) to detect objects already seen and replace them with a reference marker, or use a library such as flatted",
          "Використати replacer у `JSON.stringify` разом із `WeakSet` (або `WeakMap` з ідентифікаторами), щоб виявляти вже бачені об'єкти й замінювати їх маркером посилання, або взяти бібліотеку на кшталт flatted",
        ],
        ["It is impossible", "Це неможливо"],
        ["Use `eval`", "Використати `eval`"],
      ],
      "b",
    ),
    question(
      "vdom-impl",
      ["What are the core pieces of a minimal virtual DOM implementation?", "З яких основних частин складається мінімальна реалізація віртуального DOM?"],
      [
        ["Copying the real DOM through `innerHTML` on every frame", "Копіювання справжнього DOM через `innerHTML` на кожному кадрі"],
        ["A Web Worker that renders HTML strings", "Web Worker, що рендерить HTML-рядки"],
        [
          "An `h(type, props, children)` function that creates plain objects, a `render` that turns them into DOM nodes, and a `diff`/`patch` step that compares the old and new trees and applies minimal changes, using keys for lists",
          "Функція `h(type, props, children)`, що створює звичайні об'єкти, `render`, що перетворює їх на DOM-вузли, і крок `diff`/`patch`, що порівнює старе й нове дерево та застосовує мінімальні зміни, використовуючи ключі для списків",
        ],
        ["Only CSS", "Лише CSS"],
      ],
      "c",
    ),
  ],
};
