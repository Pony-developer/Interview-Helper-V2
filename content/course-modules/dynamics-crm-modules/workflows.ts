import { PROGRAM_WITH } from "../csharp-code";
import { XRM_FAKES, XRM_SDK, XRM_USINGS, XRM_WORKFLOW } from "../dynamics-crm-sdk";
import type { ModuleDef } from "../types";

const TYPES = (body: string) => `${XRM_SDK}

${XRM_WORKFLOW}

${XRM_FAKES}

// ===== Your custom workflow activity =====
class GetConfigurationValue : CodeActivity
{
    [RequiredArgument]
    [Input("Key")]
    public InArgument<string> Key { get; set; }

    [Input("Default value")]
    [Default("")]
    public InArgument<string> DefaultValue { get; set; }

    [Output("Value")]
    public OutArgument<string> Value { get; set; }

    [Output("Found")]
    public OutArgument<bool> Found { get; set; }

    protected override void Execute(CodeActivityContext executionContext)
    {
${body}
    }
}`;

const SOLUTION = `        var tracing = executionContext.GetExtension<ITracingService>();
        var context = executionContext.GetExtension<IWorkflowContext>();
        var factory = executionContext.GetExtension<IOrganizationServiceFactory>();
        IOrganizationService service = factory.CreateOrganizationService(context.UserId);

        string key = Key.Get(executionContext);
        var query = new QueryByAttribute("contoso_configuration");
        query.ColumnSet = new ColumnSet("contoso_value");
        query.AddAttributeValue("contoso_key", key);
        query.AddAttributeValue("statecode", 0);
        List<Entity> rows = service.RetrieveMultiple(query).Entities;

        if (rows.Count > 1)
            throw new InvalidPluginExecutionException("Duplicate configuration key: " + key);

        if (rows.Count == 1)
        {
            Value.Set(executionContext, rows[0].GetAttributeValue<string>("contoso_value"));
            Found.Set(executionContext, true);
            tracing.Trace("{0}: found", key);
        }
        else
        {
            Value.Set(executionContext, DefaultValue.Get(executionContext));
            Found.Set(executionContext, false);
            tracing.Trace("{0}: default used", key);
        }`;

const MEMBERS = `    static readonly FakeDatabase db = new FakeDatabase();

    static void AddSetting(string key, string value, int state)
    {
        var row = new Entity("contoso_configuration");
        row["contoso_key"] = key;
        row["contoso_value"] = value;
        row["statecode"] = new OptionSetValue(state);   // 0 Active, 1 Inactive
        db.Insert(row);
    }

    // Plays the workflow engine: binds the step's inputs, runs it, reads its outputs
    static void RunStep(string key, string defaultValue, Guid userId)
    {
        Console.WriteLine("== Key " + key);
        var activity = new GetConfigurationValue
        {
            Key = new InArgument<string>(key),
            DefaultValue = new InArgument<string>(defaultValue),
            Value = new OutArgument<string>(),
            Found = new OutArgument<bool>(),
        };
        var context = new CodeActivityContext();
        var tracing = new FakeTracingService();
        context.AddExtension<IWorkflowContext>(new FakeWorkflowContext { MessageName = "Create", PrimaryEntityName = "invoice", UserId = userId, InitiatingUserId = userId });
        context.AddExtension<ITracingService>(tracing);
        context.AddExtension<IOrganizationServiceFactory>(new FakeServiceFactory(db));
        try
        {
            activity.Invoke(context);
            Console.WriteLine("  Value = " + activity.Value.Get(context) + ", Found = " + activity.Found.Get(context));
        }
        catch (InvalidPluginExecutionException ex)
        {
            Console.WriteLine("  ERROR " + ex.Message);
        }
        foreach (var line in tracing.Lines) Console.WriteLine("  trace: " + line);
    }`;

const MAIN = `        Console.WriteLine("Step properties in the workflow designer:");
        foreach (var property in typeof(GetConfigurationValue).GetProperties().OrderBy(p => p.MetadataToken))
        {
            var input = (InputAttribute)property.GetCustomAttributes(typeof(InputAttribute), false).FirstOrDefault();
            var output = (OutputAttribute)property.GetCustomAttributes(typeof(OutputAttribute), false).FirstOrDefault();
            bool required = property.GetCustomAttributes(typeof(RequiredArgumentAttribute), false).Any();
            if (input != null) Console.WriteLine("  input  " + input.Name + (required ? " (required)" : ""));
            if (output != null) Console.WriteLine("  output " + output.Name);
        }

        var anna = new Entity("systemuser");
        anna["fullname"] = "Anna Shevchenko";
        Guid annaId = db.Insert(anna);

        AddSetting("invoice.prefix", "INV-", 0);
        AddSetting("support.email", "help@contoso.com", 0);
        AddSetting("old.feature", "on", 1);
        AddSetting("tax.rate", "20", 0);
        AddSetting("tax.rate", "21", 0);

        RunStep("invoice.prefix", "X-", annaId);
        RunStep("missing.key", "fallback", annaId);
        RunStep("old.feature", "off", annaId);
        RunStep("tax.rate", "0", annaId);
        Console.WriteLine("Service calls: " + db.Calls);`;

export const workflowsModule: ModuleDef = {
  slug: "crm-workflows",
  title: { en: "Custom workflow activities", uk: "Власні workflow activities" },
  slides: [
    {
      kind: "lecture",
      slug: "custom-workflow-intro",
      title: { en: "Introduction to custom workflow activities", uk: "Вступ до власних workflow activities" },
    },
    {
      kind: "lecture",
      slug: "configuration-table",
      title: { en: "A configuration table for the demo", uk: "Конфігураційна таблиця для демо" },
    },
    {
      kind: "lecture",
      slug: "workflow-activity-code",
      title: { en: "Developing a custom workflow activity", uk: "Розробка власної workflow activity" },
    },
    {
      kind: "lecture",
      slug: "workflow-activity-context",
      title: { en: "Developing a custom workflow activity (continued)", uk: "Розробка власної workflow activity (продовження)" },
    },
    { kind: "lecture", slug: "workflow-deploy", title: { en: "Deploying custom workflow activities", uk: "Розгортання власних workflow activities" } },
    { kind: "lecture", slug: "workflow-debugging", title: { en: "Debugging custom workflow activities", uk: "Налагодження власних workflow activities" } },
    {
      kind: "lecture",
      slug: "workflow-versioning",
      title: { en: "Assembly versioning for workflow activities", uk: "Версіонування збірок для workflow activities" },
    },
    { kind: "lecture", slug: "plugins-vs-workflows", title: { en: "Comparison: plug-ins vs workflows", uk: "Порівняння: плагіни проти workflow" } },
    {
      kind: "quiz",
      slug: "custom-workflows-quiz",
      title: { en: "Custom workflows", uk: "Власні workflow" },
      questions: [
        {
          id: "base-class",
          mode: "single",
          prompt: {
            en: "Which base class does a custom workflow activity derive from?",
            uk: "Від якого базового класу походить власна workflow activity?",
          },
          options: [
            { id: "a", text: { en: "System.Activities.CodeActivity", uk: "System.Activities.CodeActivity" } },
            { id: "b", text: { en: "Microsoft.Xrm.Sdk.IPlugin", uk: "Microsoft.Xrm.Sdk.IPlugin" } },
            { id: "c", text: { en: "System.Threading.Tasks.Task", uk: "System.Threading.Tasks.Task" } },
          ],
          correct: ["a"],
        },
        {
          id: "arguments",
          mode: "single",
          prompt: {
            en: "How does a custom workflow activity receive values from the workflow designer and give results back?",
            uk: "Як власна workflow activity отримує значення з дизайнера workflow і повертає результати?",
          },
          options: [
            { id: "a", text: { en: "Public InArgument<T> and OutArgument<T> properties marked with [Input] and [Output]", uk: "Публічні властивості InArgument<T> та OutArgument<T> з атрибутами [Input] і [Output]" } },
            { id: "b", text: { en: "Through InputParameters[\"Target\"] only", uk: "Лише через InputParameters[\"Target\"]" } },
            { id: "c", text: { en: "Through static fields of the class", uk: "Через статичні поля класу" } },
          ],
          correct: ["a"],
        },
        {
          id: "services",
          mode: "single",
          prompt: {
            en: "How does the activity get IWorkflowContext and IOrganizationServiceFactory?",
            uk: "Як activity отримує IWorkflowContext та IOrganizationServiceFactory?",
          },
          options: [
            { id: "a", text: { en: "executionContext.GetExtension<T>()", uk: "executionContext.GetExtension<T>()" } },
            { id: "b", text: { en: "serviceProvider.GetService(typeof(T)) from an IServiceProvider parameter", uk: "serviceProvider.GetService(typeof(T)) з параметра IServiceProvider" } },
            { id: "c", text: { en: "new ServiceClient(connectionString)", uk: "new ServiceClient(connectionString)" } },
          ],
          correct: ["a"],
        },
        {
          id: "flows",
          mode: "single",
          prompt: {
            en: "Can a Power Automate cloud flow use a custom workflow activity?",
            uk: "Чи може хмарний flow у Power Automate використати власну workflow activity?",
          },
          options: [
            { id: "a", text: { en: "No: they run only in classic workflows; to share code with flows, expose it as a Custom API", uk: "Ні: вони працюють лише в класичних workflow; щоб поділитися кодом із flow, зробіть Custom API" } },
            { id: "b", text: { en: "Yes, directly as a flow action", uk: "Так, напряму як дію flow" } },
            { id: "c", text: { en: "Only in desktop flows", uk: "Лише в desktop flow" } },
          ],
          correct: ["a"],
        },
        {
          id: "versioning",
          mode: "single",
          prompt: {
            en: "You need a breaking change in an activity's inputs while old workflows keep working. What do you do?",
            uk: "Потрібна несумісна зміна вхідних параметрів activity, але старі workflow мають працювати. Що робити?",
          },
          options: [
            { id: "a", text: { en: "Register the assembly with a new major or minor version, so both versions exist side by side, and move workflows over one by one", uk: "Зареєструвати збірку з новою major чи minor версією, щоб обидві версії існували поруч, і переводити workflow по одному" } },
            { id: "b", text: { en: "Change only the revision number and update the assembly in place", uk: "Змінити лише revision і оновити збірку на місці" } },
            { id: "c", text: { en: "Delete the old assembly first", uk: "Спершу видалити стару збірку" } },
          ],
          correct: ["a"],
        },
        {
          id: "compare",
          mode: "multi",
          prompt: {
            en: "Which statements about plug-ins and workflows are true?",
            uk: "Які твердження про плагіни та workflow правильні?",
          },
          options: [
            { id: "a", text: { en: "Plug-ins can run in PreValidation and PreOperation; workflows cannot change the record before the save in the same way", uk: "Плагіни можуть працювати на PreValidation і PreOperation; workflow не можуть так само змінити запис до збереження" } },
            { id: "b", text: { en: "Business users can change a classic workflow's steps without a developer", uk: "Бізнес-користувачі можуть змінювати кроки класичного workflow без розробника" } },
            { id: "c", text: { en: "Background workflows can wait for conditions and timeouts", uk: "Фонові workflow можуть чекати на умови й тайм-аути" } },
            { id: "d", text: { en: "Workflows run faster than plug-ins because they are compiled", uk: "Workflow працюють швидше за плагіни, бо скомпільовані" } },
          ],
          correct: ["a", "b", "c"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "config-value-activity",
      title: { en: "Practice: A configuration lookup step", uk: "Практика «Крок для читання конфігурації»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES("        // Write your code here"), MAIN, XRM_USINGS, MEMBERS),
      solution: PROGRAM_WITH(TYPES(SOLUTION), MAIN, XRM_USINGS, MEMBERS),
      expectedOutput: "Step properties in the workflow designer:\n  input  Key (required)\n  input  Default value\n  output Value\n  output Found\n== Key invoice.prefix\n  Value = INV-, Found = True\n  trace: invoice.prefix: found\n== Key missing.key\n  Value = fallback, Found = False\n  trace: missing.key: default used\n== Key old.feature\n  Value = off, Found = False\n  trace: old.feature: default used\n== Key tax.rate\n  ERROR Duplicate configuration key: tax.rate\nService calls: 4\n",
      maxScore: 5,
    },
  ],
};
