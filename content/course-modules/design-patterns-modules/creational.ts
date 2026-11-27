import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { factoryPractice } from "./practices";

export const creationalModule: ModuleDef = {
  slug: "creational",
  title: { en: "Creational patterns", uk: "Породжувальні патерни" },
  slides: [
    { kind: "lecture", slug: "singleton", title: { en: "Singleton", uk: "Singleton (Одинак)" } },
    { kind: "lecture", slug: "factory-method", title: { en: "Factory and Factory Method", uk: "Factory і Factory Method (Фабричний метод)" } },
    { kind: "lecture", slug: "abstract-factory", title: { en: "Abstract Factory", uk: "Abstract Factory (Абстрактна фабрика)" } },
    { kind: "lecture", slug: "builder", title: { en: "Builder", uk: "Builder (Будівельник)" } },
    { kind: "lecture", slug: "prototype", title: { en: "Prototype", uk: "Prototype (Прототип)" } },
    factoryPractice,
    {
      kind: "quiz",
      slug: "creational-quiz",
      title: { en: "Quiz: Creational patterns", uk: "Квіз «Породжувальні патерни»" },
      questions: [
        question(
          "singleton-what",
          ["What does Singleton guarantee?", "Що гарантує Singleton?"],
          [
            ["That a class has no fields", "Що клас не має полів"],
            ["That an object can't be changed after creation", "Що об'єкт не можна змінити після створення"],
            [
              "That a class has exactly one instance and gives a single global access point to it",
              "Що клас має рівно один екземпляр і дає до нього одну глобальну точку доступу",
            ],
            ["That an object is created only on another thread", "Що об'єкт створюється лише в іншому потоці"],
          ],
          "c",
        ),
        question(
          "singleton-risk",
          ["Why is Singleton often called an anti-pattern? Choose all that apply.", "Чому Singleton часто називають антипатерном? Оберіть усе, що підходить."],
          [
            ["It is hidden global state: any code can change it", "Це прихований глобальний стан: будь-який код може його змінити"],
            ["It is hard to replace with a fake in unit tests", "Його важко замінити підробкою в модульних тестах"],
            ["It hides dependencies: you can't see from a constructor that a class uses it", "Він приховує залежності: з конструктора не видно, що клас ним користується"],
            ["It always leaks memory", "Він завжди спричиняє витік пам'яті"],
          ],
          ["a", "b", "c"],
        ),
        question(
          "factory",
          ["What is the main benefit of a factory?", "Яка головна користь від фабрики?"],
          [
            [
              "The calling code asks for \"a notifier for this channel\" and gets an `INotifier`, without knowing the concrete classes; adding a new class touches only the factory",
              "Код, що викликає, просить «сповіщувач для цього каналу» й отримує `INotifier`, не знаючи конкретних класів; новий клас зачіпає лише фабрику",
            ],
            ["It makes objects immutable", "Вона робить об'єкти незмінними"],
            ["It guarantees a single instance", "Вона гарантує єдиний екземпляр"],
            ["It removes the need for interfaces", "Вона позбавляє потреби в інтерфейсах"],
          ],
          "a",
        ),
        question(
          "abstract-factory",
          ["When does Abstract Factory fit better than a simple factory?", "Коли Abstract Factory пасує краще за просту фабрику?"],
          [
            ["When you need exactly one object", "Коли потрібен рівно один об'єкт"],
            [
              "When you create whole families of related objects that must match each other, such as a light or dark theme's button, checkbox and window, or test and production versions of all services",
              "Коли треба створювати цілі родини пов'язаних об'єктів, які мусять пасувати одне одному, як-от кнопка, прапорець і вікно світлої чи темної теми, або тестові та робочі версії всіх сервісів",
            ],
            ["When the object has many optional parameters", "Коли об'єкт має багато необов'язкових параметрів"],
            ["When you want to copy an existing object", "Коли треба скопіювати наявний об'єкт"],
          ],
          "b",
        ),
        question(
          "builder",
          ["`new ReportBuilder().Title(\"Sales\").AddColumn(\"Amount\").SortBy(\"Date\").Build()` is an example of…", "`new ReportBuilder().Title(\"Sales\").AddColumn(\"Amount\").SortBy(\"Date\").Build()` — це приклад…"],
          [
            ["Prototype", "Prototype"],
            ["Singleton", "Singleton"],
            ["Adapter", "Adapter"],
            [
              "Builder: a complex object is assembled step by step, and only the parts you need are set",
              "Builder: складний об'єкт збирається крок за кроком, і задаються лише потрібні частини",
            ],
          ],
          "d",
        ),
        question(
          "prototype",
          ["What is the trap of Prototype (cloning) in C#?", "Яка пастка Prototype (клонування) у C#?"],
          [
            [
              "A shallow copy (`MemberwiseClone`) copies references, so the clone and the original share the same lists and nested objects; changes to one show up in the other",
              "Поверхнева копія (`MemberwiseClone`) копіює посилання, тож клон і оригінал ділять ті самі списки й вкладені об'єкти; зміни в одному видно в іншому",
            ],
            ["A clone can't be changed", "Клон не можна змінювати"],
            ["Cloning is forbidden for classes", "Клонування заборонене для класів"],
            ["A clone always has a new type", "Клон завжди має новий тип"],
          ],
          "a",
        ),
      ],
    },
  ],
};
