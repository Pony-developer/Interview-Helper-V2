import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const USINGS = "using System.Collections.Generic;\nusing System.Linq;";

const TYPES = (body: string) => `[Flags]
enum ChangeType { None = 0, Added = 1, Modified = 2, Deleted = 4 }

// The trigger's Scope option: whose rows can start the flow, relative to the flow owner
enum Scope { User, BusinessUnit, ParentChildBusinessUnits, Organization }

class BusinessUnit
{
    public string Name;
    public BusinessUnit Parent;

    public BusinessUnit(string name, BusinessUnit parent) { Name = name; Parent = parent; }
}

class User
{
    public string Name;
    public BusinessUnit Unit;

    public User(string name, BusinessUnit unit) { Name = name; Unit = unit; }
}

// The Dataverse trigger "When a row is added, modified or deleted"
class Trigger
{
    public string Flow;
    public string Table;
    public ChangeType Change;
    public Scope Scope;
    public User Owner;                                        // the flow owner
    public List<string> SelectColumns = new List<string>();   // empty = any column
    public string FilterColumn;                               // simplified Filter rows: FilterColumn eq FilterValue; null = no filter
    public object FilterValue;
}

class RowEvent
{
    public string Description;
    public string Table;
    public ChangeType Change;                                  // exactly one flag
    public User RowOwner;
    public List<string> ChangedColumns = new List<string>();
    public Dictionary<string, object> Row = new Dictionary<string, object>();   // the row's values
}

static class Triggers
{
${body}
}`;

const STARTER = `    public static bool ShouldFire(Trigger t, RowEvent e)
    {
        // Write your code here
        return false;
    }`;

const SOLUTION = `    public static bool ShouldFire(Trigger t, RowEvent e)
    {
        if (t.Table != e.Table) return false;
        if ((t.Change & e.Change) == 0) return false;
        if (!InScope(t, e.RowOwner)) return false;
        // Select columns only narrow down updates
        if (e.Change == ChangeType.Modified && t.SelectColumns.Count > 0 && !e.ChangedColumns.Any(c => t.SelectColumns.Contains(c)))
            return false;
        if (t.FilterColumn != null)
        {
            object value;
            if (!e.Row.TryGetValue(t.FilterColumn, out value) || !Equals(value, t.FilterValue)) return false;
        }
        return true;
    }

    static bool InScope(Trigger t, User rowOwner)
    {
        switch (t.Scope)
        {
            case Scope.User:
                return rowOwner == t.Owner;
            case Scope.BusinessUnit:
                return rowOwner.Unit == t.Owner.Unit;
            case Scope.ParentChildBusinessUnits:
                for (var unit = rowOwner.Unit; unit != null; unit = unit.Parent)
                    if (unit == t.Owner.Unit) return true;
                return false;
            default:
                return true;
        }
    }`;

const MAIN = `        var contoso = new BusinessUnit("Contoso", null);
        var sales = new BusinessUnit("Sales", contoso);
        var service = new BusinessUnit("Service", contoso);
        var anna = new User("Anna", sales);
        var bohdan = new User("Bohdan", sales);
        var chen = new User("Chen", service);
        var admin = new User("Admin", contoso);

        var triggers = new List<Trigger>
        {
            new Trigger { Flow = "Welcome email", Table = "contact", Change = ChangeType.Added, Scope = Scope.Organization, Owner = admin },
            new Trigger { Flow = "Credit check", Table = "account", Change = ChangeType.Added | ChangeType.Modified, Scope = Scope.Organization, Owner = admin,
                SelectColumns = new List<string> { "creditlimit" } },
            new Trigger { Flow = "My won deals", Table = "opportunity", Change = ChangeType.Modified, Scope = Scope.User, Owner = anna,
                SelectColumns = new List<string> { "statecode" }, FilterColumn = "statecode", FilterValue = 1 },
            new Trigger { Flow = "Sales digest", Table = "opportunity", Change = ChangeType.Added | ChangeType.Modified | ChangeType.Deleted,
                Scope = Scope.BusinessUnit, Owner = bohdan },
            new Trigger { Flow = "Archive copy", Table = "opportunity", Change = ChangeType.Deleted, Scope = Scope.ParentChildBusinessUnits, Owner = admin },
        };

        var events = new List<RowEvent>
        {
            new RowEvent { Description = "Anna adds a contact", Table = "contact", Change = ChangeType.Added, RowOwner = anna,
                ChangedColumns = new List<string> { "fullname", "emailaddress1" } },
            new RowEvent { Description = "Chen changes an account's phone", Table = "account", Change = ChangeType.Modified, RowOwner = chen,
                ChangedColumns = new List<string> { "telephone1" } },
            new RowEvent { Description = "Chen creates an account", Table = "account", Change = ChangeType.Added, RowOwner = chen,
                ChangedColumns = new List<string> { "name" } },
            new RowEvent { Description = "Anna wins her deal", Table = "opportunity", Change = ChangeType.Modified, RowOwner = anna,
                ChangedColumns = new List<string> { "statecode", "statuscode" }, Row = new Dictionary<string, object> { { "statecode", 1 } } },
            new RowEvent { Description = "Chen wins his deal", Table = "opportunity", Change = ChangeType.Modified, RowOwner = chen,
                ChangedColumns = new List<string> { "statecode", "statuscode" }, Row = new Dictionary<string, object> { { "statecode", 1 } } },
            new RowEvent { Description = "Anna renames a deal", Table = "opportunity", Change = ChangeType.Modified, RowOwner = anna,
                ChangedColumns = new List<string> { "name" }, Row = new Dictionary<string, object> { { "statecode", 0 } } },
            new RowEvent { Description = "Anna loses a deal", Table = "opportunity", Change = ChangeType.Modified, RowOwner = anna,
                ChangedColumns = new List<string> { "statecode", "statuscode" }, Row = new Dictionary<string, object> { { "statecode", 2 } } },
            new RowEvent { Description = "Bohdan deletes a deal", Table = "opportunity", Change = ChangeType.Deleted, RowOwner = bohdan,
                Row = new Dictionary<string, object> { { "statecode", 0 } } },
            new RowEvent { Description = "Chen deletes a deal", Table = "opportunity", Change = ChangeType.Deleted, RowOwner = chen,
                Row = new Dictionary<string, object> { { "statecode", 0 } } },
        };

        foreach (var e in events)
        {
            var fired = triggers.Where(t => Triggers.ShouldFire(t, e)).Select(t => t.Flow).ToList();
            Console.WriteLine(e.Description + ": " + (fired.Count == 0 ? "-" : string.Join(", ", fired)));
        }`;

export const powerAutomateModule: ModuleDef = {
  slug: "crm-power-automate",
  title: { en: "Power Automate and Dataverse", uk: "Power Automate і Dataverse" },
  slides: [
    { kind: "lecture", slug: "cloud-flows", title: { en: "Cloud flows on Dataverse", uk: "Хмарні потоки на Dataverse" } },
    {
      kind: "lecture",
      slug: "flows-in-alm",
      title: { en: "Flows in solutions: connections, errors and limits", uk: "Потоки в рішеннях: з'єднання, помилки та ліміти" },
    },
    {
      kind: "quiz",
      slug: "flows-quiz",
      title: { en: "Power Automate check", uk: "Перевірка: Power Automate" },
      questions: [
        {
          id: "select-columns",
          mode: "single",
          prompt: {
            en: "A flow must run only when an account's credit limit changes, not on every save. What do you configure?",
            uk: "Потік має запускатися лише тоді, коли змінюється кредитний ліміт акаунта, а не при кожному збереженні. Що налаштувати?",
          },
          options: [
            { id: "a", text: { en: "Select columns = creditlimit on the trigger", uk: "Select columns = creditlimit у тригері" } },
            { id: "b", text: { en: "A Condition action as the first step that checks the value", uk: "Дію Condition першим кроком, що перевіряє значення" } },
            { id: "c", text: { en: "Filter rows = creditlimit ne null", uk: "Filter rows = creditlimit ne null" } },
          ],
          correct: ["a"],
        },
        {
          id: "scope",
          mode: "single",
          prompt: {
            en: "A flow owned by a sales manager uses the trigger scope Business unit. Which rows start it?",
            uk: "Потік, що належить менеджеру з продажу, має область тригера Business unit. Які рядки його запускають?",
          },
          options: [
            { id: "a", text: { en: "Rows owned by users or teams in the flow owner's business unit", uk: "Рядки, якими володіють користувачі чи команди бізнес-підрозділу власника потоку" } },
            { id: "b", text: { en: "Rows the person who saved them can see", uk: "Рядки, які бачить той, хто їх зберіг" } },
            { id: "c", text: { en: "Every row in the environment", uk: "Усі рядки в середовищі" } },
          ],
          correct: ["a"],
        },
        {
          id: "sync",
          mode: "single",
          prompt: {
            en: "Saving an order must be blocked when the customer is on credit hold, and the user must see the error at once. Is a cloud flow a good fit?",
            uk: "Збереження замовлення треба блокувати, якщо клієнт на кредитному утриманні, і користувач має одразу побачити помилку. Чи підходить хмарний потік?",
          },
          options: [
            { id: "a", text: { en: "No: cloud flows run asynchronously after the save; use a synchronous plug-in", uk: "Ні: хмарні потоки виконуються асинхронно після збереження; потрібен синхронний плагін" } },
            { id: "b", text: { en: "Yes, if the flow uses a Terminate action with status Failed", uk: "Так, якщо потік використовує дію Terminate зі статусом Failed" } },
            { id: "c", text: { en: "Yes, flows run inside the save transaction", uk: "Так, потоки виконуються всередині транзакції збереження" } },
          ],
          correct: ["a"],
        },
        {
          id: "conn-ref",
          mode: "single",
          prompt: {
            en: "A solution-aware flow is imported into production. How does it get a production connection without editing the flow?",
            uk: "Потік у рішенні імпортують у продакшн. Як він отримує продакшн-з'єднання без редагування потоку?",
          },
          options: [
            { id: "a", text: { en: "Through a connection reference that is mapped to a production connection at import", uk: "Через connection reference, який під час імпорту прив'язують до продакшн-з'єднання" } },
            { id: "b", text: { en: "The developer's connection is exported inside the solution", uk: "З'єднання розробника експортується всередині рішення" } },
            { id: "c", text: { en: "Each flow must be opened and re-saved after import", uk: "Кожен потік треба відкрити й перезберегти після імпорту" } },
          ],
          correct: ["a"],
        },
        {
          id: "try-catch",
          mode: "single",
          prompt: {
            en: "How do you build try/catch error handling in a cloud flow?",
            uk: "Як побудувати обробку помилок try/catch у хмарному потоці?",
          },
          options: [
            { id: "a", text: { en: "A Try scope, then a Catch scope whose Configure run after is set to 'has failed' and 'has timed out'", uk: "Scope Try, потім scope Catch, у якого Configure run after = «has failed» і «has timed out»" } },
            { id: "b", text: { en: "Wrap the flow in a C# try/catch block", uk: "Обгорнути потік у блок try/catch на C#" } },
            { id: "c", text: { en: "Flows cannot handle errors; they always stop", uk: "Потоки не вміють обробляти помилки; вони завжди зупиняються" } },
          ],
          correct: ["a"],
        },
        {
          id: "flow-facts",
          mode: "multi",
          prompt: {
            en: "Which statements about cloud flows on Dataverse are true?",
            uk: "Які твердження про хмарні потоки на Dataverse правильні?",
          },
          options: [
            { id: "a", text: { en: "Environment variables keep settings such as URLs out of the flow definition", uk: "Змінні середовища тримають налаштування, як-от URL, поза визначенням потоку" } },
            { id: "b", text: { en: "Dataverse actions in a flow count against the request limits of the connection's user", uk: "Дії Dataverse у потоці враховуються в ліміти запитів користувача з'єднання" } },
            { id: "c", text: { en: "Apply to each runs its iterations in parallel by default, so order is not guaranteed", uk: "Apply to each за замовчуванням виконує ітерації паралельно, тож порядок не гарантовано" } },
            { id: "d", text: { en: "List rows returns every matching row without paging settings", uk: "List rows повертає всі відповідні рядки без налаштувань пагінації" } },
          ],
          correct: ["a", "b"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "flow-trigger",
      title: { en: "Practice: Which flows start?", uk: "Практика «Які потоки запустяться?»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES(STARTER), MAIN, USINGS),
      solution: PROGRAM_WITH(TYPES(SOLUTION), MAIN, USINGS),
      expectedOutput: "Anna adds a contact: Welcome email\nChen changes an account's phone: -\nChen creates an account: Credit check\nAnna wins her deal: My won deals, Sales digest\nChen wins his deal: -\nAnna renames a deal: Sales digest\nAnna loses a deal: Sales digest\nBohdan deletes a deal: Sales digest, Archive copy\nChen deletes a deal: Archive copy\n",
      maxScore: 4,
    },
  ],
};
