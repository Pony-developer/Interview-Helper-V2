Коли стандартних контролів і кількох рядків скрипту недостатньо, ви створюєте **компоненти коду** на Power Apps component framework (PCF) і налаштовуєте **панель команд**.

## PCF-контроли

PCF-контрол замінює спосіб показу стовпця чи сітки: зірковий рейтинг замість числа, карта замість адреси, канбан-дошка замість списку. Контроли пишуть на **TypeScript** (часто з React і Fluent UI), вони виконуються в браузері й працюють у model-driven застосунках, canvas-застосунках і Power Pages.

Два види:

- **Field**-контроли прив'язуються до одного чи кількох стовпців: `pac pcf init --namespace Contoso --name StarRating --template field`.
- **Dataset**-контроли прив'язуються до подання чи підсітки: `--template dataset`.

Маніфест (`ControlManifest.Input.xml`) оголошує властивості, їхні типи та ресурси. Клас реалізує чотири методи:

```typescript
export class StarRating implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private value: number | null = null;
  private notifyOutputChanged!: () => void;
  private container!: HTMLDivElement;

  init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void,
       state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.container = container;
  }

  updateView(context: ComponentFramework.Context<IInputs>): void {
    this.value = context.parameters.rating.raw;   // викликається при кожній зміні даних чи розмітки
    this.render(context.mode.isControlDisabled);
  }

  getOutputs(): IOutputs {
    return { rating: this.value ?? undefined };   // тут платформа читає нове значення
  }

  destroy(): void { /* прибрати слухачів, демонтувати React */ }

  private render(disabled: boolean) { /* намалювати зірки; при кліку: задати this.value, викликати notifyOutputChanged() */ }
}
```

Цикл такий: платформа один раз викликає `init`, потім `updateView` щоразу, коли щось змінюється. Коли користувач змінює значення, контрол викликає `notifyOutputChanged()`, і платформа викликає `getOutputs()`, щоб прочитати нове значення. `context` також дає доступ до `webAPI`, `navigation`, `formatting`, `resources` (переклади) і можливостей пристрою.

Розробляють із `npm start watch` (локальне тестове середовище), потім пакують: `pac solution init`, `pac solution add-reference`, збирання та імпорт рішення. Під час розробки `pac pcf push --publisher-prefix contoso` розгортає контрол просто в середовище.

## Команди

Панель команд (раніше — **стрічка**, ribbon) містить кнопки над формами й сітками.

- **Сучасні команди** (modern commanding): у дизайнері команд застосунку додавайте кнопки, дія й видимість яких задаються формулами **Power Fx** або викликом функції JavaScript. Це актуальний спосіб.
- **Класичне налаштування стрічки** змінює `RibbonDiffXml`, зазвичай через інструмент спільноти **Ribbon Workbench** в XrmToolBox. Його досі можна зустріти в старших системах: команди, enable rules і display rules.

Команда на JavaScript отримує параметри, які ви налаштовуєте, наприклад `PrimaryControl` (контекст форми поточного запису) чи `SelectedControlSelectedItemIds` (id, вибрані в сітці):

```javascript
Contoso.Account.markVip = async function (primaryControl) {
  const formContext = primaryControl;
  formContext.getAttribute("contoso_isvip").setValue(true);
  await formContext.data.save();
};
```

## Інші веб-ресурси

Веб-ресурсами також можуть бути HTML-сторінки, CSS, зображення (SVG, PNG) і RESX-файли для перекладів. Власні HTML-сторінки, вбудовані у форми, — старіший підхід; для нового інтерфейсу краще PCF-контроли або **custom pages** (canvas-сторінки, вбудовані в model-driven застосунки).

## Як обрати

| Потреба | Інструмент |
| --- | --- |
| Показати, приховати, зробити обов'язковим на формі | Бізнес-правило, потім скрипт форми |
| Інший спосіб показати чи редагувати стовпець | PCF field-контрол |
| Власна сітка чи дошка | PCF dataset-контрол |
| Нова кнопка з простою логікою | Сучасна команда з Power Fx |
| Цілком новий екран | Custom page або PCF |

## На співбесіді

- Поясніть різницю між field- і dataset-контролами PCF і чотири методи життєвого циклу.
- Поясніть, як контрол повідомляє платформі нове значення.
- Опишіть, як PCF-контрол збирають і розгортають через `pac`.
- Порівняйте сучасні команди з класичним налаштуванням стрічки.
