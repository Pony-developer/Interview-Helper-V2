import type { ModuleDef } from "../types";

export const platformModule: ModuleDef = {
  slug: "crm-platform",
  title: { en: "Dynamics 365 and Dataverse", uk: "Dynamics 365 і Dataverse" },
  slides: [
    {
      kind: "lecture",
      slug: "dynamics-landscape",
      title: { en: "Dynamics 365, Power Platform and Dataverse", uk: "Dynamics 365, Power Platform і Dataverse" },
    },
    { kind: "lecture", slug: "dataverse-tables", title: { en: "Tables, columns and relationships", uk: "Таблиці, стовпці та зв'язки" } },
    {
      kind: "quiz",
      slug: "platform-quiz",
      title: { en: "Platform check", uk: "Перевірка: платформа" },
      questions: [
        {
          id: "dataverse",
          mode: "single",
          prompt: {
            en: "How do Dynamics 365 Sales and a custom model-driven app relate to Dataverse?",
            uk: "Як Dynamics 365 Sales і власний model-driven застосунок пов'язані з Dataverse?",
          },
          options: [
            { id: "a", text: { en: "Both are model-driven apps on top of the same Dataverse platform: tables, security, API and plug-ins", uk: "Обидва є model-driven застосунками на тій самій платформі Dataverse: таблиці, безпека, API і плагіни" } },
            { id: "b", text: { en: "Dynamics 365 has its own database; only custom apps use Dataverse", uk: "Dynamics 365 має власну базу; Dataverse використовують лише власні застосунки" } },
            { id: "c", text: { en: "Dataverse is only a reporting copy of Dynamics data", uk: "Dataverse лише звітна копія даних Dynamics" } },
          ],
          correct: ["a"],
        },
        {
          id: "names",
          mode: "single",
          prompt: {
            en: "Which name does code use for a custom column in the SDK and FetchXML?",
            uk: "Яке ім'я використовує код для власного стовпця в SDK та FetchXML?",
          },
          options: [
            { id: "a", text: { en: "The logical name, all lower case with the publisher prefix, such as new_creditscore", uk: "Логічне ім'я в нижньому регістрі з префіксом видавця, наприклад new_creditscore" } },
            { id: "b", text: { en: "The display name shown on the form, such as Credit score", uk: "Відображуване ім'я з форми, наприклад Credit score" } },
            { id: "c", text: { en: "The column's GUID", uk: "GUID стовпця" } },
          ],
          correct: ["a"],
        },
        {
          id: "lookup",
          mode: "single",
          prompt: {
            en: "In a 1:N relationship between account and contact, where is the link stored?",
            uk: "Де зберігається зв'язок у відношенні 1:N між account і contact?",
          },
          options: [
            { id: "a", text: { en: "In a lookup column on contact that points to an account", uk: "У lookup-стовпці контакту, що вказує на акаунт" } },
            { id: "b", text: { en: "In a list of contact ids on the account", uk: "У списку id контактів в акаунті" } },
            { id: "c", text: { en: "In an intersect table", uk: "У проміжній (intersect) таблиці" } },
          ],
          correct: ["a"],
        },
        {
          id: "cascade",
          mode: "single",
          prompt: {
            en: "What do a relationship's cascade settings decide?",
            uk: "Що визначають налаштування каскаду зв'язку?",
          },
          options: [
            { id: "a", text: { en: "What happens to child records when the parent is assigned, shared, reparented or deleted", uk: "Що стається з дочірніми записами, коли батьківський призначають, надають у доступ, змінюють батька чи видаляють" } },
            { id: "b", text: { en: "The order in which records are shown in a subgrid", uk: "Порядок записів у підсітці" } },
            { id: "c", text: { en: "Which form opens when you click the lookup", uk: "Яка форма відкривається при кліку на lookup" } },
          ],
          correct: ["a"],
        },
        {
          id: "types",
          mode: "multi",
          prompt: {
            en: "Which are real Dataverse table ownership or column options?",
            uk: "Які з цих варіантів справді є типами володіння таблицею чи стовпців у Dataverse?",
          },
          options: [
            { id: "a", text: { en: "User or team owned tables", uk: "Таблиці у власності користувача або команди" } },
            { id: "b", text: { en: "Organization owned tables", uk: "Таблиці у власності організації" } },
            { id: "c", text: { en: "Choice and choices (multi-select) columns", uk: "Стовпці choice і choices (множинний вибір)" } },
            { id: "d", text: { en: "Columns that store a stored procedure", uk: "Стовпці, що зберігають збережену процедуру" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "alt-key",
          mode: "single",
          prompt: {
            en: "An ERP sends customers with its own customer code. How do you update the right account without looking up its GUID first?",
            uk: "ERP надсилає клієнтів зі своїм кодом клієнта. Як оновити потрібний акаунт, не шукаючи спершу його GUID?",
          },
          options: [
            { id: "a", text: { en: "Define an alternate key on the code column and upsert by that key", uk: "Створити альтернативний ключ на стовпці коду й робити upsert за цим ключем" } },
            { id: "b", text: { en: "Store the ERP code in the primary key", uk: "Зберігати код ERP у первинному ключі" } },
            { id: "c", text: { en: "Use the account name as the key", uk: "Використати назву акаунта як ключ" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
