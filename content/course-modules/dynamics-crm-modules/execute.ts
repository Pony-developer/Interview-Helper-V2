import { PROGRAM_WITH } from "../csharp-code";
import { XRM_FAKES, XRM_SDK, XRM_USINGS } from "../dynamics-crm-sdk";
import type { ModuleDef } from "../types";

const TYPES = `${XRM_SDK}

${XRM_FAKES}`;

const MEMBERS = (body: string) => `    // Sends the requests in ExecuteMultiple batches of at most batchSize requests
    static void ImportInBatches(IOrganizationService service, List<OrganizationRequest> requests, int batchSize)
    {
${body}
    }`;

const SOLUTION = `        int succeeded = 0, failed = 0;
        for (int start = 0; start < requests.Count; start += batchSize)
        {
            var batch = new ExecuteMultipleRequest
            {
                Requests = new OrganizationRequestCollection(),
                Settings = new ExecuteMultipleSettings { ContinueOnError = true, ReturnResponses = true },
            };
            batch.Requests.AddRange(requests.Skip(start).Take(batchSize));
            Console.WriteLine("Batch " + (start / batchSize + 1) + ": " + batch.Requests.Count + " requests");

            var response = (ExecuteMultipleResponse)service.Execute(batch);
            foreach (var item in response.Responses)
            {
                int index = start + item.RequestIndex;
                if (item.Fault != null)
                {
                    failed++;
                    Console.WriteLine("  #" + index + " FAILED: " + item.Fault.Message);
                    continue;
                }
                succeeded++;
                var created = item.Response as CreateResponse;
                if (created != null)
                    Console.WriteLine("  #" + index + " created " + created.id.ToString().Substring(0, 8));
                else
                    Console.WriteLine("  #" + index + " " + item.Response.ResponseName + " ok");
            }
        }
        Console.WriteLine("Succeeded: " + succeeded + ", failed: " + failed);`;

const MAIN = `        var db = new FakeDatabase();
        var contoso = new Entity("account");
        contoso["name"] = "Contoso";
        Guid contosoId = db.Insert(contoso);
        IOrganizationService service = new FakeServiceFactory(db).CreateOrganizationService(null);

        var requests = new List<OrganizationRequest>();
        var fabrikam = new Entity("account");
        fabrikam["name"] = "Fabrikam";
        requests.Add(new CreateRequest { Target = fabrikam });
        var northwind = new Entity("account");
        northwind["name"] = "Northwind";
        requests.Add(new CreateRequest { Target = northwind });
        var phone = new Entity("account", contosoId);
        phone["telephone1"] = "555-0100";
        requests.Add(new UpdateRequest { Target = phone });
        var missing = new Entity("account", new Guid(99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
        missing["name"] = "Ghost";
        requests.Add(new UpdateRequest { Target = missing });
        var duplicate = new Entity("account", contosoId);
        duplicate["name"] = "Contoso again";
        requests.Add(new CreateRequest { Target = duplicate });
        requests.Add(new DeleteRequest { Target = new EntityReference("account", contosoId) });
        var late = new Entity("account", contosoId);
        late["name"] = "Contoso Ltd";
        requests.Add(new UpdateRequest { Target = late });
        var litware = new Entity("account");
        litware["name"] = "Litware";
        requests.Add(new CreateRequest { Target = litware });

        ImportInBatches(service, requests, 3);

        Console.WriteLine("Service calls: " + db.Calls);
        Console.WriteLine("Accounts: " + string.Join(", ", db.All("account").Select(a => a.GetAttributeValue<string>("name"))));`;

export const executeModule: ModuleDef = {
  slug: "crm-execute",
  title: { en: "Messages with Service.Execute", uk: "Повідомлення через Service.Execute" },
  slides: [
    { kind: "lecture", slug: "execute-intro", title: { en: "Introduction to Service.Execute", uk: "Вступ до Service.Execute" } },
    {
      kind: "lecture",
      slug: "execute-messages",
      title: { en: "Service.Execute for CRUD and advanced messages", uk: "Service.Execute для CRUD і розширених повідомлень" },
    },
    { kind: "lecture", slug: "execute-multiple", title: { en: "Working with ExecuteMultipleRequest", uk: "Робота з ExecuteMultipleRequest" } },
    {
      kind: "quiz",
      slug: "execute-quiz",
      title: { en: "Service.Execute check", uk: "Перевірка: Service.Execute" },
      questions: [
        {
          id: "execute",
          mode: "single",
          prompt: {
            en: "What does service.Create(entity) do under the hood?",
            uk: "Що робить service.Create(entity) «під капотом»?",
          },
          options: [
            { id: "a", text: { en: "It sends a CreateRequest through Execute and returns CreateResponse.id", uk: "Надсилає CreateRequest через Execute і повертає CreateResponse.id" } },
            { id: "b", text: { en: "It writes the row to SQL directly, skipping the pipeline", uk: "Записує рядок просто в SQL, оминаючи конвеєр" } },
            { id: "c", text: { en: "It calls the Web API with HttpClient", uk: "Викликає Web API через HttpClient" } },
          ],
          correct: ["a"],
        },
        {
          id: "custom",
          mode: "single",
          prompt: {
            en: "How do you call a Custom API named contoso_Recalculate that has no generated request class?",
            uk: "Як викликати Custom API contoso_Recalculate, для якого немає згенерованого класу запиту?",
          },
          options: [
            { id: "a", text: { en: "new OrganizationRequest(\"contoso_Recalculate\") with Parameters, then read response.Results", uk: "new OrganizationRequest(\"contoso_Recalculate\") з Parameters, потім читати response.Results" } },
            { id: "b", text: { en: "It cannot be called from the SDK", uk: "Його не можна викликати з SDK" } },
            { id: "c", text: { en: "Only through a classic workflow", uk: "Лише через класичний workflow" } },
          ],
          correct: ["a"],
        },
        {
          id: "em-transaction",
          mode: "single",
          prompt: {
            en: "Request 3 of an ExecuteMultipleRequest fails and ContinueOnError is true. What happens to requests 1 and 2?",
            uk: "Запит 3 в ExecuteMultipleRequest падає, а ContinueOnError = true. Що буде із запитами 1 і 2?",
          },
          options: [
            { id: "a", text: { en: "They stay saved: ExecuteMultiple is not a transaction", uk: "Вони лишаються збереженими: ExecuteMultiple — не транзакція" } },
            { id: "b", text: { en: "They are rolled back", uk: "Вони відкочуються" } },
            { id: "c", text: { en: "They are retried", uk: "Вони повторюються" } },
          ],
          correct: ["a"],
        },
        {
          id: "em-limits",
          mode: "multi",
          prompt: {
            en: "Which statements about ExecuteMultipleRequest are true?",
            uk: "Які твердження про ExecuteMultipleRequest правильні?",
          },
          options: [
            { id: "a", text: { en: "A batch holds at most 1,000 requests", uk: "Пакет містить щонайбільше 1000 запитів" } },
            { id: "b", text: { en: "Each response item has a RequestIndex pointing at the request in the batch", uk: "Кожен елемент відповіді має RequestIndex, що вказує на запит у пакеті" } },
            { id: "c", text: { en: "It should not be used inside plug-ins and workflow activities", uk: "Його не слід використовувати всередині плагінів і workflow activities" } },
            { id: "d", text: { en: "It runs all requests in parallel on the server", uk: "Він виконує всі запити паралельно на сервері" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "atomic",
          mode: "single",
          prompt: {
            en: "An order and its lines must be created all together or not at all. Which request do you use?",
            uk: "Замовлення та його рядки мають створитися всі разом або жоден. Який запит використати?",
          },
          options: [
            { id: "a", text: { en: "ExecuteTransactionRequest", uk: "ExecuteTransactionRequest" } },
            { id: "b", text: { en: "ExecuteMultipleRequest with ContinueOnError = false", uk: "ExecuteMultipleRequest з ContinueOnError = false" } },
            { id: "c", text: { en: "Separate Create calls in a try/catch", uk: "Окремі виклики Create у try/catch" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "execute-multiple-batches",
      title: { en: "Practice: Import in ExecuteMultiple batches", uk: "Практика «Імпорт пакетами ExecuteMultiple»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES, MAIN, XRM_USINGS, MEMBERS("        // Write your code here")),
      solution: PROGRAM_WITH(TYPES, MAIN, XRM_USINGS, MEMBERS(SOLUTION)),
      expectedOutput: "Batch 1: 3 requests\n  #0 created 00000002\n  #1 created 00000003\n  #2 Update ok\nBatch 2: 3 requests\n  #3 FAILED: account With Id = 00000063-0000-0000-0000-000000000000 Does Not Exist\n  #4 FAILED: Cannot insert duplicate key: account 00000001-0000-0000-0000-000000000000\n  #5 Delete ok\nBatch 3: 2 requests\n  #6 FAILED: account With Id = 00000001-0000-0000-0000-000000000000 Does Not Exist\n  #7 created 00000004\nSucceeded: 5, failed: 3\nService calls: 3\nAccounts: Fabrikam, Northwind, Litware\n",
      maxScore: 5,
    },
  ],
};
