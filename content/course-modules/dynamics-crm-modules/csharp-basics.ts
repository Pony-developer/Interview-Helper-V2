import { PROGRAM_WITH } from "../csharp-code";
import { XRM_SDK, XRM_USINGS } from "../dynamics-crm-sdk";
import type { ModuleDef } from "../types";

const WITH_SDK = (types: string) => `${XRM_SDK}

// ===== Your code =====
${types}`;

/* ---------- Practice: describe an account ---------- */

const DESCRIBE_TYPES = (body: string) => `static class Describe
{
    // "Contoso | Kyiv | 500 employees | credit 250000 | contact Olena Koval"
    public static string Account(Entity account)
    {
${body}
    }
}`;

const DESCRIBE_SOLUTION = `        var name = account.GetAttributeValue<string>("name") ?? "(no name)";
        var city = account.GetAttributeValue<string>("address1_city");
        var employees = account.GetAttributeValue<int?>("numberofemployees");
        var credit = account.GetAttributeValue<Money>("creditlimit");
        var contact = account.GetAttributeValue<EntityReference>("primarycontactid");

        return name
            + " | " + (string.IsNullOrEmpty(city) ? "-" : city)
            + " | " + (employees.HasValue ? employees.Value.ToString() : "?") + " employees"
            + " | credit " + (credit == null ? 0m : credit.Value).ToString(System.Globalization.CultureInfo.InvariantCulture)
            + " | contact " + (contact == null ? "none" : contact.Name);`;

const DESCRIBE_MAIN = `        var contoso = new Entity("account");
        contoso["name"] = "Contoso";
        contoso["address1_city"] = "Kyiv";
        contoso["numberofemployees"] = 500;
        contoso["creditlimit"] = new Money(250000m);
        contoso["primarycontactid"] = new EntityReference("contact", new Guid(7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)) { Name = "Olena Koval" };

        var fabrikam = new Entity("account");
        fabrikam["name"] = "Fabrikam";
        fabrikam["numberofemployees"] = null;          // the column is there, but empty
        fabrikam["creditlimit"] = new Money(1500.50m);

        var empty = new Entity("account");             // nothing retrieved at all

        var litware = new Entity("account");
        litware["name"] = "Litware";
        litware["address1_city"] = "";
        litware["numberofemployees"] = 0;

        foreach (var account in new[] { contoso, fabrikam, empty, litware })
            Console.WriteLine(Describe.Account(account));`;

/* ---------- Practice: build an entity for Create ---------- */

const BUILD_TYPES = (body: string) => `static class Contacts
{
    public static Entity NewContact(string firstName, string lastName, string email, Guid accountId)
    {
${body}
    }
}`;

const BUILD_SOLUTION = `        var contact = new Entity("contact");
        contact["firstname"] = firstName.Trim();
        contact["lastname"] = lastName.Trim();

        var hasEmail = !string.IsNullOrWhiteSpace(email);
        if (hasEmail) contact["emailaddress1"] = email.Trim().ToLowerInvariant();
        contact["preferredcontactmethodcode"] = new OptionSetValue(hasEmail ? 2 : 1);   // 2 = Email, 1 = Any
        contact["donotemail"] = !hasEmail;

        if (accountId != Guid.Empty) contact["parentcustomerid"] = new EntityReference("account", accountId);
        return contact;`;

const BUILD_MAIN = `        var contosoId = new Guid(42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

        Console.WriteLine(Contacts.NewContact("Olena", "Koval", " Olena@Contoso.com ", contosoId));
        Console.WriteLine(Contacts.NewContact(" Taras ", "Melnyk", "", contosoId));
        Console.WriteLine(Contacts.NewContact("Petro", "Hnatiuk", null, Guid.Empty));`;

/* ---------- Practice: choice values and labels ---------- */

const CHOICE_TYPES = (body: string) => `class ChoiceOption
{
    public int Value;
    public string Label;

    public ChoiceOption(int value, string label) { Value = value; Label = label; }
}

// The metadata of a choice column: its options with values and labels
class Choice
{
    public string LogicalName;
    public List<ChoiceOption> Options = new List<ChoiceOption>();
}

static class Choices
{
${body}
}`;

const CHOICE_STARTER = `    public static string Label(Choice choice, OptionSetValue value)
    {
        // Write your code here
        return "";
    }

    public static OptionSetValue Parse(Choice choice, string label)
    {
        // Write your code here
        return null;
    }`;

const CHOICE_SOLUTION = `    public static string Label(Choice choice, OptionSetValue value)
    {
        if (value == null) return "(empty)";
        var option = choice.Options.FirstOrDefault(o => o.Value == value.Value);
        return option != null ? option.Label : "Unknown (" + value.Value + ")";
    }

    public static OptionSetValue Parse(Choice choice, string label)
    {
        if (label == null) return null;
        var option = choice.Options.FirstOrDefault(o => string.Equals(o.Label, label.Trim(), StringComparison.OrdinalIgnoreCase));
        return option != null ? new OptionSetValue(option.Value) : null;
    }`;

const CHOICE_MAIN = `        var tier = new Choice { LogicalName = "contoso_tier" };
        tier.Options.Add(new ChoiceOption(100000000, "Bronze"));
        tier.Options.Add(new ChoiceOption(100000001, "Silver"));
        tier.Options.Add(new ChoiceOption(100000002, "Gold"));

        foreach (var value in new[] { null, new OptionSetValue(100000001), new OptionSetValue(100000007) })
            Console.WriteLine("Label(" + (value == null ? "null" : value.ToString()) + ") = " + Choices.Label(tier, value));

        foreach (var label in new[] { "gold", " Silver ", "Platinum", null })
        {
            var parsed = Choices.Parse(tier, label);
            Console.WriteLine("Parse(" + (label == null ? "null" : "\\"" + label + "\\"") + ") = " + (parsed == null ? "not found" : parsed.ToString()));
        }`;

export const csharpBasicsModule: ModuleDef = {
  slug: "crm-csharp-basics",
  title: { en: "C# basics for Dynamics developers", uk: "Основи C# для розробників Dynamics" },
  slides: [
    { kind: "lecture", slug: "csharp-for-plugins", title: { en: "The C# you need for plug-ins", uk: "C#, потрібний для плагінів" } },
    { kind: "lecture", slug: "entity-attributes", title: { en: "Reading and writing Entity columns", uk: "Читання та запис стовпців Entity" } },
    {
      kind: "quiz",
      slug: "csharp-basics-quiz",
      title: { en: "C# basics check", uk: "Перевірка: основи C#" },
      questions: [
        {
          id: "indexer",
          mode: "single",
          prompt: {
            en: "A retrieved account has no 'telephone1' in its Attributes. What does account[\"telephone1\"] do?",
            uk: "Прочитаний акаунт не має 'telephone1' в Attributes. Що робить account[\"telephone1\"]?",
          },
          options: [
            { id: "a", text: { en: "Throws KeyNotFoundException", uk: "Кидає KeyNotFoundException" } },
            { id: "b", text: { en: "Returns null", uk: "Повертає null" } },
            { id: "c", text: { en: "Returns an empty string", uk: "Повертає порожній рядок" } },
          ],
          correct: ["a"],
        },
        {
          id: "get-value",
          mode: "single",
          prompt: {
            en: "What does account.GetAttributeValue<Money>(\"creditlimit\") return when the column is missing?",
            uk: "Що повертає account.GetAttributeValue<Money>(\"creditlimit\"), коли стовпця немає?",
          },
          options: [
            { id: "a", text: { en: "null, so check it before using .Value", uk: "null, тож перевірте його перед .Value" } },
            { id: "b", text: { en: "A Money with value 0", uk: "Money зі значенням 0" } },
            { id: "c", text: { en: "It throws an exception", uk: "Кидає виняток" } },
          ],
          correct: ["a"],
        },
        {
          id: "types",
          mode: "multi",
          prompt: {
            en: "Which .NET types does the SDK use for these Dataverse columns?",
            uk: "Які типи .NET використовує SDK для цих стовпців Dataverse?",
          },
          options: [
            { id: "a", text: { en: "Lookup → EntityReference", uk: "Lookup → EntityReference" } },
            { id: "b", text: { en: "Choice → OptionSetValue", uk: "Choice → OptionSetValue" } },
            { id: "c", text: { en: "Currency → Money", uk: "Currency → Money" } },
            { id: "d", text: { en: "Whole number → string", uk: "Ціле число → string" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "decimal",
          mode: "single",
          prompt: {
            en: "Which C# type should you use for amounts of money in calculations?",
            uk: "Який тип C# використовувати для грошових сум в обчисленнях?",
          },
          options: [
            { id: "a", text: { en: "decimal", uk: "decimal" } },
            { id: "b", text: { en: "double", uk: "double" } },
            { id: "c", text: { en: "float", uk: "float" } },
          ],
          correct: ["a"],
        },
        {
          id: "update-only",
          mode: "single",
          prompt: {
            en: "You need to change only the phone number of an account you know the id of. What do you send to Update?",
            uk: "Треба змінити лише телефон акаунта, id якого ви знаєте. Що передати в Update?",
          },
          options: [
            { id: "a", text: { en: "A new Entity(\"account\", id) with just telephone1 set", uk: "Новий Entity(\"account\", id), де задано лише telephone1" } },
            { id: "b", text: { en: "The whole account retrieved with all columns, with telephone1 changed", uk: "Увесь акаунт, прочитаний з усіма стовпцями, зі зміненим telephone1" } },
            { id: "c", text: { en: "An EntityReference with the new phone in its Name", uk: "EntityReference з новим телефоном у Name" } },
          ],
          correct: ["a"],
        },
        {
          id: "utc",
          mode: "single",
          prompt: {
            en: "In which time zone does the SDK return a User local date and time column?",
            uk: "У якому часовому поясі SDK повертає стовпець дати й часу з поведінкою User local?",
          },
          options: [
            { id: "a", text: { en: "UTC", uk: "UTC" } },
            { id: "b", text: { en: "The server's local time", uk: "Локальний час сервера" } },
            { id: "c", text: { en: "The time zone of the user who created the record", uk: "Часовий пояс користувача, що створив запис" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "describe-entity",
      title: { en: "Practice: Read columns safely", uk: "Практика «Безпечне читання стовпців»" },
      language: "csharp",
      starter: PROGRAM_WITH(WITH_SDK(DESCRIBE_TYPES('        // Write your code here\n        return "";')), DESCRIBE_MAIN, XRM_USINGS),
      solution: PROGRAM_WITH(WITH_SDK(DESCRIBE_TYPES(DESCRIBE_SOLUTION)), DESCRIBE_MAIN, XRM_USINGS),
      expectedOutput: "Contoso | Kyiv | 500 employees | credit 250000 | contact Olena Koval\nFabrikam | - | ? employees | credit 1500.50 | contact none\n(no name) | - | ? employees | credit 0 | contact none\nLitware | - | 0 employees | credit 0 | contact none\n",
      maxScore: 3,
    },
    {
      kind: "practice",
      slug: "build-entity",
      title: { en: "Practice: Build a contact for Create", uk: "Практика «Зібрати контакт для Create»" },
      language: "csharp",
      starter: PROGRAM_WITH(WITH_SDK(BUILD_TYPES('        // Write your code here\n        return new Entity("contact");')), BUILD_MAIN, XRM_USINGS),
      solution: PROGRAM_WITH(WITH_SDK(BUILD_TYPES(BUILD_SOLUTION)), BUILD_MAIN, XRM_USINGS),
      expectedOutput: "contact(00000000) donotemail=False emailaddress1=olena@contoso.com firstname=Olena lastname=Koval parentcustomerid=account(0000002a) preferredcontactmethodcode=2\ncontact(00000000) donotemail=True firstname=Taras lastname=Melnyk parentcustomerid=account(0000002a) preferredcontactmethodcode=1\ncontact(00000000) donotemail=True firstname=Petro lastname=Hnatiuk preferredcontactmethodcode=1\n",
      maxScore: 3,
    },
    {
      kind: "practice",
      slug: "choice-labels",
      title: { en: "Practice: Choice values and labels", uk: "Практика «Значення та мітки choice»" },
      language: "csharp",
      starter: PROGRAM_WITH(WITH_SDK(CHOICE_TYPES(CHOICE_STARTER)), CHOICE_MAIN, XRM_USINGS),
      solution: PROGRAM_WITH(WITH_SDK(CHOICE_TYPES(CHOICE_SOLUTION)), CHOICE_MAIN, XRM_USINGS),
      expectedOutput: "Label(null) = (empty)\nLabel(100000001) = Silver\nLabel(100000007) = Unknown (100000007)\nParse(\"gold\") = 100000002\nParse(\" Silver \") = 100000001\nParse(\"Platinum\") = not found\nParse(null) = not found\n",
      maxScore: 3,
    },
  ],
};
