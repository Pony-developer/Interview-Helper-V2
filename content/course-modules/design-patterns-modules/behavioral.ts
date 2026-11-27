import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { statePractice, strategyPractice } from "./practices";

export const behavioralModule: ModuleDef = {
  slug: "behavioral",
  title: { en: "Behavioral patterns: the everyday ones", uk: "Поведінкові патерни: щоденні" },
  slides: [
    { kind: "lecture", slug: "strategy", title: { en: "Strategy", uk: "Strategy (Стратегія)" } },
    { kind: "lecture", slug: "observer", title: { en: "Observer", uk: "Observer (Спостерігач)" } },
    { kind: "lecture", slug: "command", title: { en: "Command", uk: "Command (Команда)" } },
    { kind: "lecture", slug: "template-method", title: { en: "Template Method", uk: "Template Method (Шаблонний метод)" } },
    { kind: "lecture", slug: "chain-of-responsibility", title: { en: "Chain of Responsibility", uk: "Chain of Responsibility (Ланцюжок обов'язків)" } },
    strategyPractice,
    {
      kind: "quiz",
      slug: "behavioral-quiz",
      title: { en: "Quiz: Everyday behavioral patterns", uk: "Квіз «Щоденні поведінкові патерни»" },
      questions: [
        question(
          "strategy",
          [
            "A method has a growing `switch` that picks how to calculate a discount: by percent, fixed amount, \"buy 2 get 1\". Which pattern removes the switch?",
            "Метод має `switch`, що росте й вибирає, як рахувати знижку: відсотком, фіксованою сумою, «2 + 1». Який патерн прибирає цей switch?",
          ],
          [
            ["Singleton", "Singleton"],
            ["Strategy: each way of calculating is a separate class behind `IDiscount`, and the caller gets the one it needs", "Strategy: кожен спосіб розрахунку — окремий клас за `IDiscount`, а код отримує потрібний"],
            ["Facade", "Facade"],
            ["Prototype", "Prototype"],
          ],
          "b",
        ),
        question(
          "observer",
          ["Which C# feature is the Observer pattern built into the language?", "Яка можливість C# — це патерн Observer, вбудований у мову?"],
          [
            ["`using` statements", "Інструкція `using`"],
            ["Properties", "Властивості"],
            ["`event` and `+=` / `-=` subscriptions", "`event` і підписки `+=` / `-=`"],
            ["Generics", "Узагальнення"],
          ],
          "c",
        ),
        question(
          "observer-leak",
          ["What is the classic bug with Observer / events in .NET?", "Яка класична помилка з Observer / подіями в .NET?"],
          [
            [
              "Forgetting to unsubscribe: the publisher keeps a reference to the subscriber, so a short-lived subscriber is never garbage-collected (a memory leak) and keeps reacting",
              "Забути відписатися: видавець тримає посилання на підписника, тож короткоживучий підписник ніколи не прибирається збирачем сміття (витік пам'яті) і далі реагує",
            ],
            ["Events can have only one subscriber", "Подія може мати лише одного підписника"],
            ["Events are always asynchronous", "Події завжди асинхронні"],
            ["Subscribers can't receive parameters", "Підписники не можуть отримувати параметри"],
          ],
          "a",
        ),
        question(
          "command",
          ["What does turning an action into a Command object give you? Choose all that apply.", "Що дає перетворення дії на об'єкт Command? Оберіть усе, що підходить."],
          [
            ["Undo: the command remembers how to reverse itself", "Скасування: команда пам'ятає, як себе відкотити"],
            ["Queueing, retrying and logging actions", "Черги, повтори та журнал дій"],
            ["The same action from a button, a menu and a hotkey", "Та сама дія з кнопки, меню та гарячої клавіші"],
            ["Automatic multithreading", "Автоматична багатопотоковість"],
          ],
          ["a", "b", "c"],
        ),
        question(
          "template",
          ["How does Template Method differ from Strategy?", "Чим Template Method відрізняється від Strategy?"],
          [
            ["They are the same pattern", "Це той самий патерн"],
            ["Template Method works only with interfaces", "Template Method працює лише з інтерфейсами"],
            ["Strategy needs inheritance, Template Method doesn't", "Strategy потребує успадкування, а Template Method — ні"],
            [
              "Template Method fixes the order of steps in a base class and lets subclasses fill in some steps (inheritance); Strategy swaps the whole algorithm as a separate object (composition)",
              "Template Method фіксує порядок кроків у базовому класі й дає підкласам заповнити окремі кроки (успадкування); Strategy замінює весь алгоритм окремим об'єктом (композиція)",
            ],
          ],
          "d",
        ),
        question(
          "chain",
          ["Which is a real-world example of Chain of Responsibility?", "Що з цього — реальний приклад Chain of Responsibility?"],
          [
            [
              "ASP.NET Core middleware: each piece handles the request or passes it on with `next()`",
              "Middleware в ASP.NET Core: кожна ланка обробляє запит або передає його далі через `next()`",
            ],
            ["A static `Math` class", "Статичний клас `Math`"],
            ["A `List<T>`", "`List<T>`"],
            ["A constructor with default parameters", "Конструктор зі значеннями за замовчуванням"],
          ],
          "a",
        ),
      ],
    },
  ],
};

export const behavioralMoreModule: ModuleDef = {
  slug: "behavioral-more",
  title: { en: "Behavioral patterns: the rest of the family", uk: "Поведінкові патерни: решта родини" },
  slides: [
    { kind: "lecture", slug: "state", title: { en: "State", uk: "State (Стан)" } },
    { kind: "lecture", slug: "iterator", title: { en: "Iterator", uk: "Iterator (Ітератор)" } },
    { kind: "lecture", slug: "mediator", title: { en: "Mediator", uk: "Mediator (Посередник)" } },
    { kind: "lecture", slug: "memento", title: { en: "Memento", uk: "Memento (Знімок)" } },
    { kind: "lecture", slug: "visitor", title: { en: "Visitor", uk: "Visitor (Відвідувач)" } },
    statePractice,
    {
      kind: "quiz",
      slug: "behavioral-more-quiz",
      title: { en: "Quiz: The rest of the behavioral family", uk: "Квіз «Решта поведінкових патернів»" },
      questions: [
        question(
          "state",
          ["How does State differ from Strategy, if both swap an object behind an interface?", "Чим State відрізняється від Strategy, якщо обидва підміняють об'єкт за інтерфейсом?"],
          [
            [
              "In State the states switch THEMSELVES (Paid decides that Ship leads to Shipped); in Strategy the client chooses the algorithm from outside and it usually doesn't change by itself",
              "У State стани перемикаються САМІ (Paid вирішує, що Ship веде до Shipped); у Strategy алгоритм вибирає клієнт ззовні, і сам по собі він зазвичай не змінюється",
            ],
            ["State can't use interfaces", "State не може використовувати інтерфейси"],
            ["Strategy has to be a singleton", "Strategy мусить бути singleton"],
            ["There is no difference", "Різниці немає"],
          ],
          "a",
        ),
        question(
          "iterator",
          ["Which C# features are the Iterator pattern? Choose all that apply.", "Які можливості C# — це патерн Iterator? Оберіть усе, що підходить."],
          [
            ["`IEnumerable<T>` / `IEnumerator<T>`", "`IEnumerable<T>` / `IEnumerator<T>`"],
            ["`foreach`", "`foreach`"],
            ["`yield return`", "`yield return`"],
            ["`lock`", "`lock`"],
          ],
          ["a", "b", "c"],
        ),
        question(
          "mediator",
          ["What does Mediator change in how objects talk?", "Що Mediator змінює в тому, як спілкуються об'єкти?"],
          [
            ["Objects stop talking at all", "Об'єкти взагалі перестають спілкуватися"],
            [
              "Instead of everyone calling everyone (a web of links), objects talk only to one mediator, which forwards and coordinates, like a control tower for planes",
              "Замість того щоб усі викликали всіх (павутиння зв'язків), об'єкти говорять лише з одним посередником, який пересилає й координує, як диспетчерська вежа для літаків",
            ],
            ["Every object gets a copy of every other object", "Кожен об'єкт отримує копію кожного іншого"],
            ["Objects become immutable", "Об'єкти стають незмінними"],
          ],
          "b",
        ),
        question(
          "memento",
          ["What is Memento for?", "Для чого Memento?"],
          [
            ["To make sure there is one instance", "Щоб гарантувати один екземпляр"],
            ["To cache network responses", "Щоб кешувати відповіді мережі"],
            [
              "To save a snapshot of an object's state and restore it later (undo, \"cancel changes\" in a form) without exposing its private fields",
              "Щоб зберегти знімок стану об'єкта й пізніше відновити його (скасування, «відмінити зміни» у формі), не відкриваючи його приватних полів",
            ],
            ["To send events", "Щоб надсилати події"],
          ],
          "c",
        ),
        question(
          "visitor",
          ["When does Visitor fit?", "Коли пасує Visitor?"],
          [
            ["When new kinds of objects are added every week", "Коли нові види об'єктів додаються щотижня"],
            ["When you need one global object", "Коли потрібен один глобальний об'єкт"],
            ["When you need to wrap a slow service", "Коли треба обгорнути повільний сервіс"],
            [
              "When the set of object types is stable but you keep adding new operations over them (export, price calculation, validation) and don't want to edit every class each time",
              "Коли набір типів об'єктів стабільний, але над ними постійно додаються нові операції (експорт, підрахунок ціни, перевірка), і не хочеться щоразу правити кожен клас",
            ],
          ],
          "d",
        ),
      ],
    },
  ],
};
