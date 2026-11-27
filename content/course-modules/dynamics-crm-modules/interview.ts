import type { ModuleDef } from "../types";

export const interviewModule: ModuleDef = {
  slug: "crm-interview",
  title: { en: "Interview preparation", uk: "Підготовка до співбесіди" },
  slides: [
    {
      kind: "lecture",
      slug: "interview-questions",
      title: { en: "Common Dynamics developer interview questions", uk: "Типові питання на співбесіді розробника Dynamics" },
    },
    {
      kind: "lecture",
      slug: "design-scenarios",
      title: { en: "Solving design scenarios", uk: "Розв'язання задач на проєктування" },
    },
    {
      kind: "quiz",
      slug: "interview-quiz",
      title: { en: "Scenario check", uk: "Перевірка: сценарії" },
      questions: [
        {
          id: "invoice-number",
          mode: "single",
          prompt: {
            en: "Invoices need numbers like INV-2026-00042 that are unique and never repeat, even when many users save at once. What do you build?",
            uk: "Рахункам потрібні номери на кшталт INV-2026-00042, унікальні й без повторів, навіть коли багато користувачів зберігають одночасно. Що побудувати?",
          },
          options: [
            { id: "a", text: { en: "An autonumber column, or a pre-operation plug-in that locks a counter row inside the transaction", uk: "Autonumber-стовпець або pre-operation плагін, що блокує рядок-лічильник усередині транзакції" } },
            { id: "b", text: { en: "A form script that reads the highest number and adds 1", uk: "Скрипт форми, що читає найбільший номер і додає 1" } },
            { id: "c", text: { en: "An asynchronous flow that counts the invoices and writes the next number", uk: "Асинхронний потік, що рахує рахунки й записує наступний номер" } },
          ],
          correct: ["a"],
        },
        {
          id: "erp-sync",
          mode: "single",
          prompt: {
            en: "Every change to an account must reach the ERP, which is sometimes offline for maintenance. Which design is most reliable?",
            uk: "Кожна зміна акаунта має потрапити в ERP, яка іноді недоступна через обслуговування. Яке рішення найнадійніше?",
          },
          options: [
            { id: "a", text: { en: "Post the change to an Azure Service Bus queue (service endpoint or async plug-in) and let a consumer deliver it with retries and a dead-letter queue", uk: "Надсилати зміну в чергу Azure Service Bus (service endpoint чи асинхронний плагін), а споживач доставляє її з повторами та dead-letter чергою" } },
            { id: "b", text: { en: "Call the ERP from a synchronous plug-in and fail the save when it is offline", uk: "Викликати ERP із синхронного плагіна й скасовувати збереження, коли вона недоступна" } },
            { id: "c", text: { en: "Export all accounts to a CSV file every night", uk: "Щоночі експортувати всі акаунти у файл CSV" } },
          ],
          correct: ["a"],
        },
        {
          id: "hide-salary",
          mode: "single",
          prompt: {
            en: "Only HR may see a contact's salary column, also in views, exports and the API. What do you use?",
            uk: "Лише HR може бачити стовпець зарплати контакту, зокрема в поданнях, експорті та API. Що використати?",
          },
          options: [
            { id: "a", text: { en: "Column security with a column security profile for HR", uk: "Безпеку стовпців із профілем безпеки стовпців для HR" } },
            { id: "b", text: { en: "Hide the column on the form with a business rule", uk: "Сховати стовпець на формі бізнес-правилом" } },
            { id: "c", text: { en: "Remove the column from all views", uk: "Прибрати стовпець з усіх подань" } },
          ],
          correct: ["a"],
        },
        {
          id: "pre-post",
          mode: "single",
          prompt: {
            en: "When a case is created, its priority must be set from the customer's SLA level, and a follow-up task must be created for the owner. How do you register it?",
            uk: "Під час створення звернення його пріоритет треба задати за рівнем SLA клієнта, а для власника створити задачу. Як це зареєструвати?",
          },
          options: [
            { id: "a", text: { en: "Set the priority on Target in PreOperation; create the task in PostOperation, when the case id exists", uk: "Задати пріоритет у Target на PreOperation; створити задачу на PostOperation, коли id звернення вже існує" } },
            { id: "b", text: { en: "Do both in PreValidation", uk: "Зробити обидва на PreValidation" } },
            { id: "c", text: { en: "Do both in PostOperation with an extra Update of the case", uk: "Зробити обидва на PostOperation з додатковим Update звернення" } },
          ],
          correct: ["a"],
        },
        {
          id: "volume",
          mode: "single",
          prompt: {
            en: "A nightly job must recalculate a score on 2 million contacts from their activity data. Which approach fits?",
            uk: "Нічне завдання має перерахувати оцінку для 2 мільйонів контактів на основі їхніх активностей. Який підхід підходить?",
          },
          options: [
            { id: "a", text: { en: "An external job (Azure Function or WebJob) that reads in pages and writes with UpdateMultiple in parallel, bypassing unneeded plug-ins", uk: "Зовнішнє завдання (Azure Function чи WebJob), що читає сторінками й пише через UpdateMultiple паралельно, оминаючи непотрібні плагіни" } },
            { id: "b", text: { en: "A scheduled cloud flow with Apply to each", uk: "Хмарний потік за розкладом з Apply to each" } },
            { id: "c", text: { en: "A synchronous plug-in on Retrieve of contact", uk: "Синхронний плагін на Retrieve контакту" } },
          ],
          correct: ["a"],
        },
        {
          id: "upgrade",
          mode: "single",
          prompt: {
            en: "A column was removed in version 2.0 of your managed solution, but it is still in production after you imported 2.0. Why?",
            uk: "Стовпець видалили у версії 2.0 вашого керованого рішення, але після імпорту 2.0 він досі є в продакшні. Чому?",
          },
          options: [
            { id: "a", text: { en: "It was imported as an update instead of an upgrade; an upgrade (or stage for upgrade and apply) deletes components missing from the new version", uk: "Його імпортували як update, а не upgrade; upgrade (або stage for upgrade і apply) видаляє компоненти, яких немає в новій версії" } },
            { id: "b", text: { en: "Managed solutions can never delete columns", uk: "Керовані рішення ніколи не можуть видаляти стовпці" } },
            { id: "c", text: { en: "Columns are only deleted after a publish all customizations", uk: "Стовпці видаляються лише після Publish all customizations" } },
          ],
          correct: ["a"],
        },
        {
          id: "clarify",
          mode: "multi",
          prompt: {
            en: "An interviewer gives you a vague requirement: 'notify managers about big deals'. What should you ask before designing?",
            uk: "Інтерв'юер дає розмиту вимогу: «сповіщати менеджерів про великі угоди». Що варто спитати перед проєктуванням?",
          },
          options: [
            { id: "a", text: { en: "What counts as big, and is the threshold fixed or configurable?", uk: "Що вважати великою угодою, і чи поріг фіксований, чи налаштовуваний?" } },
            { id: "b", text: { en: "Which manager: the owner's manager, a team, a business unit?", uk: "Який менеджер: керівник власника, команда, бізнес-підрозділ?" } },
            { id: "c", text: { en: "When: on creation, when the value crosses the threshold, or when the deal is won?", uk: "Коли: при створенні, коли сума перетинає поріг, чи коли угоду виграно?" } },
            { id: "d", text: { en: "Nothing: start writing the plug-in at once to show speed", uk: "Нічого: одразу почати писати плагін, щоб показати швидкість" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "client-vs-server",
          mode: "single",
          prompt: {
            en: "'A lead's email must be unique.' A candidate proposes an OnSave form script that checks for duplicates. What is the main weakness?",
            uk: "«Email ліда має бути унікальним». Кандидат пропонує скрипт форми на OnSave, що перевіряє дублікати. Яка головна вада?",
          },
          options: [
            { id: "a", text: { en: "Imports, the API and flows never run form scripts, and two users can still save at the same moment; use an alternate key or server-side check", uk: "Імпорт, API й потоки ніколи не запускають скрипти форм, і двоє користувачів усе одно можуть зберегти одночасно; потрібен альтернативний ключ або перевірка на сервері" } },
            { id: "b", text: { en: "Form scripts cannot call the Web API", uk: "Скрипти форм не можуть викликати Web API" } },
            { id: "c", text: { en: "There is no weakness", uk: "Вад немає" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
