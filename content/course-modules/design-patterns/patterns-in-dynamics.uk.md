SDK Dynamics 365 / Dataverse — гарна екскурсія патернами проєктування. Знання їх допомагає зрозуміти, *чому* платформа працює саме так, і дає конкретні відповіді на співбесіді на роль Dynamics-розробника.

## Конвеєр подій: Chain of Responsibility

Коли запис створюється чи оновлюється, повідомлення проходить етапи: **PreValidation → PreOperation → основна операція → PostOperation**. Плагіни реєструються на цих етапах із порядком виконання. Кожен робить свою частину й пропускає повідомлення далі або зупиняє всю операцію, кинувши `InvalidPluginExecutionException`. Це конвеєр обробників, точнісінько як middleware в ASP.NET Core.

## IServiceProvider: Service Locator

`IPlugin.Execute(IServiceProvider serviceProvider)` дає вам скриньку, у якої просять сервіси:

```csharp
var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
```

Це патерн **Service Locator**. На межі плагіна він доречний, але в коді застосунку вважається антипатерном, бо залежності сховано всередині методів. Звичайне рішення: отримати сервіси **один раз** на початку `Execute` і передати їх у власні класи через конструктори (DI вручну).

## IOrganizationServiceFactory: Factory

`factory.CreateOrganizationService(context.UserId)` створює сервіс, що працює від імені заданого користувача (або від SYSTEM із `null`). Ви не знаєте конкретного класу, який отримаєте; вирішує фабрика.

## OrganizationRequest і Execute: Command

```csharp
service.Execute(new SetStateRequest { EntityMoniker = account.ToEntityReference(), State = new OptionSetValue(1), Status = new OptionSetValue(2) });
```

Кожна операція — **об'єкт запиту**. Оскільки дії є об'єктами, їх можна збирати в пакет `ExecuteMultipleRequest` чи виконувати однією транзакцією в `ExecuteTransactionRequest`.

## Клас PluginBase: Template Method

Більшість команд один раз пише базовий клас:

```csharp
public abstract class PluginBase : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)    // фіксований план
    {
        var local = new LocalContext(serviceProvider);       // контекст, сервіси, трасування
        try
        {
            ExecuteCore(local);                               // єдиний крок, який заповнює кожен плагін
        }
        catch (InvalidPluginExecutionException) { throw; }
        catch (Exception e)
        {
            local.Trace(e.ToString());
            throw new InvalidPluginExecutionException("Unexpected error, see the trace log", e);
        }
    }

    protected abstract void ExecuteCore(LocalContext local);
}
```

## Early-bound класи: обгортки на кшталт Proxy

Класи, згенеровані `pac modelbuilder` (`Account`, `Contact`), обгортають загальний `Entity` та його словник атрибутів типізованими властивостями: `account.Name` замість `entity.GetAttributeValue<string>("name")`.

## Pre- і Post-образи: Memento

**PreImage** — знімок запису до операції; **PostImage** — знімок після. Плагін порівнює їх, щоб побачити, що насправді змінилося.

## Repository і тестовані плагіни

Сховайте доступ до даних за інтерфейсом (`IAccountRepository`, що всередині використовує `IOrganizationService`). Бізнес-логіка отримує репозиторій через конструктор, а модульні тести передають підробку чи використовують FakeXrmEasy, без справжнього Dataverse.

## Запам'ятайте

На співбесіді на роль Dynamics-розробника найсильніша відповідь пов'язує патерни з платформою: «конвеєр плагінів — це Chain of Responsibility, `Execute` з об'єктами запитів — Command, наш `PluginBase` — Template Method, а репозиторії ми впроваджуємо, щоб покривати плагіни модульними тестами».
