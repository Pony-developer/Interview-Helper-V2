GC звільняє **пам'ять**, і робить це **в невідомий момент**. Файл, що лишається відкритим до наступного повного збирання, блокує інші програми; з'єднання з базою, яке повернули в пул через годину, вичерпує пул. Таким ресурсам потрібне **детерміноване** звільнення: саме тоді, коли програма з ними закінчила. У .NET для цього є інтерфейс `IDisposable`:

```csharp
public interface IDisposable
{
    void Dispose();
}
```

## `using`

```csharp
using (var reader = new StreamReader("data.txt"))
{
    Console.WriteLine(reader.ReadLine());
}   // тут викликається reader.Dispose(), навіть якщо було кинуто виняток
```

Компілятор перетворює це на `try { ... } finally { if (reader != null) reader.Dispose(); }`.

Починаючи з C# 8 є також **using-оголошення**. Об'єкт звільняється в кінці охопного блоку:

```csharp
using var reader = new StreamReader("data.txt");
Console.WriteLine(reader.ReadLine());
// reader.Dispose() виконується, коли метод (або блок) закінчується
```

## Хто звільняє

Звільняє **власник**: код, що створив об'єкт і тримає його. Якщо ви отримали об'єкт ззовні (параметр, аргумент конструктора від DI-контейнера), ви не його власник, тож не звільняйте його.

Якщо ваш клас тримає disposable-об'єкт у полі, клас ним володіє. Тоді ваш клас теж мусить реалізувати `IDisposable` і звільняти поле у власному `Dispose`.

## Як правильно написати `Dispose`

```csharp
public sealed class ReportWriter : IDisposable
{
    private readonly StreamWriter writer;
    private bool disposed;

    public ReportWriter(string path) { writer = new StreamWriter(path); }

    public void Write(string line)
    {
        if (disposed) throw new ObjectDisposedException(nameof(ReportWriter));
        writer.WriteLine(line);
    }

    public void Dispose()
    {
        if (disposed) return;   // подвійний виклик Dispose має бути безпечним
        writer.Dispose();
        disposed = true;
    }
}
```

Три правила: `Dispose` можна викликати багато разів; після нього інші методи кидають `ObjectDisposedException`; сам `Dispose` не повинен кидати винятків.

## Асинхронне прибирання

Деяким об'єктам під час закриття треба виконати введення-виведення (скинути дані мережевого потоку). Вони реалізують `IAsyncDisposable`, а ви використовуєте `await using`:

```csharp
await using var stream = new FileStream(path, FileMode.Create);
```

## Пастка `HttpClient`

`HttpClient` — disposable, але якщо створювати і звільняти його **на кожен запит**, сокети машини вичерпуються: закриті з'єднання ще якийсь час лишаються в стані очікування. Використовуйте один спільний екземпляр або `IHttpClientFactory`. Це популярне питання на співбесідах.

## Правило

Усе, що реалізує `IDisposable` і чим ви володієте, кладіть у `using`. Клас, що володіє disposable-полем, сам є disposable.
