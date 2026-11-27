import type { ModuleDef } from "../types";
import { BEGINNER_CRM } from "./first-steps";

export const fetchDrillsModule: ModuleDef = {
  slug: "crm-fetch-drills",
  title: { en: "Reading FetchXML: easy drills", uk: "Читаємо FetchXML: прості вправи" },
  slides: [
    { kind: "lecture", slug: "reading-fetchxml", title: { en: "Reading FetchXML step by step", uk: "Читаємо FetchXML крок за кроком" } },
    {
      kind: "quiz",
      slug: "fetch-drills-quiz",
      title: { en: "FetchXML check", uk: "Перевірка: FetchXML" },
      questions: [
        {
          id: "entity",
          mode: "single",
          prompt: {
            en: "In <fetch><entity name=\"contact\">…, what does name=\"contact\" mean?",
            uk: "Що означає name=\"contact\" у <fetch><entity name=\"contact\">…?",
          },
          options: [
            { id: "a", text: { en: "The logical name of the table to query: FROM contact", uk: "Логічне ім'я таблиці для запиту: FROM contact" } },
            { id: "b", text: { en: "The name of the view", uk: "Назва подання" } },
            { id: "c", text: { en: "The display name shown to users", uk: "Відображуване ім'я для користувачів" } },
          ],
          correct: ["a"],
        },
        {
          id: "operators",
          mode: "multi",
          prompt: {
            en: "Which FetchXML conditions are translated correctly into SQL?",
            uk: "Які умови FetchXML правильно перекладено на SQL?",
          },
          options: [
            { id: "a", text: { en: "operator=\"eq\" value=\"0\" → = 0", uk: "operator=\"eq\" value=\"0\" → = 0" } },
            { id: "b", text: { en: "operator=\"not-null\" → IS NOT NULL", uk: "operator=\"not-null\" → IS NOT NULL" } },
            { id: "c", text: { en: "operator=\"begins-with\" value=\"Sales\" → LIKE 'Sales%'", uk: "operator=\"begins-with\" value=\"Sales\" → LIKE 'Sales%'" } },
            { id: "d", text: { en: "operator=\"ne\" value=\"0\" → = NULL", uk: "operator=\"ne\" value=\"0\" → = NULL" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "filter-type",
          mode: "single",
          prompt: {
            en: "A <filter type=\"or\"> contains two conditions. How are they combined?",
            uk: "<filter type=\"or\"> містить дві умови. Як вони поєднуються?",
          },
          options: [
            { id: "a", text: { en: "With OR: a row matches if either condition is true", uk: "Через OR: рядок підходить, якщо істинна будь-яка умова" } },
            { id: "b", text: { en: "With AND, like every filter", uk: "Через AND, як кожен фільтр" } },
            { id: "c", text: { en: "Only the first condition is used", uk: "Використовується лише перша умова" } },
          ],
          correct: ["a"],
        },
        {
          id: "link-type",
          mode: "single",
          prompt: {
            en: "A link-entity has link-type=\"inner\". What happens to contacts without a parent account?",
            uk: "link-entity має link-type=\"inner\". Що стається з контактами без батьківського акаунта?",
          },
          options: [
            { id: "a", text: { en: "They are left out, like with an INNER JOIN", uk: "Їх не буде в результаті, як з INNER JOIN" } },
            { id: "b", text: { en: "They appear with empty account columns", uk: "Вони з'являються з порожніми стовпцями акаунта" } },
            { id: "c", text: { en: "The query fails", uk: "Запит падає" } },
          ],
          correct: ["a"],
        },
        {
          id: "from-to",
          mode: "single",
          prompt: {
            en: "In <link-entity name=\"account\" from=\"accountid\" to=\"parentcustomerid\"> inside a contact query, which SQL join condition does it mean?",
            uk: "Яку умову з'єднання SQL означає <link-entity name=\"account\" from=\"accountid\" to=\"parentcustomerid\"> у запиті до contact?",
          },
          options: [
            { id: "a", text: { en: "account.accountid = contact.parentcustomerid", uk: "account.accountid = contact.parentcustomerid" } },
            { id: "b", text: { en: "account.parentcustomerid = contact.accountid", uk: "account.parentcustomerid = contact.accountid" } },
            { id: "c", text: { en: "account.accountid = contact.contactid", uk: "account.accountid = contact.contactid" } },
          ],
          correct: ["a"],
        },
        {
          id: "aggregate",
          mode: "single",
          prompt: {
            en: "What must you add to <fetch> to use groupby and count?",
            uk: "Що треба додати до <fetch>, щоб використовувати groupby і count?",
          },
          options: [
            { id: "a", text: { en: "aggregate=\"true\"", uk: "aggregate=\"true\"" } },
            { id: "b", text: { en: "distinct=\"true\"", uk: "distinct=\"true\"" } },
            { id: "c", text: { en: "count=\"true\"", uk: "count=\"true\"" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "fetch-filter",
      title: { en: "Practice: Filters and sorting", uk: "Практика «Фільтри та сортування»" },
      language: "sql",
      setup: BEGINNER_CRM,
      starter: "-- Write your query here\n",
      solution: `SELECT fullname, jobtitle, emailaddress1
FROM contact
WHERE statecode = 0
  AND jobtitle LIKE 'Sales%'
  AND emailaddress1 IS NOT NULL
ORDER BY fullname;
`,
      expectedOutput: "     fullname      |       jobtitle       |    emailaddress1\n-------------------+----------------------+----------------------\n Andrii Shevchenko | Sales Representative | andrii@northwind.com\n Maksym Kravets    | Sales Director       | maksym@fabrikam.com\n Olena Koval       | Sales Manager        | olena@contoso.com\n(3 rows)\n",
      maxScore: 2,
    },
    {
      kind: "practice",
      slug: "fetch-link",
      title: { en: "Practice: A link-entity", uk: "Практика «Link-entity»" },
      language: "sql",
      setup: BEGINNER_CRM,
      starter: "-- Write your query here\n",
      solution: `SELECT a.name AS account, c.fullname
FROM contact c
JOIN account a ON a.accountid = c.parentcustomerid
WHERE c.statecode = 0
  AND a.statecode = 0
  AND a.address1_city = 'Kyiv'
ORDER BY account, c.fullname;
`,
      expectedOutput: " account |   fullname\n---------+---------------\n Contoso | Olena Koval\n Contoso | Taras Melnyk\n Litware | Daria Lysenko\n(3 rows)\n",
      maxScore: 3,
    },
    {
      kind: "practice",
      slug: "fetch-aggregate",
      title: { en: "Practice: Count with groupby", uk: "Практика «Підрахунок із groupby»" },
      language: "sql",
      setup: BEGINNER_CRM,
      starter: "-- Write your query here\n",
      solution: `SELECT address1_city AS city, count(*) AS contacts
FROM contact
WHERE statecode = 0
GROUP BY address1_city
ORDER BY contacts DESC, city;
`,
      expectedOutput: " city  | contacts\n-------+----------\n Kyiv  |        4\n Lviv  |        2\n Odesa |        1\n(3 rows)\n",
      maxScore: 3,
    },
  ],
};
