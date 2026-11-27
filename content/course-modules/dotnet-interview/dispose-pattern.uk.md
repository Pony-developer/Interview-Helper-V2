## Завдання

Питання 81: «Чому патерн Dispose такий складний для керованих і некерованих ресурсів?» Реалізуйте його й побачте, навіщо кожна частина. `FileResource` володіє **некерованим** дескриптором (з `NativeApi.Open`) і **керованим** disposable (`MemoryStream`).

Допишіть:

1. **`Dispose()`** — викличте `Dispose(true)`, потім `GC.SuppressFinalize(this)`.
2. **`Dispose(bool disposing)`**:
   - якщо вже звільнено — нічого не робіть (Dispose має бути безпечно викликати двічі);
   - якщо `disposing` дорівнює true (виклик із `Dispose()`), звільніть буфер і запишіть `"buffer disposed"`;
   - завжди закривайте дескриптор (`NativeApi.Close(handle)`) і записуйте `"handle closed"`;
   - позначте об'єкт як звільнений.
3. **Фіналізатор `~FileResource()`** — викличте `Dispose(false)`: із фіналізатора можна звільняти лише некерований дескриптор, бо інші керовані об'єкти вже можуть бути фіналізовані.
4. **`LoggedResource.Dispose(bool)`** — поверніться, якщо `IsDisposed`; коли `disposing`, запишіть `"derived cleanup"`; потім викличте `base.Dispose(disposing)`.

`FinalizerDemo.RunFinalizerPath()` виконує рівно те, що виконав би фіналізатор, тож шлях `disposing: false` видно детерміновано: дескриптор закрито, буфер не чіпали.

Очікуваний вивід:

```
write a
buffer disposed
handle closed
derived cleanup
buffer disposed
handle closed
ObjectDisposedException
handle closed
open handles: 0
```
