import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

/** The plug-in trace log, cut down to a few of its real columns. */
const TRACE_LOG = `-- One row per plug-in execution, as in the plugintracelog table
-- performanceexecutionduration: milliseconds
-- exceptiondetails: NULL or empty when the execution succeeded
CREATE TABLE plugintracelog (
    plugintracelogid             integer PRIMARY KEY,
    typename                     text NOT NULL,
    messagename                  text NOT NULL,
    primaryentity                text NOT NULL,
    performanceexecutionduration integer NOT NULL,
    exceptiondetails             text
);

INSERT INTO plugintracelog VALUES
    (1,  'Contoso.Plugins.AccountPreUpdate', 'Update', 'account', 120, NULL),
    (2,  'Contoso.Plugins.AccountPreUpdate', 'Update', 'account', 140, ''),
    (3,  'Contoso.Plugins.AccountPreUpdate', 'Update', 'account', 160, NULL),
    (4,  'Contoso.Plugins.InvoiceTotals', 'Create', 'new_invoice', 1800, NULL),
    (5,  'Contoso.Plugins.InvoiceTotals', 'Create', 'new_invoice', 2200, NULL),
    (6,  'Contoso.Plugins.InvoiceTotals', 'Create', 'new_invoice', 2600, NULL),
    (7,  'Contoso.Plugins.ErpSync', 'Update', 'account', 900, NULL),
    (8,  'Contoso.Plugins.ErpSync', 'Update', 'account', 1100, NULL),
    (9,  'Contoso.Plugins.ErpSync', 'Update', 'account', 3000, 'System.TimeoutException: The operation has timed out.'),
    (10, 'Contoso.Plugins.ContactValidation', 'Create', 'contact', 40, NULL),
    (11, 'Contoso.Plugins.ContactValidation', 'Create', 'contact', 60, 'Microsoft.Xrm.Sdk.InvalidPluginExecutionException: Email is required.'),
    (12, 'Contoso.Plugins.ContactValidation', 'Create', 'contact', 50, NULL),
    (13, 'Contoso.Plugins.ContactValidation', 'Update', 'contact', 30, NULL),
    (14, 'Contoso.Plugins.ContactValidation', 'Update', 'contact', 30, NULL);
`;

const USINGS = "using System.Collections.Generic;";

const TYPES = (body: string) => `enum ConcurrencyBehavior { Default, AlwaysOverwrite, IfRowVersionMatches }

class ConcurrencyVersionMismatchException : Exception
{
    public ConcurrencyVersionMismatchException(string message) : base(message) { }
}

class Record
{
    public Guid Id;
    public string RowVersion;
    public Dictionary<string, object> Values = new Dictionary<string, object>();

    public Record Copy()
    {
        return new Record { Id = Id, RowVersion = RowVersion, Values = new Dictionary<string, object>(Values) };
    }
}

// The platform side: already implemented
class Store
{
    readonly Dictionary<Guid, Record> rows = new Dictionary<Guid, Record>();
    long version = 1000;
    public int UpdateCalls;
    // Runs once, just before the next Update is applied: simulates another user who saves first
    public Action BeforeNextUpdate;

    public Guid Create(Dictionary<string, object> values)
    {
        var record = new Record { Id = Guid.NewGuid(), RowVersion = (++version).ToString(), Values = new Dictionary<string, object>(values) };
        rows[record.Id] = record;
        return record.Id;
    }

    public Record Retrieve(Guid id) { return rows[id].Copy(); }

    public void SaveAsAnotherUser(Guid id, string column, object value)
    {
        rows[id].Values[column] = value;
        rows[id].RowVersion = (++version).ToString();
    }

    public void Update(Record record, ConcurrencyBehavior behavior)
    {
        UpdateCalls++;
        var hook = BeforeNextUpdate;
        BeforeNextUpdate = null;
        if (hook != null) hook();

        var current = rows[record.Id];
        if (behavior == ConcurrencyBehavior.IfRowVersionMatches && current.RowVersion != record.RowVersion)
            throw new ConcurrencyVersionMismatchException("The version of the existing record doesn't match the RowVersion property provided.");
        foreach (var pair in record.Values) current.Values[pair.Key] = pair.Value;
        current.RowVersion = (++version).ToString();
    }
}

static class Inventory
{
${body}
}`;

const STARTER = `    public static string Reserve(Store store, Guid productId, int quantity)
    {
        // Write your code here
        return "";
    }`;

const SOLUTION = `    public static string Reserve(Store store, Guid productId, int quantity)
    {
        for (var attempt = 1; attempt <= 3; attempt++)
        {
            var product = store.Retrieve(productId);
            var available = (int)product.Values["new_available"];
            if (available < quantity) return "Not enough stock: " + available + " left";

            // Send only the changed column, with the version we read
            var update = new Record { Id = productId, RowVersion = product.RowVersion };
            update.Values["new_available"] = available - quantity;
            try
            {
                store.Update(update, ConcurrencyBehavior.IfRowVersionMatches);
                return "Reserved " + quantity + ", " + (available - quantity) + " left (attempt " + attempt + ")";
            }
            catch (ConcurrencyVersionMismatchException)
            {
                // Someone saved the product after we read it: read it again and retry
            }
        }
        return "Gave up after 3 conflicts";
    }`;

const MAIN = `        var store = new Store();
        var keyboard = store.Create(new Dictionary<string, object> { { "new_name", "Keyboard" }, { "new_available", 10 } });

        Console.WriteLine("1. " + Inventory.Reserve(store, keyboard, 2));

        store.BeforeNextUpdate = () => store.SaveAsAnotherUser(keyboard, "new_available", 6);
        Console.WriteLine("2. " + Inventory.Reserve(store, keyboard, 3));

        store.BeforeNextUpdate = () => store.SaveAsAnotherUser(keyboard, "new_available", 1);
        Console.WriteLine("3. " + Inventory.Reserve(store, keyboard, 2));

        Action busy = null;
        busy = () => { store.SaveAsAnotherUser(keyboard, "new_available", 20); store.BeforeNextUpdate = busy; };
        store.BeforeNextUpdate = busy;
        Console.WriteLine("4. " + Inventory.Reserve(store, keyboard, 1));
        store.BeforeNextUpdate = null;

        Console.WriteLine("Available: " + store.Retrieve(keyboard).Values["new_available"]);
        Console.WriteLine("Update calls: " + store.UpdateCalls);`;

export const diagnosticsModule: ModuleDef = {
  slug: "crm-diagnostics",
  title: { en: "Diagnostics, performance and concurrency", uk: "Діагностика, продуктивність і конкурентність" },
  slides: [
    {
      kind: "lecture",
      slug: "troubleshooting",
      title: { en: "Troubleshooting plug-ins and integrations", uk: "Пошук проблем у плагінах та інтеграціях" },
    },
    {
      kind: "lecture",
      slug: "performance-concurrency",
      title: { en: "Query performance and optimistic concurrency", uk: "Продуктивність запитів і оптимістична конкурентність" },
    },
    {
      kind: "quiz",
      slug: "diagnostics-quiz",
      title: { en: "Diagnostics and performance check", uk: "Перевірка: діагностика та продуктивність" },
      questions: [
        {
          id: "trace-setting",
          mode: "single",
          prompt: {
            en: "Your plug-in calls ITracingService.Trace, but the Plug-in Trace Log table stays empty. What is the most likely reason?",
            uk: "Ваш плагін викликає ITracingService.Trace, але таблиця Plug-in Trace Log лишається порожньою. Яка найімовірніша причина?",
          },
          options: [
            { id: "a", text: { en: "The environment setting 'Enable logging to plug-in trace log' is Off", uk: "Налаштування середовища «Enable logging to plug-in trace log» має значення Off" } },
            { id: "b", text: { en: "Tracing works only for asynchronous plug-ins", uk: "Трасування працює лише для асинхронних плагінів" } },
            { id: "c", text: { en: "Trace messages are only written to the Windows event log", uk: "Повідомлення трасування пишуться лише в журнал подій Windows" } },
          ],
          correct: ["a"],
        },
        {
          id: "profiler",
          mode: "single",
          prompt: {
            en: "A plug-in fails only in the test environment with real data. How can you step through it in Visual Studio?",
            uk: "Плагін падає лише в тестовому середовищі на реальних даних. Як пройти його покроково у Visual Studio?",
          },
          options: [
            { id: "a", text: { en: "Capture a profile with the Plug-in Profiler, then replay it in the Plug-in Registration Tool with the debugger attached", uk: "Записати профіль через Plug-in Profiler і відтворити його в Plug-in Registration Tool з підключеним налагоджувачем" } },
            { id: "b", text: { en: "Attach Visual Studio to the sandbox worker process in the cloud", uk: "Підключити Visual Studio до процесу sandbox у хмарі" } },
            { id: "c", text: { en: "It is impossible; only tracing helps", uk: "Це неможливо; допоможе лише трасування" } },
          ],
          correct: ["a"],
        },
        {
          id: "timeout",
          mode: "single",
          prompt: {
            en: "A synchronous plug-in calls a slow ERP API and sometimes fails after about two minutes. What is the right fix?",
            uk: "Синхронний плагін викликає повільний API ERP і іноді падає приблизно через дві хвилини. Яке правильне рішення?",
          },
          options: [
            { id: "a", text: { en: "Move the call out of the transaction: an asynchronous plug-in, a Service Bus message or a flow, with retries", uk: "Винести виклик із транзакції: асинхронний плагін, повідомлення Service Bus або потік, з повторами" } },
            { id: "b", text: { en: "Raise the sandbox time-out in the plug-in step", uk: "Збільшити тайм-аут sandbox у кроці плагіна" } },
            { id: "c", text: { en: "Call the API in a background thread and return immediately", uk: "Викликати API у фоновому потоці й одразу повернутися" } },
          ],
          correct: ["a"],
        },
        {
          id: "row-version",
          mode: "single",
          prompt: {
            en: "Two users read the same stock record, and both save a new quantity. How do you stop the second save from silently overwriting the first?",
            uk: "Двоє користувачів читають той самий запис залишку, і обидва зберігають нову кількість. Як не дати другому збереженню тихо перезаписати перше?",
          },
          options: [
            { id: "a", text: { en: "Send the RowVersion you read with ConcurrencyBehavior.IfRowVersionMatches (If-Match in the Web API), and re-read and retry on a conflict", uk: "Надсилати прочитаний RowVersion з ConcurrencyBehavior.IfRowVersionMatches (If-Match у Web API), а при конфлікті перечитати й повторити" } },
            { id: "b", text: { en: "Use a static lock object in the plug-in", uk: "Використати статичний об'єкт lock у плагіні" } },
            { id: "c", text: { en: "Always use ConcurrencyBehavior.AlwaysOverwrite", uk: "Завжди використовувати ConcurrencyBehavior.AlwaysOverwrite" } },
          ],
          correct: ["a"],
        },
        {
          id: "query-tuning",
          mode: "multi",
          prompt: {
            en: "Which changes usually make a slow Dataverse query faster?",
            uk: "Які зміни зазвичай пришвидшують повільний запит до Dataverse?",
          },
          options: [
            { id: "a", text: { en: "Requesting only the needed columns instead of all columns", uk: "Запитувати лише потрібні стовпці замість усіх" } },
            { id: "b", text: { en: "Replacing a leading wildcard (like '%smith') with 'begins with'", uk: "Замінити шаблон із підстановкою на початку (like '%smith') на «begins with»" } },
            { id: "c", text: { en: "Querying inside a loop, one query per parent record", uk: "Виконувати запит у циклі, по одному на кожен батьківський запис" } },
            { id: "d", text: { en: "Filtering on indexed columns, such as alternate key or Quick Find columns", uk: "Фільтрувати за індексованими стовпцями, як-от альтернативний ключ чи стовпці Quick Find" } },
          ],
          correct: ["a", "b", "d"],
        },
        {
          id: "static",
          mode: "single",
          prompt: {
            en: "What is safe to cache in a static field of a plug-in class?",
            uk: "Що безпечно кешувати в статичному полі класу плагіна?",
          },
          options: [
            { id: "a", text: { en: "Immutable data such as metadata or configuration, in a thread-safe way and with an expiry", uk: "Незмінні дані, як-от метадані чи конфігурацію, потокобезпечно й із терміном дії" } },
            { id: "b", text: { en: "The IOrganizationService and the execution context", uk: "IOrganizationService і контекст виконання" } },
            { id: "c", text: { en: "The Target entity of the current request", uk: "Сутність Target поточного запиту" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "trace-log-analysis",
      title: { en: "Practice: Find the slow and failing steps", uk: "Практика «Знайти повільні та збійні кроки»" },
      language: "sql",
      setup: TRACE_LOG,
      starter: "-- Write your query here\n",
      solution: `SELECT typename AS plugin,
       messagename || ' ' || primaryentity AS message,
       count(*) AS runs,
       round(avg(performanceexecutionduration))::integer AS avg_ms,
       max(performanceexecutionduration) AS max_ms,
       count(*) FILTER (WHERE coalesce(exceptiondetails, '') <> '') AS failures
FROM plugintracelog
GROUP BY typename, messagename, primaryentity
HAVING avg(performanceexecutionduration) >= 1000
    OR count(*) FILTER (WHERE coalesce(exceptiondetails, '') <> '') > 0
ORDER BY failures DESC, avg_ms DESC;
`,
      expectedOutput: "              plugin               |      message       | runs | avg_ms | max_ms | failures\n-----------------------------------+--------------------+------+--------+--------+----------\n Contoso.Plugins.ErpSync           | Update account     |    3 |   1667 |   3000 |        1\n Contoso.Plugins.ContactValidation | Create contact     |    3 |     50 |     60 |        1\n Contoso.Plugins.InvoiceTotals     | Create new_invoice |    3 |   2200 |   2600 |        0\n(3 rows)\n",
      maxScore: 4,
    },
    {
      kind: "practice",
      slug: "optimistic-concurrency",
      title: { en: "Practice: Optimistic concurrency", uk: "Практика «Оптимістична конкурентність»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES(STARTER), MAIN, USINGS),
      solution: PROGRAM_WITH(TYPES(SOLUTION), MAIN, USINGS),
      expectedOutput: "1. Reserved 2, 8 left (attempt 1)\n2. Reserved 3, 3 left (attempt 2)\n3. Not enough stock: 1 left\n4. Gave up after 3 conflicts\nAvailable: 20\nUpdate calls: 7\n",
      maxScore: 4,
    },
  ],
};
