import type { ModuleDef } from "../types";

export const clientModule: ModuleDef = {
  slug: "crm-client",
  title: { en: "Development with the Client API", uk: "Розробка з Client API" },
  slides: [
    { kind: "lecture", slug: "client-api-overview", title: { en: "The Client API object model", uk: "Об'єктна модель Client API" } },
    { kind: "lecture", slug: "form-scripting", title: { en: "Form scripts and the Client API", uk: "Скрипти форм і Client API" } },
    {
      kind: "lecture",
      slug: "attributes-controls",
      title: { en: "Working with columns and controls", uk: "Робота зі стовпцями та контролами" },
    },
    { kind: "lecture", slug: "form-ui", title: { en: "Tabs, sections and notifications", uk: "Вкладки, секції та сповіщення" } },
    { kind: "lecture", slug: "form-events", title: { en: "Form events in depth", uk: "Події форми детально" } },
    {
      kind: "lecture",
      slug: "xrm-navigation-utility",
      title: { en: "Xrm.Navigation, Xrm.Utility and Xrm.App", uk: "Xrm.Navigation, Xrm.Utility та Xrm.App" },
    },
    {
      kind: "quiz",
      slug: "client-quiz",
      title: { en: "Client API check", uk: "Перевірка: Client API" },
      questions: [
        {
          id: "form-context",
          mode: "single",
          prompt: {
            en: "How should a form script get access to the form's columns and controls?",
            uk: "Як скрипт форми має отримувати доступ до стовпців і контролів форми?",
          },
          options: [
            { id: "a", text: { en: "Pass the execution context to the handler and call executionContext.getFormContext()", uk: "Передати контекст виконання в обробник і викликати executionContext.getFormContext()" } },
            { id: "b", text: { en: "Use the global Xrm.Page object", uk: "Використати глобальний об'єкт Xrm.Page" } },
            { id: "c", text: { en: "Query the DOM with document.getElementById", uk: "Шукати елементи в DOM через document.getElementById" } },
          ],
          correct: ["a"],
        },
        {
          id: "business-rule",
          mode: "single",
          prompt: {
            en: "A field must become required when Status is Closed, on the form and for API calls. What is the lightest tool?",
            uk: "Поле має ставати обов'язковим, коли Status = Closed, і на формі, і для викликів API. Який найлегший інструмент?",
          },
          options: [
            { id: "a", text: { en: "A business rule with Entity scope, plus a plug-in if the API rule must be strict", uk: "Бізнес-правило з областю Entity, а якщо правило для API має бути суворим, ще й плагін" } },
            { id: "b", text: { en: "Only a form script: it also runs for API calls", uk: "Лише скрипт форми: він також виконується для викликів API" } },
            { id: "c", text: { en: "A PCF control", uk: "PCF-контрол" } },
          ],
          correct: ["a"],
        },
        {
          id: "attribute-control",
          mode: "single",
          prompt: {
            en: "You need to hide the field contoso_procurementcode. Which object do you call setVisible on?",
            uk: "Потрібно приховати поле contoso_procurementcode. На якому об'єкті викликати setVisible?",
          },
          options: [
            { id: "a", text: { en: "The control: formContext.getControl(\"contoso_procurementcode\")", uk: "На контролі: formContext.getControl(\"contoso_procurementcode\")" } },
            { id: "b", text: { en: "The attribute: formContext.getAttribute(\"contoso_procurementcode\")", uk: "На атрибуті: formContext.getAttribute(\"contoso_procurementcode\")" } },
            { id: "c", text: { en: "formContext.data.entity", uk: "formContext.data.entity" } },
          ],
          correct: ["a"],
        },
        {
          id: "lookup-value",
          mode: "single",
          prompt: {
            en: "What does getValue() return for a lookup column?",
            uk: "Що повертає getValue() для lookup-стовпця?",
          },
          options: [
            { id: "a", text: { en: "An array of objects with id, name and entityType, or null", uk: "Масив об'єктів з id, name і entityType або null" } },
            { id: "b", text: { en: "The GUID as a string", uk: "GUID як рядок" } },
            { id: "c", text: { en: "The related record's name", uk: "Назву пов'язаного запису" } },
          ],
          correct: ["a"],
        },
        {
          id: "webapi",
          mode: "single",
          prompt: {
            en: "Which call reads records from a form script?",
            uk: "Який виклик читає записи зі скрипту форми?",
          },
          options: [
            { id: "a", text: { en: "Xrm.WebApi.retrieveMultipleRecords(\"contact\", \"?$select=fullname&$filter=...\")", uk: "Xrm.WebApi.retrieveMultipleRecords(\"contact\", \"?$select=fullname&$filter=...\")" } },
            { id: "b", text: { en: "A synchronous XMLHttpRequest to the SOAP endpoint", uk: "Синхронний XMLHttpRequest до SOAP-ендпоінту" } },
            { id: "c", text: { en: "IOrganizationService.RetrieveMultiple", uk: "IOrganizationService.RetrieveMultiple" } },
          ],
          correct: ["a"],
        },
        {
          id: "onsave",
          mode: "single",
          prompt: {
            en: "How does an OnSave handler stop the save when validation fails?",
            uk: "Як обробник OnSave зупиняє збереження, якщо перевірка не пройшла?",
          },
          options: [
            { id: "a", text: { en: "executionContext.getEventArgs().preventDefault(), and show a notification", uk: "executionContext.getEventArgs().preventDefault() і показати сповіщення" } },
            { id: "b", text: { en: "Return false from the handler", uk: "Повернути false з обробника" } },
            { id: "c", text: { en: "Throw an InvalidPluginExecutionException", uk: "Кинути InvalidPluginExecutionException" } },
          ],
          correct: ["a"],
        },
        {
          id: "form-type",
          mode: "single",
          prompt: {
            en: "OnLoad logic must run only for a new, unsaved record. What do you check?",
            uk: "Логіка OnLoad має працювати лише для нового, ще не збереженого запису. Що перевірити?",
          },
          options: [
            { id: "a", text: { en: "formContext.ui.getFormType() === 1 (Create)", uk: "formContext.ui.getFormType() === 1 (Create)" } },
            { id: "b", text: { en: "Whether the URL contains \"new\"", uk: "Чи містить URL слово «new»" } },
            { id: "c", text: { en: "formContext.data.entity.getIsDirty()", uk: "formContext.data.entity.getIsDirty()" } },
          ],
          correct: ["a"],
        },
        {
          id: "navigation",
          mode: "multi",
          prompt: {
            en: "Which are Xrm.Navigation functions?",
            uk: "Які з цих функцій належать до Xrm.Navigation?",
          },
          options: [
            { id: "a", text: { en: "openAlertDialog and openConfirmDialog", uk: "openAlertDialog і openConfirmDialog" } },
            { id: "b", text: { en: "openForm", uk: "openForm" } },
            { id: "c", text: { en: "navigateTo (pages, web resources and custom pages, inline or as a dialog)", uk: "navigateTo (сторінки, веб-ресурси й custom pages, вбудовано чи як діалог)" } },
            { id: "d", text: { en: "retrieveMultipleRecords", uk: "retrieveMultipleRecords" } },
          ],
          correct: ["a", "b", "c"],
        },
      ],
    },
  ],
};

export const clientAdvancedModule: ModuleDef = {
  slug: "crm-client-advanced",
  title: { en: "Advanced Client API", uk: "Просунутий Client API" },
  slides: [
    {
      kind: "lecture",
      slug: "lookup-filtering",
      title: { en: "Filtering and setting lookups", uk: "Фільтрація та заповнення lookup-полів" },
    },
    {
      kind: "lecture",
      slug: "grids-quick-views",
      title: { en: "Subgrids, quick views and tabs", uk: "Підсітки, quick view та вкладки" },
    },
    {
      kind: "lecture",
      slug: "business-process-flows",
      title: { en: "Scripting business process flows", uk: "Скрипти для business process flows" },
    },
    { kind: "lecture", slug: "pcf-and-commands", title: { en: "PCF controls and commands", uk: "PCF-контроли та команди" } },
    {
      kind: "quiz",
      slug: "client-advanced-quiz",
      title: { en: "Advanced Client API check", uk: "Перевірка: просунутий Client API" },
      questions: [
        {
          id: "presearch",
          mode: "single",
          prompt: {
            en: "A lookup to contact must show only contacts of the account selected on the form. Which Client API calls do this?",
            uk: "Lookup на contact має показувати лише контакти акаунта, вибраного на формі. Які виклики Client API це роблять?",
          },
          options: [
            { id: "a", text: { en: "control.addPreSearch(handler), and in the handler control.addCustomFilter(fetchXmlFilter)", uk: "control.addPreSearch(handler), а в обробнику control.addCustomFilter(fetchXmlFilter)" } },
            { id: "b", text: { en: "attribute.setValue with a filter string", uk: "attribute.setValue із рядком фільтра" } },
            { id: "c", text: { en: "A RetrieveMultiple plug-in on contact", uk: "Плагін RetrieveMultiple на contact" } },
          ],
          correct: ["a"],
        },
        {
          id: "grid-refresh",
          mode: "single",
          prompt: {
            en: "After a script creates related records, how do you show them in the subgrid without reloading the form?",
            uk: "Після того як скрипт створив пов'язані записи, як показати їх у підсітці без перезавантаження форми?",
          },
          options: [
            { id: "a", text: { en: "formContext.getControl(\"contacts_grid\").refresh()", uk: "formContext.getControl(\"contacts_grid\").refresh()" } },
            { id: "b", text: { en: "location.reload()", uk: "location.reload()" } },
            { id: "c", text: { en: "It cannot be done", uk: "Це неможливо" } },
          ],
          correct: ["a"],
        },
        {
          id: "bpf",
          mode: "single",
          prompt: {
            en: "How can a script block moving a business process flow to the next stage until a condition holds?",
            uk: "Як скрипт може заблокувати перехід business process flow на наступний етап, доки не виконано умову?",
          },
          options: [
            { id: "a", text: { en: "formContext.data.process.addOnPreStageChange(handler) and preventDefault() on the event args", uk: "formContext.data.process.addOnPreStageChange(handler) і preventDefault() на аргументах події" } },
            { id: "b", text: { en: "Hide the Next Stage button with CSS", uk: "Приховати кнопку Next Stage через CSS" } },
            { id: "c", text: { en: "addOnStageChange: it runs before the move", uk: "addOnStageChange: він виконується до переходу" } },
          ],
          correct: ["a"],
        },
        {
          id: "pcf",
          mode: "multi",
          prompt: {
            en: "Which statements about PCF (Power Apps component framework) controls are true?",
            uk: "Які твердження про PCF-контроли (Power Apps component framework) правильні?",
          },
          options: [
            { id: "a", text: { en: "They are written in TypeScript and implement init, updateView, getOutputs and destroy", uk: "Їх пишуть на TypeScript, і вони реалізують init, updateView, getOutputs і destroy" } },
            { id: "b", text: { en: "They are scaffolded and built with the pac CLI and shipped in a solution", uk: "Їх створюють і збирають через pac CLI та постачають у рішенні" } },
            { id: "c", text: { en: "They can be bound to a column or to a dataset (a view or subgrid)", uk: "Їх можна прив'язати до стовпця або до набору даних (подання чи підсітки)" } },
            { id: "d", text: { en: "They run on the server inside the plug-in sandbox", uk: "Вони виконуються на сервері в пісочниці плагінів" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "quick-view",
          mode: "single",
          prompt: {
            en: "Where do you read a column shown in a quick view form of the parent account?",
            uk: "Звідки прочитати стовпець, показаний у quick view формі батьківського акаунта?",
          },
          options: [
            { id: "a", text: { en: "formContext.ui.quickForms.get(\"name\").getControl(\"column\").getAttribute().getValue(), once the quick view is loaded", uk: "formContext.ui.quickForms.get(\"name\").getControl(\"column\").getAttribute().getValue(), коли quick view завантажено" } },
            { id: "b", text: { en: "formContext.getAttribute(\"column\") on the main form", uk: "formContext.getAttribute(\"column\") на основній формі" } },
            { id: "c", text: { en: "Quick view values are not available to scripts", uk: "Значення quick view недоступні скриптам" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};

export const clientBestPracticesModule: ModuleDef = {
  slug: "crm-client-best-practices",
  title: { en: "Client API best practices", uk: "Найкращі практики Client API" },
  slides: [
    {
      kind: "lecture",
      slug: "typescript-web-resources",
      title: { en: "TypeScript, bundling and source control", uk: "TypeScript, збирання та контроль версій" },
    },
    { kind: "lecture", slug: "client-performance", title: { en: "Fast forms", uk: "Швидкі форми" } },
    { kind: "lecture", slug: "client-debugging", title: { en: "Debugging and testing scripts", uk: "Налагодження та тестування скриптів" } },
    {
      kind: "lecture",
      slug: "client-supportability",
      title: { en: "Supported code, deprecations and localization", uk: "Підтримуваний код, застарілі API та локалізація" },
    },
    {
      kind: "quiz",
      slug: "client-best-practices-quiz",
      title: { en: "Client best practices check", uk: "Перевірка: найкращі практики" },
      questions: [
        {
          id: "async",
          mode: "single",
          prompt: {
            en: "OnLoad needs data from two related tables. What is the fastest correct approach?",
            uk: "OnLoad потрібні дані з двох пов'язаних таблиць. Який найшвидший правильний підхід?",
          },
          options: [
            { id: "a", text: { en: "Start both Xrm.WebApi calls at once and await Promise.all, selecting only needed columns", uk: "Запустити обидва виклики Xrm.WebApi одночасно й чекати Promise.all, вибираючи лише потрібні стовпці" } },
            { id: "b", text: { en: "Two synchronous XMLHttpRequests one after another", uk: "Два синхронні XMLHttpRequest один за одним" } },
            { id: "c", text: { en: "Retrieve all columns so they are cached for later", uk: "Отримати всі стовпці, щоб закешувати на потім" } },
          ],
          correct: ["a"],
        },
        {
          id: "unsupported",
          mode: "multi",
          prompt: {
            en: "Which of these are unsupported customizations that can break with an update?",
            uk: "Що з цього — непідтримувані налаштування, які можуть зламатися з оновленням?",
          },
          options: [
            { id: "a", text: { en: "Changing form HTML through document.getElementById or jQuery", uk: "Зміна HTML форми через document.getElementById чи jQuery" } },
            { id: "b", text: { en: "Using undocumented internal functions found in the page's scripts", uk: "Використання недокументованих внутрішніх функцій зі скриптів сторінки" } },
            { id: "c", text: { en: "formContext.getAttribute(...).setValue(...)", uk: "formContext.getAttribute(...).setValue(...)" } },
            { id: "d", text: { en: "Xrm.WebApi.retrieveRecord", uk: "Xrm.WebApi.retrieveRecord" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "debug",
          mode: "single",
          prompt: {
            en: "How can you test a changed script against a production-like environment without deploying it?",
            uk: "Як перевірити змінений скрипт на середовищі, близькому до продакшну, не розгортаючи його?",
          },
          options: [
            { id: "a", text: { en: "Redirect the web resource's URL to your local file with a proxy such as Fiddler's AutoResponder", uk: "Перенаправити URL веб-ресурсу на локальний файл через проксі, як-от AutoResponder у Fiddler" } },
            { id: "b", text: { en: "Edit the script in the browser's developer tools and save", uk: "Відредагувати скрипт у devtools браузера й зберегти" } },
            { id: "c", text: { en: "It is not possible", uk: "Це неможливо" } },
          ],
          correct: ["a"],
        },
        {
          id: "localize",
          mode: "single",
          prompt: {
            en: "How should a script show messages in the user's language?",
            uk: "Як скрипт має показувати повідомлення мовою користувача?",
          },
          options: [
            { id: "a", text: { en: "RESX web resources added to the library's dependencies, read with Xrm.Utility.getResourceString", uk: "RESX веб-ресурси в залежностях бібліотеки, які читає Xrm.Utility.getResourceString" } },
            { id: "b", text: { en: "Hard-code English and Ukrainian strings with if/else", uk: "Зашити англійські й українські рядки через if/else" } },
            { id: "c", text: { en: "Translate with an external API on every load", uk: "Перекладати зовнішнім API під час кожного завантаження" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};

export const webResourcesModule: ModuleDef = {
  slug: "crm-web-resources",
  title: { en: "HTML web resources", uk: "HTML веб-ресурси" },
  slides: [
    { kind: "lecture", slug: "html-web-resources", title: { en: "HTML web resources", uk: "HTML веб-ресурси" } },
    {
      kind: "lecture",
      slug: "web-resource-form-communication",
      title: { en: "Talking to the form and opening dialogs", uk: "Зв'язок із формою та відкриття діалогів" },
    },
    {
      kind: "lecture",
      slug: "web-resource-lifecycle",
      title: { en: "Dependencies, caching and alternatives", uk: "Залежності, кешування та альтернативи" },
    },
    {
      kind: "quiz",
      slug: "web-resources-quiz",
      title: { en: "HTML web resources check", uk: "Перевірка: HTML веб-ресурси" },
      questions: [
        {
          id: "xrm-access",
          mode: "single",
          prompt: {
            en: "An HTML web resource embedded on a form needs the form's context. What is the supported way?",
            uk: "HTML веб-ресурсу, вбудованому у форму, потрібен контекст форми. Який підтримуваний спосіб?",
          },
          options: [
            { id: "a", text: { en: "The form script calls getContentWindow() on the web resource control and passes Xrm and formContext to a function of the page", uk: "Скрипт форми викликає getContentWindow() на контролі веб-ресурсу й передає Xrm і formContext у функцію сторінки" } },
            { id: "b", text: { en: "Read parent.Xrm.Page from the iframe", uk: "Читати parent.Xrm.Page з iframe" } },
            { id: "c", text: { en: "Scrape values from the parent page's HTML", uk: "Вичитувати значення з HTML батьківської сторінки" } },
          ],
          correct: ["a"],
        },
        {
          id: "dialog",
          mode: "single",
          prompt: {
            en: "How do you open an HTML web resource as a modal dialog from a command or a form script?",
            uk: "Як відкрити HTML веб-ресурс як модальний діалог із команди чи скрипту форми?",
          },
          options: [
            { id: "a", text: { en: "Xrm.Navigation.navigateTo({ pageType: \"webresource\", webresourceName, data }, { target: 2 })", uk: "Xrm.Navigation.navigateTo({ pageType: \"webresource\", webresourceName, data }, { target: 2 })" } },
            { id: "b", text: { en: "window.showModalDialog", uk: "window.showModalDialog" } },
            { id: "c", text: { en: "Xrm.WebApi.execute", uk: "Xrm.WebApi.execute" } },
          ],
          correct: ["a"],
        },
        {
          id: "data-param",
          mode: "single",
          prompt: {
            en: "How do you pass your own values to an HTML web resource?",
            uk: "Як передати HTML веб-ресурсу власні значення?",
          },
          options: [
            { id: "a", text: { en: "In the single data query string parameter (URL-encoded), and read it in the page", uk: "В одному параметрі рядка запиту data (закодованому для URL) і прочитати його на сторінці" } },
            { id: "b", text: { en: "In any number of custom query string parameters", uk: "У будь-якій кількості власних параметрів рядка запиту" } },
            { id: "c", text: { en: "Through a global variable on the form", uk: "Через глобальну змінну форми" } },
          ],
          correct: ["a"],
        },
        {
          id: "alternative",
          mode: "single",
          prompt: {
            en: "You need a new interactive widget on a form, bound to a column. What is the modern choice instead of an HTML web resource?",
            uk: "Потрібен новий інтерактивний віджет на формі, прив'язаний до стовпця. Що сучасне обрати замість HTML веб-ресурсу?",
          },
          options: [
            { id: "a", text: { en: "A PCF field control", uk: "PCF field-контрол" } },
            { id: "b", text: { en: "A Silverlight web resource", uk: "Silverlight веб-ресурс" } },
            { id: "c", text: { en: "An iframe to an external site with the record id in the URL", uk: "Iframe на зовнішній сайт з id запису в URL" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};

export const sampleAppModule: ModuleDef = {
  slug: "crm-sample-app",
  title: { en: "Sample application", uk: "Приклад застосунку" },
  slides: [
    {
      kind: "lecture",
      slug: "sample-application",
      title: { en: "Putting it together: an account credit check", uk: "Усе разом: перевірка кредиту акаунта" },
    },
  ],
};
