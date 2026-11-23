import type { ModuleDef } from "../types";
import { CRM } from "./sdk";

export const webApiModule: ModuleDef = {
  slug: "crm-web-api",
  title: { en: "Web API", uk: "Web API" },
  slides: [
    { kind: "lecture", slug: "web-api-crud", title: { en: "Web API: create, read, update, delete", uk: "Web API: створення, читання, оновлення, видалення" } },
    { kind: "lecture", slug: "web-api-queries", title: { en: "Querying with OData", uk: "Запити через OData" } },
    {
      kind: "lecture",
      slug: "web-api-actions-batch",
      title: { en: "Functions, actions and $batch", uk: "Функції, дії та $batch" },
    },
    {
      kind: "quiz",
      slug: "web-api-quiz",
      title: { en: "Web API check", uk: "Перевірка: Web API" },
      questions: [
        {
          id: "bind",
          mode: "single",
          prompt: {
            en: "How do you set the parent account of a new contact in a Web API POST body?",
            uk: "Як задати батьківський акаунт нового контакту в тілі POST-запиту Web API?",
          },
          options: [
            { id: "a", text: { en: "\"parentcustomerid_account@odata.bind\": \"/accounts(<guid>)\"", uk: "\"parentcustomerid_account@odata.bind\": \"/accounts(<guid>)\"" } },
            { id: "b", text: { en: "\"parentcustomerid\": \"<guid>\"", uk: "\"parentcustomerid\": \"<guid>\"" } },
            { id: "c", text: { en: "\"_parentcustomerid_value\": \"<guid>\"", uk: "\"_parentcustomerid_value\": \"<guid>\"" } },
          ],
          correct: ["a"],
        },
        {
          id: "lookup-read",
          mode: "single",
          prompt: {
            en: "In a GET response, under which property is the id of a contact's parent account?",
            uk: "Під якою властивістю у відповіді GET лежить id батьківського акаунта контакту?",
          },
          options: [
            { id: "a", text: { en: "_parentcustomerid_value", uk: "_parentcustomerid_value" } },
            { id: "b", text: { en: "parentcustomerid", uk: "parentcustomerid" } },
            { id: "c", text: { en: "parentcustomerid_account@odata.bind", uk: "parentcustomerid_account@odata.bind" } },
          ],
          correct: ["a"],
        },
        {
          id: "formatted",
          mode: "single",
          prompt: {
            en: "How do you get choice labels and lookup names in the response?",
            uk: "Як отримати у відповіді підписи choice і назви lookup-записів?",
          },
          options: [
            { id: "a", text: { en: "Send Prefer: odata.include-annotations=\"*\" and read the @OData.Community.Display.V1.FormattedValue annotations", uk: "Надіслати Prefer: odata.include-annotations=\"*\" і читати анотації @OData.Community.Display.V1.FormattedValue" } },
            { id: "b", text: { en: "Add $format=labels to the URL", uk: "Додати $format=labels до URL" } },
            { id: "c", text: { en: "They are always included", uk: "Вони завжди є" } },
          ],
          correct: ["a"],
        },
        {
          id: "paging",
          mode: "single",
          prompt: {
            en: "How do you read all pages of a large Web API query?",
            uk: "Як прочитати всі сторінки великого запиту Web API?",
          },
          options: [
            { id: "a", text: { en: "Set Prefer: odata.maxpagesize and follow @odata.nextLink until it is absent", uk: "Задати Prefer: odata.maxpagesize і переходити за @odata.nextLink, доки він є" } },
            { id: "b", text: { en: "Use $skip with increasing offsets", uk: "Використати $skip зі зростаючими зсувами" } },
            { id: "c", text: { en: "Set $top=100000", uk: "Задати $top=100000" } },
          ],
          correct: ["a"],
        },
        {
          id: "batch",
          mode: "multi",
          prompt: {
            en: "Which statements about $batch are true?",
            uk: "Які твердження про $batch правильні?",
          },
          options: [
            { id: "a", text: { en: "It sends several operations in one HTTP request", uk: "Він надсилає кілька операцій в одному HTTP-запиті" } },
            { id: "b", text: { en: "Operations inside a change set succeed or fail together", uk: "Операції всередині change set разом вдаються або разом скасовуються" } },
            { id: "c", text: { en: "A change set can refer to a record created earlier in it with $<Content-ID>", uk: "Change set може посилатися на запис, створений раніше в ньому, через $<Content-ID>" } },
            { id: "d", text: { en: "Each request in a batch skips plug-ins", uk: "Кожен запит у пакеті пропускає плагіни" } },
          ],
          correct: ["a", "b", "c"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "odata-to-sql",
      title: { en: "Practice: An OData query in SQL", uk: "Практика «Запит OData мовою SQL»" },
      language: "sql",
      setup: CRM,
      starter: "-- Write your query here\n",
      solution: `SELECT c.fullname, c.emailaddress1, a.name AS account
FROM contact c
LEFT JOIN account a ON a.accountid = c.parentcustomerid
WHERE c.statecode = 0 AND c.emailaddress1 IS NOT NULL
ORDER BY c.fullname;
`,
      expectedOutput: "     fullname      |    emailaddress1     |  account\n-------------------+----------------------+-----------\n Andrii Shevchenko | andrii@northwind.com | Northwind\n Daria Lysenko     | daria@litware.com    | Litware\n Maksym Kravets    | maksym@fabrikam.com  | Fabrikam\n Olena Koval       | olena@contoso.com    | Contoso\n Petro Hnatiuk     | petro@example.com    | NULL\n Taras Melnyk      | taras@contoso.com    | Contoso\n(6 rows)\n",
      maxScore: 4,
    },
  ],
};
