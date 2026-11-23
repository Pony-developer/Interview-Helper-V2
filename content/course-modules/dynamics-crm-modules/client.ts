import type { ModuleDef } from "../types";

export const clientModule: ModuleDef = {
  slug: "crm-client",
  title: { en: "Client-side development", uk: "Клієнтська розробка" },
  slides: [
    { kind: "lecture", slug: "form-scripting", title: { en: "Form scripts and the Client API", uk: "Скрипти форм і Client API" } },
    { kind: "lecture", slug: "pcf-and-commands", title: { en: "PCF controls and commands", uk: "PCF-контроли та команди" } },
    {
      kind: "quiz",
      slug: "client-quiz",
      title: { en: "Client-side check", uk: "Перевірка: клієнтська частина" },
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
      ],
    },
  ],
};
