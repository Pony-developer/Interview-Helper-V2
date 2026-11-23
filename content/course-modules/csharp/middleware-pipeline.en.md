Build a small model of the ASP.NET Core middleware pipeline. A `Context` stands for `HttpContext`, and a `RequestDelegate` is a step that handles a context.

Write two methods of `PipelineBuilder`:

- `Use(Action<Context, Action> middleware)` remembers a middleware. A middleware receives the context and a `next` action, and decides whether and when to call it. The method returns the builder itself, so calls can be chained;
- `Build(RequestDelegate endpoint)` combines everything into **one** `RequestDelegate`: the first middleware added is the outermost, it wraps the second, and so on; the last one wraps the endpoint.

`Main` builds the pipeline "logging → authorization → error handling → endpoint" and sends three requests through it:

- `/home` passes every middleware and reaches the endpoint;
- `/admin/users` is stopped by the authorization middleware, which sets status 403 and does **not** call `next`;
- `/boom` reaches the endpoint, which throws; the error handling middleware catches the exception and sets status 500.

Do not change `Main` or `Context`. Expected output:

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

Hint: store each middleware as a function that turns the next step into a new step: `Func<RequestDelegate, RequestDelegate>`, that is `next => context => middleware(context, () => next(context))`. `Build` starts from the endpoint and wraps it, going through the list **from the end**.
