import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { chainPractice } from "./practices";

export const inPracticeModule: ModuleDef = {
  slug: "in-practice",
  title: { en: "Patterns in real projects", uk: "Патерни в реальних проєктах" },
  slides: [
    { kind: "lecture", slug: "patterns-in-dotnet", title: { en: "Patterns you already use in .NET", uk: "Патерни, якими ви вже користуєтеся в .NET" } },
    { kind: "lecture", slug: "dependency-injection", title: { en: "Dependency Injection, Repository and Unit of Work", uk: "Dependency Injection, Repository і Unit of Work" } },
    { kind: "lecture", slug: "patterns-in-dynamics", title: { en: "Patterns in Dynamics 365 plug-ins", uk: "Патерни в плагінах Dynamics 365" } },
    { kind: "lecture", slug: "anti-patterns", title: { en: "Anti-patterns and overengineering", uk: "Антипатерни та переускладнення" } },
    { kind: "lecture", slug: "patterns-interview", title: { en: "How to talk about patterns in an interview", uk: "Як говорити про патерни на співбесіді" } },
    chainPractice,
    {
      kind: "quiz",
      slug: "final-quiz",
      title: { en: "Final quiz: Which pattern is it?", uk: "Підсумковий квіз «Що це за патерн?»" },
      questions: [
        question(
          "stream",
          ["`new GZipStream(new BufferedStream(new FileStream(path, FileMode.Open)), CompressionMode.Decompress)` shows which pattern?", "`new GZipStream(new BufferedStream(new FileStream(path, FileMode.Open)), CompressionMode.Decompress)` — який це патерн?"],
          [
            ["Decorator: each stream wraps another `Stream` and adds one ability", "Decorator: кожен потік обгортає інший `Stream` і додає одну можливість"],
            ["Composite", "Composite"],
            ["Builder", "Builder"],
            ["Memento", "Memento"],
          ],
          "a",
        ),
        question(
          "di",
          ["What does Dependency Injection mean in plain words?", "Що означає Dependency Injection простими словами?"],
          [
            ["A class creates everything it needs with `new` inside its methods", "Клас сам створює все потрібне через `new` усередині методів"],
            [
              "A class gets what it needs (`IEmailSender`, `IRepository`) from outside, usually through its constructor, instead of creating it itself, so the parts can be replaced, for example with fakes in tests",
              "Клас отримує потрібне (`IEmailSender`, `IRepository`) ззовні, зазвичай через конструктор, а не створює сам, тож частини можна замінити, наприклад підробками в тестах",
            ],
            ["All services are made static", "Усі сервіси робляться статичними"],
            ["Code is injected into a running process", "Код впроваджується в запущений процес"],
          ],
          "b",
        ),
        question(
          "plugin-pipeline",
          [
            "In Dynamics 365, a message goes through PreValidation, PreOperation, the main operation and PostOperation, and each registered plug-in can process it or stop it with an exception. Which pattern does this look like?",
            "У Dynamics 365 повідомлення проходить PreValidation, PreOperation, основну операцію й PostOperation, і кожен зареєстрований плагін може його обробити або зупинити винятком. На який патерн це схоже?",
          ],
          [
            ["Singleton", "Singleton"],
            ["Prototype", "Prototype"],
            ["Chain of Responsibility (a pipeline of handlers)", "Chain of Responsibility (конвеєр обробників)"],
            ["Flyweight", "Flyweight"],
          ],
          "c",
        ),
        question(
          "execute",
          [
            "`service.Execute(new AssignRequest { Target = …, Assignee = … })`: the action is packed into a request object that can also go into `ExecuteMultipleRequest`. Which pattern is that?",
            "`service.Execute(new AssignRequest { Target = …, Assignee = … })`: дію упаковано в об'єкт запиту, який можна покласти й у `ExecuteMultipleRequest`. Що це за патерн?",
          ],
          [
            ["Observer", "Observer"],
            ["Command: an action as an object that can be passed, batched and executed later", "Command: дія як об'єкт, який можна передати, зібрати в пакет і виконати пізніше"],
            ["Adapter", "Adapter"],
            ["Bridge", "Bridge"],
          ],
          "b",
        ),
        question(
          "anti",
          ["Which of these are signs of overusing patterns? Choose all that apply.", "Що з цього — ознаки зловживання патернами? Оберіть усе, що підходить."],
          [
            ["An interface with one implementation \"just in case\", for every class", "Інтерфейс з однією реалізацією «про всяк випадок» для кожного класу"],
            ["A factory that only ever creates one class", "Фабрика, що завжди створює лише один клас"],
            ["Five layers of wrappers to save one record", "П'ять шарів обгорток, щоб зберегти один запис"],
            ["A strategy introduced because a third discount type arrived", "Стратегія, введена, бо з'явився третій тип знижки"],
          ],
          ["a", "b", "c"],
        ),
        question(
          "interview",
          ["An interviewer asks \"Which patterns have you used?\". What makes the best answer?", "На співбесіді питають «Які патерни ви використовували?». Яка відповідь найкраща?"],
          [
            ["A list of all 23 patterns by heart", "Перелік усіх 23 патернів напам'ять"],
            ["\"I don't use patterns, they are overengineering\"", "«Я не використовую патерни, це переускладнення»"],
            ["The UML diagram of each pattern", "UML-діаграма кожного патерну"],
            [
              "Two or three real cases: what the problem was, which pattern you chose, what it gave you and what it cost",
              "Два-три реальні випадки: яка була проблема, який патерн обрали, що він дав і чого коштував",
            ],
          ],
          "d",
        ),
      ],
    },
  ],
};
