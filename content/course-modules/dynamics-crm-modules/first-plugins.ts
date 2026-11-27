import { PROGRAM_WITH } from "../csharp-code";
import { XRM_FAKES, XRM_SDK, XRM_USINGS } from "../dynamics-crm-sdk";
import type { ModuleDef } from "../types";

/** The SDK model, the fake platform and one plug-in class whose Execute body is the task. */
const PLUGIN = (comment: string, className: string, body: string) => `${XRM_SDK}

${XRM_FAKES}

// ===== Your plug-in: ${comment} =====
class ${className} : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
${body}
    }
}`;

/** Plays the platform for one synchronous step: runs the plug-in, then "saves" the Target unless it threw. */
const HARNESS = `    static readonly FakeDatabase db = new FakeDatabase();

    static void Run(IPlugin plugin, string message, int stage, object target)
    {
        var entity = target as Entity;
        var table = entity != null ? entity.LogicalName : ((EntityReference)target).LogicalName;
        Console.WriteLine("== " + message + " " + table + " (stage " + stage + ")");

        var context = new FakePluginContext { MessageName = message, PrimaryEntityName = table, Stage = stage, Depth = 1,
            UserId = FakeDatabase.SystemUserId, InitiatingUserId = FakeDatabase.SystemUserId };
        context.InputParameters["Target"] = target;
        var tracing = new FakeTracingService();
        string result;
        try
        {
            plugin.Execute(new FakeServiceProvider(context, tracing, new FakeServiceFactory(db)));
            result = entity != null ? "saved: " + Columns(entity) : "deleted";
        }
        catch (InvalidPluginExecutionException ex)
        {
            result = "ERROR: " + ex.Message;
        }
        foreach (var line in tracing.Lines) Console.WriteLine("  trace: " + line);
        Console.WriteLine("  " + result);
    }

    static string Columns(Entity entity)
    {
        return string.Join(", ", entity.Attributes.OrderBy(a => a.Key, StringComparer.Ordinal).Select(a => a.Key + "=" + a.Value));
    }`;

const ID = (n: number) => `new Guid(${n}, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`;
const STARTER = "        // Write your code here";

/* ---------- Drill 1: read the context ---------- */

const HELLO_SOLUTION = `        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

        tracing.Trace("Message: {0}", context.MessageName);
        tracing.Trace("Table: {0}", context.PrimaryEntityName);
        tracing.Trace("Stage: {0}, depth: {1}", context.Stage, context.Depth);

        // Create and Update send an Entity; Delete sends an EntityReference
        var target = context.InputParameters["Target"];
        var entity = target as Entity;
        if (entity != null)
            tracing.Trace("Columns: {0}", string.Join(", ", entity.Attributes.Keys.OrderBy(k => k, StringComparer.Ordinal)));
        else
            tracing.Trace("Record: {0}", target);`;

const HELLO_MAIN = `        var plugin = new HelloContextPlugin();

        var contact = new Entity("contact");
        contact["lastname"] = "Koval";
        contact["firstname"] = "Olena";
        contact["emailaddress1"] = "olena@contoso.com";
        Run(plugin, "Create", 20, contact);

        var change = new Entity("account", ${ID(3)});
        change["telephone1"] = "+380 44 123 4567";
        Run(plugin, "Update", 10, change);

        Run(plugin, "Delete", 20, new EntityReference("contact", ${ID(5)}));`;

/* ---------- Drill 2: default values ---------- */

const DEFAULTS_SOLUTION = `        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var target = (Entity)context.InputParameters["Target"];

        var name = target.GetAttributeValue<string>("name");
        if (name != null) target["name"] = name.Trim();

        var credit = target.GetAttributeValue<Money>("creditlimit");
        if (credit != null && credit.Value < 0)
            throw new InvalidPluginExecutionException("Credit limit cannot be negative.");

        // Defaults only for new accounts: on Update, a missing column means "not changed"
        if (context.MessageName == "Create")
        {
            if (!target.Contains("creditlimit")) target["creditlimit"] = new Money(1000m);
            if (!target.Contains("address1_country")) target["address1_country"] = "Ukraine";
        }`;

const DEFAULTS_MAIN = `        var plugin = new AccountDefaultsPlugin();

        var contoso = new Entity("account");
        contoso["name"] = "  Contoso  ";
        Run(plugin, "Create", 20, contoso);

        var fabrikam = new Entity("account");
        fabrikam["name"] = "Fabrikam";
        fabrikam["creditlimit"] = new Money(50000m);
        fabrikam["address1_country"] = "Poland";
        Run(plugin, "Create", 20, fabrikam);

        var bad = new Entity("account");
        bad["name"] = "Bad Debts Ltd";
        bad["creditlimit"] = new Money(-5m);
        Run(plugin, "Create", 20, bad);

        var phone = new Entity("account", ${ID(3)});
        phone["telephone1"] = "+380 44 123 4567";
        Run(plugin, "Update", 20, phone);

        var rename = new Entity("account", ${ID(4)});
        rename["name"] = " Litware ";
        Run(plugin, "Update", 20, rename);`;

/* ---------- Drill 3: a required email ---------- */

const EMAIL_SOLUTION = `        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var target = (Entity)context.InputParameters["Target"];

        // An update that does not touch the email has nothing to check
        if (context.MessageName == "Update" && !target.Contains("emailaddress1")) return;

        var email = target.GetAttributeValue<string>("emailaddress1");
        if (string.IsNullOrWhiteSpace(email))
            throw new InvalidPluginExecutionException(context.MessageName == "Create" ? "Email is required." : "Email cannot be cleared.");

        target["emailaddress1"] = email.Trim().ToLowerInvariant();`;

const EMAIL_MAIN = `        var plugin = new ContactEmailPlugin();

        var olena = new Entity("contact");
        olena["lastname"] = "Koval";
        olena["emailaddress1"] = " Olena@Contoso.COM ";
        Run(plugin, "Create", 10, olena);

        var taras = new Entity("contact");
        taras["lastname"] = "Melnyk";
        Run(plugin, "Create", 10, taras);

        var iryna = new Entity("contact");
        iryna["lastname"] = "Bondar";
        iryna["emailaddress1"] = "   ";
        Run(plugin, "Create", 10, iryna);

        var job = new Entity("contact", ${ID(1)});
        job["jobtitle"] = "Sales Manager";
        Run(plugin, "Update", 10, job);

        var clear = new Entity("contact", ${ID(1)});
        clear["emailaddress1"] = null;
        Run(plugin, "Update", 10, clear);

        var fix = new Entity("contact", ${ID(2)});
        fix["emailaddress1"] = "TARAS@contoso.com";
        Run(plugin, "Update", 10, fix);`;

const EXPECTED: Record<string, string> = {
  "hello-context": "== Create contact (stage 20)\n  trace: Message: Create\n  trace: Table: contact\n  trace: Stage: 20, depth: 1\n  trace: Columns: emailaddress1, firstname, lastname\n  saved: emailaddress1=olena@contoso.com, firstname=Olena, lastname=Koval\n== Update account (stage 10)\n  trace: Message: Update\n  trace: Table: account\n  trace: Stage: 10, depth: 1\n  trace: Columns: telephone1\n  saved: telephone1=+380 44 123 4567\n== Delete contact (stage 20)\n  trace: Message: Delete\n  trace: Table: contact\n  trace: Stage: 20, depth: 1\n  trace: Record: contact(00000005)\n  deleted\n",
  "default-values": "== Create account (stage 20)\n  saved: address1_country=Ukraine, creditlimit=1000, name=Contoso\n== Create account (stage 20)\n  saved: address1_country=Poland, creditlimit=50000, name=Fabrikam\n== Create account (stage 20)\n  ERROR: Credit limit cannot be negative.\n== Update account (stage 20)\n  saved: telephone1=+380 44 123 4567\n== Update account (stage 20)\n  saved: name=Litware\n",
  "required-email": "== Create contact (stage 10)\n  saved: emailaddress1=olena@contoso.com, lastname=Koval\n== Create contact (stage 10)\n  ERROR: Email is required.\n== Create contact (stage 10)\n  ERROR: Email is required.\n== Update contact (stage 10)\n  saved: jobtitle=Sales Manager\n== Update contact (stage 10)\n  ERROR: Email cannot be cleared.\n== Update contact (stage 10)\n  saved: emailaddress1=taras@contoso.com\n",
};

const practice = (slug: string, title: { en: string; uk: string }, comment: string, className: string, solution: string, main: string) => ({
  kind: "practice" as const,
  slug,
  title,
  language: "csharp" as const,
  starter: PROGRAM_WITH(PLUGIN(comment, className, STARTER), main, XRM_USINGS, HARNESS),
  solution: PROGRAM_WITH(PLUGIN(comment, className, solution), main, XRM_USINGS, HARNESS),
  expectedOutput: EXPECTED[slug],
  maxScore: 3,
});

export const firstPluginsModule: ModuleDef = {
  slug: "crm-first-plugins",
  title: { en: "Your first plug-ins: easy drills", uk: "Ваші перші плагіни: прості вправи" },
  slides: [
    {
      kind: "lecture",
      slug: "context-cheatsheet",
      title: { en: "The plug-in context: a cheat sheet", uk: "Контекст плагіна: шпаргалка" },
    },
    {
      kind: "quiz",
      slug: "first-plugins-quiz",
      title: { en: "First plug-ins check", uk: "Перевірка: перші плагіни" },
      questions: [
        {
          id: "target-type",
          mode: "single",
          prompt: {
            en: "What is InputParameters[\"Target\"] in a plug-in registered on Delete?",
            uk: "Що таке InputParameters[\"Target\"] у плагіні, зареєстрованому на Delete?",
          },
          options: [
            { id: "a", text: { en: "An EntityReference: the table and id of the deleted row", uk: "EntityReference: таблиця та id видаленого рядка" } },
            { id: "b", text: { en: "An Entity with all columns of the row", uk: "Entity з усіма стовпцями рядка" } },
            { id: "c", text: { en: "There is no Target on Delete", uk: "На Delete немає Target" } },
          ],
          correct: ["a"],
        },
        {
          id: "update-target",
          mode: "single",
          prompt: {
            en: "A user changes only the phone number of an account. Which columns are in the Target of the Update?",
            uk: "Користувач змінює лише телефон акаунта. Які стовпці є в Target оновлення?",
          },
          options: [
            { id: "a", text: { en: "Only the changed ones (telephone1), plus the id", uk: "Лише змінені (telephone1) плюс id" } },
            { id: "b", text: { en: "All columns of the account", uk: "Усі стовпці акаунта" } },
            { id: "c", text: { en: "Only the columns visible on the form", uk: "Лише стовпці, видимі на формі" } },
          ],
          correct: ["a"],
        },
        {
          id: "stage-numbers",
          mode: "single",
          prompt: {
            en: "Which stage numbers belong to PreValidation, PreOperation and PostOperation?",
            uk: "Які номери стадій відповідають PreValidation, PreOperation і PostOperation?",
          },
          options: [
            { id: "a", text: { en: "10, 20 and 40", uk: "10, 20 і 40" } },
            { id: "b", text: { en: "1, 2 and 3", uk: "1, 2 і 3" } },
            { id: "c", text: { en: "20, 30 and 40", uk: "20, 30 і 40" } },
          ],
          correct: ["a"],
        },
        {
          id: "change-before-save",
          mode: "single",
          prompt: {
            en: "In which stage can a plug-in change a value in Target so that it is saved, without calling Update?",
            uk: "На якій стадії плагін може змінити значення в Target, щоб воно збереглося без виклику Update?",
          },
          options: [
            { id: "a", text: { en: "PreOperation (or PreValidation)", uk: "PreOperation (або PreValidation)" } },
            { id: "b", text: { en: "PostOperation", uk: "PostOperation" } },
            { id: "c", text: { en: "Any stage, including asynchronous", uk: "Будь-якої, включно з асинхронними" } },
          ],
          correct: ["a"],
        },
        {
          id: "get-services",
          mode: "multi",
          prompt: {
            en: "Which services can a plug-in get from the IServiceProvider?",
            uk: "Які сервіси плагін може отримати з IServiceProvider?",
          },
          options: [
            { id: "a", text: { en: "IPluginExecutionContext", uk: "IPluginExecutionContext" } },
            { id: "b", text: { en: "ITracingService", uk: "ITracingService" } },
            { id: "c", text: { en: "IOrganizationServiceFactory", uk: "IOrganizationServiceFactory" } },
            { id: "d", text: { en: "A SQL connection to the database", uk: "SQL-з'єднання з базою даних" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "defaults-update",
          mode: "single",
          prompt: {
            en: "A plug-in sets a default country when Target has no address1_country. Why must it do this only on Create?",
            uk: "Плагін задає типову країну, коли в Target немає address1_country. Чому це треба робити лише на Create?",
          },
          options: [
            { id: "a", text: { en: "On Update, a missing column means 'not changed', so the default would overwrite the real value", uk: "На Update відсутній стовпець означає «не змінено», тож типове значення перезапише справжнє" } },
            { id: "b", text: { en: "Update plug-ins cannot change Target", uk: "Плагіни на Update не можуть змінювати Target" } },
            { id: "c", text: { en: "It makes no difference", uk: "Різниці немає" } },
          ],
          correct: ["a"],
        },
      ],
    },
    practice(
      "hello-context",
      { en: "Practice: Read the plug-in context", uk: "Практика «Прочитати контекст плагіна»" },
      "registered on Create, Update and Delete, synchronous",
      "HelloContextPlugin",
      HELLO_SOLUTION,
      HELLO_MAIN,
    ),
    practice(
      "default-values",
      { en: "Practice: Default values", uk: "Практика «Значення за замовчуванням»" },
      "registered on Create and Update of account, PreOperation (20)",
      "AccountDefaultsPlugin",
      DEFAULTS_SOLUTION,
      DEFAULTS_MAIN,
    ),
    practice(
      "required-email",
      { en: "Practice: A required email", uk: "Практика «Обов'язковий email»" },
      "registered on Create and Update of contact, PreValidation (10)",
      "ContactEmailPlugin",
      EMAIL_SOLUTION,
      EMAIL_MAIN,
    ),
  ],
};
