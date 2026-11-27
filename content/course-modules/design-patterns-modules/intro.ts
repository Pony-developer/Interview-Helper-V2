import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";

export const introModule: ModuleDef = {
  slug: "intro",
  title: { en: "Patterns in plain words", uk: "Патерни простими словами" },
  slides: [
    { kind: "lecture", slug: "what-is-a-pattern", title: { en: "What a design pattern is", uk: "Що таке патерн проєктування" } },
    { kind: "lecture", slug: "pattern-foundations", title: { en: "The ideas behind every pattern", uk: "Ідеї, на яких стоять усі патерни" } },
    {
      kind: "quiz",
      slug: "intro-quiz",
      title: { en: "Quiz: Patterns in plain words", uk: "Квіз «Патерни простими словами»" },
      questions: [
        question(
          "what",
          ["What is a design pattern?", "Що таке патерн проєктування?"],
          [
            ["A library you install from NuGet", "Бібліотека, яку встановлюють із NuGet"],
            [
              "A named, proven solution to a problem that keeps coming back in code: an idea you adapt to your situation, not ready-made code",
              "Іменоване перевірене рішення задачі, що постійно повторюється в коді: ідея, яку пристосовують до своєї ситуації, а не готовий код",
            ],
            ["A rule of the C# compiler", "Правило компілятора C#"],
            ["A way to make code run faster", "Спосіб пришвидшити код"],
          ],
          "b",
        ),
        question(
          "families",
          ["Match the three classic families of patterns to what they are about.", "Які три класичні родини патернів і про що кожна?"],
          [
            [
              "Creational: how objects are created. Structural: how objects are put together. Behavioral: how objects talk and share the work",
              "Породжувальні: як створюються об'єкти. Структурні: як об'єкти складаються докупи. Поведінкові: як об'єкти спілкуються й ділять роботу",
            ],
            ["Fast, safe and simple patterns", "Швидкі, безпечні та прості патерни"],
            ["Frontend, backend and database patterns", "Frontend-, backend- і патерни баз даних"],
            ["Creational: how classes are named. Structural: folder layout. Behavioral: tests", "Породжувальні: як називати класи. Структурні: розкладка папок. Поведінкові: тести"],
          ],
          "a",
        ),
        question(
          "interface",
          ["What does \"program to an interface, not an implementation\" mean?", "Що означає «програмуй на рівні інтерфейсу, а не реалізації»?"],
          [
            ["Every class must have an interface with the same name", "Кожен клас мусить мати інтерфейс із такою самою назвою"],
            ["Write the UI first and the logic later", "Спершу писати UI, а логіку потім"],
            [
              "Code depends on what an object can do (`INotifier.Send`), not on which concrete class it is (`EmailNotifier`), so the concrete class can be swapped without touching that code",
              "Код залежить від того, що об'єкт уміє (`INotifier.Send`), а не від того, який це конкретний клас (`EmailNotifier`), тож конкретний клас можна замінити, не чіпаючи цей код",
            ],
            ["Never use the `new` keyword", "Ніколи не використовувати ключове слово `new`"],
          ],
          "c",
        ),
        question(
          "composition",
          ["Why do patterns usually prefer composition over inheritance?", "Чому патерни зазвичай віддають перевагу композиції над успадкуванням?"],
          [
            ["Inheritance is not supported in C#", "Успадкування не підтримується в C#"],
            [
              "An object that holds other objects can change its parts at runtime and combine them freely; inheritance fixes the behavior at compile time and multiplies subclasses",
              "Об'єкт, що містить інші об'єкти, може змінювати свої частини під час виконання й вільно їх комбінувати; успадкування фіксує поведінку на етапі компіляції й плодить підкласи",
            ],
            ["Composition is always faster", "Композиція завжди швидша"],
            ["Because interfaces cannot be inherited", "Бо інтерфейси не можна успадковувати"],
          ],
          "b",
        ),
        question(
          "when",
          ["When should you NOT add a pattern?", "Коли патерн НЕ варто додавати?"],
          [
            [
              "When the problem it solves isn't there yet: a pattern adds classes and indirection, so for one simple case plain code is better",
              "Коли задачі, яку він розв'язує, ще немає: патерн додає класи й непрямість, тож для одного простого випадку краще звичайний код",
            ],
            ["When the project is written in C#", "Коли проєкт написаний на C#"],
            ["When the code has tests", "Коли код покритий тестами"],
            ["Never: more patterns always means better code", "Ніколи: більше патернів завжди означає кращий код"],
          ],
          "a",
        ),
      ],
    },
  ],
};
