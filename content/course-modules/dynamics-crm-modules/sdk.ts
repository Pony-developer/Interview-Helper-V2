import type { ModuleDef } from "../types";

/** Two Dataverse tables with their real logical names, cut down to a few columns. */
const CRM = `-- statecode: 0 = Active, 1 = Inactive
CREATE TABLE account (
    accountid integer PRIMARY KEY,
    name      text NOT NULL,
    statecode integer NOT NULL DEFAULT 0,
    revenue   numeric(14, 2)
);

CREATE TABLE contact (
    contactid        integer PRIMARY KEY,
    fullname         text NOT NULL,
    parentcustomerid integer REFERENCES account (accountid),
    statecode        integer NOT NULL DEFAULT 0,
    emailaddress1    text
);

INSERT INTO account (accountid, name, statecode, revenue) VALUES
    (1, 'Contoso', 0, 5000000),
    (2, 'Fabrikam', 0, 1200000),
    (3, 'Northwind', 1, 800000),
    (4, 'Adventure Works', 0, NULL),
    (5, 'Litware', 0, 300000);

INSERT INTO contact (contactid, fullname, parentcustomerid, statecode, emailaddress1) VALUES
    (1, 'Olena Koval', 1, 0, 'olena@contoso.com'),
    (2, 'Taras Melnyk', 1, 0, 'taras@contoso.com'),
    (3, 'Iryna Bondar', 1, 1, NULL),
    (4, 'Maksym Kravets', 2, 0, 'maksym@fabrikam.com'),
    (5, 'Sofia Tkachenko', 2, 1, NULL),
    (6, 'Andrii Shevchenko', 3, 0, NULL),
    (7, 'Daria Lysenko', 5, 0, 'daria@litware.com'),
    (8, 'Petro Hnatiuk', NULL, 0, NULL);
`;

export const sdkModule: ModuleDef = {
  slug: "crm-sdk",
  title: { en: "Working with data from code", uk: "Робота з даними з коду" },
  slides: [
    {
      kind: "lecture",
      slug: "organization-service",
      title: { en: "The SDK and IOrganizationService", uk: "SDK та IOrganizationService" },
    },
    {
      kind: "lecture",
      slug: "querying-dataverse",
      title: { en: "QueryExpression, FetchXML and paging", uk: "QueryExpression, FetchXML і пагінація" },
    },
    {
      kind: "quiz",
      slug: "sdk-quiz",
      title: { en: "SDK and queries check", uk: "Перевірка: SDK і запити" },
      questions: [
        {
          id: "update-columns",
          mode: "single",
          prompt: {
            en: "You retrieve an account with all columns, change its phone and call Update with that entity. What is the problem?",
            uk: "Ви отримали акаунт з усіма стовпцями, змінили телефон і викликали Update з цією сутністю. У чому проблема?",
          },
          options: [
            { id: "a", text: { en: "Every column is sent and \"changed\": plug-ins and auditing fire for all of them and you may overwrite someone else's edit", uk: "Надсилаються й «змінюються» всі стовпці: плагіни та аудит спрацьовують для всіх, і можна перезаписати чужу зміну" } },
            { id: "b", text: { en: "There is no problem: only changed values are saved", uk: "Проблеми немає: зберігаються лише змінені значення" } },
            { id: "c", text: { en: "Update cannot accept a retrieved entity", uk: "Update не приймає отриману сутність" } },
          ],
          correct: ["a"],
        },
        {
          id: "types",
          mode: "multi",
          prompt: {
            en: "Which SDK types are used for these column values?",
            uk: "Які типи SDK використовуються для значень таких стовпців?",
          },
          options: [
            { id: "a", text: { en: "Lookup: EntityReference", uk: "Lookup: EntityReference" } },
            { id: "b", text: { en: "Choice: OptionSetValue", uk: "Choice: OptionSetValue" } },
            { id: "c", text: { en: "Currency: Money", uk: "Currency: Money" } },
            { id: "d", text: { en: "Lookup: the related record's name as a string", uk: "Lookup: назва пов'язаного запису як рядок" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "paging",
          mode: "single",
          prompt: {
            en: "A RetrieveMultiple returns 5,000 records and MoreRecords = true. What do you do?",
            uk: "RetrieveMultiple повернув 5000 записів і MoreRecords = true. Що робити?",
          },
          options: [
            { id: "a", text: { en: "Request the next page with PageInfo.PageNumber + 1 and the returned PagingCookie, until MoreRecords is false", uk: "Запитати наступну сторінку з PageInfo.PageNumber + 1 і отриманим PagingCookie, доки MoreRecords не стане false" } },
            { id: "b", text: { en: "Nothing: 5,000 is all the data", uk: "Нічого: 5000 — це всі дані" } },
            { id: "c", text: { en: "Set Count = 100000 to get everything in one call", uk: "Задати Count = 100000, щоб отримати все одним викликом" } },
          ],
          correct: ["a"],
        },
        {
          id: "link-entity",
          mode: "single",
          prompt: {
            en: "In FetchXML, what does a filter inside an outer link-entity do?",
            uk: "Що робить фільтр усередині зовнішнього (outer) link-entity у FetchXML?",
          },
          options: [
            { id: "a", text: { en: "It limits which related rows are joined, like a condition in a LEFT JOIN's ON clause; parent rows without a match stay", uk: "Обмежує, які пов'язані рядки приєднуються, як умова в ON для LEFT JOIN; батьківські рядки без збігу лишаються" } },
            { id: "b", text: { en: "It removes parent rows that have no matching related row, like WHERE", uk: "Прибирає батьківські рядки без відповідного пов'язаного рядка, як WHERE" } },
            { id: "c", text: { en: "It is ignored for outer joins", uk: "Для зовнішніх з'єднань він ігнорується" } },
          ],
          correct: ["a"],
        },
        {
          id: "execute-multiple",
          mode: "single",
          prompt: {
            en: "What does ExecuteTransactionRequest give you that ExecuteMultipleRequest does not?",
            uk: "Що дає ExecuteTransactionRequest, чого не дає ExecuteMultipleRequest?",
          },
          options: [
            { id: "a", text: { en: "All requests succeed or fail together in one database transaction", uk: "Усі запити разом виконуються або разом скасовуються в одній транзакції бази" } },
            { id: "b", text: { en: "Up to a million requests per call", uk: "До мільйона запитів за виклик" } },
            { id: "c", text: { en: "Requests run in parallel on the server", uk: "Запити виконуються паралельно на сервері" } },
          ],
          correct: ["a"],
        },
        {
          id: "count",
          mode: "single",
          prompt: {
            en: "What is the cheapest way to count active contacts per account?",
            uk: "Який найдешевший спосіб порахувати активні контакти для кожного акаунта?",
          },
          options: [
            { id: "a", text: { en: "An aggregate FetchXML query with groupby and countcolumn", uk: "Агрегатний FetchXML-запит із groupby і countcolumn" } },
            { id: "b", text: { en: "Retrieve every contact and count them in C#", uk: "Отримати всі контакти й порахувати їх у C#" } },
            { id: "c", text: { en: "Call Retrieve for each account", uk: "Викликати Retrieve для кожного акаунта" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "fetchxml-to-sql",
      title: { en: "Practice: FetchXML in SQL", uk: "Практика «FetchXML мовою SQL»" },
      language: "sql",
      setup: CRM,
      starter: "-- Write your query here\n",
      solution: `SELECT a.name AS account, count(c.contactid) AS contacts
FROM account a
LEFT JOIN contact c ON c.parentcustomerid = a.accountid AND c.statecode = 0
WHERE a.statecode = 0
GROUP BY a.accountid, a.name
ORDER BY contacts DESC, account;
`,
      expectedOutput: "     account     | contacts\n-----------------+----------\n Contoso         |        2\n Fabrikam        |        1\n Litware         |        1\n Adventure Works |        0\n(4 rows)\n",
      maxScore: 4,
    },
  ],
};
