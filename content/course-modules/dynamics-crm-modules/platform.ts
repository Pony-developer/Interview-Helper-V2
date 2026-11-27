import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

/** Accounts and opportunities with real logical names and multi-currency columns. */
const PIPELINE = `-- account.statecode:     0 = Active, 1 = Inactive
-- opportunity.statecode: 0 = Open, 1 = Won, 2 = Lost
-- estimatedvalue is in the opportunity's own (transaction) currency.
-- exchangerate = units of that currency per 1 unit of the base currency (USD).
CREATE TABLE account (
    accountid integer PRIMARY KEY,
    name      text NOT NULL,
    statecode integer NOT NULL DEFAULT 0
);

CREATE TABLE opportunity (
    opportunityid   integer PRIMARY KEY,
    name            text NOT NULL,
    parentaccountid integer REFERENCES account (accountid),
    statecode       integer NOT NULL DEFAULT 0,
    estimatedvalue  numeric(14, 2),
    isocurrencycode text NOT NULL DEFAULT 'USD',
    exchangerate    numeric(10, 4) NOT NULL DEFAULT 1
);

INSERT INTO account (accountid, name, statecode) VALUES
    (1, 'Contoso', 0),
    (2, 'Fabrikam', 0),
    (3, 'Northwind', 1),
    (4, 'Adventure Works', 0),
    (5, 'Litware', 0);

INSERT INTO opportunity (opportunityid, name, parentaccountid, statecode, estimatedvalue, isocurrencycode, exchangerate) VALUES
    (1, 'Contoso CRM rollout', 1, 0, 120000, 'USD', 1),
    (2, 'Contoso support', 1, 0, 45000, 'EUR', 0.9),
    (3, 'Contoso pilot', 1, 1, 30000, 'USD', 1),
    (4, 'Fabrikam portal', 2, 0, 4100000, 'UAH', 41),
    (5, 'Fabrikam training', 2, 2, 20000, 'USD', 1),
    (6, 'Fabrikam upgrade', 2, 0, NULL, 'USD', 1),
    (7, 'Northwind audit', 3, 0, 80000, 'USD', 1),
    (8, 'Litware licences', 5, 0, 18000, 'EUR', 0.9),
    (9, 'Litware renewal', 5, 1, 9000, 'EUR', 0.9);
`;

/** A custom table, contacts and the intersect table of their native N:N relationship. */
const PROJECTS = `-- statecode: 0 = Active, 1 = Inactive
CREATE TABLE new_project (
    new_projectid integer PRIMARY KEY,
    new_name      text NOT NULL,
    statecode     integer NOT NULL DEFAULT 0
);

CREATE TABLE contact (
    contactid integer PRIMARY KEY,
    fullname  text NOT NULL,
    statecode integer NOT NULL DEFAULT 0
);

-- The hidden intersect table of the N:N relationship new_project_contact:
-- one row per link, only the two ids.
CREATE TABLE new_project_contact (
    new_projectid integer REFERENCES new_project (new_projectid),
    contactid     integer REFERENCES contact (contactid),
    PRIMARY KEY (new_projectid, contactid)
);

INSERT INTO new_project (new_projectid, new_name, statecode) VALUES
    (1, 'CRM rollout', 0),
    (2, 'Data migration', 0),
    (3, 'Legacy cleanup', 1),
    (4, 'Portal redesign', 0);

INSERT INTO contact (contactid, fullname, statecode) VALUES
    (1, 'Olena Koval', 0),
    (2, 'Taras Melnyk', 0),
    (3, 'Iryna Bondar', 1),
    (4, 'Maksym Kravets', 0),
    (5, 'Daria Lysenko', 0);

INSERT INTO new_project_contact (new_projectid, contactid) VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 2), (2, 4), (2, 5),
    (3, 1), (3, 4);
`;

const CASCADE_USINGS = "using System.Collections.Generic;\nusing System.Linq;";

const CASCADE_TYPES = (deleteBody: string) => `// What happens to child rows when their parent is deleted
enum Cascade { Cascade, RemoveLink, Restrict }

class Row
{
    public string Table;
    public string Name;
    // Lookup column logical name -> the row it points to
    public Dictionary<string, Row> Lookups = new Dictionary<string, Row>();

    public Row(string table, string name) { Table = table; Name = name; }

    public override string ToString()
    {
        return Table + " " + Name + string.Concat(Lookups.Select(l => " -> " + l.Key + "=" + l.Value.Name));
    }
}

// A 1:N relationship: rows of ChildTable point at a ParentTable row through LookupColumn
class Relationship
{
    public string Name;
    public string ParentTable;
    public string ChildTable;
    public string LookupColumn;
    public Cascade Delete;

    public Relationship(string name, string parentTable, string childTable, string lookupColumn, Cascade delete)
    {
        Name = name; ParentTable = parentTable; ChildTable = childTable; LookupColumn = lookupColumn; Delete = delete;
    }
}

class Database
{
    public List<Row> Rows = new List<Row>();
    public List<Relationship> Relationships = new List<Relationship>();
    public List<string> Log = new List<string>();

    public Row Add(string table, string name)
    {
        var row = new Row(table, name);
        Rows.Add(row);
        return row;
    }

    public void Link(Row child, string lookupColumn, Row parent) { child.Lookups[lookupColumn] = parent; }

${deleteBody}
}`;

const CASCADE_STARTER = `    public void Delete(Row row)
    {
        // Write your code here
    }`;

const CASCADE_SOLUTION = `    public void Delete(Row row)
    {
        // Validate the whole tree first, so a Restrict anywhere leaves everything unchanged
        Check(row, row);
        Apply(row);
    }

    // Every (relationship, child) pair whose lookup points at parent, in relationship order
    List<Tuple<Relationship, Row>> ChildrenOf(Row parent)
    {
        var result = new List<Tuple<Relationship, Row>>();
        foreach (var rel in Relationships)
        {
            if (rel.ParentTable != parent.Table) continue;
            foreach (var child in Rows)
            {
                Row target;
                if (child.Table == rel.ChildTable && child.Lookups.TryGetValue(rel.LookupColumn, out target) && target == parent)
                    result.Add(Tuple.Create(rel, child));
            }
        }
        return result;
    }

    void Check(Row root, Row row)
    {
        foreach (var link in ChildrenOf(row))
        {
            if (link.Item1.Delete == Cascade.Restrict)
                throw new InvalidOperationException("Cannot delete " + root.Name + ": " + link.Item2.Table + " " + link.Item2.Name
                    + " still references " + row.Name + " (" + link.Item1.Name + ")");
            if (link.Item1.Delete == Cascade.Cascade) Check(root, link.Item2);
        }
    }

    void Apply(Row row)
    {
        foreach (var link in ChildrenOf(row))
        {
            if (link.Item1.Delete == Cascade.Cascade)
            {
                Apply(link.Item2);
            }
            else
            {
                link.Item2.Lookups.Remove(link.Item1.LookupColumn);
                Log.Add("Unlink " + link.Item2.Table + " " + link.Item2.Name + " (" + link.Item1.LookupColumn + ")");
            }
        }
        Rows.Remove(row);
        Log.Add("Delete " + row.Table + " " + row.Name);
    }`;

const CASCADE_MAIN = `        var db = new Database();
        db.Relationships.Add(new Relationship("account_parent_account", "account", "account", "parentaccountid", Cascade.RemoveLink));
        db.Relationships.Add(new Relationship("contact_customer_accounts", "account", "contact", "parentcustomerid", Cascade.RemoveLink));
        db.Relationships.Add(new Relationship("opportunity_customer_accounts", "account", "opportunity", "parentaccountid", Cascade.Cascade));
        db.Relationships.Add(new Relationship("account_tasks", "account", "task", "regardingobjectid", Cascade.Cascade));
        db.Relationships.Add(new Relationship("opportunity_tasks", "opportunity", "task", "regardingobjectid", Cascade.Cascade));
        db.Relationships.Add(new Relationship("new_opportunity_invoice", "opportunity", "new_invoice", "new_opportunityid", Cascade.Restrict));

        var contoso = db.Add("account", "Contoso");
        db.Link(db.Add("account", "Contoso East"), "parentaccountid", contoso);
        var fabrikam = db.Add("account", "Fabrikam");
        db.Link(db.Add("contact", "Olena Koval"), "parentcustomerid", contoso);
        db.Link(db.Add("contact", "Taras Melnyk"), "parentcustomerid", contoso);
        db.Link(db.Add("contact", "Maksym Kravets"), "parentcustomerid", fabrikam);
        var rollout = db.Add("opportunity", "CRM rollout");
        db.Link(rollout, "parentaccountid", contoso);
        db.Link(db.Add("opportunity", "Support contract"), "parentaccountid", contoso);
        var portal = db.Add("opportunity", "Portal");
        db.Link(portal, "parentaccountid", fabrikam);
        db.Link(db.Add("task", "Call Olena"), "regardingobjectid", contoso);
        db.Link(db.Add("task", "Send proposal"), "regardingobjectid", rollout);
        db.Link(db.Add("task", "Kick-off"), "regardingobjectid", portal);
        db.Link(db.Add("new_invoice", "INV-001"), "new_opportunityid", portal);

        foreach (var target in new[] { fabrikam, contoso })
        {
            Console.WriteLine("== Delete " + target.Name);
            db.Log.Clear();
            try
            {
                db.Delete(target);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }
            foreach (var line in db.Log) Console.WriteLine("  " + line);
        }

        Console.WriteLine("== Remaining");
        foreach (var row in db.Rows) Console.WriteLine("  " + row);`;

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
    {
      kind: "lecture",
      slug: "column-types",
      title: { en: "Choices, dates, currency and computed columns", uk: "Choice, дати, валюта та обчислювані стовпці" },
    },
    {
      kind: "quiz",
      slug: "columns-quiz",
      title: { en: "Column types check", uk: "Перевірка: типи стовпців" },
      questions: [
        {
          id: "choice-value",
          mode: "single",
          prompt: {
            en: "What does the SDK store and return for a choice column?",
            uk: "Що SDK зберігає та повертає для стовпця choice?",
          },
          options: [
            { id: "a", text: { en: "An integer value wrapped in OptionSetValue, such as 100000001", uk: "Ціле значення, обгорнуте в OptionSetValue, наприклад 100000001" } },
            { id: "b", text: { en: "The label text in the user's language", uk: "Текст мітки мовою користувача" } },
            { id: "c", text: { en: "The GUID of the option", uk: "GUID варіанта" } },
          ],
          correct: ["a"],
        },
        {
          id: "relabel",
          mode: "single",
          prompt: {
            en: "A label in a global choice has a typo, and thousands of records already use that option. What is safe?",
            uk: "У мітці глобального choice є помилка, і тисячі записів уже використовують цей варіант. Що безпечно зробити?",
          },
          options: [
            { id: "a", text: { en: "Fix the label and keep the value", uk: "Виправити мітку й залишити значення" } },
            { id: "b", text: { en: "Delete the option and add a new one with the right label", uk: "Видалити варіант і додати новий із правильною міткою" } },
            { id: "c", text: { en: "Renumber all options so the values are consecutive", uk: "Перенумерувати всі варіанти, щоб значення йшли підряд" } },
          ],
          correct: ["a"],
        },
        {
          id: "date-only",
          mode: "single",
          prompt: {
            en: "A contact's birthday shows one day earlier for users in New York than for users in Kyiv. Which column behaviour fixes it?",
            uk: "День народження контакту в користувачів у Нью-Йорку показується на день раніше, ніж у Києві. Яка поведінка стовпця це виправить?",
          },
          options: [
            { id: "a", text: { en: "Date only: no time part and no time zone conversion", uk: "Date only: без часу й без перерахунку часових поясів" } },
            { id: "b", text: { en: "User local", uk: "User local" } },
            { id: "c", text: { en: "Store the date as text", uk: "Зберігати дату як текст" } },
          ],
          correct: ["a"],
        },
        {
          id: "base",
          mode: "single",
          prompt: {
            en: "The base currency is USD. A EUR opportunity has estimatedvalue = 45,000 and exchangerate = 0.9. What is estimatedvalue_base?",
            uk: "Базова валюта — USD. Угода в EUR має estimatedvalue = 45 000 і exchangerate = 0,9. Чому дорівнює estimatedvalue_base?",
          },
          options: [
            { id: "a", text: { en: "50,000: the value divided by the exchange rate", uk: "50 000: значення, поділене на курс" } },
            { id: "b", text: { en: "40,500: the value multiplied by the exchange rate", uk: "40 500: значення, помножене на курс" } },
            { id: "c", text: { en: "45,000: base columns are never converted", uk: "45 000: базові стовпці ніколи не перераховуються" } },
          ],
          correct: ["a"],
        },
        {
          id: "rollup-timing",
          mode: "single",
          prompt: {
            en: "A rollup column on account sums its open opportunities. A user creates a new opportunity. When does the account's total change?",
            uk: "Rollup-стовпець на акаунті підсумовує його відкриті угоди. Користувач створює нову угоду. Коли зміниться сума на акаунті?",
          },
          options: [
            { id: "a", text: { en: "When the rollup system job runs next, or when someone recalculates it (CalculateRollupFieldRequest)", uk: "Коли наступного разу спрацює системне завдання rollup або хтось перерахує його (CalculateRollupFieldRequest)" } },
            { id: "b", text: { en: "Immediately, in the same transaction as the create", uk: "Одразу, у тій самій транзакції, що й створення" } },
            { id: "c", text: { en: "Never: a rollup is calculated once when the column is created", uk: "Ніколи: rollup обчислюється один раз під час створення стовпця" } },
          ],
          correct: ["a"],
        },
        {
          id: "computed",
          mode: "multi",
          prompt: {
            en: "Which statements about computed columns are true?",
            uk: "Які твердження про обчислювані стовпці правильні?",
          },
          options: [
            { id: "a", text: { en: "Calculated and formula columns are evaluated when the record is read", uk: "Calculated і formula стовпці обчислюються під час читання запису" } },
            { id: "b", text: { en: "Rollup columns aggregate related child records over a 1:N relationship", uk: "Rollup-стовпці агрегують пов'язані дочірні записи через зв'язок 1:N" } },
            { id: "c", text: { en: "A plug-in that creates a child record can read the updated rollup in the same transaction", uk: "Плагін, що створює дочірній запис, може прочитати оновлений rollup у тій самій транзакції" } },
            { id: "d", text: { en: "An autonumber column can combine a sequence, a date and random characters", uk: "Autonumber-стовпець може поєднувати послідовність, дату й випадкові символи" } },
          ],
          correct: ["a", "b", "d"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "rollup-pipeline",
      title: { en: "Practice: A rollup column in SQL", uk: "Практика «Rollup-стовпець мовою SQL»" },
      language: "sql",
      setup: PIPELINE,
      starter: "-- Write your query here\n",
      solution: `SELECT a.name AS account,
       count(o.opportunityid) AS open_opportunities,
       round(coalesce(sum(o.estimatedvalue / o.exchangerate), 0), 2) AS pipeline_base
FROM account a
LEFT JOIN opportunity o ON o.parentaccountid = a.accountid AND o.statecode = 0
WHERE a.statecode = 0
GROUP BY a.accountid, a.name
ORDER BY pipeline_base DESC, account;
`,
      expectedOutput: "     account     | open_opportunities | pipeline_base\n-----------------+--------------------+---------------\n Contoso         |                  2 |     170000.00\n Fabrikam        |                  2 |     100000.00\n Litware         |                  1 |      20000.00\n Adventure Works |                  0 |          0.00\n(4 rows)\n",
      maxScore: 4,
    },
    {
      kind: "lecture",
      slug: "data-modeling",
      title: { en: "Designing a Dataverse data model", uk: "Проєктування моделі даних Dataverse" },
    },
    {
      kind: "quiz",
      slug: "modeling-quiz",
      title: { en: "Data modelling check", uk: "Перевірка: моделювання даних" },
      questions: [
        {
          id: "choice-vs-lookup",
          mode: "single",
          prompt: {
            en: "Business users must add product categories themselves, and each category has a manager. How do you model the category?",
            uk: "Бізнес-користувачі мають самі додавати категорії товарів, і кожна категорія має менеджера. Як змоделювати категорію?",
          },
          options: [
            { id: "a", text: { en: "A lookup to a custom organization-owned table", uk: "Lookup на власну таблицю у власності організації" } },
            { id: "b", text: { en: "A global choice", uk: "Глобальний choice" } },
            { id: "c", text: { en: "A single line of text", uk: "Однорядковий текст" } },
          ],
          correct: ["a"],
        },
        {
          id: "manual-nn",
          mode: "single",
          prompt: {
            en: "Each project membership needs a role and a start date. How do you link projects and contacts?",
            uk: "Кожне членство в проєкті потребує ролі й дати початку. Як пов'язати проєкти й контакти?",
          },
          options: [
            { id: "a", text: { en: "A custom table with two lookups (a manual N:N) that holds the role and date", uk: "Власна таблиця з двома lookup (ручний N:N), що зберігає роль і дату" } },
            { id: "b", text: { en: "A native N:N relationship", uk: "Нативний зв'язок N:N" } },
            { id: "c", text: { en: "A multi-select choice of contact names on the project", uk: "Choices (множинний вибір) з іменами контактів на проєкті" } },
          ],
          correct: ["a"],
        },
        {
          id: "associate",
          mode: "single",
          prompt: {
            en: "Which message does a plug-in register on to react when a contact is added to a project through a native N:N relationship?",
            uk: "На яке повідомлення реєструють плагін, щоб реагувати на додавання контакту до проєкту через нативний зв'язок N:N?",
          },
          options: [
            { id: "a", text: { en: "Associate (and Disassociate for removal)", uk: "Associate (і Disassociate для видалення)" } },
            { id: "b", text: { en: "Create of the contact", uk: "Create контакту" } },
            { id: "c", text: { en: "Update of the project", uk: "Update проєкту" } },
          ],
          correct: ["a"],
        },
        {
          id: "polymorphic",
          mode: "single",
          prompt: {
            en: "A task's Regarding can point at an account, a contact or an opportunity. How does code know which table a value is from?",
            uk: "Поле Regarding задачі може вказувати на акаунт, контакт або угоду. Як код дізнається, з якої таблиці значення?",
          },
          options: [
            { id: "a", text: { en: "From EntityReference.LogicalName", uk: "З EntityReference.LogicalName" } },
            { id: "b", text: { en: "It cannot: a lookup stores only a GUID", uk: "Ніяк: lookup зберігає лише GUID" } },
            { id: "c", text: { en: "Each target table has its own regarding column", uk: "Для кожної цільової таблиці є окремий стовпець regarding" } },
          ],
          correct: ["a"],
        },
        {
          id: "restrict",
          mode: "single",
          prompt: {
            en: "Invoices must never disappear or lose their opportunity when someone deletes an opportunity. Which delete behaviour do you set on that relationship?",
            uk: "Рахунки ніколи не мають зникати чи втрачати угоду, коли хтось видаляє угоду. Яку поведінку видалення задати для цього зв'язку?",
          },
          options: [
            { id: "a", text: { en: "Restrict: the opportunity cannot be deleted while invoices point at it", uk: "Restrict: угоду не можна видалити, поки на неї посилаються рахунки" } },
            { id: "b", text: { en: "Cascade (parental)", uk: "Cascade (батьківський)" } },
            { id: "c", text: { en: "Remove link", uk: "Remove link" } },
          ],
          correct: ["a"],
        },
        {
          id: "immutable",
          mode: "multi",
          prompt: {
            en: "Which of these cannot be changed after a table or column is created?",
            uk: "Що з цього не можна змінити після створення таблиці чи стовпця?",
          },
          options: [
            { id: "a", text: { en: "The schema and logical name", uk: "Схемне й логічне ім'я" } },
            { id: "b", text: { en: "The table's ownership type", uk: "Тип володіння таблицею" } },
            { id: "c", text: { en: "The display name", uk: "Відображуване ім'я" } },
            { id: "d", text: { en: "The column's description", uk: "Опис стовпця" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "habits",
          mode: "multi",
          prompt: {
            en: "Which are good data modelling habits?",
            uk: "Які звички моделювання даних хороші?",
          },
          options: [
            { id: "a", text: { en: "Reuse standard tables such as account, contact and the activities before creating custom ones", uk: "Використовувати стандартні таблиці, як-от account, contact і активності, перш ніж створювати власні" } },
            { id: "b", text: { en: "Show parent data with a quick view form instead of copying it into every child", uk: "Показувати дані батька через quick view форму замість копіювання в кожен дочірній запис" } },
            { id: "c", text: { en: "Copy every parent column into child tables to avoid joins", uk: "Копіювати всі стовпці батька в дочірні таблиці, щоб уникати join" } },
            { id: "d", text: { en: "Create a solution with your own publisher before the first table", uk: "Створити рішення з власним видавцем ще до першої таблиці" } },
          ],
          correct: ["a", "b", "d"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "project-members",
      title: { en: "Practice: Query an N:N relationship", uk: "Практика «Запит до зв'язку N:N»" },
      language: "sql",
      setup: PROJECTS,
      starter: "-- Write your query here\n",
      solution: `SELECT p.new_name AS project,
       count(c.contactid) AS members,
       coalesce(string_agg(c.fullname, ', ' ORDER BY c.fullname), '-') AS names
FROM new_project p
LEFT JOIN new_project_contact pc ON pc.new_projectid = p.new_projectid
LEFT JOIN contact c ON c.contactid = pc.contactid AND c.statecode = 0
WHERE p.statecode = 0
GROUP BY p.new_projectid, p.new_name
ORDER BY project;
`,
      expectedOutput: "     project     | members |                    names\n-----------------+---------+---------------------------------------------\n CRM rollout     |       2 | Olena Koval, Taras Melnyk\n Data migration  |       3 | Daria Lysenko, Maksym Kravets, Taras Melnyk\n Portal redesign |       0 | -\n(3 rows)\n",
      maxScore: 4,
    },
    {
      kind: "practice",
      slug: "cascade-delete",
      title: { en: "Practice: Cascade delete", uk: "Практика «Каскадне видалення»" },
      language: "csharp",
      starter: PROGRAM_WITH(CASCADE_TYPES(CASCADE_STARTER), CASCADE_MAIN, CASCADE_USINGS),
      solution: PROGRAM_WITH(CASCADE_TYPES(CASCADE_SOLUTION), CASCADE_MAIN, CASCADE_USINGS),
      expectedOutput: "== Delete Fabrikam\nError: Cannot delete Fabrikam: new_invoice INV-001 still references Portal (new_opportunity_invoice)\n== Delete Contoso\n  Unlink account Contoso East (parentaccountid)\n  Unlink contact Olena Koval (parentcustomerid)\n  Unlink contact Taras Melnyk (parentcustomerid)\n  Delete task Send proposal\n  Delete opportunity CRM rollout\n  Delete opportunity Support contract\n  Delete task Call Olena\n  Delete account Contoso\n== Remaining\n  account Contoso East\n  account Fabrikam\n  contact Olena Koval\n  contact Taras Melnyk\n  contact Maksym Kravets -> parentcustomerid=Fabrikam\n  opportunity Portal -> parentaccountid=Fabrikam\n  task Kick-off -> regardingobjectid=Portal\n  new_invoice INV-001 -> new_opportunityid=Portal\n",
      maxScore: 5,
    },
    {
      kind: "lecture",
      slug: "model-driven-apps",
      title: { en: "Model-driven apps and low-code logic", uk: "Model-driven застосунки та low-code логіка" },
    },
    {
      kind: "lecture",
      slug: "platform-services",
      title: { en: "Auditing, search, change tracking and capacity", uk: "Аудит, пошук, відстеження змін і ємність" },
    },
    {
      kind: "quiz",
      slug: "apps-services-quiz",
      title: { en: "Apps and platform services check", uk: "Перевірка: застосунки та сервіси платформи" },
      questions: [
        {
          id: "rule-scope",
          mode: "single",
          prompt: {
            en: "A business rule sets a default value. It must also apply to records created through the API and imports. Which scope do you choose?",
            uk: "Бізнес-правило задає значення за замовчуванням. Воно має діяти й для записів, створених через API та імпорт. Яку область дії обрати?",
          },
          options: [
            { id: "a", text: { en: "Entity (table): the rule also runs on the server", uk: "Entity (таблиця): правило виконується й на сервері" } },
            { id: "b", text: { en: "All forms", uk: "All forms (усі форми)" } },
            { id: "c", text: { en: "The main form only", uk: "Лише основна форма" } },
          ],
          correct: ["a"],
        },
        {
          id: "server-rule",
          mode: "single",
          prompt: {
            en: "A discount above 20% must be rejected wherever an opportunity is saved from: forms, imports, flows and integrations. Where do you put the check?",
            uk: "Знижку понад 20% треба відхиляти, звідки б не зберігали угоду: з форм, імпорту, потоків чи інтеграцій. Де розмістити перевірку?",
          },
          options: [
            { id: "a", text: { en: "In a synchronous plug-in on the server", uk: "У синхронному плагіні на сервері" } },
            { id: "b", text: { en: "In a form script on the OnSave event", uk: "У скрипті форми на подію OnSave" } },
            { id: "c", text: { en: "In the filter of the Active Opportunities view", uk: "У фільтрі подання Active Opportunities" } },
          ],
          correct: ["a"],
        },
        {
          id: "views",
          mode: "single",
          prompt: {
            en: "What is the difference between a system view and a personal view?",
            uk: "Чим системне подання відрізняється від особистого?",
          },
          options: [
            { id: "a", text: { en: "System views (savedquery) are solution components for everyone; personal views (userquery) are owned by a user and shared like records", uk: "Системні подання (savedquery) — компоненти рішень для всіх; особисті (userquery) належать користувачу й надаються в доступ як записи" } },
            { id: "b", text: { en: "Personal views can query any table without security checks", uk: "Особисті подання можуть запитувати будь-яку таблицю без перевірки безпеки" } },
            { id: "c", text: { en: "System views are stored as SQL, personal views as FetchXML", uk: "Системні подання зберігаються як SQL, особисті — як FetchXML" } },
          ],
          correct: ["a"],
        },
        {
          id: "duplicates",
          mode: "single",
          prompt: {
            en: "Duplicate detection rules are published, yet an integration keeps creating duplicate contacts. Why?",
            uk: "Правила виявлення дублікатів опубліковані, але інтеграція далі створює дублікати контактів. Чому?",
          },
          options: [
            { id: "a", text: { en: "API calls skip duplicate detection unless the request sets SuppressDuplicateDetection to false", uk: "Виклики API пропускають виявлення дублікатів, якщо запит не задає SuppressDuplicateDetection = false" } },
            { id: "b", text: { en: "Duplicate detection works only together with Dataverse search", uk: "Виявлення дублікатів працює лише разом із пошуком Dataverse" } },
            { id: "c", text: { en: "Duplicate detection rules only run on Update", uk: "Правила виявлення дублікатів виконуються лише на Update" } },
          ],
          correct: ["a"],
        },
        {
          id: "delta",
          mode: "single",
          prompt: {
            en: "A nightly sync must fetch only the accounts changed or deleted since its last run. What do you use?",
            uk: "Нічна синхронізація має отримувати лише акаунти, змінені чи видалені після попереднього запуску. Що використати?",
          },
          options: [
            { id: "a", text: { en: "Change tracking on the table and a delta token (RetrieveEntityChangesRequest or Prefer: odata.track-changes)", uk: "Відстеження змін на таблиці й delta-токен (RetrieveEntityChangesRequest або Prefer: odata.track-changes)" } },
            { id: "b", text: { en: "Read every account and compare with yesterday's copy", uk: "Прочитати всі акаунти й порівняти з учорашньою копією" } },
            { id: "c", text: { en: "Filter on modifiedon only: it also reveals deleted rows", uk: "Фільтрувати лише за modifiedon: так видно й видалені рядки" } },
          ],
          correct: ["a"],
        },
        {
          id: "capacity",
          mode: "multi",
          prompt: {
            en: "Which statements about Dataverse storage capacity are true?",
            uk: "Які твердження про ємність сховища Dataverse правильні?",
          },
          options: [
            { id: "a", text: { en: "Attachments, file and image columns count against file capacity", uk: "Вкладення, file та image стовпці враховуються у файлову ємність" } },
            { id: "b", text: { en: "Audit history and plug-in trace logs count against log capacity", uk: "Історія аудиту й журнали трасування плагінів враховуються в ємність журналів" } },
            { id: "c", text: { en: "Rows of a virtual table count against database capacity", uk: "Рядки віртуальної таблиці враховуються в ємність бази даних" } },
            { id: "d", text: { en: "Deleting rows can never free capacity", uk: "Видалення рядків ніколи не звільняє ємність" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "elastic",
          mode: "single",
          prompt: {
            en: "You must store hundreds of millions of IoT readings that expire after 90 days. Which table type fits best?",
            uk: "Треба зберігати сотні мільйонів показів IoT-датчиків, які застарівають через 90 днів. Який тип таблиці підходить найкраще?",
          },
          options: [
            { id: "a", text: { en: "An elastic table with a time to live", uk: "Еластична таблиця з часом життя (time to live)" } },
            { id: "b", text: { en: "A standard table cleaned by a nightly bulk delete", uk: "Стандартна таблиця, яку щоночі чистить bulk delete" } },
            { id: "c", text: { en: "An activity table", uk: "Таблиця активностей" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
