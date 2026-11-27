## Статичні помічники проти info-об'єктів

| Статичний клас | Клас екземпляра | Клас екземпляра кращий, коли |
| --- | --- | --- |
| `File` | `FileInfo` | ви запитуєте кілька властивостей того самого файлу |
| `Directory` | `DirectoryInfo` | ви перелічуєте й досліджуєте багато записів |

```csharp
File.Exists(path);
File.Copy(src, dest, overwrite: true);
File.Move(src, dest, overwrite: true);       // .NET Core 3.0+
File.Delete(path);                           // без помилки, якщо файлу немає
File.WriteAllText(path, text); File.AppendAllLines(path, lines);
byte[] bytes = await File.ReadAllBytesAsync(path);
File.GetLastWriteTimeUtc(path);

var info = new FileInfo(path);
Console.WriteLine($"{info.Name} {info.Length} bytes, modified {info.LastWriteTimeUtc}");

Directory.CreateDirectory(@"out/reports/2024");   // створює всі відсутні рівні; нормально, якщо існує
foreach (string f in Directory.EnumerateFiles("logs", "*.log", SearchOption.AllDirectories)) { }
Directory.Delete("tmp", recursive: true);
```

Для великих каталогів віддавайте перевагу `Enumerate*` (ліниво), а не `Get*` (будує масив). `EnumerationOptions` (.NET Core 2.1) керує рекурсією, чутливістю до регістру та пропуском недоступних тек.

## Шляхи

```csharp
string full = Path.Combine(baseDir, "data", "orders.csv");   // правильний роздільник для ОС
string name = Path.GetFileName(full);                        // orders.csv
string noExt = Path.GetFileNameWithoutExtension(full);       // orders
string ext = Path.GetExtension(full);                        // .csv
string dir = Path.GetDirectoryName(full)!;
string abs = Path.GetFullPath("../config.json");             // розв'язується відносно поточного каталогу
string temp = Path.GetTempFileName();                        // створює порожній тимчасовий файл
Path.DirectorySeparatorChar;                                 // '\' у Windows, '/' деінде
```

- Ніколи не будуйте шляхи склеюванням рядків з `"\\"`: у Linux це зламається.
- `Path.Combine("a", "/b")` повертає `"/b"`: кореневий другий аргумент перемагає. `Path.Join` (.NET Core 3.0) так не робить, що безпечніше з недовіреним вводом.
- Відносні шляхи розв'язуються відносно **поточного каталогу**, який може не бути текою застосунку. Для файлів, що постачаються із застосунком, беріть `AppContext.BaseDirectory`.
- Імена файлів у Windows не чутливі до регістру, у Linux — чутливі.

## Особливі теки

```csharp
Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);       // дані застосунку користувача
Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData); // для всіх користувачів
Path.GetTempPath();
```

Не пишіть під час роботи в теку встановлення застосунку: вона часто лише для читання.

## Стеження за змінами

```csharp
using var watcher = new FileSystemWatcher(@"C:\inbox", "*.csv")
{
    NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite,
    IncludeSubdirectories = false,
    EnableRaisingEvents = true,
};
watcher.Created += (_, e) => Console.WriteLine($"new file {e.FullPath}");
watcher.Error += (_, e) => Console.WriteLine("buffer overflow: events were lost");
```

Застереження: одне збереження може дати кілька подій; подія може спрацювати, поки писач ще тримає файл відкритим (повторіть спробу, якщо відкриття не вдалося); внутрішній буфер може переповнитися під навантаженням (обробляйте `Error` і скануйте заново); мережеві ресурси й контейнери можуть бути ненадійними. Багато надійних систем як запасний варіант опитують теку.

## Одночасний доступ і блокування

Відкриття файлу блокує його відповідно до `FileShare`. Другий процес, що хоче писати, поки ви читаєте, отримає `IOException`, якщо ви не дозволили `FileShare.ReadWrite`. Ловіть `IOException` навколо файлових операцій: файли можуть зникнути, бути заблокованими чи жити на від'єднаному диску будь-якої миті.

## Що сказати на співбесіді

- `File`/`Directory` — для разових викликів, `FileInfo`/`DirectoryInfo` — для повторних запитів; `Enumerate*` лінивий.
- Будуйте шляхи через `Path.Combine`/`Path.Join`; для файлів застосунку — `AppContext.BaseDirectory`.
- Події `FileSystemWatcher` можуть дублюватися, приходити зарано чи губитися.
