import type { ModuleDef } from "../types";

export const solutionsModule: ModuleDef = {
  slug: "crm-solutions",
  title: { en: "Solutions and ALM", uk: "Рішення та ALM" },
  slides: [
    {
      kind: "lecture",
      slug: "solutions-and-layers",
      title: { en: "Solutions, publishers and layers", uk: "Рішення, видавці та шари" },
    },
    {
      kind: "lecture",
      slug: "alm-pipelines",
      title: { en: "Environments, source control and pipelines", uk: "Середовища, контроль версій і конвеєри" },
    },
    {
      kind: "quiz",
      slug: "solutions-quiz",
      title: { en: "Solutions and ALM check", uk: "Перевірка: рішення та ALM" },
      questions: [
        {
          id: "managed",
          mode: "single",
          prompt: {
            en: "Which kind of solution do you import into test and production?",
            uk: "Яке рішення імпортують у тестове та продакшн-середовище?",
          },
          options: [
            { id: "a", text: { en: "Managed: it installs as a sealed layer and can be upgraded or removed as a unit", uk: "Кероване (managed): воно встановлюється як закритий шар, і його можна оновити чи видалити цілком" } },
            { id: "b", text: { en: "Unmanaged, so people can fix things directly in production", uk: "Некероване (unmanaged), щоб можна було виправляти просто в продакшні" } },
            { id: "c", text: { en: "The Default solution exported from development", uk: "Default solution, експортоване з розробки" } },
          ],
          correct: ["a"],
        },
        {
          id: "publisher",
          mode: "single",
          prompt: {
            en: "Why create your own publisher instead of using the default one?",
            uk: "Навіщо створювати власного видавця замість стандартного?",
          },
          options: [
            { id: "a", text: { en: "Its prefix marks every component you create (new tables, columns) and identifies who owns them", uk: "Його префікс позначає всі компоненти, які ви створюєте (таблиці, стовпці), і показує, кому вони належать" } },
            { id: "b", text: { en: "Only a custom publisher can export solutions", uk: "Лише власний видавець може експортувати рішення" } },
            { id: "c", text: { en: "The default publisher cannot create tables", uk: "Стандартний видавець не може створювати таблиці" } },
          ],
          correct: ["a"],
        },
        {
          id: "layers",
          mode: "single",
          prompt: {
            en: "Someone changed a form directly in production. After you import a new managed version, the change is still visible. Why?",
            uk: "Хтось змінив форму просто в продакшні. Після імпорту нової керованої версії зміна досі видна. Чому?",
          },
          options: [
            { id: "a", text: { en: "The direct edit created an unmanaged active layer that sits on top of every managed layer", uk: "Пряма зміна створила некерований активний шар, який лежить поверх усіх керованих шарів" } },
            { id: "b", text: { en: "Managed solutions never change forms", uk: "Керовані рішення ніколи не змінюють форми" } },
            { id: "c", text: { en: "The browser cached the old form", uk: "Браузер закешував стару форму" } },
          ],
          correct: ["a"],
        },
        {
          id: "env-vars",
          mode: "single",
          prompt: {
            en: "An API URL differs between test and production. How do you keep it out of the solution's code?",
            uk: "URL API відрізняється між тестовим і продакшн-середовищем. Як не тримати його в коді рішення?",
          },
          options: [
            { id: "a", text: { en: "An environment variable, with its value set per environment at import or in the pipeline", uk: "Змінна середовища (environment variable), значення якої задається для кожного середовища під час імпорту чи в конвеєрі" } },
            { id: "b", text: { en: "Hard-code both URLs and pick one with an if", uk: "Зашити обидва URL і вибирати через if" } },
            { id: "c", text: { en: "Edit the plug-in assembly after import", uk: "Змінювати збірку плагіна після імпорту" } },
          ],
          correct: ["a"],
        },
        {
          id: "source-control",
          mode: "multi",
          prompt: {
            en: "What belongs in a healthy Dataverse ALM setup?",
            uk: "Що входить до здорового налаштування ALM для Dataverse?",
          },
          options: [
            { id: "a", text: { en: "The solution unpacked into source control (pac solution unpack / clone)", uk: "Рішення, розпаковане в систему контролю версій (pac solution unpack / clone)" } },
            { id: "b", text: { en: "Automated export, build and import with pipelines (Azure DevOps, GitHub Actions or Power Platform Pipelines)", uk: "Автоматизовані експорт, збирання та імпорт конвеєрами (Azure DevOps, GitHub Actions або Power Platform Pipelines)" } },
            { id: "c", text: { en: "Connection references instead of connections inside flows", uk: "Посилання на з'єднання (connection references) замість самих з'єднань у flow" } },
            { id: "d", text: { en: "One shared development environment where everyone edits the Default solution", uk: "Одне спільне dev-середовище, де всі редагують Default solution" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "patch",
          mode: "single",
          prompt: {
            en: "What is the difference between an update and an upgrade when importing a managed solution?",
            uk: "Чим відрізняються update та upgrade під час імпорту керованого рішення?",
          },
          options: [
            { id: "a", text: { en: "An upgrade replaces the old version and deletes components that are no longer in the solution; an update only adds and changes", uk: "Upgrade замінює стару версію й видаляє компоненти, яких більше немає в рішенні; update лише додає та змінює" } },
            { id: "b", text: { en: "They are the same", uk: "Вони однакові" } },
            { id: "c", text: { en: "An update deletes all data in the solution's tables", uk: "Update видаляє всі дані в таблицях рішення" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
