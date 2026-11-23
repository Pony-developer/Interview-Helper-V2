import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 156–165 of the list: algorithms and data structures. */
export const algorithmsQuiz: SlideDef = {
  kind: "quiz",
  slug: "algorithms-quiz",
  title: { en: "Algorithms and data structures", uk: "Алгоритми та структури даних" },
  questions: [
    question(
      "complexity",
      [
        "What is the time complexity of finding a value in an unsorted array by checking every item?",
        "Яка часова складність пошуку значення в невідсортованому масиві перебором усіх елементів?",
      ],
      [
        ["O(1)", "O(1)"],
        ["O(log n)", "O(log n)"],
        ["O(n)", "O(n)"],
        ["O(n²)", "O(n²)"],
      ],
      "c",
    ),
    question(
      "data-structures",
      ["Which data structure works on the LIFO principle (last in, first out)?", "Яка структура даних працює за принципом LIFO (останнім прийшов — першим вийшов)?"],
      [
        ["A queue", "Черга"],
        ["A stack", "Стек"],
        ["A hash table", "Хеш-таблиця"],
        ["A sorted array", "Відсортований масив"],
      ],
      "b",
    ),
    question(
      "sorting",
      ["Which sorting algorithm is O(n log n) even in the worst case?", "Який алгоритм сортування має O(n log n) навіть у найгіршому випадку?"],
      [
        ["Bubble sort", "Сортування бульбашкою"],
        ["Quicksort", "Швидке сортування"],
        ["Insertion sort", "Сортування вставками"],
        ["Merge sort", "Сортування злиттям"],
      ],
      "d",
    ),
    question(
      "bfs-dfs",
      ["What is the key difference between breadth-first search (BFS) and depth-first search (DFS)?", "Яка ключова відмінність між пошуком у ширину (BFS) і пошуком у глибину (DFS)?"],
      [
        [
          "BFS goes level by level using a queue and finds the shortest path in an unweighted graph; DFS goes as deep as possible first, using a stack or recursion",
          "BFS іде рівень за рівнем за допомогою черги й знаходить найкоротший шлях у незваженому графі; DFS спершу йде якомога глибше, за допомогою стека чи рекурсії",
        ],
        ["It is the other way around: BFS uses a stack, DFS a queue", "Навпаки: BFS використовує стек, а DFS чергу"],
        ["BFS works only on trees, DFS only on graphs", "BFS працює лише з деревами, а DFS лише з графами"],
        ["There is no difference: they always visit nodes in the same order", "Різниці немає: вони завжди обходять вузли в тому самому порядку"],
      ],
      "a",
    ),
    question(
      "recursion",
      [
        "What does this code print?\n\n```js\nfunction sum(n) {\n  return n === 0 ? 0 : n + sum(n - 1);\n}\nconsole.log(sum(4));\n```",
        "Що виведе цей код?\n\n```js\nfunction sum(n) {\n  return n === 0 ? 0 : n + sum(n - 1);\n}\nconsole.log(sum(4));\n```",
      ],
      [
        ["4", "4"],
        ["24", "24"],
        ["10", "10"],
        ["A stack overflow error", "Помилку переповнення стека"],
      ],
      "c",
    ),
    question(
      "memoization",
      [
        "Why is the naive recursive `fib(n) = fib(n - 1) + fib(n - 2)` slow, and how does memoization help?",
        "Чому наївна рекурсивна `fib(n) = fib(n - 1) + fib(n - 2)` повільна і як допомагає мемоізація?",
      ],
      [
        ["Memoization runs the calls in parallel", "Мемоізація запускає виклики паралельно"],
        [
          "It recomputes the same values an exponential number of times; caching each result makes it O(n)",
          "Вона обчислює ті самі значення експоненційну кількість разів; кешування кожного результату робить її O(n)",
        ],
        ["Recursion is always slow, and memoization turns it into a loop", "Рекурсія завжди повільна, а мемоізація перетворює її на цикл"],
        ["It is not slow", "Вона не повільна"],
      ],
      "b",
    ),
    question(
      "search-algorithms",
      ["What does binary search require, and how fast is it?", "Що потрібно для бінарного пошуку і наскільки він швидкий?"],
      [
        ["Nothing special; O(1)", "Нічого особливого; O(1)"],
        ["A linked list; O(n log n)", "Зв'язний список; O(n log n)"],
        ["A hash table; O(n)", "Хеш-таблиця; O(n)"],
        ["A sorted collection with access by index; O(log n)", "Відсортована колекція з доступом за індексом; O(log n)"],
      ],
      "d",
    ),
    question(
      "hash-table",
      ["What is true about hash tables, such as a JS `Map`?", "Що правильно про хеш-таблиці, як-от `Map` у JS?"],
      [
        [
          "Lookup, insertion and deletion are O(1) on average, but collisions can slow them down, and the structure uses extra memory",
          "Пошук, вставлення й видалення в середньому O(1), але колізії можуть їх сповільнити, а сама структура потребує додаткової пам'яті",
        ],
        ["Lookup is always O(n)", "Пошук завжди O(n)"],
        ["Keys can only be numbers", "Ключами можуть бути лише числа"],
        ["The keys are always kept sorted", "Ключі завжди тримаються відсортованими"],
      ],
      "a",
    ),
    question(
      "bst",
      ["What property defines a binary search tree?", "Яка властивість визначає двійкове дерево пошуку?"],
      [
        ["Every node has exactly two children", "Кожен вузол має рівно двох нащадків"],
        ["The values are stored in random order", "Значення зберігаються у випадковому порядку"],
        [
          "For every node, values in the left subtree are smaller and values in the right subtree are larger, so a search in a balanced tree takes O(log n)",
          "Для кожного вузла значення в лівому піддереві менші, а в правому більші, тож пошук у збалансованому дереві займає O(log n)",
        ],
        ["Values in the left subtree are larger than the node", "Значення в лівому піддереві більші за вузол"],
      ],
      "c",
    ),
    question(
      "shortest-path",
      ["Which algorithm finds the shortest paths in a graph with non-negative edge weights?", "Який алгоритм знаходить найкоротші шляхи в графі з невід'ємними вагами ребер?"],
      [
        ["Bubble sort", "Сортування бульбашкою"],
        ["Depth-first search", "Пошук у глибину"],
        ["Binary search", "Бінарний пошук"],
        ["Dijkstra's algorithm", "Алгоритм Дейкстри"],
      ],
      "d",
    ),
  ],
};
