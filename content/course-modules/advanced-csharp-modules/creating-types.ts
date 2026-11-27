import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

const shapeTypes = (circle: string, rect: string, square: string) => `abstract class Shape
{
    public string Name { get; }
    protected Shape(string name) { Name = name; }

    public abstract double Area { get; }

    // Not virtual on purpose: every shape describes itself the same way.
    public string Describe() { return Name + " with area " + Area.ToString("0.00"); }

    public override string ToString() { return Describe(); }
}

class Circle : Shape
{
    public double Radius { get; }
${circle}
}

class Rectangle : Shape
{
    public double Width { get; }
    public double Height { get; }
${rect}
}

// A square is a rectangle whose name is "Square".
class Square : Rectangle
{
${square}
}`;

const shapeMain = `        var shapes = new Shape[] { new Circle(1), new Rectangle(2, 3.5), new Square(4) };
        double total = 0;
        foreach (var s in shapes)
        {
            Console.WriteLine(s);
            total += s.Area;
        }
        Console.WriteLine("Total: " + total.ToString("0.00"));
        Rectangle r = new Square(3);
        Console.WriteLine(r.Name + " " + r.Width + "x" + r.Height + " is Rectangle: " + (r is Rectangle));`;

export const creatingTypesModule: ModuleDef = {
  slug: "creating-types",
  title: { en: "Creating types: classes and inheritance", uk: "Створення типів: класи та успадкування" },
  slides: [
    lecture("class-members", "Class members: fields, properties, indexers, constructors", "Члени класу: поля, властивості, індексатори, конструктори"),
    lecture("inheritance-deep", "Inheritance, virtual members and hiding", "Успадкування, віртуальні члени та приховування"),
    lecture("object-boxing", "The object type, boxing and unboxing", "Тип object, пакування та розпакування"),
    lecture("structs-deep", "Structs: readonly, ref structs and when to use them", "Структури: readonly, ref struct і коли їх застосовувати"),
    lecture("access-modifiers", "Access modifiers and encapsulation", "Модифікатори доступу та інкапсуляція"),
    quiz("creating-types-quiz", "Classes and inheritance", "Класи та успадкування", [
      question(
        "readonly-const",
        ["How is a `const` field different from a `static readonly` field?", "Чим поле `const` відрізняється від поля `static readonly`?"],
        [
          ["There is no difference", "Нічим"],
          ["A `const` value is compiled into every place that uses it; a `static readonly` value is read at run time and can be computed", "Значення `const` вкомпільовується в кожне місце використання; значення `static readonly` читається під час виконання і може бути обчислене"],
          ["`const` can be changed in the constructor", "`const` можна змінити в конструкторі"],
          ["`static readonly` works only for strings", "`static readonly` працює лише для рядків"],
        ],
        "b",
      ),
      question(
        "init",
        ["What does an `init` accessor allow?", "Що дозволяє аксесор `init`?"],
        [
          ["Setting the property only in an object initializer or constructor, making it immutable afterwards", "Задати властивість лише в ініціалізаторі об'єкта чи конструкторі, після чого вона незмінна"],
          ["Setting the property at any time", "Задавати властивість будь-коли"],
          ["Lazy initialization on first read", "Ліниву ініціалізацію при першому читанні"],
          ["Initialization from a config file", "Ініціалізацію з файлу конфігурації"],
        ],
        "a",
      ),
      question(
        "new-vs-override",
        ["`Base b = new Derived(); b.M();` M is `virtual` in Base. Which runs if Derived declares `new void M()` instead of `override`?", "`Base b = new Derived(); b.M();` M віртуальний у Base. Що виконається, якщо Derived оголосить `new void M()` замість `override`?"],
        [
          ["Derived.M, always", "Завжди Derived.M"],
          ["A compile error", "Помилка компіляції"],
          ["Base.M, because `new` hides the method instead of overriding it, and the call goes through the Base reference", "Base.M, бо `new` приховує метод, а не перевизначає, а виклик іде через посилання типу Base"],
          ["Both, one after the other", "Обидва, один за одним"],
        ],
        "c",
      ),
      question(
        "ctor-order",
        ["In what order do constructors run when you create a `Derived` object?", "У якому порядку виконуються конструктори під час створення об'єкта `Derived`?"],
        [
          ["Derived first, then Base", "Спершу Derived, потім Base"],
          ["Only the Derived constructor runs", "Виконується лише конструктор Derived"],
          ["In random order", "У випадковому порядку"],
          ["Field initializers of Derived, then the Base constructor, then the Derived constructor body", "Ініціалізатори полів Derived, потім конструктор Base, потім тіло конструктора Derived"],
        ],
        "d",
      ),
      question(
        "boxing",
        ["Which lines cause boxing?", "Які рядки спричиняють пакування (boxing)?"],
        [
          ["`object o = 42;`", "`object o = 42;`"],
          ["`IComparable c = 5;`", "`IComparable c = 5;`"],
          ["`int x = 5; long y = x;`", "`int x = 5; long y = x;`"],
          ["`var list = new ArrayList(); list.Add(3.14);`", "`var list = new ArrayList(); list.Add(3.14);`"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "unbox",
        ["`object o = 42; long l = (long)o;` What happens?", "`object o = 42; long l = (long)o;` Що станеться?"],
        [
          ["`l` becomes 42", "`l` стане 42"],
          ["`InvalidCastException`: unboxing must be to the exact type (`(long)(int)o` works)", "`InvalidCastException`: розпакування можливе лише в точний тип (`(long)(int)o` працює)"],
          ["A compile error", "Помилка компіляції"],
          ["`l` becomes 0", "`l` стане 0"],
        ],
        "b",
      ),
      question(
        "ref-struct",
        ["What is true about a `ref struct` such as `Span<T>`?", "Що правда про `ref struct`, як-от `Span<T>`?"],
        [
          ["It can be stored in a class field", "Його можна зберегти в полі класу"],
          ["It can be boxed", "Його можна запакувати"],
          ["It can live only on the stack: no boxing, no class fields, no use across `await`", "Він може жити лише в стеку: без пакування, без полів класу, без використання через `await`"],
          ["It is a reference type", "Це тип посилання"],
        ],
        "c",
      ),
      question(
        "private-protected",
        ["Who can access a `protected internal` member?", "Хто має доступ до члена `protected internal`?"],
        [
          ["Code in the same assembly OR derived classes in any assembly", "Код у тій самій збірці АБО похідні класи в будь-якій збірці"],
          ["Only derived classes in the same assembly", "Лише похідні класи в тій самій збірці"],
          ["Only the declaring class", "Лише клас, що його оголошує"],
          ["Everyone", "Усі"],
        ],
        "a",
      ),
      question(
        "sealed",
        ["Why mark a class `sealed`?", "Навіщо позначати клас `sealed`?"],
        [
          ["To make it immutable", "Щоб зробити його незмінним"],
          ["To make it thread-safe", "Щоб зробити його потокобезпечним"],
          ["To make its fields private", "Щоб зробити його поля приватними"],
          ["To stop others deriving from it, keeping its behavior predictable; it can also let the JIT devirtualize calls", "Щоб від нього не можна було наслідуватися і його поведінка лишалася передбачуваною; це ще й дозволяє JIT девіртуалізувати виклики"],
        ],
        "d",
      ),
    ]),
    practice("shapes-practice", "A shape hierarchy", "Ієрархія фігур", {
      starter: PROGRAM_WITH(
        shapeTypes(
          "    // constructor and Area\n    public Circle(double radius) : base(\"Circle\") { }\n    public override double Area { get { throw new NotImplementedException(); } }",
          "    // constructors and Area\n    public Rectangle(double width, double height) : base(\"Rectangle\") { }\n    public override double Area { get { throw new NotImplementedException(); } }",
          "    public Square(double side) : base(side, side) { }",
        ),
        shapeMain,
      ),
      solution: PROGRAM_WITH(
        shapeTypes(
          `    public Circle(double radius) : base("Circle") { Radius = radius; }
    public override double Area { get { return Math.PI * Radius * Radius; } }`,
          `    public Rectangle(double width, double height) : this("Rectangle", width, height) { }
    protected Rectangle(string name, double width, double height) : base(name)
    {
        Width = width;
        Height = height;
    }
    public override double Area { get { return Width * Height; } }`,
          `    public Square(double side) : base("Square", side, side) { }`,
        ),
        shapeMain,
      ),
      expectedOutput:
        "Circle with area 3.14\nRectangle with area 7.00\nSquare with area 16.00\nTotal: 26.14\nSquare 3x3 is Rectangle: True\n",
    }),
  ],
};
