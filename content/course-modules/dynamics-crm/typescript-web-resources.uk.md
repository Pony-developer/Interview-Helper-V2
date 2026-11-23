Кілька рядків JavaScript, вставлених у редактор веб-ресурсів, годяться для демо. Справжні проєкти мають десятки скриптів, які роками підтримують кілька людей; їм потрібні типи, збирання й контроль версій.

## Пишіть на TypeScript

```bash
npm install --save-dev typescript @types/xrm esbuild
```

`@types/xrm` описує весь Client API, тож редактор доповнює `formContext.getAttribute(...)`, а компілятор ловить одруківки й неправильні типи значень:

```typescript
namespace Contoso.Account {
  export function onLoad(executionContext: Xrm.Events.EventContext): void {
    const fc = executionContext.getFormContext();
    const industry = fc.getAttribute<Xrm.Attributes.OptionSetAttribute>("industrycode");
    industry?.addOnChange(onIndustryChange);
    onIndustryChange(executionContext);
  }

  function onIndustryChange(executionContext: Xrm.Events.EventContext): void {
    const fc = executionContext.getFormContext();
    const isPublic = fc.getAttribute<Xrm.Attributes.OptionSetAttribute>("industrycode")?.getValue() === 7;
    fc.getControl<Xrm.Controls.StandardControl>("contoso_procurementcode")?.setVisible(isPublic);
  }
}
```

## Один файл на таблицю

Форма завантажує веб-ресурси як звичайні скрипти, тож результат має бути одним файлом, що кладе ваші функції під **глобальне ім'я**, яке використовується в обробнику події (`Contoso.Account.onLoad`). З ES-модулями й бандлером:

```bash
esbuild src/account/index.ts --bundle --format=iife --global-name=Contoso.Account --minify --outfile=dist/contoso_/scripts/account.js
```

Webpack і Rollup теж підійдуть. Тримайте один бандл на таблицю (або на форму), а не одну величезну бібліотеку для всього: кожна форма завантажувала б код, якого ніколи не використовує.

## Імена та структура

- Імена веб-ресурсів містять префікс видавця й віртуальну теку: `contoso_/scripts/account.js`, `contoso_/html/creditcheck.html`, `contoso_/strings/account.1033.resx`.
- Один простір імен для компанії чи продукту (`Contoso`), вкладені — для таблиць.
- Спільні допоміжні функції (обгортки Web API, сповіщення) — у загальній бібліотеці, вказаній як **залежність** скрипту кожної таблиці.

## Розгортання зі збирання

Веб-ресурси — компоненти рішення, тож зібрані файли мають потрапити в рішення:

- з `pac solution clone`/`sync` веб-ресурси — це файли в теці рішення: збирання копіює туди бандли, а `pac solution pack` пакує їх;
- під час розробки інструменти на кшталт розширення VS Code *Dataverse DevTools*, *WebResources Manager* в XrmToolBox чи *spkl* завантажують і публікують змінений файл за секунди.

Ніколи не редагуйте розгорнутий мінімізований файл у середовищі: наступне розгортання його перезапише, а зміна пропаде з контролю версій.

## Лінтинг і форматування

ESLint (із правилами проти `Xrm.Page` і доступу до `document`) та Prettier тримають скрипти узгодженими й ловлять непідтримувані шаблони ще на рев'ю, до того як вони дійдуть до користувачів.

## На співбесіді

- Поясніть, що дає `@types/xrm`.
- Поясніть, як зібраний модуль стає функцією, яку може викликати форма.
- Опишіть, як веб-ресурси потрапляють із системи контролю версій у рішення.
- Поясніть, чому редагування скриптів просто в середовищі — проблема.
