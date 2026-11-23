Делегат дозволяє програмі вибирати поведінку **під час виконання**. Поширена форма — таблиця, що зіставляє назву з делегатом, наприклад команди калькулятора:

```csharp
delegate int Operation(int a, int b);

static int Add(int a, int b) { return a + b; }
static int Subtract(int a, int b) { return a - b; }
static int Multiply(int a, int b) { return a * b; }

var commands = new Dictionary<string, Operation>
{
    { "add", Add },
    { "sub", Subtract },
    { "mul", Multiply }
};

string input = "mul";                       // може прийти від користувача
if (commands.ContainsKey(input))
{
    Console.WriteLine(commands[input](6, 7));   // 42
}
```

Немає жодного `if` чи `switch` за назвою команди. Додати нову команду означає додати один рядок до таблиці. Решта програми не змінюється.

## Методи екземплярів теж

Делегат може тримати метод об'єкта, а не лише статичний. Об'єкт запам'ятовується разом з методом:

```csharp
class Counter
{
    private int total;

    public int Add(int x)
    {
        total += x;
        return total;
    }
}

var counter = new Counter();
Operation1 f = counter.Add;              // об'єкт counter запам'ятовується
Console.WriteLine(f(5));                 // 5
Console.WriteLine(f(5));                 // 10: використовується той самий об'єкт
```

Для делегата з одним параметром `int` і результатом `int` ми б написали `delegate int Operation1(int x);`. Делегат запам'ятовує об'єкт, тож кожен виклик працює з тим самим лічильником.

## Де це використовують

- команди й дії меню;
- системи плагінів, де програма завантажує поведінку ззовні;
- зворотні виклики (callbacks): «викличте мене, коли робота завершиться»;
- обробники подій, яких торкаються пізніші лекції.
