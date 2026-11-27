## Файли, відображені в пам'ять

Файл, відображений у пам'ять, відображає файл (чи блок спільної пам'яті) у віртуальний адресний простір процесу. ОС підвантажує й вивантажує дані сторінками за потребою, тож з величезними файлами можна працювати так, ніби вони в пам'яті.

```csharp
using var mmf = MemoryMappedFile.CreateFromFile("prices.bin", FileMode.Open);
using var accessor = mmf.CreateViewAccessor(offset: 0, size: 0);   // 0 = до кінця файлу

long recordOffset = 1_000_000 * 16L;          // одразу до запису №1 000 000
double price = accessor.ReadDouble(recordOffset);
accessor.Write(recordOffset, price * 1.1);     // записи повертаються у файл
```

Коли використовувати:

- **Довільний доступ** до великих файлів (індекси, бази даних, двійкові набори даних): читання запису N — це обчислення вказівника, без викликів `Seek` + `Read`.
- **Спільна пам'ять між процесами**: два процеси відкривають відображення з однаковим ім'ям.

```csharp
// процес A
using var shared = MemoryMappedFile.CreateNew("Shop.Stats", 4096);    // іменована спільна пам'ять (Windows)
using var view = shared.CreateViewAccessor();
view.Write(0, 42);

// процес B
using var existing = MemoryMappedFile.OpenExisting("Shop.Stats");
using var view2 = existing.CreateViewAccessor();
int value = view2.ReadInt32(0);
```

Іменовані відображення без файлу — лише для Windows; у Linux відображайте файл, доступний обом процесам. Одночасних писачів координуйте через іменований `Mutex` чи `Semaphore`.

`CreateViewStream` дає `Stream` над відображенням, а `accessor.SafeMemoryMappedViewHandle` відкриває вказівник для `unsafe` чи доступу через `Span`.

Для послідовного читання звичайні буферизовані `FileStream` так само швидкі й простіші.

## Безпека ОС і права доступу до файлів

Файлові операції виконуються з ідентичністю процесу, а що дозволено — вирішує ОС:

- У **Windows** файли й теки мають ACL. `FileSystemAclExtensions.GetAccessControl` / `SetAccessControl` (пакет лише для Windows) читають і змінюють їх.
- У **Linux/macOS** файли мають біти прав власника/групи/інших. .NET 7 додав `File.GetUnixFileMode` / `SetUnixFileMode`; раніше викликали `chmod`.
- Заборонений доступ кидає `UnauthorizedAccessException`.

Практичні поради:

- Запускайте сервіси під окремим обліковим записом з мінімальними правами й надавайте лише потрібні теки.
- Не вимагайте прав адміністратора для звичайної роботи; пишіть у теки користувача чи даних застосунку.
- Перевіряйте підвищені права, коли треба: `new WindowsPrincipal(WindowsIdentity.GetCurrent()).IsInRole(WindowsBuiltInRole.Administrator)` у Windows, перевірки на кшталт `Environment.UserName == "root"` деінде.

## Що сказати на співбесіді

- Файли, відображені в пам'ять, дають довільний доступ до величезних файлів і спільну пам'ять між процесами.
- Для послідовного I/O звичайні потоки простіші й так само швидкі.
- Доступ до файлів регулюють права ОС; очікуйте `UnauthorizedAccessException` і працюйте з мінімальними привілеями.
