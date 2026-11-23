Часто кілька алгоритмів мають **той самий кістяк** і відрізняються лише деякими **кроками**. Приготування чаю й кави: закип'ятити воду, заварити, налити, щось додати. Складання звіту у вигляді тексту, CSV чи Markdown: заголовок, рядки, підсумок. Шаблон **шаблонного методу** тримає кістяк в **одному** місці й дозволяє похідним класам заповнити кроки.

## Без шаблону: копії

```csharp
class TextReport
{
    public string Build(string[] items)
    {
        string text = "REPORT\n";
        for (int i = 0; i < items.Length; i++) text += (i + 1) + ". " + items[i] + "\n";
        return text + "Total: " + items.Length + "\n";
    }
}

class CsvReport
{
    public string Build(string[] items)
    {
        string text = "number,item\n";                              // той самий цикл, знову
        for (int i = 0; i < items.Length; i++) text += (i + 1) + "," + items[i] + "\n";
        return text;
    }
}
```

Цикл скопійовано. Якщо завтра звіт має пропускати порожні елементи, ви зміните його в кожному класі й пропустите один.

## Із шаблонним методом

Базовий клас має метод `Build`, що **фіксує порядок кроків**, а самі кроки — `abstract` або `virtual`:

```csharp
abstract class Report
{
    private readonly string[] items;

    protected Report(string[] items) { this.items = items; }

    protected int Count => items.Length;

    protected abstract string Header();                              // крок: мусить бути написаний
    protected abstract string FormatItem(int number, string item);   // крок: мусить бути написаний
    protected virtual string Footer() { return ""; }                 // крок із типовою поведінкою: «гачок»

    public string Build()                                            // ШАБЛОННИЙ МЕТОД
    {
        string text = Header() + "\n";
        for (int i = 0; i < items.Length; i++)
        {
            text += FormatItem(i + 1, items[i]) + "\n";
        }
        string footer = Footer();
        if (footer != "")
        {
            text += footer + "\n";
        }
        return text;
    }
}
```

```csharp
class CsvReport : Report
{
    public CsvReport(string[] items) : base(items) { }

    protected override string Header() { return "number,item"; }
    protected override string FormatItem(int number, string item) { return number + "," + item; }
    // Footer не перевизначено: підсумку немає
}

class TextReport : Report
{
    public TextReport(string[] items) : base(items) { }

    protected override string Header() { return "REPORT"; }
    protected override string FormatItem(int number, string item) { return number + ". " + item; }
    protected override string Footer() { return "Total: " + Count + " items"; }
}

Console.Write(new CsvReport(new[] { "apple", "pear" }).Build());
// number,item
// 1,apple
// 2,pear
```

Кістяк (заголовок, цикл, правило порожнього підсумку) написано **один раз**. Новий формат — це новий малий клас із двома-трьома короткими методами.

## Принцип: не телефонуйте нам, ми зателефонуємо вам

У звичайному коді **ваш** код викликає бібліотеку. У шаблонному методі **навпаки**: базовий клас («фреймворк») керує перебігом і **викликає код похідних класів** у потрібні моменти. Похідний клас не запускає алгоритм. Він лише відповідає на запитання «який заголовок?» та «як форматується рядок?». Це іноді називають **принципом Голлівуду**: «не телефонуйте нам, ми вам зателефонуємо».

## Гачки

Крок із **типовою** поведінкою (`virtual`) — це **гачок**: місце, де похідний клас **може** щось змінити, але не мусить. `Footer` вище — гачок. Обов'язкові кроки — `abstract`.

## Деталі дизайну

- Робіть кроки **`protected`**: вони лише для похідних класів, а зовнішній код викликає тільки `Build()`.
- Робіть сам шаблонний метод **невіртуальним** (не `virtual`), щоб похідний клас не міг зламати кістяк.
- Тримайте кількість кроків **малою**. Шаблон із двадцятьма абстрактними кроками важко реалізувати.

## Шаблонний метод чи інтерфейс?

Інший спосіб варіювати алгоритм — **композиція**: передати класові об'єкт з інтерфейсом (наприклад, `IFormatter`) і дозволити йому викликати цей об'єкт. Це часто гнучкіше, бо об'єкт можна **змінювати під час виконання**, і немає успадкування. Шаблонний метод пасує, коли кроки **тісно пов'язані** з кістяком і ділять дані в базовому класі. Обидва вживаються в реальному коді, і ви маєте вміти вибирати.
