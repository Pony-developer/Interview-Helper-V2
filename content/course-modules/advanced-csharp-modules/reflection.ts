import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const diTypes = (body: string) => `interface IClock { string Now(); }
class FixedClock : IClock { public string Now() { return "2024-03-05 10:00"; } }

interface IRepository { string Load(int id); }
class MemoryRepository : IRepository
{
    private static int _instances;
    public int Number { get; private set; }
    public MemoryRepository() { Number = ++_instances; }
    public string Load(int id) { return "order#" + id + " (repo " + Number + ")"; }
}

class OrderService
{
    private readonly IRepository _repo;
    private readonly IClock _clock;
    public OrderService(IRepository repo, IClock clock) { _repo = repo; _clock = clock; }
    public string Describe(int id) { return _repo.Load(id) + " at " + _clock.Now(); }
}

class Report
{
    public OrderService Orders { get; private set; }
    public Report(OrderService orders) { Orders = orders; }
}

class Broken { public Broken(IDisposable missing) { } }

// A tiny DI container: Register maps a service type to an implementation type (singleton or transient).
// Resolve creates objects by calling the constructor with the MOST parameters, resolving each parameter recursively.
// Concrete classes that weren't registered can still be resolved (transient). Unknown interfaces throw
// InvalidOperationException("No registration for <type name>").
class Container
{
    private readonly Dictionary<Type, Type> _map = new Dictionary<Type, Type>();
    private readonly HashSet<Type> _singletonTypes = new HashSet<Type>();
    private readonly Dictionary<Type, object> _singletons = new Dictionary<Type, object>();

    public void Register<TService, TImpl>(bool singleton = false) where TImpl : TService
    {
        _map[typeof(TService)] = typeof(TImpl);
        if (singleton) _singletonTypes.Add(typeof(TService));
    }

    public T Resolve<T>() { return (T)Resolve(typeof(T)); }

    public object Resolve(Type type)
    {
${body}
    }
}`;

const diSolution = `        object existing;
        if (_singletons.TryGetValue(type, out existing)) return existing;

        Type impl;
        if (!_map.TryGetValue(type, out impl))
        {
            if (type.IsInterface || type.IsAbstract) throw new InvalidOperationException("No registration for " + type.Name);
            impl = type;
        }

        ConstructorInfo ctor = impl.GetConstructors().OrderByDescending(c => c.GetParameters().Length).First();
        object[] args = ctor.GetParameters().Select(p => Resolve(p.ParameterType)).ToArray();
        object instance = ctor.Invoke(args);

        if (_singletonTypes.Contains(type)) _singletons[type] = instance;
        return instance;`;

const diMain = `        var c = new Container();
        c.Register<IClock, FixedClock>(singleton: true);
        c.Register<IRepository, MemoryRepository>();          // transient

        var report = c.Resolve<Report>();
        Console.WriteLine(report.Orders.Describe(7));
        Console.WriteLine(c.Resolve<OrderService>().Describe(8));
        Console.WriteLine("same clock: " + ReferenceEquals(c.Resolve<IClock>(), c.Resolve<IClock>()));
        Console.WriteLine("same repo: " + ReferenceEquals(c.Resolve<IRepository>(), c.Resolve<IRepository>()));
        try { c.Resolve<Broken>(); }
        catch (InvalidOperationException e) { Console.WriteLine(e.Message); }`;

const pluginTypes = (body: string) => `interface IDiscountRule
{
    decimal Apply(decimal total);
}

[AttributeUsage(AttributeTargets.Class)]
class RuleAttribute : Attribute
{
    public int Order { get; private set; }
    public RuleAttribute(int order) { Order = order; }
}

[Rule(2)] class TenPercentOff : IDiscountRule { public decimal Apply(decimal t) { return t * 0.9m; } }
[Rule(1)] class MinusFive : IDiscountRule { public decimal Apply(decimal t) { return t > 50 ? t - 5 : t; } }
[Rule(3)] class RoundDown : IDiscountRule { public decimal Apply(decimal t) { return Math.Floor(t); } }
class NotARule { }
abstract class BaseRule : IDiscountRule { public abstract decimal Apply(decimal t); }
class Unordered : IDiscountRule { public decimal Apply(decimal t) { return t; } }   // no [Rule]: ignored

static class RuleLoader
{
    // Finds every concrete (non-abstract) class in the assembly that implements IDiscountRule AND has [Rule],
    // creates an instance of each, and returns them sorted by Rule.Order.
    public static List<IDiscountRule> Discover(Assembly assembly)
    {
${body}
    }
}`;

const pluginSolution = `        return assembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && typeof(IDiscountRule).IsAssignableFrom(t))
            .Select(t => new { Type = t, Rule = t.GetCustomAttribute<RuleAttribute>() })
            .Where(x => x.Rule != null)
            .OrderBy(x => x.Rule.Order)
            .Select(x => (IDiscountRule)Activator.CreateInstance(x.Type))
            .ToList();`;

const pluginMain = `        var rules = RuleLoader.Discover(typeof(Program).Assembly);
        Console.WriteLine(string.Join(" -> ", rules.Select(r => r.GetType().Name)));
        decimal total = 120m;
        foreach (var r in rules) { total = r.Apply(total); Console.WriteLine(r.GetType().Name + ": " + total); }

        Type t = typeof(TenPercentOff);
        MethodInfo apply = t.GetMethod("Apply");
        object result = apply.Invoke(Activator.CreateInstance(t), new object[] { 200m });
        Console.WriteLine(apply.ReturnType.Name + " " + result);`;

export const reflectionModule: ModuleDef = {
  slug: "reflection",
  title: { en: "Reflection, code generation and dynamic objects", uk: "Рефлексія, генерація коду та динамічні об'єкти" },
  slides: [
    lecture("reflecting-types", "Reflecting and activating types", "Рефлексія та створення типів"),
    lecture("reflecting-members", "Reflecting and invoking members", "Рефлексія та виклик членів"),
    lecture("reflection-emit", "Dynamic code generation: DynamicMethod and Reflection.Emit", "Динамічна генерація коду: DynamicMethod і Reflection.Emit"),
    lecture("source-generators", "Source generators: compile-time metaprogramming", "Генератори коду: метапрограмування під час компіляції"),
    lecture("dynamic-objects", "The DLR and implementing dynamic objects", "DLR і реалізація динамічних об'єктів"),
    quiz("reflection-quiz", "Reflection, code generation and dynamic objects", "Рефлексія, генерація коду та динамічні об'єкти", [
      question(
        "typeof-gettype",
        ["What is the difference between `typeof(Order)` and `order.GetType()`?", "Чим відрізняються `typeof(Order)` і `order.GetType()`?"],
        [
          ["None", "Нічим"],
          ["`typeof` is evaluated at compile time for a known type; `GetType()` returns the runtime type of an instance, which may be a subclass", "`typeof` обчислюється під час компіляції для відомого типу; `GetType()` повертає тип екземпляра під час виконання, який може бути підкласом"],
          ["`GetType()` works only on structs", "`GetType()` працює лише для структур"],
          ["`typeof` returns a string", "`typeof` повертає рядок"],
        ],
        "b",
      ),
      question(
        "bindingflags",
        ["Why does `type.GetMethods(BindingFlags.NonPublic)` return nothing?", "Чому `type.GetMethods(BindingFlags.NonPublic)` нічого не повертає?"],
        [
          ["Private methods can't be reflected", "Приватні методи не можна досліджувати рефлексією"],
          ["You must also specify `Instance` and/or `Static`; without them no members match", "Треба ще вказати `Instance` і/або `Static`; без них жоден член не підходить"],
          ["The type has no methods", "У типу немає методів"],
          ["You need admin rights", "Потрібні права адміністратора"],
        ],
        "b",
      ),
      question(
        "invoke-speed",
        ["How can you call a method found by reflection many times quickly?", "Як швидко викликати багато разів метод, знайдений рефлексією?"],
        [
          ["Call MethodInfo.Invoke in a loop", "Викликати MethodInfo.Invoke у циклі"],
          ["Use dynamic", "Використати dynamic"],
          ["Create a strongly typed delegate once with `Delegate.CreateDelegate` / `MethodInfo.CreateDelegate` (or compile an expression tree) and call the delegate", "Один раз створити строго типізований делегат через `Delegate.CreateDelegate` / `MethodInfo.CreateDelegate` (або скомпілювати дерево виразів) і викликати делегат"],
          ["Copy the IL manually", "Скопіювати IL вручну"],
        ],
        "c",
      ),
      question(
        "generic-reflection",
        ["How do you get `List<int>`'s Type from `typeof(List<>)` at run time?", "Як під час виконання отримати Type для `List<int>` з `typeof(List<>)`?"],
        [
          ["`typeof(List<>).MakeGenericType(typeof(int))`", "`typeof(List<>).MakeGenericType(typeof(int))`"],
          ["`typeof(List<>) + typeof(int)`", "`typeof(List<>) + typeof(int)`"],
          ["`Type.GetType(\"List<int>\")`", "`Type.GetType(\"List<int>\")`"],
          ["It's impossible", "Це неможливо"],
        ],
        "a",
      ),
      question(
        "emit",
        ["What is `DynamicMethod` / Reflection.Emit used for?", "Для чого використовують `DynamicMethod` / Reflection.Emit?"],
        [
          ["Writing log files", "Запису лог-файлів"],
          ["Generating IL at run time for fast dynamic code: serializers, mappers, proxies, ORMs", "Генерації IL під час виконання для швидкого динамічного коду: серіалізатори, мапери, проксі, ORM"],
          ["Encrypting assemblies", "Шифрування збірок"],
          ["Loading resources", "Завантаження ресурсів"],
        ],
        "b",
      ),
      question(
        "source-gen",
        ["Why are source generators often preferred over runtime reflection today?", "Чому сьогодні генератори коду часто кращі за рефлексію під час виконання?"],
        [
          ["They run faster at compile time", "Вони швидше виконуються під час компіляції"],
          ["The code is generated at compile time: no reflection cost at startup, errors at build time, and it works with trimming and Native AOT", "Код генерується під час компіляції: жодних витрат на рефлексію під час старту, помилки на етапі збирання, і це працює з trimming і Native AOT"],
          ["They can modify existing source code", "Вони можуть змінювати наявний код"],
          ["They don't need the compiler", "Вони не потребують компілятора"],
        ],
        "b",
      ),
      question(
        "expando",
        ["Which are true about dynamic objects?", "Що правда про динамічні об'єкти?"],
        [
          ["`ExpandoObject` lets you add members at run time and implements `IDictionary<string, object>`", "`ExpandoObject` дозволяє додавати члени під час виконання й реалізує `IDictionary<string, object>`"],
          ["Deriving from `DynamicObject` and overriding `TryGetMember`/`TryInvokeMember` customizes dynamic binding", "Наслідування `DynamicObject` з перевизначенням `TryGetMember`/`TryInvokeMember` налаштовує динамічне зв'язування"],
          ["The DLR caches binding decisions per call site", "DLR кешує рішення про зв'язування для кожного місця виклику"],
          ["Dynamic calls are checked by the compiler", "Динамічні виклики перевіряє компілятор"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "private-access",
        ["Is accessing private members via reflection a good idea in production code?", "Чи добра ідея звертатися до приватних членів через рефлексію в продакшн-коді?"],
        [
          ["Yes, always", "Так, завжди"],
          ["It works but is fragile: private members can change in any release, it breaks encapsulation and trimming", "Це працює, але крихко: приватні члени можуть змінитися в будь-якому релізі, це ламає інкапсуляцію й trimming"],
          ["It's impossible", "Це неможливо"],
          ["Only for structs", "Лише для структур"],
        ],
        "b",
      ),
    ]),
    practice("plugin-discovery-practice", "Discover plug-ins by interface and attribute", "Пошук плагінів за інтерфейсом і атрибутом", {
      starter: PROGRAM_WITH(pluginTypes(TODO), pluginMain, "using System.Collections.Generic;\nusing System.Linq;\nusing System.Reflection;"),
      solution: PROGRAM_WITH(pluginTypes(pluginSolution), pluginMain, "using System.Collections.Generic;\nusing System.Linq;\nusing System.Reflection;"),
      expectedOutput:
        "MinusFive -> TenPercentOff -> RoundDown\nMinusFive: 115\nTenPercentOff: 103.5\nRoundDown: 103\nDecimal 180.0\n",
    }),
    practice("di-container-practice", "A tiny DI container with reflection", "Крихітний DI-контейнер на рефлексії", {
      starter: PROGRAM_WITH(diTypes(TODO), diMain, "using System.Collections.Generic;\nusing System.Linq;\nusing System.Reflection;"),
      solution: PROGRAM_WITH(diTypes(diSolution), diMain, "using System.Collections.Generic;\nusing System.Linq;\nusing System.Reflection;"),
      expectedOutput:
        "order#7 (repo 1) at 2024-03-05 10:00\norder#8 (repo 2) at 2024-03-05 10:00\nsame clock: True\nsame repo: False\nNo registration for IDisposable\n",
    }),
  ],
};
