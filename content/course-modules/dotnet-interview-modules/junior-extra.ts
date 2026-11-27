import { PROGRAM_WITH } from "../csharp-code";
import { WRITE_QUERY } from "../databases-data";
import { question } from "../frontend-interview-modules/quiz";
import type { SlideDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";

const stub = "        throw new NotImplementedException();";

/* ---------- junior-general ---------- */

const routerTypes = (handle: string) => `class Route
{
    public string Method, Template;
    public Func<Dictionary<string, string>, string> Handler;
}

class Router
{
    private readonly List<Route> routes = new List<Route>();

    public void Map(string method, string template, Func<Dictionary<string, string>, string> handler)
    {
        routes.Add(new Route { Method = method, Template = template, Handler = handler });
    }

    // Matches the path against each template segment by segment (empty segments are ignored, so "/orders/" == "/orders").
    // "{name}" matches any one segment and captures it under "name".
    //   a template matches and the method matches  -> "200 " + handler(captured values)
    //   templates match the path but none for this method -> "405 Method Not Allowed"
    //   no template matches the path              -> "404 Not Found"
    public string Handle(string method, string path)
    {
${handle}
    }
}`;

const routerMain = `        var router = new Router();
        router.Map("GET", "/orders", p => "all orders");
        router.Map("GET", "/orders/{id}", p => "order " + p["id"]);
        router.Map("DELETE", "/orders/{id}", p => "deleted " + p["id"]);
        router.Map("GET", "/customers/{cid}/orders/{oid}", p => "order " + p["oid"] + " of customer " + p["cid"]);

        var requests = new[]
        {
            "GET /orders", "GET /orders/42", "DELETE /orders/42", "POST /orders/42",
            "GET /customers/7/orders/9", "GET /products", "GET /orders/42/items", "GET /orders/",
        };
        foreach (var r in requests)
        {
            var parts = r.Split(' ');
            Console.WriteLine(r + " -> " + router.Handle(parts[0], parts[1]));
        }`;

export const restRouterPractice = practice("rest-router", "A tiny REST router: 200, 404 and 405", "Маленький REST-маршрутизатор: 200, 404 і 405", {
  starter: PROGRAM_WITH(routerTypes(stub), routerMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    routerTypes(`        string[] segments = path.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
        bool pathMatched = false;
        foreach (var route in routes)
        {
            var values = Match(route.Template, segments);
            if (values == null) continue;
            pathMatched = true;
            if (route.Method == method) return "200 " + route.Handler(values);
        }
        return pathMatched ? "405 Method Not Allowed" : "404 Not Found";
    }

    static Dictionary<string, string> Match(string template, string[] segments)
    {
        string[] parts = template.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != segments.Length) return null;
        var values = new Dictionary<string, string>();
        for (int i = 0; i < parts.Length; i++)
        {
            if (parts[i].StartsWith("{") && parts[i].EndsWith("}")) values[parts[i].Substring(1, parts[i].Length - 2)] = segments[i];
            else if (parts[i] != segments[i]) return null;
        }
        return values;`),
    routerMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "GET /orders -> 200 all orders\nGET /orders/42 -> 200 order 42\nDELETE /orders/42 -> 200 deleted 42\nPOST /orders/42 -> 405 Method Not Allowed\nGET /customers/7/orders/9 -> 200 order 9 of customer 7\nGET /products -> 404 Not Found\nGET /orders/42/items -> 404 Not Found\nGET /orders/ -> 200 all orders\n",
});

export const juniorGeneralExtras: SlideDef[] = [
  lecture("junior-general-followups", "Follow-up questions on the general topics", "Уточнювальні питання до загальних тем"),
  quiz("junior-general-quiz-3", "General questions, part 3", "Загальні питання, частина 3", [
    question(
      "oop-vs-procedural",
      ["What is the main idea OOP adds compared to procedural code?", "Яку головну ідею додає ООП порівняно з процедурним кодом?"],
      [
        ["Data and the behaviour that works on it are bundled into objects that hide their state", "Дані та поведінка, що з ними працює, об'єднані в об'єкти, які ховають свій стан"],
        ["Programs run faster", "Програми працюють швидше"],
        ["No functions are allowed", "Функції заборонені"],
        ["Everything must be static", "Усе має бути статичним"],
      ],
      "a",
    ),
    question(
      "recursion-vs-loop",
      ["When is a loop better than recursion in C#?", "Коли цикл кращий за рекурсію в C#?"],
      [
        ["When the depth can be large (thousands of levels): each call uses stack space and there's no guaranteed tail-call optimization", "Коли глибина може бути великою (тисячі рівнів): кожен виклик займає стек, а оптимізація хвостових викликів не гарантована"],
        ["Never; recursion is always faster", "Ніколи; рекурсія завжди швидша"],
        ["Only for strings", "Лише для рядків"],
        ["When the method is public", "Коли метод публічний"],
      ],
      "a",
    ),
    question(
      "statelessness",
      ["\"REST is stateless\" means…", "«REST не має стану» означає…"],
      [
        ["Each request carries everything the server needs (e.g. a token); the server keeps no client session between requests", "Кожен запит несе все потрібне серверу (наприклад, токен); сервер не тримає сесію клієнта між запитами"],
        ["The database has no data", "У базі немає даних"],
        ["Responses can't contain state", "Відповіді не можуть містити стан"],
        ["Cookies are forbidden", "Cookies заборонені"],
      ],
      "a",
    ),
    question(
      "status-codes",
      ["Match the situation: the resource doesn't exist; the method isn't supported for this URL; the client must log in.", "Зіставте: ресурсу не існує; метод не підтримується для цього URL; клієнт мусить увійти."],
      [
        ["404, 405, 401", "404, 405, 401"],
        ["400, 404, 403", "400, 404, 403"],
        ["500, 501, 302", "500, 501, 302"],
        ["404, 400, 403", "404, 400, 403"],
      ],
      "a",
    ),
    question(
      "compose",
      ["What does `docker compose up` do?", "Що робить `docker compose up`?"],
      [
        ["Starts several containers defined in compose.yaml (e.g. API + database + cache) with their network and volumes", "Запускає кілька контейнерів, описаних у compose.yaml (наприклад, API + база + кеш), з їхньою мережею й томами"],
        ["Builds a NuGet package", "Збирає пакет NuGet"],
        ["Deploys to Azure", "Розгортає в Azure"],
        ["Updates Docker itself", "Оновлює сам Docker"],
      ],
      "a",
    ),
    question(
      "volumes",
      ["Why does a PostgreSQL container need a volume?", "Навіщо контейнеру PostgreSQL том (volume)?"],
      [
        ["The container's writable layer is deleted with the container; a volume keeps the data", "Шар запису контейнера видаляється разом із контейнером; том зберігає дані"],
        ["To make it faster", "Щоб він був швидшим"],
        ["Volumes are required for networking", "Томи потрібні для мережі"],
        ["It doesn't", "Не потрібен"],
      ],
      "a",
    ),
    question(
      "test-double",
      ["Which test double returns canned answers and has no verification logic?", "Яка тестова заміна повертає заготовлені відповіді й не має логіки перевірки?"],
      [
        ["A stub", "Стаб (stub)"],
        ["A mock", "Мок (mock)"],
        ["A spy", "Шпигун (spy)"],
        ["A production service", "Продакшн-сервіс"],
      ],
      "a",
    ),
    question(
      "singleton-gof",
      ["Which GoF pattern does `HttpClientFactory` / `IHttpClientFactory.CreateClient()` illustrate?", "Який патерн GoF ілюструє `IHttpClientFactory.CreateClient()`?"],
      [
        ["Factory (Method)", "Factory (Method)"],
        ["Observer", "Observer"],
        ["Visitor", "Visitor"],
        ["Memento", "Memento"],
      ],
      "a",
    ),
  ]),
  restRouterPractice,
];

/* ---------- junior-platform ---------- */

export const juniorPlatformExtras: SlideDef[] = [
  lecture("junior-predict-output", "Predict the output: exceptions, delegates and LINQ", "Передбачте вивід: винятки, делегати та LINQ"),
  quiz("junior-platform-quiz-3", "Predict the output", "Передбачте вивід", [
    question(
      "finally-print",
      ["`try { Console.Write(\"A\"); throw new Exception(); } catch { Console.Write(\"B\"); } finally { Console.Write(\"C\"); } Console.Write(\"D\");` prints…", "`try { Console.Write(\"A\"); throw new Exception(); } catch { Console.Write(\"B\"); } finally { Console.Write(\"C\"); } Console.Write(\"D\");` друкує…"],
      [
        ["ABCD", "ABCD"],
        ["ACD", "ACD"],
        ["ABD", "ABD"],
        ["AB", "AB"],
      ],
      "a",
    ),
    question(
      "rethrow-finally",
      ["`try { throw new Exception(\"x\"); } catch { Console.Write(\"C\"); throw; } finally { Console.Write(\"F\"); }` inside a method whose caller catches. What does this method print?", "`try { throw new Exception(\"x\"); } catch { Console.Write(\"C\"); throw; } finally { Console.Write(\"F\"); }` у методі, викликач якого перехоплює виняток. Що надрукує цей метод?"],
      [
        ["CF", "CF"],
        ["C", "C"],
        ["F", "F"],
        ["Nothing", "Нічого"],
      ],
      "a",
    ),
    question(
      "multicast-result",
      ["`Func<int> f = () => 1; f += () => 2; Console.Write(f());` prints…", "`Func<int> f = () => 1; f += () => 2; Console.Write(f());` друкує…"],
      [
        ["1", "1"],
        ["2 — both run, the last result is returned", "2 — виконуються обидва, повертається останній результат"],
        ["3", "3"],
        ["Compile error", "Помилка компіляції"],
      ],
      "b",
    ),
    question(
      "deferred-print",
      ["`var list = new List<int> { 1, 2 }; var q = list.Select(x => x * 10); list.Add(3); Console.Write(string.Join(\",\", q));` prints…", "`var list = new List<int> { 1, 2 }; var q = list.Select(x => x * 10); list.Add(3); Console.Write(string.Join(\",\", q));` друкує…"],
      [
        ["10,20", "10,20"],
        ["10,20,30", "10,20,30"],
        ["1,2,3", "1,2,3"],
        ["Nothing", "Нічого"],
      ],
      "b",
    ),
    question(
      "first-empty",
      ["`new List<int>().First()` …", "`new List<int>().First()` …"],
      [
        ["returns 0", "повертає 0"],
        ["throws InvalidOperationException; `FirstOrDefault()` would return 0", "кидає InvalidOperationException; `FirstOrDefault()` повернув би 0"],
        ["returns null", "повертає null"],
        ["doesn't compile", "не компілюється"],
      ],
      "b",
    ),
    question(
      "single-many",
      ["`new[] { 1, 2, 2 }.Single(x => x == 2)` …", "`new[] { 1, 2, 2 }.Single(x => x == 2)` …"],
      [
        ["returns 2", "повертає 2"],
        ["throws InvalidOperationException: more than one element matches", "кидає InvalidOperationException: збігається більше одного елемента"],
        ["returns the first 2", "повертає першу 2"],
        ["returns null", "повертає null"],
      ],
      "b",
    ),
    question(
      "closure-print",
      ["`int x = 1; Action a = () => Console.Write(x); x = 5; a();` prints…", "`int x = 1; Action a = () => Console.Write(x); x = 5; a();` друкує…"],
      [
        ["1", "1"],
        ["5 — the lambda captures the variable, not its value at creation", "5 — лямбда захоплює змінну, а не її значення на момент створення"],
        ["0", "0"],
        ["Compile error", "Помилка компіляції"],
      ],
      "b",
    ),
    question(
      "groupby-count",
      ["`new[] { \"a\", \"bb\", \"cc\", \"d\" }.GroupBy(s => s.Length).Count()` is…", "`new[] { \"a\", \"bb\", \"cc\", \"d\" }.GroupBy(s => s.Length).Count()` дорівнює…"],
      [
        ["4", "4"],
        ["2", "2"],
        ["1", "1"],
        ["3", "3"],
      ],
      "b",
    ),
  ]),
];

/* ---------- junior-types ---------- */

const repoTypes = (save: string, find: string, where: string, del: string, maxBy: string) => `interface IEntity { int Id { get; set; } }

class Product : IEntity
{
    public int Id { get; set; }
    public string Name;
    public decimal Price;
    public override string ToString() { return "#" + Id + " " + Name + " " + Price.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture); }
}

class Customer : IEntity
{
    public int Id { get; set; }
    public string Email;
    public override string ToString() { return "#" + Id + " " + Email; }
}

class InMemoryRepository<T> where T : class, IEntity
{
    private readonly Dictionary<int, T> items = new Dictionary<int, T>();
    private int nextId = 1;

    // Id 0: assign the next id (1, 2, 3, …), store and return the entity.
    // An Id that is stored: replace the stored entity. Any other Id: throw KeyNotFoundException.
    public T Save(T entity)
    {
${save}
    }

    // null when there is no such id.
    public T Find(int id)
    {
${find}
    }

    // The matching entities ordered by Id.
    public IReadOnlyList<T> Where(Func<T, bool> predicate)
    {
${where}
    }

    public bool Delete(int id)
    {
${del}
    }
}

static class Seq
{
    // The element with the largest key; InvalidOperationException for an empty sequence.
    public static T MaxBy<T, TKey>(IEnumerable<T> items, Func<T, TKey> key) where TKey : IComparable<TKey>
    {
${maxBy}
    }
}`;

const repoMain = `        var products = new InMemoryRepository<Product>();
        products.Save(new Product { Name = "Keyboard", Price = 49.9m });
        products.Save(new Product { Name = "Mouse", Price = 19.9m });
        products.Save(new Product { Name = "Monitor", Price = 289m });
        products.Save(new Product { Id = 2, Name = "Mouse Pro", Price = 29.9m });
        try { products.Save(new Product { Id = 99, Name = "Ghost" }); }
        catch (KeyNotFoundException) { Console.WriteLine("no product 99"); }
        Console.WriteLine(products.Find(2));
        Console.WriteLine(products.Find(7) == null ? "7 not found" : "7 found");
        Console.WriteLine(string.Join("; ", products.Where(p => p.Price < 100)));
        Console.WriteLine(products.Delete(1) + " " + products.Delete(1));
        Console.WriteLine(Seq.MaxBy(products.Where(p => true), p => p.Price));

        var customers = new InMemoryRepository<Customer>();
        customers.Save(new Customer { Email = "ann@shop.ua" });
        customers.Save(new Customer { Email = "bob@shop.ua" });
        Console.WriteLine(string.Join("; ", customers.Where(c => c.Email.StartsWith("b"))));
        Console.WriteLine(Seq.MaxBy(new[] { "pear", "banana", "fig" }, s => s.Length));
        try { Seq.MaxBy(new int[0], x => x); }
        catch (InvalidOperationException) { Console.WriteLine("empty"); }`;

export const genericRepositoryPractice = practice("generic-repository", "Generics with constraints: a repository and MaxBy", "Generics з обмеженнями: репозиторій і MaxBy", {
  starter: PROGRAM_WITH(repoTypes(stub, stub, stub, stub, stub), repoMain, "using System.Collections.Generic;\nusing System.Linq;"),
  solution: PROGRAM_WITH(
    repoTypes(
      `        if (entity.Id == 0) entity.Id = nextId++;
        else if (!items.ContainsKey(entity.Id)) throw new KeyNotFoundException("No entity " + entity.Id);
        items[entity.Id] = entity;
        return entity;`,
      `        T value;
        return items.TryGetValue(id, out value) ? value : null;`,
      "        return items.Values.Where(predicate).OrderBy(e => e.Id).ToList();",
      "        return items.Remove(id);",
      `        bool any = false;
        T best = default(T);
        TKey bestKey = default(TKey);
        foreach (var item in items)
        {
            TKey k = key(item);
            if (!any || k.CompareTo(bestKey) > 0) { best = item; bestKey = k; any = true; }
        }
        if (!any) throw new InvalidOperationException("Sequence is empty");
        return best;`,
    ),
    repoMain,
    "using System.Collections.Generic;\nusing System.Linq;",
  ),
  expectedOutput:
    "no product 99\n#2 Mouse Pro 29.90\n7 not found\n#1 Keyboard 49.90; #2 Mouse Pro 29.90\nTrue False\n#3 Monitor 289.00\n#2 bob@shop.ua\nbanana\nempty\n",
});

export const juniorTypesExtras: SlideDef[] = [
  lecture("junior-value-semantics-traps", "Traps with types: copies, equality, nulls and generics", "Пастки типів: копії, рівність, null і generics"),
  quiz("junior-types-quiz-3", "Types and collections, part 3", "Типи та колекції, частина 3", [
    question(
      "struct-in-method",
      ["`void Move(Point p) { p.X += 1; }` where `Point` is a struct. After `Move(pt)`, `pt.X` is…", "`void Move(Point p) { p.X += 1; }`, де `Point` — структура. Після `Move(pt)` `pt.X`…"],
      [
        ["unchanged — the method got a copy (use `ref` to change the caller's value)", "не змінюється — метод отримав копію (щоб змінити значення викликача, потрібен `ref`)"],
        ["increased by 1", "збільшується на 1"],
        ["0", "0"],
        ["Compile error", "Помилка компіляції"],
      ],
      "a",
    ),
    question(
      "class-equals",
      ["Two `new Person(\"Ann\")` objects of a plain class. `a == b` and `a.Equals(b)` are…", "Два об'єкти `new Person(\"Ann\")` звичайного класу. `a == b` і `a.Equals(b)` дорівнюють…"],
      [
        ["false and false — reference equality by default", "false і false — за замовчуванням рівність посилань"],
        ["true and true", "true і true"],
        ["false and true", "false і true"],
        ["true and false", "true і false"],
      ],
      "a",
    ),
    question(
      "record-equals",
      ["`record Person(string Name);` — `new Person(\"Ann\") == new Person(\"Ann\")` is…", "`record Person(string Name);` — `new Person(\"Ann\") == new Person(\"Ann\")` дорівнює…"],
      [
        ["true — records have value equality", "true — record-и мають рівність за значенням"],
        ["false", "false"],
        ["Compile error", "Помилка компіляції"],
        ["It throws", "Кидає виняток"],
      ],
      "a",
    ),
    question(
      "default-values",
      ["Which defaults are correct?", "Які значення за замовчуванням правильні?"],
      [
        ["`default(int)` is 0", "`default(int)` — 0"],
        ["`default(string)` is null", "`default(string)` — null"],
        ["`default(bool)` is false", "`default(bool)` — false"],
        ["`default(DateTime)` is today", "`default(DateTime)` — сьогоднішня дата"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "constraint-new",
      ["Which constraint lets a generic method write `new T()`?", "Яке обмеження дозволяє в generic-методі писати `new T()`?"],
      [
        ["`where T : new()`", "`where T : new()`"],
        ["`where T : class`", "`where T : class`"],
        ["`where T : struct` only", "Лише `where T : struct`"],
        ["None is needed", "Жодне не потрібне"],
      ],
      "a",
    ),
    question(
      "list-capacity",
      ["`var list = new List<int>(100);` — what is `list.Count`?", "`var list = new List<int>(100);` — чому дорівнює `list.Count`?"],
      [
        ["0 — 100 is the capacity, not the number of items", "0 — 100 це місткість, а не кількість елементів"],
        ["100", "100"],
        ["It throws", "Кидає виняток"],
        ["1", "1"],
      ],
      "a",
    ),
    question(
      "hashset-order",
      ["Can you rely on the enumeration order of a `HashSet<T>`?", "Чи можна покладатися на порядок перебору `HashSet<T>`?"],
      [
        ["No — use `SortedSet<T>` or sort explicitly when order matters", "Ні — коли порядок важливий, використовуйте `SortedSet<T>` або сортуйте явно"],
        ["Yes, it's always insertion order", "Так, завжди порядок вставлення"],
        ["Yes, it's always sorted", "Так, завжди відсортований"],
        ["Only for strings", "Лише для рядків"],
      ],
      "a",
    ),
    question(
      "char-arithmetic",
      ["`char c = 'a'; c++; Console.Write(c);` prints…", "`char c = 'a'; c++; Console.Write(c);` друкує…"],
      [
        ["b", "b"],
        ["98", "98"],
        ["a1", "a1"],
        ["Compile error", "Помилка компіляції"],
      ],
      "a",
    ),
  ]),
  genericRepositoryPractice,
];

/* ---------- junior-classes ---------- */

const parkingTypes = (park: string, leave: string, free: string) => `enum SpotSize { Small, Medium, Large }

abstract class Vehicle
{
    public readonly string Plate;
    protected Vehicle(string plate) { Plate = plate; }
    public abstract SpotSize Size { get; }
    public abstract decimal HourlyRate { get; }
}

class Motorcycle : Vehicle
{
    public Motorcycle(string plate) : base(plate) { }
    public override SpotSize Size { get { return SpotSize.Small; } }
    public override decimal HourlyRate { get { return 10m; } }
}

class Car : Vehicle
{
    public Car(string plate) : base(plate) { }
    public override SpotSize Size { get { return SpotSize.Medium; } }
    public override decimal HourlyRate { get { return 20m; } }
}

class Bus : Vehicle
{
    public Bus(string plate) : base(plate) { }
    public override SpotSize Size { get { return SpotSize.Large; } }
    public override decimal HourlyRate { get { return 50m; } }
}

class Spot
{
    public int Number;
    public SpotSize Size;
    public Vehicle Parked;
    public DateTime ParkedAt;
}

class ParkingLot
{
    private readonly List<Spot> spots = new List<Spot>();

    public ParkingLot(params SpotSize[] sizes)
    {
        for (int i = 0; i < sizes.Length; i++) spots.Add(new Spot { Number = i + 1, Size = sizes[i] });
    }

    // Parks in a free spot that is big enough (spot.Size >= vehicle.Size), choosing the smallest fitting size
    // and, among those, the lowest number. Returns the spot number, or -1 when nothing fits.
    public int Park(Vehicle vehicle, DateTime at)
    {
${park}
    }

    // Frees the vehicle's spot and returns the fee: every started hour costs HourlyRate, at least one hour.
    // Throws KeyNotFoundException for a plate that is not parked.
    public decimal Leave(string plate, DateTime at)
    {
${leave}
    }

    public int FreeSpots(SpotSize size)
    {
${free}
    }
}`;

const parkingMain = `        var lot = new ParkingLot(SpotSize.Small, SpotSize.Small, SpotSize.Medium, SpotSize.Medium, SpotSize.Large);
        var morning = new DateTime(2026, 5, 4, 10, 0, 0);
        Vehicle[] arrivals = { new Motorcycle("M1"), new Car("C1"), new Car("C2"), new Car("C3"), new Bus("B1"), new Motorcycle("M2"), new Motorcycle("M3") };
        foreach (var v in arrivals) Console.WriteLine(v.Plate + " -> " + lot.Park(v, morning));
        Console.WriteLine("free: " + lot.FreeSpots(SpotSize.Small) + " " + lot.FreeSpots(SpotSize.Medium) + " " + lot.FreeSpots(SpotSize.Large));
        Console.WriteLine("C1 pays " + lot.Leave("C1", morning.AddMinutes(150)));
        Console.WriteLine("M1 pays " + lot.Leave("M1", morning.AddMinutes(10)));
        try { lot.Leave("X9", morning); }
        catch (KeyNotFoundException) { Console.WriteLine("X9 is not parked"); }
        Console.WriteLine("C3 pays " + lot.Leave("C3", morning.AddMinutes(60)));
        Console.WriteLine("B1 -> " + lot.Park(new Bus("B1"), morning.AddHours(1)));
        Console.WriteLine("free: " + lot.FreeSpots(SpotSize.Small) + " " + lot.FreeSpots(SpotSize.Medium) + " " + lot.FreeSpots(SpotSize.Large));`;

export const parkingLotPractice = practice("parking-lot", "Object-oriented design: a parking lot", "Об'єктно-орієнтований дизайн: паркінг", {
  starter: PROGRAM_WITH(parkingTypes(stub, stub, stub), parkingMain, "using System.Collections.Generic;\nusing System.Linq;"),
  solution: PROGRAM_WITH(
    parkingTypes(
      `        var spot = spots.Where(s => s.Parked == null && s.Size >= vehicle.Size)
                        .OrderBy(s => s.Size).ThenBy(s => s.Number)
                        .FirstOrDefault();
        if (spot == null) return -1;
        spot.Parked = vehicle;
        spot.ParkedAt = at;
        return spot.Number;`,
      `        var spot = spots.FirstOrDefault(s => s.Parked != null && s.Parked.Plate == plate);
        if (spot == null) throw new KeyNotFoundException(plate);
        int hours = Math.Max(1, (int)Math.Ceiling((at - spot.ParkedAt).TotalHours));
        decimal fee = hours * spot.Parked.HourlyRate;
        spot.Parked = null;
        return fee;`,
      "        return spots.Count(s => s.Size == size && s.Parked == null);",
    ),
    parkingMain,
    "using System.Collections.Generic;\nusing System.Linq;",
  ),
  expectedOutput:
    "M1 -> 1\nC1 -> 3\nC2 -> 4\nC3 -> 5\nB1 -> -1\nM2 -> 2\nM3 -> -1\nfree: 0 0 0\nC1 pays 60\nM1 pays 10\nX9 is not parked\nC3 pays 20\nB1 -> 5\nfree: 1 1 0\n",
});

export const juniorClassesExtras: SlideDef[] = [
  lecture("junior-oop-design", "OOP design interview: modelling a parking lot", "Співбесіда з ООП-дизайну: моделюємо паркінг"),
  quiz("junior-classes-quiz-2", "Classes, structs and interfaces, part 2", "Класи, структури та інтерфейси, частина 2", [
    question(
      "virtual-default",
      ["Are C# methods virtual by default?", "Чи віртуальні методи C# за замовчуванням?"],
      [
        ["No — you must mark them `virtual` (or `abstract`) to allow overriding", "Ні — щоб дозволити перевизначення, їх треба позначити `virtual` (або `abstract`)"],
        ["Yes, like in Java", "Так, як у Java"],
        ["Only public ones", "Лише публічні"],
        ["Only in abstract classes", "Лише в абстрактних класах"],
      ],
      "a",
    ),
    question(
      "base-ctor-order",
      ["`class A { public A() { Console.Write(\"A\"); } } class B : A { public B() { Console.Write(\"B\"); } }` — `new B()` prints…", "`class A { public A() { Console.Write(\"A\"); } } class B : A { public B() { Console.Write(\"B\"); } }` — `new B()` друкує…"],
      [
        ["AB — the base constructor runs first", "AB — спершу виконується базовий конструктор"],
        ["BA", "BA"],
        ["B", "B"],
        ["A", "A"],
      ],
      "a",
    ),
    question(
      "explicit-interface",
      ["What is an explicit interface implementation (`void IDisposable.Dispose()`)?", "Що таке явна реалізація інтерфейсу (`void IDisposable.Dispose()`)?"],
      [
        ["The member is callable only through the interface type; useful to hide it or resolve name clashes between interfaces", "Член доступний лише через тип інтерфейсу; корисно, щоб сховати його чи розв'язати конфлікт імен між інтерфейсами"],
        ["A static implementation", "Статична реалізація"],
        ["A private method nobody can call", "Приватний метод, який ніхто не може викликати"],
        ["A compile error", "Помилка компіляції"],
      ],
      "a",
    ),
    question(
      "sealed-class",
      ["Why mark a class `sealed`?", "Навіщо позначати клас `sealed`?"],
      [
        ["To forbid inheritance when the class isn't designed for it (and allow some JIT devirtualization)", "Щоб заборонити успадкування, коли клас для нього не призначений (і дозволити JIT деякі девіртуалізації)"],
        ["To make it immutable", "Щоб зробити його незмінним"],
        ["To make it static", "Щоб зробити його статичним"],
        ["To hide it from other assemblies", "Щоб сховати його від інших збірок"],
      ],
      "a",
    ),
    question(
      "static-ctor",
      ["When does a static constructor run?", "Коли виконується статичний конструктор?"],
      [
        ["Once, automatically, before the first use of the type (first instance or static member access)", "Один раз, автоматично, перед першим використанням типу (перший екземпляр чи звернення до статичного члена)"],
        ["Every time an instance is created", "Щоразу під час створення екземпляра"],
        ["Only when called explicitly", "Лише коли його явно викликають"],
        ["At program exit", "Під час завершення програми"],
      ],
      "a",
    ),
    question(
      "interface-vs-abstract-choice",
      ["Shapes share a `Name` property and a `Describe()` method that uses `Area()`, which each shape computes differently. Best fit?", "Фігури мають спільну властивість `Name` і метод `Describe()`, що використовує `Area()`, який кожна фігура рахує по-своєму. Що підходить найкраще?"],
      [
        ["An abstract class `Shape` with `Name`, a concrete `Describe()` and an abstract `Area()`", "Абстрактний клас `Shape` з `Name`, конкретним `Describe()` і абстрактним `Area()`"],
        ["A static class", "Статичний клас"],
        ["A struct with inheritance", "Структура з успадкуванням"],
        ["An enum", "Перелік"],
      ],
      "a",
    ),
    question(
      "readonly-reference",
      ["`readonly List<int> items = new();` — can you call `items.Add(1)`?", "`readonly List<int> items = new();` — чи можна викликати `items.Add(1)`?"],
      [
        ["Yes — `readonly` protects the reference, not the object's contents", "Так — `readonly` захищає посилання, а не вміст об'єкта"],
        ["No, the list is frozen", "Ні, список заморожено"],
        ["Only in the constructor", "Лише в конструкторі"],
        ["Compile error", "Помилка компіляції"],
      ],
      "a",
    ),
    question(
      "struct-interface-boxing",
      ["`IComparable c = 5;` — what happens?", "`IComparable c = 5;` — що відбувається?"],
      [
        ["The int is boxed: converting a struct to an interface allocates a box on the heap", "int упаковується: перетворення структури на інтерфейс виділяє «коробку» в купі"],
        ["Nothing special", "Нічого особливого"],
        ["Compile error", "Помилка компіляції"],
        ["The int becomes a class permanently", "int назавжди стає класом"],
      ],
      "a",
    ),
  ]),
  parkingLotPractice,
];

/* ---------- junior-async-db-tests ---------- */

const SCHOOL = `CREATE TABLE students (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE courses (id integer PRIMARY KEY, title text NOT NULL);
CREATE TABLE enrollments (
    student_id integer NOT NULL REFERENCES students (id),
    course_id  integer NOT NULL REFERENCES courses (id),
    grade      integer,
    PRIMARY KEY (student_id, course_id)
);

INSERT INTO students VALUES (1, 'Anna'), (2, 'Bohdan'), (3, 'Daria'), (4, 'Ivan'), (5, 'Oleh');
INSERT INTO courses VALUES (1, 'C# Basics'), (2, 'SQL'), (3, 'Docker'), (4, 'Azure');
INSERT INTO enrollments VALUES
    (1, 1, 90), (1, 2, 85), (2, 1, 70), (3, 1, 95), (3, 2, NULL), (3, 3, 80), (5, 2, 60);
`;

export const enrollmentsSqlPractice: SlideDef = {
  kind: "practice",
  slug: "course-enrollments",
  title: { en: "Practice: Courses, students and missing rows", uk: "Практика «Курси, студенти й відсутні рядки»" },
  language: "sql",
  setup: SCHOOL,
  starter: WRITE_QUERY,
  solution: `SELECT c.title,
       count(e.student_id) AS students,
       round(avg(e.grade), 1) AS avg_grade
FROM courses AS c
LEFT JOIN enrollments AS e ON e.course_id = c.id
GROUP BY c.id, c.title
ORDER BY students DESC, c.title;

SELECT s.name
FROM students AS s
WHERE NOT EXISTS (SELECT 1 FROM enrollments AS e WHERE e.student_id = s.id)
ORDER BY s.name;
`,
  expectedOutput: "   title   | students | avg_grade\n-----------+----------+-----------\n C# Basics |        3 |      85.0\n SQL       |        3 |      72.5\n Docker    |        1 |      80.0\n Azure     |        0 | NULL\n(4 rows)\n\n name\n------\n Ivan\n(1 row)\n",
  maxScore: 3,
};

export const juniorAsyncDbExtras: SlideDef[] = [
  lecture("junior-async-practice", "Async in everyday code: patterns and mistakes", "Async у повсякденному коді: шаблони й помилки"),
  quiz("junior-async-db-tests-quiz-3", "Async, databases and tests, part 3", "Асинхронність, БД і тести, частина 3", [
    question(
      "async-suffix",
      ["What is the naming convention for asynchronous methods in .NET?", "Яка домовленість щодо назв асинхронних методів у .NET?"],
      [
        ["Suffix `Async` and return `Task`/`Task<T>`/`ValueTask`: `GetOrderAsync`", "Суфікс `Async` і тип `Task`/`Task<T>`/`ValueTask`: `GetOrderAsync`"],
        ["Prefix `Async`", "Префікс `Async`"],
        ["No convention", "Жодної домовленості"],
        ["Suffix `Task`", "Суфікс `Task`"],
      ],
      "a",
    ),
    question(
      "task-delay-sleep",
      ["`await Task.Delay(1000)` vs `Thread.Sleep(1000)`?", "`await Task.Delay(1000)` чи `Thread.Sleep(1000)`?"],
      [
        ["Delay frees the thread while waiting; Sleep blocks it", "Delay звільняє потік під час очікування; Sleep блокує його"],
        ["They are identical", "Вони однакові"],
        ["Sleep is asynchronous", "Sleep асинхронний"],
        ["Delay uses more threads", "Delay використовує більше потоків"],
      ],
      "a",
    ),
    question(
      "cancellation",
      ["How does a long async operation support cancellation?", "Як довга асинхронна операція підтримує скасування?"],
      [
        ["It accepts a `CancellationToken`, passes it to inner calls and calls `ThrowIfCancellationRequested()` in loops", "Вона приймає `CancellationToken`, передає його у внутрішні виклики й викликає `ThrowIfCancellationRequested()` у циклах"],
        ["By calling `Thread.Abort()`", "Викликаючи `Thread.Abort()`"],
        ["It can't be cancelled", "Її не можна скасувати"],
        ["By disposing the Task", "Звільнивши Task через Dispose"],
      ],
      "a",
    ),
    question(
      "group-by-where",
      ["Which query returns customers with more than 3 orders?", "Який запит повертає клієнтів із понад 3 замовленнями?"],
      [
        ["`SELECT customer_id FROM orders GROUP BY customer_id HAVING count(*) > 3`", "`SELECT customer_id FROM orders GROUP BY customer_id HAVING count(*) > 3`"],
        ["`SELECT customer_id FROM orders WHERE count(*) > 3`", "`SELECT customer_id FROM orders WHERE count(*) > 3`"],
        ["`SELECT customer_id FROM orders ORDER BY count(*) > 3`", "`SELECT customer_id FROM orders ORDER BY count(*) > 3`"],
        ["`SELECT DISTINCT customer_id FROM orders LIMIT 3`", "`SELECT DISTINCT customer_id FROM orders LIMIT 3`"],
      ],
      "a",
    ),
    question(
      "avg-null",
      ["`avg(grade)` over the values 90, NULL, 80 is…", "`avg(grade)` над значеннями 90, NULL, 80 дорівнює…"],
      [
        ["85 — aggregates skip NULLs", "85 — агрегати пропускають NULL"],
        ["56.7", "56.7"],
        ["NULL", "NULL"],
        ["An error", "Помилка"],
      ],
      "a",
    ),
    question(
      "primary-key",
      ["What does a primary key guarantee?", "Що гарантує первинний ключ?"],
      [
        ["Unique, non-null values that identify each row (and usually an index)", "Унікальні, не-NULL значення, що ідентифікують кожен рядок (і зазвичай індекс)"],
        ["The rows are sorted on screen", "Рядки відсортовані на екрані"],
        ["The column is encrypted", "Колонка зашифрована"],
        ["Faster inserts", "Швидші вставлення"],
      ],
      "a",
    ),
    question(
      "test-naming",
      ["Which test name is most useful when it fails in CI?", "Яка назва тесту найкорисніша, коли він падає в CI?"],
      [
        ["`Withdraw_amount_above_balance_throws_InvalidOperationException`", "`Withdraw_amount_above_balance_throws_InvalidOperationException`"],
        ["`Test1`", "`Test1`"],
        ["`WithdrawTest`", "`WithdrawTest`"],
        ["`ShouldWork`", "`ShouldWork`"],
      ],
      "a",
    ),
    question(
      "theory",
      ["In xUnit, how do you run one test with several inputs?", "Як у xUnit запустити один тест із кількома вхідними даними?"],
      [
        ["`[Theory]` with `[InlineData(...)]` (or `[MemberData]`)", "`[Theory]` з `[InlineData(...)]` (або `[MemberData]`)"],
        ["Copy the test", "Скопіювати тест"],
        ["`[Fact(Repeat = 3)]`", "`[Fact(Repeat = 3)]`"],
        ["A `for` loop with asserts", "Цикл `for` з перевірками"],
      ],
      "a",
    ),
  ]),
  enrollmentsSqlPractice,
];

/* ---------- junior-practical ---------- */

const rleTypes = (encode: string, decode: string) => `static class Rle
{
    // Run-length encoding: "aaabccdddd" -> "a3bc2d4" (a run of one keeps just the character). "" -> "".
    // The input never contains digits.
    public static string Encode(string text)
    {
${encode}
    }

    // The reverse; counts may have several digits ("x12" -> twelve x's).
    // Throws FormatException when the text starts with a digit.
    public static string Decode(string encoded)
    {
${decode}
    }
}`;

const rleMain = `        foreach (var s in new[] { "aaabccdddd", "abc", "", "zzzzzzzzzzzzy" })
            Console.WriteLine("'" + s + "' -> '" + Rle.Encode(s) + "'");
        foreach (var s in new[] { "a3bc2d4", "x12y", "q" })
            Console.WriteLine("'" + s + "' -> '" + Rle.Decode(s) + "'");
        string text = new string('w', 100) + "ab" + new string('b', 9);
        Console.WriteLine(Rle.Encode(text) + " " + (Rle.Decode(Rle.Encode(text)) == text));
        try { Rle.Decode("3a"); }
        catch (FormatException) { Console.WriteLine("FormatException"); }`;

export const rlePractice = practice("rle-compression", "Run-length encoding", "Кодування довжинами серій (RLE)", {
  starter: PROGRAM_WITH(rleTypes(stub, stub), rleMain),
  solution: PROGRAM_WITH(
    rleTypes(
      `        var sb = new System.Text.StringBuilder();
        int i = 0;
        while (i < text.Length)
        {
            int j = i;
            while (j < text.Length && text[j] == text[i]) j++;
            sb.Append(text[i]);
            if (j - i > 1) sb.Append(j - i);
            i = j;
        }
        return sb.ToString();`,
      `        if (encoded.Length > 0 && char.IsDigit(encoded[0])) throw new FormatException("Starts with a count");
        var sb = new System.Text.StringBuilder();
        int i = 0;
        while (i < encoded.Length)
        {
            char c = encoded[i++];
            int count = 0;
            while (i < encoded.Length && char.IsDigit(encoded[i])) count = count * 10 + (encoded[i++] - '0');
            sb.Append(c, count == 0 ? 1 : count);
        }
        return sb.ToString();`,
    ),
    rleMain,
  ),
  expectedOutput:
    "'aaabccdddd' -> 'a3bc2d4'\n'abc' -> 'abc'\n'' -> ''\n'zzzzzzzzzzzzy' -> 'z12y'\n'a3bc2d4' -> 'aaabccdddd'\n'x12y' -> 'xxxxxxxxxxxxy'\n'q' -> 'q'\nw100ab10 True\nFormatException\n",
});

export const juniorPracticalExtras: SlideDef[] = [
  lecture("junior-live-coding", "How to pass a live-coding task", "Як пройти задачу з живого кодування"),
  rlePractice,
];
