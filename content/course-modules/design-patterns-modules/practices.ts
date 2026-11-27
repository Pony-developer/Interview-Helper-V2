import { PROGRAM_WITH } from "../csharp-code";
import type { SlideDef } from "../types";

/**
 * The coding practices of the "Design Patterns" course. Plain C# 7 without NuGet packages, so they run on Wandbox:
 *   npx tsx scripts/verify-course-practice.ts
 */

const COLLECTIONS = "using System.Collections.Generic;";

// ---------- Factory ----------

const factoryTypes = (createBody: string) => `interface INotifier
{
    string Send(string to, string text);
}

class EmailNotifier : INotifier
{
    public string Send(string to, string text) { return "Email to " + to + ": " + text; }
}

class SmsNotifier : INotifier
{
    // SMS are short: long texts are cut to 20 characters
    public string Send(string to, string text)
    {
        return "SMS to " + to + ": " + (text.Length > 20 ? text.Substring(0, 20) + "..." : text);
    }
}

class TeamsNotifier : INotifier
{
    public string Send(string to, string text) { return "Teams message to @" + to + ": " + text; }
}

static class NotifierFactory
{
    public static INotifier Create(string channel)
    {
${createBody}
    }
}`;

const factoryMain = `        var channels = new[] { "email", "SMS", "teams", "fax" };
        foreach (var channel in channels)
        {
            try
            {
                INotifier notifier = NotifierFactory.Create(channel);
                Console.WriteLine(notifier.Send("anna", "Your order #42 has been shipped"));
            }
            catch (ArgumentException e)
            {
                Console.WriteLine("Error: " + e.Message);
            }
        }`;

export const factoryPractice: SlideDef = {
  kind: "practice",
  slug: "factory-practice",
  title: { en: "Practice: A notification factory", uk: "Практика «Фабрика сповіщень»" },
  language: "csharp",
  starter: PROGRAM_WITH(factoryTypes("        // Write your code here\n        throw new NotImplementedException();"), factoryMain),
  solution: PROGRAM_WITH(
    factoryTypes(`        switch (channel.ToLowerInvariant())
        {
            case "email": return new EmailNotifier();
            case "sms": return new SmsNotifier();
            case "teams": return new TeamsNotifier();
            default: throw new ArgumentException("Unknown channel: " + channel);
        }`),
    factoryMain,
  ),
  expectedOutput:
    "Email to anna: Your order #42 has been shipped\nSMS to anna: Your order #42 has b...\nTeams message to @anna: Your order #42 has been shipped\nError: Unknown channel: fax\n",
  maxScore: 3,
};

// ---------- Decorator ----------

const decoratorTypes = (cachingBody: string, loggingBody: string) => `interface IWeather
{
    int GetTemperature(string city);
}

// The "real" service: slow and expensive, so we want to call it as rarely as possible
class WeatherApi : IWeather
{
    public int Calls;

    public int GetTemperature(string city)
    {
        Calls++;
        Console.WriteLine("  [weather api] " + city);
        switch (city)
        {
            case "Kyiv": return 3;
            case "Lviv": return 1;
            default: return 7;
        }
    }
}

class CachingWeather : IWeather
{
    private readonly IWeather inner;
    private readonly Dictionary<string, int> cache = new Dictionary<string, int>();

    public CachingWeather(IWeather inner) { this.inner = inner; }

    public int GetTemperature(string city)
    {
${cachingBody}
    }
}

class LoggingWeather : IWeather
{
    private readonly IWeather inner;

    public LoggingWeather(IWeather inner) { this.inner = inner; }

    public int GetTemperature(string city)
    {
${loggingBody}
    }
}`;

const decoratorMain = `        var api = new WeatherApi();
        IWeather weather = new LoggingWeather(new CachingWeather(api));

        foreach (var city in new[] { "Kyiv", "Lviv", "Kyiv", "Kyiv", "Lviv" })
            weather.GetTemperature(city);

        Console.WriteLine("Weather API calls: " + api.Calls);`;

export const decoratorPractice: SlideDef = {
  kind: "practice",
  slug: "decorator-practice",
  title: { en: "Practice: Caching and logging decorators", uk: "Практика «Декоратори кешу та логування»" },
  language: "csharp",
  starter: PROGRAM_WITH(
    decoratorTypes(
      "        // Write your code here\n        return inner.GetTemperature(city);",
      "        // Write your code here\n        return inner.GetTemperature(city);",
    ),
    decoratorMain,
    COLLECTIONS,
  ),
  solution: PROGRAM_WITH(
    decoratorTypes(
      `        int value;
        if (cache.TryGetValue(city, out value)) return value;
        value = inner.GetTemperature(city);
        cache[city] = value;
        return value;`,
      `        Console.WriteLine("Request: " + city);
        var value = inner.GetTemperature(city);
        Console.WriteLine(city + " = " + value);
        return value;`,
    ),
    decoratorMain,
    COLLECTIONS,
  ),
  expectedOutput:
    "Request: Kyiv\n  [weather api] Kyiv\nKyiv = 3\nRequest: Lviv\n  [weather api] Lviv\nLviv = 1\nRequest: Kyiv\nKyiv = 3\nRequest: Kyiv\nKyiv = 3\nRequest: Lviv\nLviv = 1\nWeather API calls: 2\n",
  maxScore: 4,
};

// ---------- Strategy ----------

const strategyTypes = (postBody: string, courierBody: string) => `interface IShippingStrategy
{
    string Name { get; }
    int Cost(int weightKg);
}

class PickupShipping : IShippingStrategy
{
    public string Name { get { return "Pickup"; } }
    public int Cost(int weightKg) { return 0; }
}

class PostShipping : IShippingStrategy
{
    public string Name { get { return "Post"; } }

    public int Cost(int weightKg)
    {
${postBody}
    }
}

class CourierShipping : IShippingStrategy
{
    public string Name { get { return "Courier"; } }

    public int Cost(int weightKg)
    {
${courierBody}
    }
}

// Checkout doesn't know HOW shipping is calculated: it just asks its strategy
class Checkout
{
    private readonly IShippingStrategy shipping;

    public Checkout(IShippingStrategy shipping) { this.shipping = shipping; }

    public int Total(int itemsSum, int weightKg) { return itemsSum + shipping.Cost(weightKg); }
}`;

const strategyMain = `        var strategies = new IShippingStrategy[] { new PickupShipping(), new PostShipping(), new CourierShipping() };

        foreach (var weight in new[] { 2, 8 })
        {
            Console.WriteLine("Parcel " + weight + " kg:");
            foreach (var strategy in strategies)
            {
                var checkout = new Checkout(strategy);
                Console.WriteLine("  " + strategy.Name + ": " + checkout.Total(1500, weight));
            }
        }`;

export const strategyPractice: SlideDef = {
  kind: "practice",
  slug: "strategy-practice",
  title: { en: "Practice: Shipping strategies", uk: "Практика «Стратегії доставки»" },
  language: "csharp",
  starter: PROGRAM_WITH(
    strategyTypes("        // Write your code here\n        return 0;", "        // Write your code here\n        return 0;"),
    strategyMain,
  ),
  solution: PROGRAM_WITH(
    strategyTypes(
      "        return 60 + 10 * weightKg;",
      "        return weightKg <= 5 ? 120 : 120 + 20 * (weightKg - 5);",
    ),
    strategyMain,
  ),
  expectedOutput: "Parcel 2 kg:\n  Pickup: 1500\n  Post: 1580\n  Courier: 1620\nParcel 8 kg:\n  Pickup: 1500\n  Post: 1640\n  Courier: 1680\n",
  maxScore: 3,
};

// ---------- State ----------

const stateTypes = (paidBody: string) => `abstract class OrderState
{
    public abstract string Name { get; }

    // By default every action is refused: each state overrides only what it allows
    public virtual OrderState Pay() { return Refuse("pay"); }
    public virtual OrderState Ship() { return Refuse("ship"); }
    public virtual OrderState Cancel() { return Refuse("cancel"); }

    protected OrderState Refuse(string action)
    {
        Console.WriteLine("  Cannot " + action + " an order that is " + Name);
        return this;
    }
}

class NewState : OrderState
{
    public override string Name { get { return "New"; } }

    public override OrderState Pay()
    {
        Console.WriteLine("  Payment received");
        return new PaidState();
    }

    public override OrderState Cancel()
    {
        Console.WriteLine("  Order cancelled");
        return new CancelledState();
    }
}

class PaidState : OrderState
{
    public override string Name { get { return "Paid"; } }
${paidBody}
}

class ShippedState : OrderState
{
    public override string Name { get { return "Shipped"; } }
}

class CancelledState : OrderState
{
    public override string Name { get { return "Cancelled"; } }
}

class Order
{
    public OrderState State = new NewState();

    public void Do(string action)
    {
        Console.WriteLine(action + " (" + State.Name + ")");
        switch (action)
        {
            case "pay": State = State.Pay(); break;
            case "ship": State = State.Ship(); break;
            case "cancel": State = State.Cancel(); break;
        }
    }
}`;

const stateMain = `        var first = new Order();
        foreach (var action in new[] { "ship", "pay", "pay", "ship", "cancel" }) first.Do(action);
        Console.WriteLine("First order: " + first.State.Name);

        var second = new Order();
        foreach (var action in new[] { "pay", "cancel", "ship" }) second.Do(action);
        Console.WriteLine("Second order: " + second.State.Name);`;

export const statePractice: SlideDef = {
  kind: "practice",
  slug: "state-practice",
  title: { en: "Practice: An order that changes its state", uk: "Практика «Замовлення, що змінює стан»" },
  language: "csharp",
  starter: PROGRAM_WITH(stateTypes("\n    // Write your code here"), stateMain),
  solution: PROGRAM_WITH(
    stateTypes(`
    public override OrderState Ship()
    {
        Console.WriteLine("  Parcel handed to the courier");
        return new ShippedState();
    }

    public override OrderState Cancel()
    {
        Console.WriteLine("  Money refunded");
        return new CancelledState();
    }`),
    stateMain,
  ),
  expectedOutput:
    "ship (New)\n  Cannot ship an order that is New\npay (New)\n  Payment received\npay (Paid)\n  Cannot pay an order that is Paid\nship (Paid)\n  Parcel handed to the courier\ncancel (Shipped)\n  Cannot cancel an order that is Shipped\nFirst order: Shipped\npay (New)\n  Payment received\ncancel (Paid)\n  Money refunded\nship (Cancelled)\n  Cannot ship an order that is Cancelled\nSecond order: Cancelled\n",
  maxScore: 4,
};

// ---------- Chain of Responsibility ----------

const chainTypes = (handlers: string, buildBody: string) => `class Expense
{
    public string Who;
    public int Amount;
    public bool HasReceipt;

    public Expense(string who, int amount, bool hasReceipt) { Who = who; Amount = amount; HasReceipt = hasReceipt; }
}

abstract class Approver
{
    private Approver next;

    // Returns the handler it was given, so calls can be chained: a.SetNext(b).SetNext(c)
    public Approver SetNext(Approver handler)
    {
        next = handler;
        return handler;
    }

    // "I can't decide, ask the next one". The end of the chain rejects the expense.
    protected string PassOn(Expense expense)
    {
        return next != null ? next.Handle(expense) : "Rejected: nobody can approve " + expense.Amount;
    }

    public abstract string Handle(Expense expense);
}

class ReceiptCheck : Approver
{
    public override string Handle(Expense expense)
    {
        if (!expense.HasReceipt) return "Rejected: no receipt";
        return PassOn(expense);
    }
}

class TeamLead : Approver
{
    public override string Handle(Expense expense)
    {
        if (expense.Amount <= 1000) return "Approved by team lead";
        return PassOn(expense);
    }
}
${handlers}
static class Approval
{
    public static Approver BuildChain()
    {
${buildBody}
    }
}`;

const chainMain = `        var chain = Approval.BuildChain();
        var expenses = new[]
        {
            new Expense("Anna", 300, true),
            new Expense("Bohdan", 5000, true),
            new Expense("Chen", 20000, false),
            new Expense("Dana", 20000, true),
            new Expense("Eva", 90000, true),
        };

        foreach (var expense in expenses)
            Console.WriteLine(expense.Who + ", " + expense.Amount + ": " + chain.Handle(expense));`;

export const chainPractice: SlideDef = {
  kind: "practice",
  slug: "chain-practice",
  title: { en: "Practice: An expense approval chain", uk: "Практика «Ланцюжок погодження витрат»" },
  language: "csharp",
  starter: PROGRAM_WITH(
    chainTypes("\n// Write your code here: the Manager and Director handlers\n", "        // Build the chain here\n        return new ReceiptCheck();"),
    chainMain,
  ),
  solution: PROGRAM_WITH(
    chainTypes(
      `
class Manager : Approver
{
    public override string Handle(Expense expense)
    {
        if (expense.Amount <= 10000) return "Approved by manager";
        return PassOn(expense);
    }
}

class Director : Approver
{
    public override string Handle(Expense expense)
    {
        if (expense.Amount <= 50000) return "Approved by director";
        return PassOn(expense);
    }
}
`,
      `        var first = new ReceiptCheck();
        first.SetNext(new TeamLead()).SetNext(new Manager()).SetNext(new Director());
        return first;`,
    ),
    chainMain,
  ),
  expectedOutput:
    "Anna, 300: Approved by team lead\nBohdan, 5000: Approved by manager\nChen, 20000: Rejected: no receipt\nDana, 20000: Approved by director\nEva, 90000: Rejected: nobody can approve 90000\n",
  maxScore: 4,
};
