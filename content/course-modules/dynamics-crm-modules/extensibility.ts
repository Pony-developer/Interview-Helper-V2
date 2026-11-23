import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const USINGS = "using System.Collections.Generic;";

const TYPES = (sendBody: string) => `class HttpResponse
{
    public int Status;
    // Seconds from the Retry-After header, or null when the server sent none
    public int? RetryAfter;

    public HttpResponse(int status, int? retryAfter = null) { Status = status; RetryAfter = retryAfter; }
}

interface IHttpSender
{
    HttpResponse Send(string request);
}

interface IClock
{
    void Sleep(TimeSpan time);
}

// Answers with the scripted responses, one per call
class ScriptedSender : IHttpSender
{
    readonly Queue<HttpResponse> responses;

    public ScriptedSender(params HttpResponse[] responses) { this.responses = new Queue<HttpResponse>(responses); }

    public HttpResponse Send(string request)
    {
        var response = responses.Dequeue();
        Console.WriteLine("  " + request + " -> " + response.Status + (response.RetryAfter.HasValue ? " (Retry-After: " + response.RetryAfter + ")" : ""));
        return response;
    }
}

class FakeClock : IClock
{
    public TimeSpan Waited = TimeSpan.Zero;

    public void Sleep(TimeSpan time)
    {
        Console.WriteLine("  wait " + time.TotalSeconds + "s");
        Waited += time;
    }
}

// Sends Web API requests and survives service protection limits
class ResilientClient
{
    readonly IHttpSender sender;
    readonly IClock clock;
    readonly int maxRetries;

    public ResilientClient(IHttpSender sender, IClock clock, int maxRetries)
    {
        this.sender = sender;
        this.clock = clock;
        this.maxRetries = maxRetries;
    }

    public HttpResponse Send(string request)
    {
${sendBody}
    }
}`;

const MEMBERS = `    static void Scenario(string title, int maxRetries, params HttpResponse[] responses)
    {
        Console.WriteLine("== " + title);
        var clock = new FakeClock();
        var client = new ResilientClient(new ScriptedSender(responses), clock, maxRetries);
        var result = client.Send("PATCH accounts(1)");
        Console.WriteLine("  result " + result.Status + ", waited " + clock.Waited.TotalSeconds + "s");
    }`;

const MAIN = `        Scenario("Plain success", 3, new HttpResponse(204));
        Scenario("Throttled with Retry-After", 3, new HttpResponse(429, 5), new HttpResponse(429, 3), new HttpResponse(204));
        Scenario("Unavailable without Retry-After", 3, new HttpResponse(503), new HttpResponse(503), new HttpResponse(503), new HttpResponse(204));
        Scenario("Gives up", 2, new HttpResponse(429, 10), new HttpResponse(429, 10), new HttpResponse(429, 10), new HttpResponse(204));
        Scenario("Mixed", 4, new HttpResponse(503), new HttpResponse(429, 7), new HttpResponse(503), new HttpResponse(204));
        Scenario("Bad request is not retried", 3, new HttpResponse(400), new HttpResponse(204));`;

const SOLUTION_BODY = `        for (int retry = 0; ; retry++)
        {
            var response = sender.Send(request);
            bool transient = response.Status == 429 || response.Status == 503;
            if (!transient || retry >= maxRetries) return response;
            int seconds = response.RetryAfter ?? (int)Math.Pow(2, retry);
            clock.Sleep(TimeSpan.FromSeconds(seconds));
        }`;

export const extensibilityModule: ModuleDef = {
  slug: "crm-extensibility",
  title: { en: "Custom APIs and integrations", uk: "Custom API та інтеграції" },
  slides: [
    {
      kind: "lecture",
      slug: "custom-apis",
      title: { en: "Custom APIs, workflow activities and flows", uk: "Custom API, workflow activities і flow" },
    },
    {
      kind: "lecture",
      slug: "integrations",
      title: { en: "Integrations and service protection limits", uk: "Інтеграції та ліміти захисту сервісу" },
    },
    {
      kind: "quiz",
      slug: "extensibility-quiz",
      title: { en: "Custom APIs and integrations check", uk: "Перевірка: Custom API та інтеграції" },
      questions: [
        {
          id: "custom-api",
          mode: "single",
          prompt: {
            en: "A mobile app must call one server operation, \"recalculate the discount for this order\", that checks business rules and returns a number. What do you build?",
            uk: "Мобільний застосунок має викликати одну серверну операцію «перерахувати знижку для замовлення», яка перевіряє бізнес-правила й повертає число. Що ви створите?",
          },
          options: [
            { id: "a", text: { en: "A Custom API with request and response parameters, implemented by a plug-in", uk: "Custom API з параметрами запиту й відповіді, реалізований плагіном" } },
            { id: "b", text: { en: "A hidden column that the app updates to trigger a plug-in", uk: "Прихований стовпець, який застосунок оновлює, щоб запустити плагін" } },
            { id: "c", text: { en: "A JavaScript web resource", uk: "Веб-ресурс на JavaScript" } },
          ],
          correct: ["a"],
        },
        {
          id: "s2s",
          mode: "single",
          prompt: {
            en: "How should a nightly integration service authenticate to Dataverse?",
            uk: "Як нічний інтеграційний сервіс має автентифікуватися в Dataverse?",
          },
          options: [
            { id: "a", text: { en: "As an application user tied to a Microsoft Entra app registration, with a least-privilege security role", uk: "Як application user, прив'язаний до реєстрації застосунку в Microsoft Entra, з мінімально потрібною роллю" } },
            { id: "b", text: { en: "With the username and password of a System Administrator", uk: "Логіном і паролем System Administrator" } },
            { id: "c", text: { en: "Anonymously through the Web API", uk: "Анонімно через Web API" } },
          ],
          correct: ["a"],
        },
        {
          id: "throttle",
          mode: "single",
          prompt: {
            en: "A bulk import starts getting HTTP 429 responses. What should the client do?",
            uk: "Масовий імпорт почав отримувати відповіді HTTP 429. Що має робити клієнт?",
          },
          options: [
            { id: "a", text: { en: "Wait for the time in the Retry-After header, then retry; lower parallelism if it keeps happening", uk: "Зачекати час із заголовка Retry-After і повторити; зменшити паралелізм, якщо це повторюється" } },
            { id: "b", text: { en: "Retry immediately in a tight loop", uk: "Одразу повторювати в щільному циклі" } },
            { id: "c", text: { en: "Open more parallel connections to finish faster", uk: "Відкрити більше паралельних з'єднань, щоб закінчити швидше" } },
          ],
          correct: ["a"],
        },
        {
          id: "async-out",
          mode: "multi",
          prompt: {
            en: "Which are ways to push Dataverse events to an external system without blocking the user's save?",
            uk: "Якими способами можна передавати події Dataverse у зовнішню систему, не блокуючи збереження користувача?",
          },
          options: [
            { id: "a", text: { en: "An asynchronous step on an Azure Service Bus service endpoint", uk: "Асинхронний крок на service endpoint Azure Service Bus" } },
            { id: "b", text: { en: "An asynchronous webhook step", uk: "Асинхронний крок webhook" } },
            { id: "c", text: { en: "A Power Automate flow with a Dataverse trigger", uk: "Flow Power Automate з тригером Dataverse" } },
            { id: "d", text: { en: "A synchronous PreValidation plug-in that calls the system over HTTP", uk: "Синхронний PreValidation-плагін, що викликає систему через HTTP" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "batch",
          mode: "single",
          prompt: {
            en: "You need to create 5,000 records from a console app. Which approach is the most efficient?",
            uk: "Треба створити 5000 записів із консольного застосунку. Який підхід найефективніший?",
          },
          options: [
            { id: "a", text: { en: "Bulk messages such as CreateMultiple (or ExecuteMultiple batches), with a few parallel threads and retry on 429", uk: "Масові повідомлення на кшталт CreateMultiple (або пакети ExecuteMultiple), кілька паралельних потоків і повтор при 429" } },
            { id: "b", text: { en: "5,000 separate Create calls one after another", uk: "5000 окремих викликів Create один за одним" } },
            { id: "c", text: { en: "One transaction with 5,000 records via ExecuteTransaction", uk: "Одна транзакція з 5000 записів через ExecuteTransaction" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "retry-after",
      title: { en: "Practice: Respect Retry-After", uk: "Практика «Поважай Retry-After»" },
      language: "csharp",
      starter: PROGRAM_WITH(TYPES("        // Write your code here\n        return sender.Send(request);"), MAIN, USINGS, MEMBERS),
      solution: PROGRAM_WITH(TYPES(SOLUTION_BODY), MAIN, USINGS, MEMBERS),
      expectedOutput: "== Plain success\n  PATCH accounts(1) -> 204\n  result 204, waited 0s\n== Throttled with Retry-After\n  PATCH accounts(1) -> 429 (Retry-After: 5)\n  wait 5s\n  PATCH accounts(1) -> 429 (Retry-After: 3)\n  wait 3s\n  PATCH accounts(1) -> 204\n  result 204, waited 8s\n== Unavailable without Retry-After\n  PATCH accounts(1) -> 503\n  wait 1s\n  PATCH accounts(1) -> 503\n  wait 2s\n  PATCH accounts(1) -> 503\n  wait 4s\n  PATCH accounts(1) -> 204\n  result 204, waited 7s\n== Gives up\n  PATCH accounts(1) -> 429 (Retry-After: 10)\n  wait 10s\n  PATCH accounts(1) -> 429 (Retry-After: 10)\n  wait 10s\n  PATCH accounts(1) -> 429 (Retry-After: 10)\n  result 429, waited 20s\n== Mixed\n  PATCH accounts(1) -> 503\n  wait 1s\n  PATCH accounts(1) -> 429 (Retry-After: 7)\n  wait 7s\n  PATCH accounts(1) -> 503\n  wait 4s\n  PATCH accounts(1) -> 204\n  result 204, waited 12s\n== Bad request is not retried\n  PATCH accounts(1) -> 400\n  result 400, waited 0s\n",
      maxScore: 5,
    },
  ],
};
