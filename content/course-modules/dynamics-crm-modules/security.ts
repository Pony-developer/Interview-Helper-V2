import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const USINGS = "using System.Collections.Generic;\nusing System.Linq;";

const TYPES = (canReadBody: string) => `enum Depth { None, User, BusinessUnit, ParentChild, Organization }

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
    // The depth of the Read privilege on account from the user's security role
    public Depth ReadDepth;

    public User(string name, BusinessUnit unit, Depth readDepth) { Name = name; Unit = unit; ReadDepth = readDepth; }
}

class Record
{
    public string Name;
    public User Owner;
    public readonly List<User> SharedWith = new List<User>();

    public Record(string name, User owner) { Name = name; Owner = owner; }
}

static class Security
{
    public static bool CanRead(User user, Record record)
    {
${canReadBody}
    }
}`;

const MAIN = `        var contoso = new BusinessUnit("Contoso", null);
        var sales = new BusinessUnit("Sales", contoso);
        var salesWest = new BusinessUnit("Sales West", sales);
        var service = new BusinessUnit("Service", contoso);

        var anna = new User("Anna", salesWest, Depth.User);
        var bohdan = new User("Bohdan", sales, Depth.BusinessUnit);
        var chen = new User("Chen", sales, Depth.ParentChild);
        var dana = new User("Dana", service, Depth.Organization);
        var eva = new User("Eva", service, Depth.None);
        var ivan = new User("Ivan", salesWest, Depth.User);
        var oleh = new User("Oleh", contoso, Depth.ParentChild);
        var users = new[] { anna, bohdan, chen, dana, eva, ivan, oleh };

        var acme = new Record("Acme", anna);
        var globex = new Record("Globex", ivan);
        globex.SharedWith.Add(anna);
        globex.SharedWith.Add(eva);
        var initech = new Record("Initech", bohdan);
        var umbrella = new Record("Umbrella", dana);
        var records = new[] { acme, globex, initech, umbrella };

        foreach (var user in users)
        {
            var visible = records.Where(r => Security.CanRead(user, r)).Select(r => r.Name).ToList();
            Console.WriteLine(user.Name + " (" + user.ReadDepth + ", " + user.Unit.Name + "): " + (visible.Count == 0 ? "-" : string.Join(", ", visible)));
        }`;

const SOLUTION_BODY = `        if (user.ReadDepth == Depth.None) return false;
        if (record.SharedWith.Contains(user)) return true;
        var ownerUnit = record.Owner.Unit;
        switch (user.ReadDepth)
        {
            case Depth.User:
                return record.Owner == user;
            case Depth.BusinessUnit:
                return ownerUnit == user.Unit;
            case Depth.ParentChild:
                for (var unit = ownerUnit; unit != null; unit = unit.Parent)
                    if (unit == user.Unit) return true;
                return false;
            default:
                return true;
        }`;

export const securityModule: ModuleDef = {
  slug: "crm-security",
  title: { en: "The security model", uk: "Модель безпеки" },
  slides: [
    {
      kind: "lecture",
      slug: "security-model",
      title: { en: "Business units, roles and privilege depth", uk: "Бізнес-підрозділи, ролі та глибина привілеїв" },
    },
    {
      kind: "lecture",
      slug: "teams-sharing-fls",
      title: { en: "Teams, sharing, field and hierarchy security", uk: "Команди, спільний доступ, безпека полів та ієрархії" },
    },
    {
      kind: "quiz",
      slug: "security-quiz",
      title: { en: "Security check", uk: "Перевірка: безпека" },
      questions: [
        {
          id: "depth",
          mode: "single",
          prompt: {
            en: "A manager in the Sales business unit must read accounts owned by anyone in Sales and in its child units, but not in Service. Which Read depth?",
            uk: "Менеджер у підрозділі Sales має читати акаунти всіх у Sales і в дочірніх підрозділах, але не в Service. Яка глибина Read?",
          },
          options: [
            { id: "a", text: { en: "Parent: Child Business Units", uk: "Parent: Child Business Units" } },
            { id: "b", text: { en: "Business Unit", uk: "Business Unit" } },
            { id: "c", text: { en: "Organization", uk: "Organization" } },
          ],
          correct: ["a"],
        },
        {
          id: "append",
          mode: "single",
          prompt: {
            en: "A user wants to set the parent account lookup on a contact. Which privileges are checked?",
            uk: "Користувач хоче заповнити lookup батьківського акаунта в контакті. Які привілеї перевіряються?",
          },
          options: [
            { id: "a", text: { en: "Append on contact and Append To on account (plus Write on the contact)", uk: "Append на contact і Append To на account (а також Write на контакт)" } },
            { id: "b", text: { en: "Only Read on account", uk: "Лише Read на account" } },
            { id: "c", text: { en: "Assign on both tables", uk: "Assign на обидві таблиці" } },
          ],
          correct: ["a"],
        },
        {
          id: "fls",
          mode: "single",
          prompt: {
            en: "Everyone who can read a contact must not see its salary column, except HR. What do you use?",
            uk: "Усі, хто може читати контакт, не повинні бачити стовпець зарплати, крім HR. Що використати?",
          },
          options: [
            { id: "a", text: { en: "Column (field) security with a field security profile for HR", uk: "Безпеку стовпців (полів) із профілем безпеки полів для HR" } },
            { id: "b", text: { en: "Hide the field on the form with JavaScript", uk: "Приховати поле на формі за допомогою JavaScript" } },
            { id: "c", text: { en: "A business rule that clears the field", uk: "Бізнес-правило, яке очищає поле" } },
          ],
          correct: ["a"],
        },
        {
          id: "teams",
          mode: "multi",
          prompt: {
            en: "Which statements about teams are true?",
            uk: "Які твердження про команди правильні?",
          },
          options: [
            { id: "a", text: { en: "An owner team can own records and have security roles", uk: "Команда-власник (owner team) може володіти записами й мати ролі безпеки" } },
            { id: "b", text: { en: "An access team gets access to a record through sharing and has no roles", uk: "Команда доступу (access team) отримує доступ до запису через спільний доступ і не має ролей" } },
            { id: "c", text: { en: "A Microsoft Entra group team keeps its members in sync with the group", uk: "Команда групи Microsoft Entra синхронізує учасників із групою" } },
            { id: "d", text: { en: "A team replaces business units", uk: "Команда замінює бізнес-підрозділи" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "share",
          mode: "single",
          prompt: {
            en: "A record is shared with a user whose role has no Read privilege on that table at all. Can the user read it?",
            uk: "Запис надано в спільний доступ користувачу, роль якого взагалі не має привілею Read на цю таблицю. Чи може він його прочитати?",
          },
          options: [
            { id: "a", text: { en: "No: sharing extends access only for users who have at least User-level privilege", uk: "Ні: спільний доступ розширює доступ лише тим, хто має привілей принаймні рівня User" } },
            { id: "b", text: { en: "Yes: sharing always wins", uk: "Так: спільний доступ завжди має пріоритет" } },
            { id: "c", text: { en: "Only in model-driven apps, not through the API", uk: "Лише в model-driven застосунках, але не через API" } },
          ],
          correct: ["a"],
        },
        {
          id: "impersonate",
          mode: "single",
          prompt: {
            en: "A plug-in must create a record with the privileges of the calling user rather than the system. What do you use?",
            uk: "Плагін має створити запис із привілеями користувача, що викликав операцію, а не системи. Що використати?",
          },
          options: [
            { id: "a", text: { en: "serviceFactory.CreateOrganizationService(context.UserId)", uk: "serviceFactory.CreateOrganizationService(context.UserId)" } },
            { id: "b", text: { en: "serviceFactory.CreateOrganizationService(null)", uk: "serviceFactory.CreateOrganizationService(null)" } },
            { id: "c", text: { en: "A new connection with the user's password", uk: "Нове з'єднання з паролем користувача" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "access-check",
      title: { en: "Practice: Who can read this record?", uk: "Практика «Хто може прочитати цей запис?»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES("        // Write your code here\n        return false;"), MAIN, USINGS),
      solution: PROGRAM_WITH(TYPES(SOLUTION_BODY), MAIN, USINGS),
      expectedOutput: "Anna (User, Sales West): Acme, Globex\nBohdan (BusinessUnit, Sales): Initech\nChen (ParentChild, Sales): Acme, Globex, Initech\nDana (Organization, Service): Acme, Globex, Initech, Umbrella\nEva (None, Service): -\nIvan (User, Sales West): Globex\nOleh (ParentChild, Contoso): Acme, Globex, Initech, Umbrella\n",
      maxScore: 4,
    },
  ],
};
