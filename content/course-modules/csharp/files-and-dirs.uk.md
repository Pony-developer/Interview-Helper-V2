Програми зберігають дані між запусками у **файлах**. Простір імен `System.IO` має все потрібне, і для нього потрібен `using System.IO;` на початку.

> **Примітка.** Онлайн-запускач для практичних завдань не має доступу до файлів, тож наведені нижче приклади призначені для вашого комп'ютера. Практичні завдання використовують текст у пам'яті з тими самими ідеями (`StringReader` — це близнюк читання файлу в пам'яті).

## Шляхи

Шлях каже, де лежить файл чи каталог (тека).

- **Абсолютний** шлях починається з кореня: `C:\Users\ann\notes.txt` у Windows, `/home/ann/notes.txt` у Linux і macOS.
- **Відносний** шлях починається з **поточного каталогу** програми: `data\notes.txt`.

Роздільник різний у різних системах (`\` у Windows, `/` деінде), тож не склеюйте шляхи через `+`. Користуйтеся `Path`:

```csharp
string path = Path.Combine("data", "reports", "2026.txt");   // data\reports\2026.txt у Windows

Path.GetFileName(path)                  // 2026.txt
Path.GetFileNameWithoutExtension(path)  // 2026
Path.GetExtension(path)                 // .txt
Path.GetDirectoryName(path)             // data\reports
Path.GetFullPath(path)                  // абсолютний шлях
```

Методи `Path` працюють із **текстом** шляху. Вони не перевіряють, чи файл існує.

Зворотну скісну риску в рядку C# треба екранувати, тож пишіть `"C:\\data\\a.txt"` або `@"C:\data\a.txt"`.

## Читання й запис цілого текстового файлу

Клас `File` має методи в один виклик для невеликих файлів:

```csharp
File.WriteAllText("notes.txt", "first line\nsecond line");   // створює або перезаписує
File.AppendAllText("notes.txt", "\nthird line");             // додає в кінець

string text = File.ReadAllText("notes.txt");                 // усе як один рядок
string[] lines = File.ReadAllLines("notes.txt");             // один елемент масиву на рядок

File.WriteAllLines("copy.txt", lines);                       // масив рядків у файл
```

Для **величезних** файлів `File.ReadLines(path)` віддає рядки по одному, не завантажуючи всі в пам'ять:

```csharp
foreach (string line in File.ReadLines("big.log"))
{
    if (line.Contains("ERROR")) Console.WriteLine(line);
}
```

## Перевірка та керування

```csharp
File.Exists("notes.txt")            // True або False
File.Copy("notes.txt", "backup.txt", true);   // true дозволяє перезапис
File.Move("backup.txt", "old.txt");
File.Delete("old.txt");

Directory.Exists("data")
Directory.CreateDirectory("data/reports");     // створює весь ланцюжок, без помилки, якщо існує
string[] files = Directory.GetFiles("data");              // файли в каталозі
string[] txt = Directory.GetFiles("data", "*.txt");       // з шаблоном
string[] folders = Directory.GetDirectories("data");
Directory.Delete("data", true);                           // true: з усім умістом. Обережно!
```

`File.Delete` та `Directory.Delete` **остаточні**: нічого не потрапляє в кошик.

Стандартні місця:

```csharp
Directory.GetCurrentDirectory()      // де запущено програму
Path.GetTempPath()                   // тека для тимчасових файлів
Path.GetTempFileName()               // створює порожній тимчасовий файл і повертає його шлях
```

## Потоки: читання й запис крок за кроком

Для більшого контролю або для великих даних використовуйте `StreamReader` та `StreamWriter`. Їх треба **закривати** після роботи, і `using` робить це за вас, навіть коли виникає виняток:

```csharp
using (var writer = new StreamWriter("log.txt"))
{
    writer.WriteLine("Started");
    writer.WriteLine("Value: " + 42);
}                                      // файл закривається тут

using (var reader = new StreamReader("log.txt"))
{
    string line;
    while ((line = reader.ReadLine()) != null)
    {
        Console.WriteLine(line);
    }
}
```

`ReadLine` повертає `null` наприкінці файлу. Умова `(line = reader.ReadLine()) != null` присвоює рядок і перевіряє його за один крок: поширений шаблон.

Відкритий файл може бути заблокований: інша програма чи інша частина вашої не може писати в нього, поки його не закрито. Це практична причина завжди користуватися `using`.

## Що може піти не так

Файли поза контролем вашої програми, тож операції з ними збоять частіше за звичайний код:

| Виняток | Типова причина |
| --- | --- |
| `FileNotFoundException` | файлу не існує |
| `DirectoryNotFoundException` | теки зі шляху не існує |
| `UnauthorizedAccessException` | немає дозволу або шлях є каталогом |
| `IOException` | файл використовується, диск заповнений, ... |
| `ArgumentException` | шлях порожній або містить заборонені символи |

```csharp
try
{
    string text = File.ReadAllText("settings.txt");
    Console.WriteLine(text.Length);
}
catch (FileNotFoundException)
{
    Console.WriteLine("No settings file; using defaults.");
}
catch (IOException e)
{
    Console.WriteLine("Cannot read: " + e.Message);
}
```

Для файлу, якого **може** не бути, чистіше спершу запитати через `File.Exists`, ніж ловити виняток. Проте хтось може видалити файл між перевіркою та читанням, тож важливий код обробляє обидва випадки.

## Близнюки в пам'яті

Класи `System.IO` також працюють із текстом і байтами в пам'яті, і саме так тестують код роботи з файлами, не торкаючись диска:

```csharp
var reader = new StringReader("line 1\nline 2\nline 3");
string line;
while ((line = reader.ReadLine()) != null)
{
    Console.WriteLine(line.ToUpper());
}

var writer = new StringWriter();
writer.WriteLine("hello");
writer.Write(42);
Console.WriteLine(writer.ToString());
```

Метод, що приймає `TextReader` (базовий клас для `StreamReader` і `StringReader`), працює і зі справжнім файлом, і з рядком.
