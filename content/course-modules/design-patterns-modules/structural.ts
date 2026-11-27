import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { decoratorPractice } from "./practices";

export const structuralModule: ModuleDef = {
  slug: "structural",
  title: { en: "Structural patterns", uk: "Структурні патерни" },
  slides: [
    { kind: "lecture", slug: "adapter", title: { en: "Adapter", uk: "Adapter (Адаптер)" } },
    { kind: "lecture", slug: "decorator", title: { en: "Decorator", uk: "Decorator (Декоратор)" } },
    { kind: "lecture", slug: "facade", title: { en: "Facade", uk: "Facade (Фасад)" } },
    { kind: "lecture", slug: "proxy", title: { en: "Proxy", uk: "Proxy (Замісник)" } },
    { kind: "lecture", slug: "composite", title: { en: "Composite", uk: "Composite (Компонувальник)" } },
    { kind: "lecture", slug: "bridge", title: { en: "Bridge", uk: "Bridge (Міст)" } },
    { kind: "lecture", slug: "flyweight", title: { en: "Flyweight", uk: "Flyweight (Легковаговик)" } },
    decoratorPractice,
    {
      kind: "quiz",
      slug: "structural-quiz",
      title: { en: "Quiz: Structural patterns", uk: "Квіз «Структурні патерни»" },
      questions: [
        question(
          "adapter",
          [
            "A new payment provider has `Charge(cents, currencyCode)`, but your code expects `IPayment.Pay(decimal amount)`. Which pattern connects them without changing either side?",
            "Новий платіжний провайдер має `Charge(cents, currencyCode)`, а ваш код очікує `IPayment.Pay(decimal amount)`. Який патерн з'єднає їх, не змінюючи жодну зі сторін?",
          ],
          [
            ["Facade", "Facade"],
            ["Adapter: a small class implements `IPayment` and translates each call into the provider's API", "Adapter: маленький клас реалізує `IPayment` і перекладає кожен виклик на API провайдера"],
            ["Composite", "Composite"],
            ["Singleton", "Singleton"],
          ],
          "b",
        ),
        question(
          "decorator-vs-proxy",
          ["Decorator and Proxy both wrap an object with the same interface. What is the usual difference?", "Decorator і Proxy обидва обгортають об'єкт тим самим інтерфейсом. У чому зазвичай різниця?"],
          [
            [
              "A decorator ADDS behavior (logging, caching, retries) and decorators are stacked freely; a proxy CONTROLS ACCESS to the real object (lazy loading, permissions, a remote call)",
              "Декоратор ДОДАЄ поведінку (логування, кеш, повтори), і декоратори вільно нашаровуються; проксі КОНТРОЛЮЄ ДОСТУП до справжнього об'єкта (ліниве завантаження, права, віддалений виклик)",
            ],
            ["A proxy changes the interface, a decorator doesn't", "Проксі змінює інтерфейс, а декоратор — ні"],
            ["There is no difference at all, the names are synonyms", "Різниці немає зовсім, це синоніми"],
            ["A decorator works only with UI", "Декоратор працює лише з UI"],
          ],
          "a",
        ),
        question(
          "facade",
          ["What does a Facade do?", "Що робить Facade?"],
          [
            ["It makes a class have only one instance", "Робить так, щоб клас мав лише один екземпляр"],
            ["It clones objects", "Клонує об'єкти"],
            [
              "It gives one simple entry point (`orderService.PlaceOrder(cart)`) to a complicated subsystem of many classes (stock, payment, delivery, emails)",
              "Дає одну просту точку входу (`orderService.PlaceOrder(cart)`) до складної підсистеми з багатьох класів (склад, оплата, доставка, листи)",
            ],
            ["It turns a request into an object", "Перетворює запит на об'єкт"],
          ],
          "c",
        ),
        question(
          "composite",
          ["Which task is a natural fit for Composite?", "Яка задача природно лягає на Composite?"],
          [
            ["Logging every method call", "Логування кожного виклику методу"],
            [
              "A tree where a folder and a file are treated the same way: `GetSize()` of a folder is the sum of `GetSize()` of everything inside it",
              "Дерево, де з папкою й файлом поводяться однаково: `GetSize()` папки — це сума `GetSize()` усього, що в ній",
            ],
            ["Choosing a shipping method", "Вибір способу доставки"],
            ["Creating one database connection", "Створення одного з'єднання з базою даних"],
          ],
          "b",
        ),
        question(
          "bridge",
          [
            "You have 3 kinds of notifications (alert, reminder, report) and 3 channels (email, SMS, Teams). Without Bridge you might end up with 9 classes. What does Bridge suggest?",
            "Є 3 види сповіщень (тривога, нагадування, звіт) і 3 канали (email, SMS, Teams). Без Bridge можна отримати 9 класів. Що пропонує Bridge?",
          ],
          [
            ["Make one huge class with a switch", "Зробити один величезний клас зі switch"],
            ["Copy each class for each channel", "Скопіювати кожен клас для кожного каналу"],
            ["Use a singleton for each channel", "Зробити singleton для кожного каналу"],
            [
              "Split the two dimensions: a notification HOLDS a channel (`IChannel`) and calls it, so 3 + 3 classes combine freely",
              "Розділити два виміри: сповіщення МІСТИТЬ канал (`IChannel`) і викликає його, тож 3 + 3 класи вільно комбінуються",
            ],
          ],
          "d",
        ),
        question(
          "flyweight",
          ["What problem does Flyweight solve?", "Яку проблему розв'язує Flyweight?"],
          [
            [
              "Memory: millions of similar objects share their common, unchanging part (a font, a tree's texture) instead of each keeping its own copy",
              "Пам'ять: мільйони схожих об'єктів ділять спільну незмінну частину (шрифт, текстуру дерева), замість того щоб кожен тримав власну копію",
            ],
            ["Slow network calls", "Повільні мережеві виклики"],
            ["Incompatible interfaces", "Несумісні інтерфейси"],
            ["Too many constructor parameters", "Забагато параметрів конструктора"],
          ],
          "a",
        ),
      ],
    },
  ],
};
