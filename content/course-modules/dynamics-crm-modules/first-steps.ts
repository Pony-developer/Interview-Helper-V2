import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

/** A small, friendly copy of account and contact for the beginner SQL practices. */
export const BEGINNER_CRM = `-- statecode: 0 = Active, 1 = Inactive
-- contact.parentcustomerid is the lookup to the contact's account
CREATE TABLE account (
    accountid         integer PRIMARY KEY,
    name              text NOT NULL,
    address1_city     text,
    numberofemployees integer,
    statecode         integer NOT NULL DEFAULT 0
);

CREATE TABLE contact (
    contactid        integer PRIMARY KEY,
    fullname         text NOT NULL,
    jobtitle         text,
    emailaddress1    text,
    address1_city    text,
    parentcustomerid integer REFERENCES account (accountid),
    statecode        integer NOT NULL DEFAULT 0
);

INSERT INTO account (accountid, name, address1_city, numberofemployees, statecode) VALUES
    (1, 'Contoso', 'Kyiv', 500, 0),
    (2, 'Fabrikam', 'Lviv', 120, 0),
    (3, 'Northwind', 'Kyiv', 80, 1),
    (4, 'Adventure Works', 'Odesa', 45, 0),
    (5, 'Litware', 'Kyiv', NULL, 0),
    (6, 'Alpine Ski House', 'Lviv', 30, 0);

INSERT INTO contact (contactid, fullname, jobtitle, emailaddress1, address1_city, parentcustomerid, statecode) VALUES
    (1, 'Olena Koval', 'Sales Manager', 'olena@contoso.com', 'Kyiv', 1, 0),
    (2, 'Taras Melnyk', 'Developer', 'taras@contoso.com', 'Kyiv', 1, 0),
    (3, 'Iryna Bondar', 'Analyst', NULL, 'Kyiv', 1, 1),
    (4, 'Maksym Kravets', 'Sales Director', 'maksym@fabrikam.com', 'Lviv', 2, 0),
    (5, 'Sofia Tkachenko', 'Accountant', NULL, 'Lviv', 2, 0),
    (6, 'Andrii Shevchenko', 'Sales Representative', 'andrii@northwind.com', 'Kyiv', 3, 0),
    (7, 'Daria Lysenko', 'CEO', 'daria@litware.com', 'Kyiv', 5, 0),
    (8, 'Petro Hnatiuk', 'Consultant', 'petro@example.com', 'Odesa', NULL, 0);
`;

const NAMES_TYPES = (body: string) => `static class Names
{
${body}
}`;

const NAMES_STARTER = `    // "Credit Score", "contoso" -> "contoso_CreditScore"
    public static string SchemaName(string displayName, string prefix)
    {
        // Write your code here
        return "";
    }

    // "Credit Score", "contoso" -> "contoso_creditscore"
    public static string LogicalName(string displayName, string prefix)
    {
        // Write your code here
        return "";
    }

    // "Company", "contoso" -> "contoso_companies"
    public static string EntitySetName(string displayName, string prefix)
    {
        // Write your code here
        return "";
    }`;

const NAMES_SOLUTION = `    // "Credit Score", "contoso" -> "contoso_CreditScore"
    public static string SchemaName(string displayName, string prefix)
    {
        var words = displayName.Split(new[] { ' ', '-', '_', '.' }, StringSplitOptions.RemoveEmptyEntries);
        var result = new StringBuilder(prefix + "_");
        foreach (var word in words)
            result.Append(char.ToUpperInvariant(word[0])).Append(word.Substring(1));
        return result.ToString();
    }

    // "Credit Score", "contoso" -> "contoso_creditscore"
    public static string LogicalName(string displayName, string prefix)
    {
        return SchemaName(displayName, prefix).ToLowerInvariant();
    }

    // "Company", "contoso" -> "contoso_companies"
    public static string EntitySetName(string displayName, string prefix)
    {
        var name = LogicalName(displayName, prefix);
        if (name.EndsWith("y")) return name.Substring(0, name.Length - 1) + "ies";
        if (name.EndsWith("s")) return name + "es";
        return name + "s";
    }`;

const NAMES_MAIN = `        Console.WriteLine("Tables:");
        foreach (var table in new[] { "Project", "Delivery Address", "Company", "Business Process" })
            Console.WriteLine("  " + table + " -> " + Names.SchemaName(table, "contoso") + " | " +
                Names.LogicalName(table, "contoso") + " | " + Names.EntitySetName(table, "contoso"));

        Console.WriteLine("Columns:");
        foreach (var column in new[] { "Credit Score", "ERP customer code", "e-mail 2" })
            Console.WriteLine("  " + column + " -> " + Names.SchemaName(column, "new") + " | " + Names.LogicalName(column, "new"));`;

export const firstStepsModule: ModuleDef = {
  slug: "crm-first-steps",
  title: { en: "First steps for new developers", uk: "Перші кроки для нових розробників" },
  slides: [
    { kind: "lecture", slug: "glossary", title: { en: "The words Dynamics people use", uk: "Слова, якими говорять у Dynamics" } },
    {
      kind: "lecture",
      slug: "first-table-and-app",
      title: { en: "Your first table and app, step by step", uk: "Ваша перша таблиця й застосунок крок за кроком" },
    },
    { kind: "lecture", slug: "how-a-save-works", title: { en: "What happens when you click Save", uk: "Що відбувається, коли ви натискаєте «Зберегти»" } },
    {
      kind: "quiz",
      slug: "first-steps-quiz",
      title: { en: "First steps check", uk: "Перевірка: перші кроки" },
      questions: [
        {
          id: "entity-table",
          mode: "single",
          prompt: {
            en: "Older documentation talks about an 'entity' and an 'attribute'. What are they called in the maker portal today?",
            uk: "Старіша документація говорить про «entity» та «attribute». Як вони називаються в maker portal сьогодні?",
          },
          options: [
            { id: "a", text: { en: "Table and column", uk: "Таблиця (table) і стовпець (column)" } },
            { id: "b", text: { en: "App and field", uk: "Застосунок і поле" } },
            { id: "c", text: { en: "Solution and component", uk: "Рішення й компонент" } },
          ],
          correct: ["a"],
        },
        {
          id: "option-set",
          mode: "single",
          prompt: {
            en: "What is an 'option set' called today?",
            uk: "Як сьогодні називається «option set»?",
          },
          options: [
            { id: "a", text: { en: "A choice", uk: "Choice (вибір)" } },
            { id: "b", text: { en: "A lookup", uk: "Lookup" } },
            { id: "c", text: { en: "A view", uk: "Подання (view)" } },
          ],
          correct: ["a"],
        },
        {
          id: "lookup",
          mode: "single",
          prompt: {
            en: "A contact form has a field 'Company Name' where you pick an account. What kind of column is it?",
            uk: "На формі контакту є поле «Company Name», де обирають акаунт. Який це тип стовпця?",
          },
          options: [
            { id: "a", text: { en: "A lookup: it stores a reference to another row", uk: "Lookup: він зберігає посилання на інший рядок" } },
            { id: "b", text: { en: "A text column with the account's name", uk: "Текстовий стовпець з назвою акаунта" } },
            { id: "c", text: { en: "A choice of all account names", uk: "Choice з усіма назвами акаунтів" } },
          ],
          correct: ["a"],
        },
        {
          id: "where-work",
          mode: "single",
          prompt: {
            en: "Where should you create a new table so it can be moved to test and production later?",
            uk: "Де створювати нову таблицю, щоб потім її можна було перенести в тест і продакшн?",
          },
          options: [
            { id: "a", text: { en: "Inside your own solution, with your own publisher", uk: "Усередині власного рішення з власним видавцем" } },
            { id: "b", text: { en: "Directly in production, then copy it back", uk: "Одразу в продакшні, а потім скопіювати назад" } },
            { id: "c", text: { en: "In the Default solution", uk: "У Default solution" } },
          ],
          correct: ["a"],
        },
        {
          id: "inactive",
          mode: "single",
          prompt: {
            en: "A user 'deactivates' an account. What happens to the row?",
            uk: "Користувач «деактивує» акаунт. Що стається з рядком?",
          },
          options: [
            { id: "a", text: { en: "It stays in the table with statecode = 1 (Inactive) and disappears from active views", uk: "Він лишається в таблиці зі statecode = 1 (Inactive) і зникає з подань активних записів" } },
            { id: "b", text: { en: "It is deleted", uk: "Його видаляють" } },
            { id: "c", text: { en: "It moves to an archive table", uk: "Його переносять в архівну таблицю" } },
          ],
          correct: ["a"],
        },
        {
          id: "save-order",
          mode: "single",
          prompt: {
            en: "When a user saves a form, what runs first?",
            uk: "Що виконується першим, коли користувач зберігає форму?",
          },
          options: [
            { id: "a", text: { en: "The form's OnSave scripts in the browser, then the request goes to the server", uk: "Скрипти OnSave форми в браузері, потім запит іде на сервер" } },
            { id: "b", text: { en: "Asynchronous plug-ins", uk: "Асинхронні плагіни" } },
            { id: "c", text: { en: "Cloud flows", uk: "Хмарні потоки" } },
          ],
          correct: ["a"],
        },
        {
          id: "sync-async",
          mode: "multi",
          prompt: {
            en: "Which of these can stop a save and show an error to the user?",
            uk: "Що з цього може зупинити збереження й показати користувачу помилку?",
          },
          options: [
            { id: "a", text: { en: "A synchronous plug-in that throws InvalidPluginExecutionException", uk: "Синхронний плагін, що кидає InvalidPluginExecutionException" } },
            { id: "b", text: { en: "An OnSave form script that prevents the save", uk: "Скрипт OnSave на формі, що скасовує збереження" } },
            { id: "c", text: { en: "A cloud flow triggered when the row is modified", uk: "Хмарний потік, що запускається при зміні рядка" } },
            { id: "d", text: { en: "An asynchronous plug-in", uk: "Асинхронний плагін" } },
          ],
          correct: ["a", "b"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "active-accounts-sql",
      title: { en: "Practice: Your first query", uk: "Практика «Ваш перший запит»" },
      language: "sql",
      setup: BEGINNER_CRM,
      starter: "-- Write your query here\n",
      solution: `SELECT name, address1_city
FROM account
WHERE statecode = 0
ORDER BY name;
`,
      expectedOutput: "       name       | address1_city\n------------------+---------------\n Adventure Works  | Odesa\n Alpine Ski House | Lviv\n Contoso          | Kyiv\n Fabrikam         | Lviv\n Litware          | Kyiv\n(5 rows)\n",
      maxScore: 2,
    },
    {
      kind: "practice",
      slug: "logical-names",
      title: { en: "Practice: Schema and logical names", uk: "Практика «Схемні та логічні імена»" },
      language: "csharp",
      starter: PROGRAM_WITH(NAMES_TYPES(NAMES_STARTER), NAMES_MAIN, "using System.Text;"),
      solution: PROGRAM_WITH(NAMES_TYPES(NAMES_SOLUTION), NAMES_MAIN, "using System.Text;"),
      expectedOutput: "Tables:\n  Project -> contoso_Project | contoso_project | contoso_projects\n  Delivery Address -> contoso_DeliveryAddress | contoso_deliveryaddress | contoso_deliveryaddresses\n  Company -> contoso_Company | contoso_company | contoso_companies\n  Business Process -> contoso_BusinessProcess | contoso_businessprocess | contoso_businessprocesses\nColumns:\n  Credit Score -> new_CreditScore | new_creditscore\n  ERP customer code -> new_ERPCustomerCode | new_erpcustomercode\n  e-mail 2 -> new_EMail2 | new_email2\n",
      maxScore: 3,
    },
  ],
};
