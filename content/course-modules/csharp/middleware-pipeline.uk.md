Побудуйте невелику модель конвеєра middleware з ASP.NET Core. `Context` заміняє `HttpContext`, а `RequestDelegate` — це крок, що обробляє контекст.

Напишіть два методи `PipelineBuilder`:

- `Use(Action<Context, Action> middleware)` запам'ятовує middleware. Middleware отримує контекст і дію `next` та вирішує, чи і коли її викликати. Метод повертає сам будівник, щоб виклики можна було писати ланцюжком;
- `Build(RequestDelegate endpoint)` об'єднує все в **один** `RequestDelegate`: доданий першим middleware — зовнішній, він обгортає другий і так далі; останній обгортає кінцеву точку.

`Main` будує конвеєр «логування → авторизація → обробка помилок → кінцева точка» і пропускає через нього три запити:

- `/home` проходить кожен middleware і доходить до кінцевої точки;
- `/admin/users` зупиняє middleware авторизації: він задає статус 403 і **не** викликає `next`;
- `/boom` доходить до кінцевої точки, яка кидає виняток; middleware обробки помилок перехоплює виняток і задає статус 500.

`Main` і `Context` не змінюйте. Очікуваний вивід:

```text
log: start /home
endpoint: /home
log: end /home -> 200
log: start /admin/users
log: end /admin/users -> 403
log: start /boom
error: boom
log: end /boom -> 500
```

Підказка: зберігайте кожен middleware як функцію, що перетворює наступний крок на новий крок: `Func<RequestDelegate, RequestDelegate>`, тобто `next => context => middleware(context, () => next(context))`. `Build` починає з кінцевої точки й обгортає її, проходячи список **з кінця**.
