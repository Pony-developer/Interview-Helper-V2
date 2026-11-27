**In plain words:** Singleton makes sure a class has **only one object**, and everyone who needs it gets **that same object**.

## A picture from life

A country has one president at a time. Whoever asks "who is the president?" gets the same answer, and nobody can just appoint a second one.

## The problem

Some things should exist once: the app's configuration, a log writer, a cache. If every class did `new Configuration()`, each would read the file again and could end up with different values.

## In C#

```csharp
public sealed class AppConfig
{
    // Lazy<T> creates the object on first use and is thread-safe out of the box
    private static readonly Lazy<AppConfig> instance = new Lazy<AppConfig>(() => new AppConfig());

    public static AppConfig Instance { get { return instance.Value; } }

    public string ApiUrl { get; private set; }

    private AppConfig()                 // private: nobody outside can call new AppConfig()
    {
        ApiUrl = "https://api.example.com";
    }
}

// Everywhere in the code:
var url = AppConfig.Instance.ApiUrl;
```

Three ingredients: a **private constructor**, a **static field** with the one instance, and a **static property** to reach it. `sealed` stops a subclass from creating a second "kind of" instance.

## When to use it, and when not to

- **Fits:** something truly global and stateless or read-only: configuration, a logger.
- **Hurts:** it is **global state in disguise**. Any code can reach it, so you can't see from a class's constructor that it depends on it, and tests can't easily replace it with a fake. Mutable singletons also leak state between tests.
- **Modern alternative:** register the class as a **singleton in a DI container** (`services.AddSingleton<IAppConfig, AppConfig>()`). You still get one instance, but classes receive it through the constructor, and tests can pass a fake.

## Remember

In an interview, show both sides: "Singleton guarantees one instance via a private constructor and a static accessor; `Lazy<T>` makes it thread-safe. But it hides dependencies and hurts testing, so in modern .NET I prefer a singleton lifetime in DI."
