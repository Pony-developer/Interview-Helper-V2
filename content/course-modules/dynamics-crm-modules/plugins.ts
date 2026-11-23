import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const USINGS = "using System.Collections.Generic;\nusing System.Linq;";

const TYPES = (pipelineBody: string) => `// --- A tiny model of the Dataverse SDK ---
class Entity
{
    public readonly string LogicalName;
    public readonly Dictionary<string, object> Attributes = new Dictionary<string, object>();

    public Entity(string logicalName) { LogicalName = logicalName; }

    public object this[string name]
    {
        get { return Attributes[name]; }
        set { Attributes[name] = value; }
    }

    public bool Contains(string name) { return Attributes.ContainsKey(name) && Attributes[name] != null; }

    public T GetAttributeValue<T>(string name)
    {
        object value;
        return Attributes.TryGetValue(name, out value) && value != null ? (T)value : default(T);
    }

    public override string ToString()
    {
        return LogicalName + " " + string.Join(" ", Attributes.OrderBy(a => a.Key, StringComparer.Ordinal).Select(a => a.Key + "=" + a.Value));
    }
}

class InvalidPluginExecutionException : Exception
{
    public InvalidPluginExecutionException(string message) : base(message) { }
}

enum Stage { PreValidation = 10, PreOperation = 20, PostOperation = 40 }

// The platform's database: rows inserted inside a transaction disappear on Rollback
class Database
{
    public readonly List<Entity> Rows = new List<Entity>();
    int transactionStart = -1;
    int lastAccountNumber = 1000;

    public bool InTransaction { get { return transactionStart >= 0; } }

    public void Begin() { transactionStart = Rows.Count; }

    public void Insert(Entity entity)
    {
        if (!InTransaction) throw new InvalidOperationException("insert outside a transaction");
        Rows.Add(entity);
        Console.WriteLine("  INSERT " + entity);
    }

    public void Commit()
    {
        transactionStart = -1;
        Console.WriteLine("  COMMIT");
    }

    public void Rollback()
    {
        Rows.RemoveRange(transactionStart, Rows.Count - transactionStart);
        transactionStart = -1;
        Console.WriteLine("  ROLLBACK");
    }

    // Auto-numbers are not given back on rollback, just like a database sequence
    public string NextAccountNumber() { return "ACC-" + (++lastAccountNumber); }
}

class PluginContext
{
    public string MessageName;
    public Entity Target;
    public Database Service;
}

interface IPlugin
{
    void Execute(PluginContext context);
}

class Step
{
    public string Name;
    public Stage Stage;
    public int Rank;
    public IPlugin Plugin;
}

// --- The plug-ins registered on Create of account ---
class RequireNamePlugin : IPlugin
{
    public void Execute(PluginContext context)
    {
        if (string.IsNullOrWhiteSpace(context.Target.GetAttributeValue<string>("name")))
            throw new InvalidPluginExecutionException("Account name is required.");
    }
}

class AccountNumberPlugin : IPlugin
{
    public void Execute(PluginContext context)
    {
        if (!context.Target.Contains("accountnumber"))
            context.Target["accountnumber"] = context.Service.NextAccountNumber();
    }
}

class NormalizeNamePlugin : IPlugin
{
    public void Execute(PluginContext context)
    {
        context.Target["name"] = context.Target.GetAttributeValue<string>("name").Trim();
    }
}

class FollowUpTaskPlugin : IPlugin
{
    public void Execute(PluginContext context)
    {
        var task = new Entity("task");
        task["subject"] = "Call " + context.Target["name"];
        context.Service.Insert(task);
    }
}

class CreditLimitPlugin : IPlugin
{
    public void Execute(PluginContext context)
    {
        if (context.Target.GetAttributeValue<decimal>("creditlimit") > 100000m)
            throw new InvalidPluginExecutionException("A credit limit over 100000 needs approval.");
    }
}

// --- The event pipeline ---
class Pipeline
{
    readonly Database db;
    readonly List<Step> steps = new List<Step>();

    public Pipeline(Database db) { this.db = db; }

    public void Register(Step step) { steps.Add(step); }

    // Runs the Create message for context.Target. Returns true when the record was saved.
    public bool Execute(PluginContext context)
    {
${pipelineBody}
    }
}`;

const MEMBERS = `    static void Create(Pipeline pipeline, Database db, string title, Entity target)
    {
        Console.WriteLine("== " + title);
        bool saved = pipeline.Execute(new PluginContext { MessageName = "Create", Target = target, Service = db });
        Console.WriteLine("  saved: " + saved);
    }`;

const MAIN = `        var db = new Database();
        var pipeline = new Pipeline(db);
        // Registered in no particular order, as steps are in a real environment
        pipeline.Register(new Step { Name = "FollowUpTask", Stage = Stage.PostOperation, Rank = 1, Plugin = new FollowUpTaskPlugin() });
        pipeline.Register(new Step { Name = "NormalizeName", Stage = Stage.PreOperation, Rank = 2, Plugin = new NormalizeNamePlugin() });
        pipeline.Register(new Step { Name = "CreditLimit", Stage = Stage.PostOperation, Rank = 2, Plugin = new CreditLimitPlugin() });
        pipeline.Register(new Step { Name = "AccountNumber", Stage = Stage.PreOperation, Rank = 1, Plugin = new AccountNumberPlugin() });
        pipeline.Register(new Step { Name = "RequireName", Stage = Stage.PreValidation, Rank = 1, Plugin = new RequireNamePlugin() });

        var contoso = new Entity("account");
        contoso["name"] = "  Contoso  ";
        Create(pipeline, db, "Contoso", contoso);

        var noName = new Entity("account");
        noName["creditlimit"] = 5000m;
        Create(pipeline, db, "No name", noName);

        var fabrikam = new Entity("account");
        fabrikam["name"] = "Fabrikam";
        fabrikam["creditlimit"] = 250000m;
        Create(pipeline, db, "Fabrikam", fabrikam);

        var northwind = new Entity("account");
        northwind["name"] = " Northwind";
        northwind["accountnumber"] = "NW-7";
        Create(pipeline, db, "Northwind", northwind);

        Console.WriteLine("Rows: " + db.Rows.Count);
        foreach (var row in db.Rows) Console.WriteLine("  " + row);`;

const SOLUTION_BODY = `        var ordered = steps.OrderBy(s => (int)s.Stage).ThenBy(s => s.Rank).ToList();
        try
        {
            foreach (var step in ordered.Where(s => s.Stage == Stage.PreValidation)) Run(step, context);

            db.Begin();
            foreach (var step in ordered.Where(s => s.Stage == Stage.PreOperation)) Run(step, context);
            db.Insert(context.Target);
            foreach (var step in ordered.Where(s => s.Stage == Stage.PostOperation)) Run(step, context);
            db.Commit();
            return true;
        }
        catch (InvalidPluginExecutionException ex)
        {
            Console.WriteLine("  ERROR " + ex.Message);
            if (db.InTransaction) db.Rollback();
            return false;
        }
    }

    void Run(Step step, PluginContext context)
    {
        Console.WriteLine("  " + step.Stage + " " + step.Name);
        step.Plugin.Execute(context);`;

export const pluginsModule: ModuleDef = {
  slug: "crm-plugins",
  title: { en: "Plug-ins", uk: "Плагіни" },
  slides: [
    { kind: "lecture", slug: "plugin-basics", title: { en: "Anatomy of a plug-in", uk: "Анатомія плагіна" } },
    {
      kind: "lecture",
      slug: "event-pipeline",
      title: { en: "The event pipeline, images and transactions", uk: "Конвеєр подій, образи та транзакції" },
    },
    {
      kind: "quiz",
      slug: "plugins-quiz",
      title: { en: "Plug-ins check", uk: "Перевірка: плагіни" },
      questions: [
        {
          id: "stage-validate",
          mode: "single",
          prompt: {
            en: "A plug-in must reject an account whose credit limit is negative, before any database work starts and without holding locks. Which stage fits best?",
            uk: "Плагін має відхиляти акаунт із від'ємним кредитним лімітом ще до початку роботи з базою й без утримання блокувань. Який етап підходить найкраще?",
          },
          options: [
            { id: "a", text: { en: "PreValidation (10)", uk: "PreValidation (10)" } },
            { id: "b", text: { en: "PreOperation (20)", uk: "PreOperation (20)" } },
            { id: "c", text: { en: "PostOperation (40), asynchronous", uk: "PostOperation (40), асинхронно" } },
          ],
          correct: ["a"],
        },
        {
          id: "set-field",
          mode: "single",
          prompt: {
            en: "You want to set a column on the record being created without an extra Update call. Where do you do it?",
            uk: "Потрібно заповнити стовпець запису, що створюється, без додаткового виклику Update. Де це зробити?",
          },
          options: [
            { id: "a", text: { en: "Change the Target entity in a PreOperation (or PreValidation) step", uk: "Змінити сутність Target на етапі PreOperation (або PreValidation)" } },
            { id: "b", text: { en: "Change the Target entity in a PostOperation step", uk: "Змінити сутність Target на етапі PostOperation" } },
            { id: "c", text: { en: "Call service.Update in a PreOperation step", uk: "Викликати service.Update на етапі PreOperation" } },
          ],
          correct: ["a"],
        },
        {
          id: "preimage",
          mode: "single",
          prompt: {
            en: "An Update plug-in needs the value a column had before the change. What is the right way to get it?",
            uk: "Плагіну на Update потрібне значення стовпця до зміни. Як правильно його отримати?",
          },
          options: [
            { id: "a", text: { en: "Register a pre-entity image with that column and read context.PreEntityImages", uk: "Зареєструвати pre-entity image із цим стовпцем і читати context.PreEntityImages" } },
            { id: "b", text: { en: "Read it from the Target: it holds every column of the record", uk: "Прочитати з Target: він містить усі стовпці запису" } },
            { id: "c", text: { en: "Retrieve the record in PostOperation", uk: "Отримати запис через Retrieve на етапі PostOperation" } },
          ],
          correct: ["a"],
        },
        {
          id: "transaction",
          mode: "multi",
          prompt: {
            en: "Which steps run inside the database transaction of the operation, so that throwing InvalidPluginExecutionException rolls the save back?",
            uk: "Які кроки виконуються всередині транзакції операції, тож виняток InvalidPluginExecutionException відкочує збереження?",
          },
          options: [
            { id: "a", text: { en: "Synchronous PreOperation", uk: "Синхронний PreOperation" } },
            { id: "b", text: { en: "Synchronous PostOperation", uk: "Синхронний PostOperation" } },
            { id: "c", text: { en: "Asynchronous PostOperation", uk: "Асинхронний PostOperation" } },
            { id: "d", text: { en: "PreValidation", uk: "PreValidation" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "stateless",
          mode: "single",
          prompt: {
            en: "Why must a plug-in class not keep per-request data in instance fields?",
            uk: "Чому клас плагіна не повинен зберігати дані запиту в полях екземпляра?",
          },
          options: [
            { id: "a", text: { en: "The platform caches the instance and may run it for many requests, even at the same time", uk: "Платформа кешує екземпляр і може виконувати його для багатьох запитів, навіть одночасно" } },
            { id: "b", text: { en: "Instance fields are not allowed by the compiler in plug-ins", uk: "Компілятор не дозволяє полів екземпляра в плагінах" } },
            { id: "c", text: { en: "Fields are reset to null after every stage", uk: "Поля скидаються в null після кожного етапу" } },
          ],
          correct: ["a"],
        },
        {
          id: "error-message",
          mode: "single",
          prompt: {
            en: "Which exception should a plug-in throw to show a business error to the user?",
            uk: "Який виняток має кинути плагін, щоб показати користувачеві бізнес-помилку?",
          },
          options: [
            { id: "a", text: { en: "InvalidPluginExecutionException", uk: "InvalidPluginExecutionException" } },
            { id: "b", text: { en: "Any exception: the message is always shown as is", uk: "Будь-який виняток: повідомлення завжди показується як є" } },
            { id: "c", text: { en: "OperationCanceledException", uk: "OperationCanceledException" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "plugin-pipeline",
      title: { en: "Practice: Run the event pipeline", uk: "Практика «Запусти конвеєр подій»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES("        // Write your code here\n        return false;"), MAIN, USINGS, MEMBERS),
      solution: PROGRAM_WITH(TYPES(SOLUTION_BODY), MAIN, USINGS, MEMBERS),
      expectedOutput: "== Contoso\n  PreValidation RequireName\n  PreOperation AccountNumber\n  PreOperation NormalizeName\n  INSERT account accountnumber=ACC-1001 name=Contoso\n  PostOperation FollowUpTask\n  INSERT task subject=Call Contoso\n  PostOperation CreditLimit\n  COMMIT\n  saved: True\n== No name\n  PreValidation RequireName\n  ERROR Account name is required.\n  saved: False\n== Fabrikam\n  PreValidation RequireName\n  PreOperation AccountNumber\n  PreOperation NormalizeName\n  INSERT account accountnumber=ACC-1002 creditlimit=250000 name=Fabrikam\n  PostOperation FollowUpTask\n  INSERT task subject=Call Fabrikam\n  PostOperation CreditLimit\n  ERROR A credit limit over 100000 needs approval.\n  ROLLBACK\n  saved: False\n== Northwind\n  PreValidation RequireName\n  PreOperation AccountNumber\n  PreOperation NormalizeName\n  INSERT account accountnumber=NW-7 name=Northwind\n  PostOperation FollowUpTask\n  INSERT task subject=Call Northwind\n  PostOperation CreditLimit\n  COMMIT\n  saved: True\nRows: 4\n  account accountnumber=ACC-1001 name=Contoso\n  task subject=Call Contoso\n  account accountnumber=NW-7 name=Northwind\n  task subject=Call Northwind\n",
      maxScore: 5,
    },
  ],
};
