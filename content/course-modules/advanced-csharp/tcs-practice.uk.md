## Завдання

`LegacyGeocoder.Lookup` — старий API на колбеках: він завершується в потоці пулу й викликає або `onSuccess(lat, lon)`, або `onError(message)`.

Напишіть метод розширення **`LookupAsync(city)`**, що обгортає його в `Task<Tuple<double, double>>` за допомогою `TaskCompletionSource`:

- у разі успіху завершіть задачу значенням `Tuple.Create(lat, lon)`;
- у разі помилки завершіть задачу з помилкою `GeocodeException`, що несе повідомлення;
- створюйте `TaskCompletionSource` з `TaskCreationOptions.RunContinuationsAsynchronously` і використовуйте методи `TrySet*`.

Далі `Main` користується задачею, як будь-якою іншою: `.Result`, `Task.WaitAll` (чий `AggregateException` містить внутрішній `GeocodeException`), `Status` задачі та продовження. (Блокування через `.Result` прийнятне в консольному `Main`; на сервері чи в UI ви б використали `await`.)

Очікуваний результат:

```
Kyiv: 50.45, 30.52
GeocodeException: Unknown city: Atlantis
Lviv: RanToCompletion 49.84
Atlantis: Faulted
lat 50.45
```
