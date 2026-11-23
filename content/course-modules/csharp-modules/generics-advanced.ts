import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const MAX_REPO_TYPES = (registry: string) => `interface INamed
{
    string Name { get; set; }
}

class Cat : INamed
{
    public string Name { get; set; }
    public override string ToString() { return "Cat " + Name; }
}

class Robot : INamed
{
    public string Name { get; set; }
    public override string ToString() { return "Robot " + Name; }
}

${registry}`;

const MAX_REPO_MAIN = `        Console.WriteLine(MaxOf(new[] { 3, 9, 2 }));
        Console.WriteLine(MaxOf(new[] { "kiwi", "apple", "pear" }));
        try
        {
            MaxOf(new int[0]);
        }
        catch (InvalidOperationException e)
        {
            Console.WriteLine(e.Message);
        }

        var cats = new Registry<Cat>();
        Console.WriteLine(cats.Create("Tom"));
        cats.Create("Felix");
        Console.WriteLine(cats.Count);

        var robots = new Registry<Robot>();
        Console.WriteLine(robots.Create("R2"));`;

const VARIANCE_TYPES = (shelter: string, vet: string) => `class Animal
{
    public string Name;
    public Animal(string name) { Name = name; }
    public virtual string Sound { get { return "..."; } }
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }
    public override string Sound { get { return "Woof"; } }
}

class Cat : Animal
{
    public Cat(string name) : base(name) { }
    public override string Sound { get { return "Meow"; } }
}

// Gives out animals of type T
interface ${shelter}
{
    T Adopt();
}

// Takes in animals of type T
interface ${vet}
{
    void Treat(T patient);
}

class DogShelter : IShelter<Dog>
{
    private int count;

    public Dog Adopt()
    {
        count++;
        return new Dog("Rex" + count);
    }
}

class AnimalVet : IVet<Animal>
{
    public void Treat(Animal patient)
    {
        Console.WriteLine("Treating " + patient.Name + ": " + patient.Sound);
    }
}`;

const VARIANCE_MAIN = `        IShelter<Dog> dogs = new DogShelter();
        IVet<Animal> vet = new AnimalVet();

        IVet<Dog> dogVet = vet;                       // a vet for any animal can treat a dog
        dogVet.Treat(dogs.Adopt());

        foreach (Animal animal in AdoptAll(dogs, 2))  // a dog shelter gives out animals
        {
            vet.Treat(animal);
        }
        vet.Treat(new Cat("Tom"));`;

export const genericsAdvancedModule: ModuleDef = {
  slug: "generics-advanced",
  title: { en: "Generics in depth", uk: "Узагальнення поглиблено" },
  slides: [
    { kind: "lecture", slug: "generic-constraints", title: { en: "Constraints", uk: "Обмеження" } },
    { kind: "lecture", slug: "generics-runtime", title: { en: "Generics at run time", uk: "Узагальнення під час виконання" } },
    {
      kind: "quiz",
      slug: "generics-quiz",
      title: { en: "Constraints and generic types", uk: "Обмеження та узагальнені типи" },
      questions: [
        {
          id: "new-constraint",
          mode: "single",
          prompt: { en: "Which constraint lets a generic method write `new T()`?", uk: "Яке обмеження дозволяє узагальненому методу написати `new T()`?" },
          options: [
            { id: "a", text: { en: "`where T : new()`", uk: "`where T : new()`" } },
            { id: "b", text: { en: "`where T : class`", uk: "`where T : class`" } },
            { id: "c", text: { en: "`where T : object`", uk: "`where T : object`" } },
            { id: "d", text: { en: "No constraint is needed", uk: "Обмеження не потрібне" } },
          ],
          correct: ["a"],
        },
        {
          id: "valid-constraints",
          mode: "multi",
          prompt: { en: "Which of these constraints are valid C#?", uk: "Які з цих обмежень є коректним C#?" },
          options: [
            { id: "a", text: { en: "`where T : struct`", uk: "`where T : struct`" } },
            { id: "b", text: { en: "`where T : IDisposable`", uk: "`where T : IDisposable`" } },
            { id: "c", text: { en: "`where T : int`", uk: "`where T : int`" } },
            { id: "d", text: { en: "`where T : class, new()`", uk: "`where T : class, new()`" } },
            { id: "e", text: { en: "`where T : new(), class`", uk: "`where T : new(), class`" } },
          ],
          correct: ["a", "b", "d"],
        },
        {
          id: "static-per-type",
          mode: "single",
          prompt: {
            en: "`class Cache<T> { public static int Hits; }`. The program does `Cache<int>.Hits++` twice and `Cache<string>.Hits++` once. What is `Cache<int>.Hits`?",
            uk: "`class Cache<T> { public static int Hits; }`. Програма двічі виконує `Cache<int>.Hits++` і один раз `Cache<string>.Hits++`. Чому дорівнює `Cache<int>.Hits`?",
          },
          options: [
            { id: "a", text: { en: "2: each closed type has its own static fields", uk: "2: кожен закритий тип має власні статичні поля" } },
            { id: "b", text: { en: "3: all `Cache<T>` share one field", uk: "3: усі `Cache<T>` мають одне спільне поле" } },
            { id: "c", text: { en: "It does not compile", uk: "Це не компілюється" } },
          ],
          correct: ["a"],
        },
        {
          id: "equals-on-t",
          mode: "single",
          prompt: { en: "Why does `a == b` not compile when `a` and `b` are of an unconstrained type `T`?", uk: "Чому `a == b` не компілюється, коли `a` і `b` мають тип `T` без обмежень?" },
          options: [
            { id: "a", text: { en: "The compiler does not know which `==` to call for an arbitrary `T`; use `EqualityComparer<T>.Default.Equals`", uk: "Компілятор не знає, який `==` викликати для довільного `T`; використовуйте `EqualityComparer<T>.Default.Equals`" } },
            { id: "b", text: { en: "Generic values can never be compared", uk: "Узагальнені значення взагалі не можна порівнювати" } },
            { id: "c", text: { en: "`==` works only for strings", uk: "`==` працює лише для рядків" } },
          ],
          correct: ["a"],
        },
        {
          id: "list-int-boxing",
          mode: "single",
          prompt: { en: "Why does `List<int>` not box its numbers, unlike the old `ArrayList`?", uk: "Чому `List<int>`, на відміну від старого `ArrayList`, не пакує свої числа?" },
          options: [
            { id: "a", text: { en: "The runtime compiles a separate version of `List<T>` for each value type, which stores plain `int`s", uk: "Середовище виконання компілює окрему версію `List<T>` для кожного значущого типу, і вона зберігає звичайні `int`" } },
            { id: "b", text: { en: "Generics are erased, and the compiler inserts casts", uk: "Узагальнення стираються, а компілятор вставляє приведення" } },
            { id: "c", text: { en: "`int` is a reference type inside a list", uk: "У списку `int` стає посилальним типом" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "generic-max-repo",
      title: { en: "Practice: Constraints", uk: "Практика «Обмеження»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        MAX_REPO_TYPES(`// Creates and remembers named objects
class Registry<T>
{
    private readonly List<T> items = new List<T>();

    public int Count { get { return items.Count; } }

    // Makes a new T with the given name, remembers it, and returns it
    public T Create(string name)
    {
        // Write your code here
        return default(T);
    }
}`),
        MAX_REPO_MAIN,
        "using System.Collections.Generic;",
        `    // The largest item; throws InvalidOperationException for an empty array
    static T MaxOf<T>(T[] items)
    {
        // Write your code here
        return default(T);
    }`,
      ),
      solution: PROGRAM_WITH(
        MAX_REPO_TYPES(`// Creates and remembers named objects
class Registry<T> where T : INamed, new()
{
    private readonly List<T> items = new List<T>();

    public int Count { get { return items.Count; } }

    // Makes a new T with the given name, remembers it, and returns it
    public T Create(string name)
    {
        T item = new T();
        item.Name = name;
        items.Add(item);
        return item;
    }
}`),
        MAX_REPO_MAIN,
        "using System.Collections.Generic;",
        `    // The largest item; throws InvalidOperationException for an empty array
    static T MaxOf<T>(T[] items) where T : IComparable<T>
    {
        if (items.Length == 0)
        {
            throw new InvalidOperationException("The array is empty");
        }
        T max = items[0];
        for (int i = 1; i < items.Length; i++)
        {
            if (items[i].CompareTo(max) > 0)
            {
                max = items[i];
            }
        }
        return max;
    }`,
      ),
      expectedOutput: "9\npear\nThe array is empty\nCat Tom\n2\nRobot R2\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "variance", title: { en: "Covariance and contravariance", uk: "Коваріантність і контраваріантність" } },
    {
      kind: "practice",
      slug: "variance-practice",
      title: { en: "Practice: Shelter and vet", uk: "Практика «Притулок і ветеринар»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        VARIANCE_TYPES("IShelter<T>", "IVet<T>"),
        VARIANCE_MAIN,
        "using System.Collections.Generic;",
        `    // Adopts count animals from the shelter and returns them in order
    static List<Animal> AdoptAll(IShelter<Animal> shelter, int count)
    {
        // Write your code here
        return new List<Animal>();
    }`,
      ),
      solution: PROGRAM_WITH(
        VARIANCE_TYPES("IShelter<out T>", "IVet<in T>"),
        VARIANCE_MAIN,
        "using System.Collections.Generic;",
        `    // Adopts count animals from the shelter and returns them in order
    static List<Animal> AdoptAll(IShelter<Animal> shelter, int count)
    {
        var result = new List<Animal>();
        for (int i = 0; i < count; i++)
        {
            result.Add(shelter.Adopt());
        }
        return result;
    }`,
      ),
      expectedOutput: "Treating Rex1: Woof\nTreating Rex2: Woof\nTreating Rex3: Woof\nTreating Tom: Meow\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "generic-math", title: { en: "Generic math", uk: "Узагальнена математика" } },
    {
      kind: "quiz",
      slug: "generics-review",
      title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
      questions: [
        {
          id: "list-invariant",
          mode: "single",
          prompt: { en: "Why can a `List<string>` not be assigned to a variable of type `List<object>`?", uk: "Чому `List<string>` не можна присвоїти змінній типу `List<object>`?" },
          options: [
            { id: "a", text: { en: "Through `List<object>` one could `Add(42)` to a list of strings", uk: "Через `List<object>` можна було б зробити `Add(42)` у список рядків" } },
            { id: "b", text: { en: "`string` does not derive from `object`", uk: "`string` не успадковується від `object`" } },
            { id: "c", text: { en: "Lists cannot be assigned at all", uk: "Списки взагалі не можна присвоювати" } },
          ],
          correct: ["a"],
        },
        {
          id: "covariant-legal",
          mode: "multi",
          prompt: { en: "Which assignments compile?", uk: "Які присвоєння компілюються?" },
          options: [
            { id: "a", text: { en: "`IEnumerable<object> x = new List<string>();`", uk: "`IEnumerable<object> x = new List<string>();`" } },
            { id: "b", text: { en: "`Action<string> x = (Action<object>)(o => { });`", uk: "`Action<string> x = (Action<object>)(o => { });`" } },
            { id: "c", text: { en: "`IEnumerable<object> x = new List<int>();`", uk: "`IEnumerable<object> x = new List<int>();`" } },
            { id: "d", text: { en: "`List<object> x = new List<string>();`", uk: "`List<object> x = new List<string>();`" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "out-meaning",
          mode: "single",
          prompt: { en: "What does `out` in `interface IProducer<out T>` promise?", uk: "Що обіцяє `out` в `interface IProducer<out T>`?" },
          options: [
            { id: "a", text: { en: "`T` appears only as a return value, never as a parameter", uk: "`T` трапляється лише як значення, що повертається, і ніколи — як параметр" } },
            { id: "b", text: { en: "The methods use `out` parameters", uk: "Методи використовують `out`-параметри" } },
            { id: "c", text: { en: "`T` must be a value type", uk: "`T` має бути значущим типом" } },
          ],
          correct: ["a"],
        },
        {
          id: "variance-where",
          mode: "single",
          prompt: { en: "Where can `in` and `out` be put on a type parameter?", uk: "Де можна поставити `in` і `out` на параметр типу?" },
          options: [
            { id: "a", text: { en: "Only on interfaces and delegates", uk: "Лише в інтерфейсах і делегатах" } },
            { id: "b", text: { en: "On any class", uk: "У будь-якому класі" } },
            { id: "c", text: { en: "Only on structs", uk: "Лише в структурах" } },
          ],
          correct: ["a"],
        },
        {
          id: "array-covariance",
          mode: "single",
          prompt: { en: "`object[] items = new string[2]; items[0] = 42;` What happens?", uk: "`object[] items = new string[2]; items[0] = 42;` Що станеться?" },
          options: [
            { id: "a", text: { en: "It compiles, and the assignment throws `ArrayTypeMismatchException` at run time", uk: "Це компілюється, а присвоєння кидає `ArrayTypeMismatchException` під час виконання" } },
            { id: "b", text: { en: "A compile error", uk: "Помилка компіляції" } },
            { id: "c", text: { en: "The array silently stores 42", uk: "Масив мовчки зберігає 42" } },
          ],
          correct: ["a"],
        },
        {
          id: "generic-math-why",
          mode: "single",
          prompt: { en: "Why could a generic `Sum<T>` not use `+` before C# 11?", uk: "Чому до C# 11 узагальнений `Sum<T>` не міг використовувати `+`?" },
          options: [
            { id: "a", text: { en: "Operators are static, and constraints could require only instance members", uk: "Оператори статичні, а обмеження могли вимагати лише екземплярних членів" } },
            { id: "b", text: { en: "Numbers are not types", uk: "Числа не є типами" } },
            { id: "c", text: { en: "Generic methods cannot have loops", uk: "Узагальнені методи не можуть мати циклів" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
