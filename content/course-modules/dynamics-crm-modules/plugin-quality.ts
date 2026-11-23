import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const USINGS = "using System.Collections.Generic;\nusing System.Linq;";

const TYPES = (serviceBody: string) => `// --- A tiny model of the Dataverse SDK ---
class Entity
{
    public string LogicalName;
    public Guid Id;
    public readonly Dictionary<string, object> Attributes = new Dictionary<string, object>();

    public Entity(string logicalName) { LogicalName = logicalName; }
    public Entity(string logicalName, Guid id) { LogicalName = logicalName; Id = id; }

    public object this[string name]
    {
        get { return Attributes[name]; }
        set { Attributes[name] = value; }
    }

    public bool Contains(string name) { return Attributes.ContainsKey(name); }

    public T GetAttributeValue<T>(string name)
    {
        object value;
        return Attributes.TryGetValue(name, out value) && value != null ? (T)value : default(T);
    }

    public override string ToString()
    {
        string id = Id.ToString().Substring(0, 8);
        return LogicalName + "(" + id + ") " + string.Join(" ", Attributes.OrderBy(a => a.Key, StringComparer.Ordinal).Select(a => a.Key + "=" + a.Value));
    }
}

class ColumnSet
{
    public readonly bool AllColumns;
    public readonly List<string> Columns = new List<string>();

    public ColumnSet(bool allColumns) { AllColumns = allColumns; }
    public ColumnSet(params string[] columns) { Columns.AddRange(columns); }
}

// What the real service throws for a missing record and other server errors
class FaultException : Exception
{
    public FaultException(string message) : base(message) { }
}

interface IOrganizationService
{
    Guid Create(Entity entity);
    Entity Retrieve(string entityName, Guid id, ColumnSet columnSet);
    void Update(Entity entity);
    void Delete(string entityName, Guid id);
    // All columns of every record of entityName whose attribute equals value, in creation order
    List<Entity> RetrieveByAttribute(string entityName, string attribute, object value);
}

// --- Plug-in logic, kept apart from IPlugin so it can be tested with any IOrganizationService ---
class AccountPhoneSync
{
    readonly IOrganizationService service;

    public AccountPhoneSync(IOrganizationService service) { this.service = service; }

    // Copies a changed account phone to the account's contacts that opted in
    public int Run(Entity target)
    {
        if (!target.Contains("telephone1")) return 0;
        int updated = 0;
        foreach (var contact in service.RetrieveByAttribute("contact", "parentcustomerid", target.Id))
        {
            if (!contact.GetAttributeValue<bool>("syncphone")) continue;
            var change = new Entity("contact", contact.Id);
            change["telephone1"] = target["telephone1"];
            service.Update(change);
            updated++;
        }
        return updated;
    }
}

// --- The fake: an in-memory IOrganizationService for unit tests ---
class FakeOrganizationService : IOrganizationService
{
${serviceBody}
}`;

const STARTER_BODY = `    public Guid Create(Entity entity)
    {
        // Write your code here
        return Guid.Empty;
    }

    public Entity Retrieve(string entityName, Guid id, ColumnSet columnSet)
    {
        // Write your code here
        return null;
    }

    public void Update(Entity entity)
    {
        // Write your code here
    }

    public void Delete(string entityName, Guid id)
    {
        // Write your code here
    }

    public List<Entity> RetrieveByAttribute(string entityName, string attribute, object value)
    {
        // Write your code here
        return new List<Entity>();
    }`;

const SOLUTION_BODY = `    readonly List<Entity> records = new List<Entity>();
    int lastId;

    static Entity Copy(Entity source, ColumnSet columns)
    {
        var copy = new Entity(source.LogicalName, source.Id);
        foreach (var attribute in source.Attributes)
            if (columns.AllColumns || columns.Columns.Contains(attribute.Key))
                copy[attribute.Key] = attribute.Value;
        return copy;
    }

    Entity Find(string entityName, Guid id)
    {
        var found = records.FirstOrDefault(r => r.LogicalName == entityName && r.Id == id);
        if (found == null) throw new FaultException(entityName + " With Id = " + id + " Does Not Exist");
        return found;
    }

    public Guid Create(Entity entity)
    {
        var stored = Copy(entity, new ColumnSet(true));
        if (stored.Id == Guid.Empty) stored.Id = new Guid(++lastId, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        records.Add(stored);
        return stored.Id;
    }

    public Entity Retrieve(string entityName, Guid id, ColumnSet columnSet)
    {
        return Copy(Find(entityName, id), columnSet);
    }

    public void Update(Entity entity)
    {
        var stored = Find(entity.LogicalName, entity.Id);
        foreach (var attribute in entity.Attributes) stored[attribute.Key] = attribute.Value;
    }

    public void Delete(string entityName, Guid id)
    {
        records.Remove(Find(entityName, id));
    }

    public List<Entity> RetrieveByAttribute(string entityName, string attribute, object value)
    {
        return records
            .Where(r => r.LogicalName == entityName && r.Contains(attribute) && Equals(r[attribute], value))
            .Select(r => Copy(r, new ColumnSet(true)))
            .ToList();
    }`;

const MEMBERS = `    static Guid AddContact(IOrganizationService service, string name, Guid parent, bool syncPhone)
    {
        var contact = new Entity("contact");
        contact["fullname"] = name;
        contact["parentcustomerid"] = parent;
        contact["syncphone"] = syncPhone;
        contact["telephone1"] = "000";
        return service.Create(contact);
    }

    static void Expect(string name, Action action)
    {
        try
        {
            action();
            Console.WriteLine(name + ": no error");
        }
        catch (FaultException ex)
        {
            Console.WriteLine(name + ": " + ex.Message);
        }
    }`;

const MAIN = `        IOrganizationService service = new FakeOrganizationService();

        var account = new Entity("account");
        account["name"] = "Contoso";
        account["telephone1"] = "111";
        Guid accountId = service.Create(account);
        Console.WriteLine("Created: " + accountId);

        account["name"] = "Changed by the caller";
        var retrieved = service.Retrieve("account", accountId, new ColumnSet("name"));
        Console.WriteLine("Retrieved: " + retrieved);
        retrieved["name"] = "Changed in the copy";
        Console.WriteLine("Stored: " + service.Retrieve("account", accountId, new ColumnSet(true)));

        var other = new Entity("account");
        other["name"] = "Fabrikam";
        Guid otherId = service.Create(other);
        AddContact(service, "Olena Koval", accountId, true);
        AddContact(service, "Taras Melnyk", accountId, false);
        Guid irynaId = AddContact(service, "Iryna Bondar", accountId, true);
        AddContact(service, "Maksym Kravets", otherId, true);

        var change = new Entity("account", accountId);
        change["telephone1"] = "222";
        service.Update(change);
        int updated = new AccountPhoneSync(service).Run(change);
        Console.WriteLine("Contacts updated: " + updated);
        foreach (var contact in service.RetrieveByAttribute("contact", "parentcustomerid", accountId))
            Console.WriteLine("  " + contact.GetAttributeValue<string>("fullname") + " " + contact.GetAttributeValue<string>("telephone1"));
        Console.WriteLine("Account: " + service.Retrieve("account", accountId, new ColumnSet("name", "telephone1")));

        service.Delete("contact", irynaId);
        Expect("Retrieve deleted", () => service.Retrieve("contact", irynaId, new ColumnSet(true)));
        Expect("Delete twice", () => service.Delete("contact", irynaId));
        Expect("Wrong table", () => service.Update(new Entity("contact", otherId)));
        Console.WriteLine("Contacts left: " + service.RetrieveByAttribute("contact", "parentcustomerid", accountId).Count);`;

export const pluginQualityModule: ModuleDef = {
  slug: "crm-plugin-quality",
  title: { en: "Testable, reliable plug-ins", uk: "Тестовані та надійні плагіни" },
  slides: [
    { kind: "lecture", slug: "testable-plugins", title: { en: "Testing plug-ins", uk: "Тестування плагінів" } },
    {
      kind: "lecture",
      slug: "plugin-pitfalls",
      title: { en: "Performance, recursion and other pitfalls", uk: "Продуктивність, рекурсія та інші пастки" },
    },
    {
      kind: "quiz",
      slug: "plugin-quality-quiz",
      title: { en: "Plug-in quality check", uk: "Перевірка: якість плагінів" },
      questions: [
        {
          id: "testable",
          mode: "single",
          prompt: {
            en: "What makes plug-in logic easiest to unit test?",
            uk: "Що найбільше спрощує модульне тестування логіки плагіна?",
          },
          options: [
            { id: "a", text: { en: "Keeping Execute thin and moving the rules into a class that takes IOrganizationService and the data it needs", uk: "Тримати Execute тонким, а правила винести в клас, який отримує IOrganizationService і потрібні дані" } },
            { id: "b", text: { en: "Putting all logic in Execute so there is one place to test", uk: "Покласти всю логіку в Execute, щоб тестувати в одному місці" } },
            { id: "c", text: { en: "Testing only by registering the plug-in in a dev environment", uk: "Тестувати лише реєстрацією плагіна в dev-середовищі" } },
          ],
          correct: ["a"],
        },
        {
          id: "depth",
          mode: "single",
          prompt: {
            en: "A PostOperation Update plug-in on account updates the same account. What stops it from running forever, and what is the better fix?",
            uk: "PostOperation-плагін на Update акаунта оновлює той самий акаунт. Що не дає йому виконуватися вічно і як краще це виправити?",
          },
          options: [
            { id: "a", text: { en: "The platform's depth limit eventually fails the call; better: filter the step on the columns it cares about and set values in PreOperation instead", uk: "Ліміт глибини платформи зрештою зупинить виклик помилкою; краще: фільтрувати крок за потрібними стовпцями й задавати значення в PreOperation" } },
            { id: "b", text: { en: "Nothing stops it; add Thread.Sleep", uk: "Ніщо не зупинить; додати Thread.Sleep" } },
            { id: "c", text: { en: "The platform silently ignores updates from plug-ins", uk: "Платформа мовчки ігнорує оновлення з плагінів" } },
          ],
          correct: ["a"],
        },
        {
          id: "columns",
          mode: "multi",
          prompt: {
            en: "Which practices keep plug-ins fast?",
            uk: "Які практики допомагають плагінам працювати швидко?",
          },
          options: [
            { id: "a", text: { en: "Retrieve only the columns you need instead of all columns", uk: "Отримувати лише потрібні стовпці, а не всі" } },
            { id: "b", text: { en: "Use filtering attributes on Update steps", uk: "Використовувати filtering attributes для кроків Update" } },
            { id: "c", text: { en: "Call slow external APIs synchronously in PreOperation", uk: "Синхронно викликати повільні зовнішні API в PreOperation" } },
            { id: "d", text: { en: "Use images instead of an extra Retrieve of the same record", uk: "Використовувати образи замість додаткового Retrieve того самого запису" } },
          ],
          correct: ["a", "b", "d"],
        },
        {
          id: "tracing",
          mode: "single",
          prompt: {
            en: "Where do messages written with ITracingService end up?",
            uk: "Куди потрапляють повідомлення, записані через ITracingService?",
          },
          options: [
            { id: "a", text: { en: "In the plug-in trace log (when enabled) and in the error details when the plug-in fails", uk: "У журналі трасування плагінів (якщо ввімкнено) і в деталях помилки, коли плагін падає" } },
            { id: "b", text: { en: "Only in the browser console", uk: "Лише в консолі браузера" } },
            { id: "c", text: { en: "In a file on the server's disk", uk: "У файлі на диску сервера" } },
          ],
          correct: ["a"],
        },
        {
          id: "timeout",
          mode: "single",
          prompt: {
            en: "A plug-in in the sandbox needs to call an external API that sometimes takes a minute. What is the best design?",
            uk: "Плагіну в пісочниці треба викликати зовнішній API, який іноді відповідає хвилину. Який дизайн найкращий?",
          },
          options: [
            { id: "a", text: { en: "Hand the work off asynchronously: an async step, a Service Bus or webhook endpoint, or a flow", uk: "Передати роботу асинхронно: асинхронний крок, Service Bus чи webhook, або flow" } },
            { id: "b", text: { en: "Call it synchronously and raise the timeout in the plug-in", uk: "Викликати синхронно й підняти тайм-аут у плагіні" } },
            { id: "c", text: { en: "Start a background thread and return immediately", uk: "Запустити фоновий потік і одразу повернутися" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "fake-org-service",
      title: { en: "Practice: A fake organization service", uk: "Практика «Фейковий сервіс організації»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES(STARTER_BODY), MAIN, USINGS, MEMBERS),
      solution: PROGRAM_WITH(TYPES(SOLUTION_BODY), MAIN, USINGS, MEMBERS),
      expectedOutput: "Created: 00000001-0000-0000-0000-000000000000\nRetrieved: account(00000001) name=Contoso\nStored: account(00000001) name=Contoso telephone1=111\nContacts updated: 2\n  Olena Koval 222\n  Taras Melnyk 000\n  Iryna Bondar 222\nAccount: account(00000001) name=Contoso telephone1=222\nRetrieve deleted: contact With Id = 00000005-0000-0000-0000-000000000000 Does Not Exist\nDelete twice: contact With Id = 00000005-0000-0000-0000-000000000000 Does Not Exist\nWrong table: contact With Id = 00000002-0000-0000-0000-000000000000 Does Not Exist\nContacts left: 2\n",
      maxScore: 5,
    },
  ],
};
