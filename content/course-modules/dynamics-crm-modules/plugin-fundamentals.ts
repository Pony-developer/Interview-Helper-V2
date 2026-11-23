import { PROGRAM_WITH } from "../csharp-code";
import { XRM_FAKES, XRM_SDK, XRM_USINGS } from "../dynamics-crm-sdk";
import type { ModuleDef } from "../types";
import { pluginPipelinePractice, pluginsQuiz } from "./plugins";

const TASK_PLUGIN = (body: string) => `${XRM_SDK}

${XRM_FAKES}

// ===== Your plug-in: registered on Create of account, PostOperation (40), synchronous =====
class FollowUpTaskPlugin : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
${body}
    }
}`;

const TASK_MEMBERS = `    static readonly FakeDatabase db = new FakeDatabase();

    // Plays the platform: runs the main operation, then the PostOperation step with a fresh context
    static void Run(IPlugin plugin, string message, Entity target, Guid userId)
    {
        Console.WriteLine("== " + message + " " + target.LogicalName + " " + (target.GetAttributeValue<string>("name") ?? target.GetAttributeValue<string>("fullname")));
        var context = new FakePluginContext { MessageName = message, PrimaryEntityName = target.LogicalName, Stage = 40, UserId = userId, InitiatingUserId = userId };
        if (message == "Create")
        {
            target.Id = db.Insert(target);
            context.OutputParameters["id"] = target.Id;
        }
        else
        {
            new FakeOrganizationService(db, userId).Update(target);
        }
        context.PrimaryEntityId = target.Id;
        context.InputParameters["Target"] = target;

        var tracing = new FakeTracingService();
        try
        {
            plugin.Execute(new FakeServiceProvider(context, tracing, new FakeServiceFactory(db)));
        }
        catch (InvalidPluginExecutionException ex)
        {
            Console.WriteLine("  ERROR " + ex.Message);
        }
        foreach (var line in tracing.Lines) Console.WriteLine("  trace: " + line);
    }`;

const TASK_MAIN = `        var anna = new Entity("systemuser");
        anna["fullname"] = "Anna Shevchenko";
        Guid annaId = db.Insert(anna);
        var olena = new Entity("contact");
        olena["fullname"] = "Olena Koval";
        Guid olenaId = db.Insert(olena);

        var plugin = new FollowUpTaskPlugin();

        var contoso = new Entity("account");
        contoso["name"] = "Contoso";
        contoso["creditlimit"] = new Money(250000m);
        contoso["primarycontactid"] = new EntityReference("contact", olenaId);
        Run(plugin, "Create", contoso, annaId);

        var fabrikam = new Entity("account");
        fabrikam["name"] = "Fabrikam";
        Run(plugin, "Create", fabrikam, annaId);

        var rename = new Entity("account", contoso.Id);
        rename["name"] = "Contoso Ltd";
        Run(plugin, "Update", rename, annaId);

        var taras = new Entity("contact");
        taras["fullname"] = "Taras Melnyk";
        Run(plugin, "Create", taras, annaId);

        Console.WriteLine("Tasks:");
        foreach (var task in db.All("task"))
        {
            Console.WriteLine("  " + task.GetAttributeValue<string>("subject") +
                " | priority " + task.GetAttributeValue<OptionSetValue>("prioritycode") +
                " | regarding " + db.NameOf(task.GetAttributeValue<EntityReference>("regardingobjectid")) +
                " | owner " + db.NameOf(task.GetAttributeValue<EntityReference>("ownerid")) +
                " | " + (task.GetAttributeValue<string>("description") ?? "-"));
        }`;

const TASK_SOLUTION = `        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));

        if (context.MessageName != "Create" || context.PrimaryEntityName != "account" || context.Stage != 40 ||
            !(context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity))
        {
            tracing.Trace("Skipped: {0} of {1}", context.MessageName, context.PrimaryEntityName);
            return;
        }

        var target = (Entity)context.InputParameters["Target"];
        IOrganizationService service = factory.CreateOrganizationService(context.UserId);

        string name = target.GetAttributeValue<string>("name");
        Money creditLimit = target.GetAttributeValue<Money>("creditlimit");

        var task = new Entity("task");
        task["subject"] = "Welcome call: " + name;
        task["regardingobjectid"] = new EntityReference("account", context.PrimaryEntityId);
        task["prioritycode"] = new OptionSetValue(creditLimit != null && creditLimit.Value > 100000m ? 2 : 1);

        var contactRef = target.GetAttributeValue<EntityReference>("primarycontactid");
        if (contactRef != null)
        {
            Entity contact = service.Retrieve(contactRef.LogicalName, contactRef.Id, new ColumnSet("fullname"));
            task["description"] = "Primary contact: " + contact.GetAttributeValue<string>("fullname");
        }

        service.Create(task);
        tracing.Trace("Task created for {0}", name);`;

const AUDIT_TYPES = (ctor: string, execute: string) => `${XRM_SDK}

${XRM_FAKES}

// ===== Two steps on Update of account =====
// PreOperation (20), synchronous, with a pre-image "PreImage" that holds creditlimit
class CaptureOldLimitPlugin : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        Money oldLimit = context.PreEntityImages["PreImage"].GetAttributeValue<Money>("creditlimit");
        context.SharedVariables["oldCreditLimit"] = oldLimit == null ? 0m : oldLimit.Value;
    }
}

// PostOperation (40), synchronous. Unsecure configuration: the threshold, for example "50000"
class CreditLimitAuditPlugin : IPlugin
{
    readonly decimal threshold;

    public CreditLimitAuditPlugin(string unsecureConfig, string secureConfig)
    {
${ctor}
    }

    public void Execute(IServiceProvider serviceProvider)
    {
${execute}
    }
}`;

const AUDIT_CTOR = `        threshold = string.IsNullOrWhiteSpace(unsecureConfig)
            ? 100000m
            : decimal.Parse(unsecureConfig, System.Globalization.CultureInfo.InvariantCulture);`;

const AUDIT_EXECUTE = `        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));

        if (context.Depth > 1)
        {
            tracing.Trace("Skipped at depth {0}", context.Depth);
            return;
        }

        var target = (Entity)context.InputParameters["Target"];
        if (!target.Contains("creditlimit"))
        {
            tracing.Trace("Credit limit not changed");
            return;
        }

        decimal oldLimit = (decimal)context.SharedVariables["oldCreditLimit"];
        Money newMoney = target.GetAttributeValue<Money>("creditlimit");
        decimal newLimit = newMoney == null ? 0m : newMoney.Value;
        if (newLimit - oldLimit < threshold)
        {
            tracing.Trace("Change of {0} is below {1}", newLimit - oldLimit, threshold);
            return;
        }

        // The audit note is written as SYSTEM: users must not be able to edit or delete it
        IOrganizationService systemService = factory.CreateOrganizationService(null);
        Entity user = systemService.Retrieve("systemuser", context.InitiatingUserId, new ColumnSet("fullname"));

        var note = new Entity("annotation");
        note["subject"] = "Credit limit raised";
        note["notetext"] = oldLimit + " -> " + newLimit + " by " + user.GetAttributeValue<string>("fullname");
        note["objectid"] = new EntityReference("account", context.PrimaryEntityId);
        systemService.Create(note);
        tracing.Trace("Audit note created");`;

const AUDIT_MEMBERS = `    static readonly FakeDatabase db = new FakeDatabase();
    static readonly IPlugin capture = new CaptureOldLimitPlugin();
    static readonly IPlugin audit = new CreditLimitAuditPlugin("50000", null);

    static Entity Change(Guid accountId, string column, object value)
    {
        var change = new Entity("account", accountId);
        change[column] = value;
        return change;
    }

    // Plays the platform for one Update: PreOperation step, main operation, PostOperation step
    static void Update(string title, Entity change, Guid userId, int depth)
    {
        Console.WriteLine("== " + title);
        var context = new FakePluginContext { MessageName = "Update", PrimaryEntityName = change.LogicalName, PrimaryEntityId = change.Id, UserId = userId, InitiatingUserId = userId, Depth = depth };
        context.InputParameters["Target"] = change;
        context.PreEntityImages["PreImage"] = FakeDatabase.Copy(db.Find(change.LogicalName, change.Id), new ColumnSet("creditlimit"));
        var tracing = new FakeTracingService();
        var factory = new FakeServiceFactory(db);

        context.Stage = 20;
        capture.Execute(new FakeServiceProvider(context, tracing, factory));
        new FakeOrganizationService(db, userId).Update(change);
        context.Stage = 40;   // same operation, so the shared variables are still there
        audit.Execute(new FakeServiceProvider(context, tracing, factory));

        foreach (var line in tracing.Lines) Console.WriteLine("  trace: " + line);
    }`;

const AUDIT_MAIN = `        var anna = new Entity("systemuser");
        anna["fullname"] = "Anna Shevchenko";
        Guid annaId = db.Insert(anna);
        var ivan = new Entity("systemuser");
        ivan["fullname"] = "Ivan Petrenko";
        Guid ivanId = db.Insert(ivan);

        var contoso = new Entity("account");
        contoso["name"] = "Contoso";
        contoso["creditlimit"] = new Money(20000m);
        Guid contosoId = db.Insert(contoso);
        var fabrikam = new Entity("account");
        fabrikam["name"] = "Fabrikam";
        Guid fabrikamId = db.Insert(fabrikam);

        Update("Anna raises Contoso to 100000", Change(contosoId, "creditlimit", new Money(100000m)), annaId, 1);
        Update("Anna raises Contoso to 120000", Change(contosoId, "creditlimit", new Money(120000m)), annaId, 1);
        Update("Anna changes Contoso's phone", Change(contosoId, "telephone1", "555-0100"), annaId, 1);
        Update("A plug-in raises Contoso to 500000", Change(contosoId, "creditlimit", new Money(500000m)), annaId, 2);
        Update("Ivan sets Fabrikam to 60000", Change(fabrikamId, "creditlimit", new Money(60000m)), ivanId, 1);

        Console.WriteLine("Notes:");
        foreach (var note in db.All("annotation"))
        {
            Console.WriteLine("  " + note.GetAttributeValue<string>("subject") +
                " | " + db.NameOf(note.GetAttributeValue<EntityReference>("objectid")) +
                " | owner " + db.NameOf(note.GetAttributeValue<EntityReference>("ownerid")) +
                " | " + note.GetAttributeValue<string>("notetext"));
        }`;

/**
 * "Fundamentals of plug-in development": from why custom code is needed and how the platform is built,
 * through messages and the pipeline, to a Hello World plug-in, reading the Target and creating related records.
 */
export const pluginFundamentalsModule: ModuleDef = {
  slug: "crm-plugins",
  title: { en: "Fundamentals of plug-in development", uk: "Основи розробки плагінів" },
  slides: [
    {
      kind: "lecture",
      slug: "why-custom-code",
      title: { en: "Introduction: why custom code?", uk: "Вступ: навіщо власний код?" },
    },
    { kind: "lecture", slug: "platform-architecture", title: { en: "Understanding the architecture", uk: "Архітектура платформи" } },
    { kind: "lecture", slug: "web-services", title: { en: "Dynamics 365 web services", uk: "Веб-сервіси Dynamics 365" } },
    {
      kind: "quiz",
      slug: "web-services-quiz",
      title: { en: "Web services and architecture", uk: "Веб-сервіси та архітектура" },
      questions: [
        {
          id: "logic-layer",
          mode: "single",
          prompt: {
            en: "A record is created from the Web API by an integration, not from a form. Which logic still runs?",
            uk: "Запис створює інтеграція через Web API, а не форма. Яка логіка все одно виконується?",
          },
          options: [
            { id: "a", text: { en: "Server-side logic: plug-ins, table-scope business rules, workflows and flows", uk: "Серверна логіка: плагіни, бізнес-правила з областю таблиці, workflow і flow" } },
            { id: "b", text: { en: "Form scripts and form business rules", uk: "Скрипти форм і бізнес-правила форми" } },
            { id: "c", text: { en: "Nothing: the API writes straight to SQL", uk: "Нічого: API пише просто в SQL" } },
          ],
          correct: ["a"],
        },
        {
          id: "web-api",
          mode: "single",
          prompt: {
            en: "A Python service needs to read and write Dataverse records. Which endpoint should it use?",
            uk: "Сервісу на Python треба читати й писати записи Dataverse. Який ендпоінт йому використати?",
          },
          options: [
            { id: "a", text: { en: "The Web API: OData v4 over HTTPS with JSON, at /api/data/v9.2/", uk: "Web API: OData v4 через HTTPS з JSON, за адресою /api/data/v9.2/" } },
            { id: "b", text: { en: "The OData v2 organization data service (OrganizationData.svc)", uk: "OData v2 organization data service (OrganizationData.svc)" } },
            { id: "c", text: { en: "A direct connection to the SQL database", uk: "Пряме з'єднання з SQL-базою" } },
          ],
          correct: ["a"],
        },
        {
          id: "in-plugin",
          mode: "single",
          prompt: {
            en: "How does a plug-in read or write other records?",
            uk: "Як плагін читає чи записує інші записи?",
          },
          options: [
            { id: "a", text: { en: "Through the IOrganizationService that the platform passes in, without HTTP or authentication code", uk: "Через IOrganizationService, який передає платформа, без HTTP і коду автентифікації" } },
            { id: "b", text: { en: "By calling the Web API with HttpClient and a token", uk: "Викликаючи Web API через HttpClient із токеном" } },
            { id: "c", text: { en: "By creating a new ServiceClient with a connection string", uk: "Створюючи новий ServiceClient із рядком підключення" } },
          ],
          correct: ["a"],
        },
        {
          id: "async-service",
          mode: "single",
          prompt: {
            en: "Which part of the platform runs asynchronous plug-in steps and system jobs?",
            uk: "Яка частина платформи виконує асинхронні кроки плагінів і системні завдання?",
          },
          options: [
            { id: "a", text: { en: "The asynchronous service, which works through a queue of system jobs", uk: "Асинхронний сервіс, що обробляє чергу системних завдань" } },
            { id: "b", text: { en: "The user's browser", uk: "Браузер користувача" } },
            { id: "c", text: { en: "SQL Server Agent", uk: "SQL Server Agent" } },
          ],
          correct: ["a"],
        },
        {
          id: "sandbox",
          mode: "multi",
          prompt: {
            en: "What is true about the sandbox that runs plug-ins in Dynamics 365 online?",
            uk: "Що правда про пісочницю, у якій виконуються плагіни в Dynamics 365 online?",
          },
          options: [
            { id: "a", text: { en: "Plug-ins run isolated from the platform's own processes", uk: "Плагіни виконуються ізольовано від власних процесів платформи" } },
            { id: "b", text: { en: "There is a 2-minute limit per execution", uk: "Є ліміт 2 хвилини на одне виконання" } },
            { id: "c", text: { en: "Plug-ins cannot use the local file system or registry", uk: "Плагіни не можуть користуватися локальною файловою системою чи реєстром" } },
            { id: "d", text: { en: "Plug-ins can open a direct connection to the SQL database", uk: "Плагіни можуть відкрити пряме з'єднання з SQL-базою" } },
          ],
          correct: ["a", "b", "c"],
        },
      ],
    },
    { kind: "lecture", slug: "plugin-messages", title: { en: "Plug-in messages", uk: "Повідомлення плагінів" } },
    {
      kind: "lecture",
      slug: "event-pipeline",
      title: { en: "Understanding the plug-in pipeline", uk: "Конвеєр виконання плагінів" },
    },
    pluginPipelinePractice,
    {
      kind: "lecture",
      slug: "hello-world-project",
      title: { en: "Hello World plug-in: preparing the project", uk: "Плагін Hello World: підготовка проєкту" },
    },
    {
      kind: "lecture",
      slug: "hello-world-code",
      title: { en: "Hello World plug-in: writing the code", uk: "Плагін Hello World: пишемо код" },
    },
    {
      kind: "lecture",
      slug: "hello-world-deploy",
      title: { en: "Hello World plug-in: deploying and testing", uk: "Плагін Hello World: розгортання й тестування" },
    },
    {
      kind: "lecture",
      slug: "metadata-browser",
      title: { en: "Browsing metadata", uk: "Перегляд метаданих" },
    },
    {
      kind: "lecture",
      slug: "reading-target",
      title: { en: "Reading data from the primary table", uk: "Читання даних основної таблиці" },
    },
    {
      kind: "lecture",
      slug: "create-task-plugin",
      title: { en: "Second plug-in: creating a task with the organization service", uk: "Другий плагін: створюємо завдання через сервіс організації" },
    },
    { kind: "lecture", slug: "plugin-impersonation", title: { en: "Impersonation in plug-ins", uk: "Імперсонація в плагінах" } },
    {
      kind: "lecture",
      slug: "shared-variables",
      title: { en: "Passing data between plug-ins with shared variables", uk: "Передавання даних між плагінами через shared variables" },
    },
    { kind: "lecture", slug: "context-depth", title: { en: "Understanding context.Depth", uk: "Як працює context.Depth" } },
    { kind: "lecture", slug: "isolation-mode", title: { en: "Isolation mode and trust", uk: "Режим ізоляції та довіра" } },
    {
      kind: "lecture",
      slug: "plugin-configuration",
      title: { en: "Handling configuration data in a plug-in", uk: "Конфігураційні дані в плагіні" },
    },
    { kind: "lecture", slug: "async-plugins", title: { en: "Asynchronous plug-ins", uk: "Асинхронні плагіни" } },
    pluginsQuiz,
    {
      kind: "practice",
      slug: "create-follow-up-task",
      title: { en: "Practice: A follow-up task for every new account", uk: "Практика «Завдання для кожного нового акаунта»" },
      language: "csharp",
      starter: PROGRAM_WITH(TASK_PLUGIN("        // Write your code here"), TASK_MAIN, XRM_USINGS, TASK_MEMBERS),
      solution: PROGRAM_WITH(TASK_PLUGIN(TASK_SOLUTION), TASK_MAIN, XRM_USINGS, TASK_MEMBERS),
      expectedOutput: "== Create account Contoso\n  trace: Task created for Contoso\n== Create account Fabrikam\n  trace: Task created for Fabrikam\n== Update account Contoso Ltd\n  trace: Skipped: Update of account\n== Create contact Taras Melnyk\n  trace: Skipped: Create of contact\nTasks:\n  Welcome call: Contoso | priority 2 | regarding Contoso Ltd | owner Anna Shevchenko | Primary contact: Olena Koval\n  Welcome call: Fabrikam | priority 1 | regarding Fabrikam | owner Anna Shevchenko | -\n",
      maxScore: 5,
    },
    {
      kind: "practice",
      slug: "credit-limit-audit",
      title: { en: "Practice: Shared variables, depth and SYSTEM", uk: "Практика «Shared variables, глибина та SYSTEM»" },
      language: "csharp",
      starter: PROGRAM_WITH(AUDIT_TYPES("        // Write your code here", "        // Write your code here"), AUDIT_MAIN, XRM_USINGS, AUDIT_MEMBERS),
      solution: PROGRAM_WITH(AUDIT_TYPES(AUDIT_CTOR, AUDIT_EXECUTE), AUDIT_MAIN, XRM_USINGS, AUDIT_MEMBERS),
      expectedOutput: "== Anna raises Contoso to 100000\n  trace: Audit note created\n== Anna raises Contoso to 120000\n  trace: Change of 20000 is below 50000\n== Anna changes Contoso's phone\n  trace: Credit limit not changed\n== A plug-in raises Contoso to 500000\n  trace: Skipped at depth 2\n== Ivan sets Fabrikam to 60000\n  trace: Audit note created\nNotes:\n  Credit limit raised | Contoso | owner SYSTEM | 20000 -> 100000 by Anna Shevchenko\n  Credit limit raised | Fabrikam | owner SYSTEM | 0 -> 60000 by Ivan Petrenko\n",
      maxScore: 5,
    },
  ],
};
