У модулі про файли ви користувалися статичними класами `File`, `Directory` та `Path`. Простір імен `System.IO` має **об'єктно-орієнтовану** альтернативу: `FileInfo` та `DirectoryInfo`. Замість того щоб щоразу передавати шлях у статичний метод, ви **створюєте об'єкт для одного файлу чи теки** і ставите йому запитання.

> **Примітка.** Онлайн-запускач не має доступу до файлів, тож ці приклади призначені для вашого комп'ютера. Практичне завдання цієї лекції використовує **віртуальне** дерево тек, збудоване з ваших власних класів, із тими самими ідеями.

## File проти FileInfo

```csharp
// статичний: шлях — аргумент щоразу
bool exists = File.Exists(@"C:\data\report.txt");
long size = new FileInfo(@"C:\data\report.txt").Length;

// об'єкт: створюємо раз, потім користуємося його членами
var file = new FileInfo(@"C:\data\report.txt");
Console.WriteLine(file.Exists);
Console.WriteLine(file.Length);
```

| Статичний `File` | Об'єкт `FileInfo` |
| --- | --- |
| `File.Exists(path)` | `file.Exists` |
| `File.Delete(path)` | `file.Delete()` |
| `File.Copy(from, to)` | `file.CopyTo(to)` |
| `File.Move(from, to)` | `file.MoveTo(to)` |
| `new FileInfo(path).Length` | `file.Length` |

Статичні методи коротші для **однієї** операції. Об'єкти краще, коли ви **ставите багато запитань** про той самий файл і коли передаєте файл далі як одну річ.

## Що знає FileInfo

```csharp
var file = new FileInfo(@"C:\data\reports\2026.final.txt");

file.Name               // "2026.final.txt"
file.Extension          // ".txt"
file.FullName           // "C:\data\reports\2026.final.txt"
file.DirectoryName      // "C:\data\reports"
file.Directory          // DirectoryInfo для теки
file.Exists             // чи він існує зараз?
file.Length             // розмір у байтах (кидає виняток, якщо файлу немає)
file.CreationTime       // коли створено
file.LastWriteTime      // коли востаннє змінено
file.IsReadOnly         // атрибут «лише для читання»
```

`FileInfo`, створений для шляху, **не перевіряє**, що файл існує. Це каже `Exists`, а властивості відсутнього файлу (як-от `Length`) кидають `FileNotFoundException`.

## Що знає DirectoryInfo

```csharp
var dir = new DirectoryInfo(@"C:\data");

dir.Name                          // "data"
dir.FullName                      // "C:\data"
dir.Parent                        // DirectoryInfo для "C:\"
dir.Exists
dir.GetFiles()                    // FileInfo[]: файли безпосередньо всередині
dir.GetFiles("*.txt")             // із шаблоном
dir.GetDirectories()              // DirectoryInfo[]: підтеки
dir.CreateSubdirectory("backup")  // створює теку, повертає її DirectoryInfo
dir.Delete(true);                 // видаляє її з усім умістом (обережно!)
```

Методи `GetFiles` та `GetDirectories` повертають **об'єкти**, а не рядки, тож можна одразу питати кожен про його `Name`, `Length` чи `Extension`.

## Перелік теки

```csharp
var dir = new DirectoryInfo(@"C:\data");
foreach (FileInfo file in dir.GetFiles())
{
    Console.WriteLine(file.Name + "  " + file.Length + " bytes");
}
foreach (DirectoryInfo sub in dir.GetDirectories())
{
    Console.WriteLine(sub.Name + "/");
}
```

## Обхід дерева: рекурсія

Тека містить файли та **теки**, які містять файли та теки: вкладена структура, що природно пасує до **рекурсії**. Загальний розмір теки — це розміри її файлів плюс загальні розміри її підтек:

```csharp
static long TotalSize(DirectoryInfo dir)
{
    long total = 0;
    foreach (FileInfo file in dir.GetFiles())
        total += file.Length;                       // файли тут
    foreach (DirectoryInfo sub in dir.GetDirectories())
        total += TotalSize(sub);                    // підтеки: та сама задача, менша
    return total;
}
```

Базовий випадок прихований: тека без підтек не робить рекурсивних викликів.

Друк із відступом за глибиною:

```csharp
static void Print(DirectoryInfo dir, int level)
{
    string pad = new string(' ', level * 2);
    Console.WriteLine(pad + dir.Name + "/");
    foreach (FileInfo file in dir.GetFiles())
        Console.WriteLine(pad + "  " + file.Name + " (" + file.Length + ")");
    foreach (DirectoryInfo sub in dir.GetDirectories())
        Print(sub, level + 1);
}
```

## Скорочення: параметри пошуку

Для пошуку через **усі** рівні рекурсію писати не потрібно:

```csharp
FileInfo[] all = dir.GetFiles("*.cs", SearchOption.AllDirectories);
```

## Великі теки: Enumerate

`GetFiles` спершу будує **весь** масив. Для теки з мільйоном файлів це повільно й використовує багато пам'яті. `EnumerateFiles` віддає файли **по одному**, і можна зупинитися раніше:

```csharp
foreach (FileInfo file in dir.EnumerateFiles("*", SearchOption.AllDirectories))
{
    if (file.Length > 100_000_000) Console.WriteLine(file.FullName);
}
```

## Що може піти не так

- `UnauthorizedAccessException`: вам не дозволено читати системну теку чи теку іншого користувача. Обхід усього диска має бути до цього готовий.
- `DirectoryNotFoundException` та `FileNotFoundException`: елемент зник відтоді, як ви на нього дивилися.
- **Застаріла інформація.** `FileInfo` кешує частину своїх даних. `file.Refresh()` читає їх знову.
- Довгий шлях або заборонений символ: `PathTooLongException`, `ArgumentException`.

## Форматування розміру

Байти важко читати. Невеликий допоміжний метод робить розміри людяними:

```csharp
static string FormatSize(long bytes)
{
    string[] units = { "B", "KB", "MB", "GB", "TB" };
    double size = bytes;
    int unit = 0;
    while (size >= 1024 && unit < units.Length - 1)
    {
        size /= 1024;
        unit++;
    }
    return Math.Round(size, 1) + " " + units[unit];
}
```

## Статичний чи об'єкт?

- **Одна швидка перевірка чи дія**: статичні `File` та `Directory`.
- **Кілька запитань про один елемент** або коли ви передаєте його далі: `FileInfo` та `DirectoryInfo`.
- **Робота зі шляхами як з текстом**: `Path`.
- **Рекурсія по дереву**: об'єкти природні, бо кожна тека — сама об'єкт зі своїми підтеками.

Це також хороша модель, у якої можна вчитися: `DirectoryInfo` має **ідентичність** (ця тека), **дані** (її назва, її час) та **поведінку** (перелік, створення, видалення). Це саме те, чим є клас.
