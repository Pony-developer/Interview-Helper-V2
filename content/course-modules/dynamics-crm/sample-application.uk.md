Остання лекція клієнтської частини складає все в одну функціональність так, як її будували б на справжньому проєкті: **перевірку кредиту акаунта**.

## Вимога

Торгові представники хочуть кнопку **Check credit** на формі акаунта. Вона запитує в зовнішнього кредитного агентства оцінку, зберігає результат в акаунті, попереджає представника, якщо акаунт варто заблокувати, і показує деталі в діалозі. Менеджери хочуть, щоб ту саму перевірку згодом можна було використати з flow.

## Дизайн

```text
 Форма акаунта ──Check credit (команда)──▶ contoso_/scripts/account.js
                                           │ Xrm.WebApi.online.execute
                                           ▼
                           Custom API contoso_CheckCredit (прив'язаний до account, дія)
                                           │ плагін: викликає агентство через HTTPS,
                                           │ записує contoso_creditscore, contoso_creditcheckedon
                                           ▼
                           Відповідь: score, approved, message
                                           │
 Сповіщення форми + оновлення ◀────────────┘──▶ діалог: contoso_/html/creditdetails.html
```

Чому саме ці частини:

- **Custom API**: логіка живе на сервері під захистом безпеки платформи, її можуть повторно використати flow, інші застосунки й інтеграції. Зовнішній виклик і його облікові дані лишаються поза браузером.
- **Плагін** за Custom API: короткий виклик HTTPS із тайм-аутом, облікові дані із секретної змінної середовища, результат записується в акаунт у тій самій операції.
- **Команда** (modern commanding) на формі: видима лише для наявних активних акаунтів.
- **Скрипт форми**: індикатор прогресу, запит, сповіщення й оновлення.
- **HTML веб-ресурс** як діалог для деталей (підійшла б і custom page).

## Обробник команди

```typescript
namespace Contoso.Account {
  export async function checkCredit(primaryControl: Xrm.FormContext): Promise<void> {
    const fc = primaryControl;
    if (fc.data.entity.getIsDirty()) await fc.data.save();          // сервер має бачити актуальні дані
    const accountId = fc.data.entity.getId().replace(/[{}]/g, "");

    Xrm.Utility.showProgressIndicator("Checking credit…");
    try {
      const response = await Xrm.WebApi.online.execute(checkCreditRequest(accountId));
      const result = await response.json();                         // { Score, Approved, Message }

      fc.ui.clearFormNotification("credit");
      if (!result.Approved) {
        fc.ui.setFormNotification(`Credit check failed: ${result.Message}`, "WARNING", "credit");
      }
      await fc.data.refresh(false);                                 // показати збережену оцінку

      await Xrm.Navigation.navigateTo(
        { pageType: "webresource", webresourceName: "contoso_/html/creditdetails.html", data: JSON.stringify(result) },
        { target: 2, position: 1, width: { value: 480, unit: "px" }, height: { value: 360, unit: "px" }, title: "Credit check" });
    } catch (e) {
      await Xrm.Navigation.openErrorDialog({ message: "The credit check could not be completed.", details: String(e) });
    } finally {
      Xrm.Utility.closeProgressIndicator();
    }
  }

  function checkCreditRequest(accountId: string) {
    return {
      entity: { entityType: "account", id: accountId },
      getMetadata: () => ({
        boundParameter: "entity",
        operationType: 0,
        operationName: "contoso_CheckCredit",
        parameterTypes: { entity: { typeName: "mscrm.account", structuralProperty: 5 } },
      }),
    };
  }
}
```

У дизайнері команд **видимість** кнопки — це формула Power Fx, що перевіряє, чи запис збережено й активний; її дія запускає функцію JavaScript `Contoso.Account.checkCredit` з параметром `PrimaryControl`.

## Скрипт форми під час завантаження

```typescript
export function onLoad(executionContext: Xrm.Events.EventContext): void {
  const fc = executionContext.getFormContext();
  const checkedOn = fc.getAttribute<Xrm.Attributes.DateAttribute>("contoso_creditcheckedon")?.getValue();
  const stale = !checkedOn || Date.now() - checkedOn.getTime() > 90 * 24 * 3600 * 1000;
  if (stale && fc.ui.getFormType() === 2) {
    fc.ui.setFormNotification("The credit check is older than 90 days.", "INFO", "credit-stale");
  }
}
```

## Що робить це готовим до продакшну

- **Рішення**: Custom API, збірка плагіна та крок, скрипт, HTML-сторінка, рядки RESX, команда, змінні середовища. Одне рішення, яке розгортає конвеєр.
- **Безпека**: привілей на Custom API, щоб запускати його могли лише ролі продажів; облікові дані ніколи не потрапляють у браузер.
- **Помилки**: плагін кидає `InvalidPluginExecutionException` зі зрозумілим повідомленням; скрипт показує його в діалозі помилки.
- **Тести**: логіка плагіна покрита модульними тестами з фейковим сервісом; логіка скрипту — тестами з моками.
- **Локалізація**: повідомлення з файлів RESX; числа відформатовано для користувача.
- **Продуктивність**: під час завантаження нічого не виконується, крім локальної перевірки дати.

Така форма більшості справжніх функцій Dynamics: трохи клієнтського коду для зручності, серверний код для правил, а частини платформи (команди, Custom API, рішення) тримають усе разом.

## На співбесіді

- Спроєктуйте функцію, що викликає зовнішній сервіс із форми, і поясніть, де виконується кожна частина.
- Поясніть, чому виклик іде через Custom API, а не через `fetch` з браузера.
- Пройдіться обробником команди: збереження, прогрес, запит, сповіщення, оновлення, діалог.
- Перелічіть, що входить у рішення для цієї функціональності.
