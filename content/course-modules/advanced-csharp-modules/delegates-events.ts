import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

const stockTypes = (body: string) => `class PriceChangedEventArgs : EventArgs
{
    public decimal OldPrice { get; private set; }
    public decimal NewPrice { get; private set; }
    public PriceChangedEventArgs(decimal oldPrice, decimal newPrice) { OldPrice = oldPrice; NewPrice = newPrice; }
}

class Stock
{
    private decimal _price;
    public string Symbol { get; private set; }
    public Stock(string symbol, decimal price) { Symbol = symbol; _price = price; }

    // Raise this event (with 'this' as the sender) whenever the price really changes.
    public event EventHandler<PriceChangedEventArgs> PriceChanged;

    protected virtual void OnPriceChanged(PriceChangedEventArgs e)
    {
${body.split("@@")[0]}
    }

    public decimal Price
    {
        get { return _price; }
        set
        {
${body.split("@@")[1]}
        }
    }
}`;

const stockMain = `        var stock = new Stock("MSFT", 300m);
        var log = new List<string>();

        EventHandler<PriceChangedEventArgs> logger = (sender, e) =>
            log.Add(((Stock)sender).Symbol + ": " + e.OldPrice + " -> " + e.NewPrice);
        EventHandler<PriceChangedEventArgs> alarm = (sender, e) =>
        {
            if (e.NewPrice < e.OldPrice * 0.9m) log.Add("ALARM: drop over 10%");
        };

        stock.Price = 310m;              // nobody listens yet
        stock.PriceChanged += logger;
        stock.PriceChanged += alarm;
        stock.Price = 320m;
        stock.Price = 320m;              // same price: no event
        stock.Price = 280m;
        stock.PriceChanged -= logger;
        stock.Price = 250m;

        foreach (var line in log) Console.WriteLine(line);
        Console.WriteLine("Final: " + stock.Price);`;

const pipelineTypes = (body: string) => `static class Pipeline
{
    // Returns a function that applies every step in order: Compose(f, g, h)(x) == h(g(f(x))).
    // With no steps it returns the input unchanged.
    public static Func<T, T> Compose<T>(params Func<T, T>[] steps)
    {
${body}
    }
}`;

const pipelineMain = `        Func<string, string> trim = s => s.Trim();
        Func<string, string> lower = s => s.ToLowerInvariant();
        Func<string, string> dashes = s => s.Replace(' ', '-');
        var slug = Pipeline.Compose(trim, lower, dashes);
        Console.WriteLine(slug("  Hello Big World "));

        int calls = 0;
        Func<int, int> counted = x => { calls++; return x; };
        var math = Pipeline.Compose<int>(x => x + 1, x => x * 10, counted);
        Console.WriteLine(math(4));
        Console.WriteLine(math(0));
        Console.WriteLine("calls=" + calls);
        Console.WriteLine(Pipeline.Compose<int>()(7));

        // Closures capture variables, not values
        var actions = new List<Func<int>>();
        for (int i = 0; i < 3; i++)
        {
            int copy = i;
            actions.Add(() => copy * copy);
        }
        foreach (var a in actions) Console.Write(a() + " ");
        Console.WriteLine();`;

export const delegatesEventsModule: ModuleDef = {
  slug: "delegates-events",
  title: { en: "Delegates, events and lambdas", uk: "Делегати, події та лямбди" },
  slides: [
    lecture("delegates-deep", "Delegates: methods as values", "Делегати: методи як значення"),
    lecture("func-action-plugins", "Func, Action and delegate compatibility", "Func, Action і сумісність делегатів"),
    lecture("events-deep", "Events and the standard event pattern", "Події та стандартний патерн подій"),
    lecture("lambdas-closures", "Lambda expressions and closures", "Лямбда-вирази та замикання"),
    lecture("anonymous-methods-local-functions", "Anonymous methods, local functions and static lambdas", "Анонімні методи, локальні функції та статичні лямбди"),
    quiz("delegates-events-quiz", "Delegates, events and lambdas", "Делегати, події та лямбди", [
      question(
        "multicast",
        ["A `Func<int>` delegate has three methods combined with `+=`. What does invoking it return?", "Делегат `Func<int>` має три методи, поєднані через `+=`. Що повертає його виклик?"],
        [
          ["The sum of the three results", "Суму трьох результатів"],
          ["An array of the three results", "Масив із трьох результатів"],
          ["All three methods run, and only the last one's result is returned", "Виконуються всі три методи, а повертається лише результат останнього"],
          ["Only the first method runs", "Виконується лише перший метод"],
        ],
        "c",
      ),
      question(
        "immutable",
        ["`d2 = d1; d1 += M;` Does `d2` now include `M`?", "`d2 = d1; d1 += M;` Чи містить тепер `d2` метод `M`?"],
        [
          ["Yes, both variables refer to the same list", "Так, обидві змінні посилаються на той самий список"],
          ["No: delegates are immutable, so `+=` creates a new delegate and assigns it to `d1` only", "Ні: делегати незмінні, тож `+=` створює новий делегат і присвоює його лише `d1`"],
          ["Only if `M` is static", "Лише якщо `M` статичний"],
          ["It throws", "Кидає виняток"],
        ],
        "b",
      ),
      question(
        "event-vs-field",
        ["What does the `event` keyword add on top of a public delegate field?", "Що додає ключове слово `event` порівняно з публічним полем-делегатом?"],
        [
          ["Outside code can only `+=` and `-=`; it can't invoke the event, replace all handlers with `=`, or set it to null", "Зовнішній код може лише `+=` і `-=`; він не може викликати подію, замінити всі обробники через `=` чи обнулити її"],
          ["Thread safety for all handlers", "Потокобезпечність для всіх обробників"],
          ["Asynchronous invocation", "Асинхронний виклик"],
          ["Nothing, it is just documentation", "Нічого, це лише документація"],
        ],
        "a",
      ),
      question(
        "raise",
        ["Why is `PriceChanged?.Invoke(this, e)` the recommended way to raise an event?", "Чому `PriceChanged?.Invoke(this, e)` — рекомендований спосіб викликати подію?"],
        [
          ["It is faster than a normal call", "Це швидше за звичайний виклик"],
          ["It makes handlers run in parallel", "Обробники виконуються паралельно"],
          ["It catches handler exceptions", "Він перехоплює винятки обробників"],
          ["The delegate is read once, so another thread unsubscribing the last handler between the null check and the call can't cause a NullReferenceException", "Делегат читається один раз, тож інший потік, що відписав останній обробник між перевіркою на null і викликом, не спричинить NullReferenceException"],
        ],
        "d",
      ),
      question(
        "closure",
        ["`for (int i = 0; i < 3; i++) list.Add(() => i);` then each lambda is called. What is printed?", "`for (int i = 0; i < 3; i++) list.Add(() => i);`, потім викликається кожна лямбда. Що буде надруковано?"],
        [
          ["0 1 2", "0 1 2"],
          ["3 3 3: all lambdas capture the same variable `i`, which is 3 after the loop", "3 3 3: усі лямбди захоплюють ту саму змінну `i`, яка після циклу дорівнює 3"],
          ["0 0 0", "0 0 0"],
          ["It does not compile", "Не скомпілюється"],
        ],
        "b",
      ),
      question(
        "foreach-capture",
        ["Same thing with `foreach (var x in new[] {0, 1, 2}) list.Add(() => x);` in C# 5+?", "Те саме з `foreach (var x in new[] {0, 1, 2}) list.Add(() => x);` у C# 5+?"],
        [
          ["3 3 3", "3 3 3"],
          ["2 2 2", "2 2 2"],
          ["0 1 2: since C# 5 the `foreach` variable is a fresh variable per iteration", "0 1 2: з C# 5 змінна `foreach` — нова змінна на кожній ітерації"],
          ["It throws", "Кидає виняток"],
        ],
        "c",
      ),
      question(
        "static-lambda",
        ["What does a `static` lambda (C# 9) guarantee?", "Що гарантує `static`-лямбда (C# 9)?"],
        [
          ["It doesn't capture local variables or `this`, so no closure object is allocated", "Вона не захоплює локальні змінні чи `this`, тож об'єкт замикання не створюється"],
          ["It runs on a static thread", "Вона виконується в статичному потоці"],
          ["It can be called only once", "Її можна викликати лише раз"],
          ["It is compiled ahead of time", "Вона компілюється наперед"],
        ],
        "a",
      ),
      question(
        "variance-delegates",
        ["Which are true about delegate compatibility?", "Що правда про сумісність делегатів?"],
        [
          ["A method returning `string` can be assigned to a `Func<object>`", "Метод, що повертає `string`, можна присвоїти `Func<object>`"],
          ["A method taking `object` can be assigned to an `Action<string>`", "Метод, що приймає `object`, можна присвоїти `Action<string>`"],
          ["Two delegate types with identical signatures are interchangeable without conversion", "Два типи делегатів з однаковими сигнатурами взаємозамінні без перетворення"],
          ["Delegates can point to instance methods as well as static ones", "Делегати можуть вказувати як на методи екземпляра, так і на статичні"],
        ],
        ["a", "b", "d"],
      ),
    ]),
    practice("events-practice", "A stock price event", "Подія зміни ціни акції", {
      starter: PROGRAM_WITH(
        stockTypes("        // raise the event here@@            // update the price and raise the event only when it changes\n            _price = value;"),
        stockMain,
        "using System.Collections.Generic;",
      ),
      solution: PROGRAM_WITH(
        stockTypes(`        var handler = PriceChanged;
        if (handler != null) handler(this, e);@@            if (_price == value) return;
            decimal old = _price;
            _price = value;
            OnPriceChanged(new PriceChangedEventArgs(old, value));`),
        stockMain,
        "using System.Collections.Generic;",
      ),
      expectedOutput: "MSFT: 310 -> 320\nMSFT: 320 -> 280\nALARM: drop over 10%\nALARM: drop over 10%\nFinal: 250\n",
    }),
    practice("compose-practice", "Composing functions", "Композиція функцій", {
      starter: PROGRAM_WITH(pipelineTypes("        // Write your code here\n        throw new NotImplementedException();"), pipelineMain, "using System.Collections.Generic;"),
      solution: PROGRAM_WITH(
        pipelineTypes(`        return input =>
        {
            T value = input;
            foreach (var step in steps) value = step(value);
            return value;
        };`),
        pipelineMain,
        "using System.Collections.Generic;",
      ),
      expectedOutput: "hello-big-world\n50\n10\ncalls=2\n7\n0 1 4 \n",
    }),
  ],
};
