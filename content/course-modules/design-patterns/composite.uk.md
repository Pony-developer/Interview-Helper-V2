**Простими словами:** Composite дає змогу **поводитися з окремим елементом і групою елементів однаково**. Група може містити елементи *й інші групи*, тож виходить дерево, і один виклик методу працює на всьому дереві.

## Картинка з життя

Коробка може містити товари й менші коробки. Щоб дізнатися загальну вартість посилки, ви питаєте велику коробку, вона питає все, що всередині, а менші коробки питають свій вміст. Нікому не треба знати, наскільки глибоко вкладені коробки.

## Проблема

Папки містять файли та інші папки. Код, що рахує розмір папки, обростає `if (item is Folder) ... else if (item is File) ...` і рекурсією, написаною вручну в кожному місці.

## На C#

```csharp
interface IFileSystemItem
{
    string Name { get; }
    long GetSize();
}

class FileItem : IFileSystemItem                     // листок
{
    public string Name { get; private set; }
    private readonly long size;

    public FileItem(string name, long size) { Name = name; this.size = size; }

    public long GetSize() { return size; }
}

class Folder : IFileSystemItem                       // компонувальник: містить інші елементи
{
    public string Name { get; private set; }
    private readonly List<IFileSystemItem> children = new List<IFileSystemItem>();

    public Folder(string name) { Name = name; }

    public void Add(IFileSystemItem item) { children.Add(item); }

    public long GetSize() { return children.Sum(c => c.GetSize()); }   // виклик іде вниз деревом
}

var root = new Folder("project");
var src = new Folder("src");
src.Add(new FileItem("Program.cs", 1200));
root.Add(src);
root.Add(new FileItem("README.md", 300));

Console.WriteLine(root.GetSize());   // 1500: тому, хто викликає, байдуже, де файл, а де папка
```

## Де ви вже це бачите

- Дерева UI: панель містить кнопки та інші панелі; відмальовування чи зміна розміру проходить усім деревом.
- Меню з підменю, організаційні структури, ієрархії бізнес-підрозділів.
- Дерева виразів: `(a + b) * c` — вузол, що містить вузли.
- Фільтри в `QueryExpression`: `FilterExpression` містить умови та вкладені фільтри.

## Коли застосовувати, а коли ні

- **Пасує:** дані за природою є деревом, і ви хочете виконувати ту саму операцію над частинами й цілим.
- **Обережно:** спільний інтерфейс може змусити листки мати безглузді методи (`File.Add(...)`?). Тримайте `Add` лише в компонувальнику, як вище.

## Запам'ятайте

Composite = «група виглядає як окремий елемент». Це патерн для дерев.
