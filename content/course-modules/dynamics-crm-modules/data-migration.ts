import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

/** A staging table with contacts exported from a legacy CRM. */
const STAGING = `-- Contacts exported from the legacy CRM, loaded as they are into a staging table
CREATE TABLE stg_contact (
    legacy_id     integer PRIMARY KEY,
    fullname      text NOT NULL,
    emailaddress1 text,
    createdon     date NOT NULL
);

INSERT INTO stg_contact (legacy_id, fullname, emailaddress1, createdon) VALUES
    (1, 'Olena Koval', 'olena@contoso.com', '2019-03-01'),
    (2, 'Olena Koval', ' Olena@Contoso.com ', '2021-06-10'),
    (3, 'Taras Melnyk', 'taras@contoso.com', '2020-01-15'),
    (4, 'Maksym Kravets', 'maksym@fabrikam.com', '2018-11-30'),
    (5, 'M. Kravets', 'MAKSYM@FABRIKAM.COM', '2017-05-04'),
    (6, 'Maksym K.', 'maksym@fabrikam.com ', '2022-02-20'),
    (7, 'Iryna Bondar', NULL, '2020-07-07'),
    (8, 'Iryna Bondar', '', '2021-07-07'),
    (9, 'Daria Lysenko', 'daria@litware.com', '2019-09-09');
`;

const USINGS = "using System.Collections.Generic;\nusing System.Linq;";

const TYPES = (body: string) => `class Lookup
{
    public string Column;
    public string Target;   // the table the lookup points at

    public Lookup(string column, string target) { Column = column; Target = target; }
}

class Table
{
    public string Name;
    public List<Lookup> Lookups;

    public Table(string name, params Lookup[] lookups) { Name = name; Lookups = lookups.ToList(); }
}

class Plan
{
    public List<string> Order = new List<string>();      // pass 1: tables in the order to create their rows
    public List<string> Deferred = new List<string>();   // pass 2: "table.column" lookups to fill in afterwards
}

static class Migration
{
${body}
}`;

const STARTER = `    public static Plan BuildPlan(List<Table> tables)
    {
        // Write your code here
        return new Plan();
    }`;

const SOLUTION = `    public static Plan BuildPlan(List<Table> tables)
    {
        var plan = new Plan();
        var loaded = new HashSet<string>();
        var deferred = new HashSet<string>();
        var remaining = new List<Table>(tables);

        while (remaining.Count > 0)
        {
            var next = remaining.FirstOrDefault(t => t.Lookups.All(l =>
                l.Target == t.Name || loaded.Contains(l.Target) || deferred.Contains(t.Name + "." + l.Column)));
            if (next == null)
            {
                // A cycle: load the first remaining table without its lookups to tables that are not loaded yet
                next = remaining[0];
                foreach (var l in next.Lookups)
                    if (!loaded.Contains(l.Target)) deferred.Add(next.Name + "." + l.Column);
            }
            foreach (var l in next.Lookups)
                if (l.Target == next.Name) deferred.Add(next.Name + "." + l.Column);

            plan.Order.Add(next.Name);
            loaded.Add(next.Name);
            remaining.Remove(next);
        }

        foreach (var name in plan.Order)
            foreach (var l in tables.First(t => t.Name == name).Lookups)
                if (deferred.Contains(name + "." + l.Column)) plan.Deferred.Add(name + "." + l.Column);
        return plan;
    }`;

const MAIN = `        var tables = new List<Table>
        {
            new Table("account",
                new Lookup("ownerid", "systemuser"),
                new Lookup("parentaccountid", "account"),
                new Lookup("primarycontactid", "contact"),
                new Lookup("transactioncurrencyid", "transactioncurrency")),
            new Table("contact",
                new Lookup("ownerid", "systemuser"),
                new Lookup("parentcustomerid", "account")),
            new Table("opportunity",
                new Lookup("ownerid", "systemuser"),
                new Lookup("parentaccountid", "account"),
                new Lookup("parentcontactid", "contact")),
            new Table("new_invoice",
                new Lookup("new_opportunityid", "opportunity"),
                new Lookup("new_billingcontactid", "contact")),
            new Table("systemuser",
                new Lookup("businessunitid", "businessunit")),
            new Table("businessunit",
                new Lookup("parentbusinessunitid", "businessunit")),
            new Table("transactioncurrency"),
        };

        var plan = Migration.BuildPlan(tables);
        Console.WriteLine("Pass 1: create rows");
        for (var i = 0; i < plan.Order.Count; i++) Console.WriteLine("  " + (i + 1) + ". " + plan.Order[i]);
        Console.WriteLine("Pass 2: update deferred lookups");
        foreach (var column in plan.Deferred) Console.WriteLine("  " + column);`;

export const dataMigrationModule: ModuleDef = {
  slug: "crm-data-migration",
  title: { en: "Data migration and bulk loading", uk: "Міграція даних і масове завантаження" },
  slides: [
    { kind: "lecture", slug: "data-migration", title: { en: "Planning a data migration", uk: "Планування міграції даних" } },
    {
      kind: "lecture",
      slug: "bulk-loading",
      title: { en: "Bulk loading, bypassing logic and reconciliation", uk: "Масове завантаження, обхід логіки та звірка" },
    },
    {
      kind: "quiz",
      slug: "migration-quiz",
      title: { en: "Data migration check", uk: "Перевірка: міграція даних" },
      questions: [
        {
          id: "created-on",
          mode: "single",
          prompt: {
            en: "Migrated cases must keep their original creation date from the legacy system. How?",
            uk: "Мігровані звернення мають зберегти початкову дату створення зі старої системи. Як?",
          },
          options: [
            { id: "a", text: { en: "Set overriddencreatedon on Create; the platform stores it in createdon", uk: "Задати overriddencreatedon під час Create; платформа збереже його в createdon" } },
            { id: "b", text: { en: "Update createdon after the record is created", uk: "Оновити createdon після створення запису" } },
            { id: "c", text: { en: "It is impossible; keep the date in a custom column only", uk: "Це неможливо; зберігайте дату лише у власному стовпці" } },
          ],
          correct: ["a"],
        },
        {
          id: "order",
          mode: "single",
          prompt: {
            en: "account.primarycontactid points at contact, and contact.parentcustomerid points at account. How do you load them?",
            uk: "account.primarycontactid вказує на contact, а contact.parentcustomerid — на account. Як їх завантажити?",
          },
          options: [
            { id: "a", text: { en: "Create accounts without the primary contact, then contacts, then update accounts' primarycontactid in a second pass", uk: "Створити акаунти без основного контакту, потім контакти, потім другим проходом оновити primarycontactid акаунтів" } },
            { id: "b", text: { en: "Load both tables in parallel and let the platform resolve the links", uk: "Завантажити обидві таблиці паралельно, і платформа сама розв'яже зв'язки" } },
            { id: "c", text: { en: "Turn off the relationship during the migration", uk: "Вимкнути зв'язок на час міграції" } },
          ],
          correct: ["a"],
        },
        {
          id: "rerun",
          mode: "single",
          prompt: {
            en: "A migration run fails halfway. What makes it safe to simply run the whole load again?",
            uk: "Запуск міграції падає на півдорозі. Що робить безпечним просто запустити все завантаження знову?",
          },
          options: [
            { id: "a", text: { en: "An alternate key on the legacy id and Upsert instead of Create", uk: "Альтернативний ключ на legacy id і Upsert замість Create" } },
            { id: "b", text: { en: "Deleting all migrated rows before every run", uk: "Видалення всіх мігрованих рядків перед кожним запуском" } },
            { id: "c", text: { en: "ExecuteMultiple with ContinueOnError = true", uk: "ExecuteMultiple з ContinueOnError = true" } },
          ],
          correct: ["a"],
        },
        {
          id: "bypass",
          mode: "single",
          prompt: {
            en: "During the initial load, synchronous plug-ins that send emails and recalculate totals must not run. What do you use?",
            uk: "Під час початкового завантаження не мають виконуватися синхронні плагіни, що надсилають листи й перераховують суми. Що використати?",
          },
          options: [
            { id: "a", text: { en: "The BypassBusinessLogicExecution (or BypassCustomPluginExecution) optional parameter, by a user with the bypass privilege", uk: "Необов'язковий параметр BypassBusinessLogicExecution (або BypassCustomPluginExecution) від користувача з привілеєм обходу" } },
            { id: "b", text: { en: "Unregister the plug-in steps in production for the migration weekend", uk: "Скасувати реєстрацію кроків плагінів у продакшні на вихідні міграції" } },
            { id: "c", text: { en: "Set depth = 2 on every request", uk: "Задати depth = 2 у кожному запиті" } },
          ],
          correct: ["a"],
        },
        {
          id: "multiple",
          mode: "single",
          prompt: {
            en: "Which API gives the best throughput for creating hundreds of thousands of rows of one table?",
            uk: "Який API дає найкращу пропускну здатність для створення сотень тисяч рядків однієї таблиці?",
          },
          options: [
            { id: "a", text: { en: "CreateMultiple (or UpsertMultiple) in batches, sent from several threads", uk: "CreateMultiple (або UpsertMultiple) пакетами з кількох потоків" } },
            { id: "b", text: { en: "One Create per row from a single thread", uk: "Один Create на рядок з одного потоку" } },
            { id: "c", text: { en: "A cloud flow with Apply to each", uk: "Хмарний потік з Apply to each" } },
          ],
          correct: ["a"],
        },
        {
          id: "reconcile",
          mode: "multi",
          prompt: {
            en: "Which checks belong in migration reconciliation?",
            uk: "Які перевірки належать до звірки міграції?",
          },
          options: [
            { id: "a", text: { en: "Row counts per table in the source, the staging area and Dataverse", uk: "Кількість рядків на таблицю в джерелі, staging і Dataverse" } },
            { id: "b", text: { en: "Totals of money columns, for example the sum of invoice amounts", uk: "Суми грошових стовпців, наприклад загальна сума рахунків" } },
            { id: "c", text: { en: "A list of every rejected row with its error", uk: "Список кожного відхиленого рядка з його помилкою" } },
            { id: "d", text: { en: "Checking that the new GUIDs equal the legacy ids", uk: "Перевірка, що нові GUID дорівнюють legacy id" } },
          ],
          correct: ["a", "b", "c"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "migration-duplicates",
      title: { en: "Practice: Find duplicates before loading", uk: "Практика «Знайти дублікати до завантаження»" },
      language: "sql",
      setup: STAGING,
      starter: "-- Write your query here\n",
      solution: `SELECT lower(trim(emailaddress1)) AS email,
       count(*) AS records,
       string_agg(legacy_id::text, ', ' ORDER BY legacy_id) AS legacy_ids,
       (array_agg(legacy_id ORDER BY createdon))[1] AS keep_id
FROM stg_contact
WHERE trim(coalesce(emailaddress1, '')) <> ''
GROUP BY lower(trim(emailaddress1))
HAVING count(*) > 1
ORDER BY email;
`,
      expectedOutput: "        email        | records | legacy_ids | keep_id\n---------------------+---------+------------+---------\n maksym@fabrikam.com |       3 | 4, 5, 6    |       5\n olena@contoso.com   |       2 | 1, 2       |       1\n(2 rows)\n",
      maxScore: 4,
    },
    {
      kind: "practice",
      slug: "load-order",
      title: { en: "Practice: The load order", uk: "Практика «Порядок завантаження»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES(STARTER), MAIN, USINGS),
      solution: PROGRAM_WITH(TYPES(SOLUTION), MAIN, USINGS),
      expectedOutput: "Pass 1: create rows\n  1. businessunit\n  2. systemuser\n  3. transactioncurrency\n  4. account\n  5. contact\n  6. opportunity\n  7. new_invoice\nPass 2: update deferred lookups\n  businessunit.parentbusinessunitid\n  account.parentaccountid\n  account.primarycontactid\n",
      maxScore: 5,
    },
  ],
};
