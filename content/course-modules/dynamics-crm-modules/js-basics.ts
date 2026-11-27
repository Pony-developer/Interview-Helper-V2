import type { ModuleDef } from "../types";

export const jsBasicsModule: ModuleDef = {
  slug: "crm-js-basics",
  title: { en: "JavaScript basics for form scripts", uk: "Основи JavaScript для скриптів форм" },
  slides: [
    {
      kind: "lecture",
      slug: "js-for-forms",
      title: { en: "The JavaScript you need for form scripts", uk: "JavaScript, потрібний для скриптів форм" },
    },
    {
      kind: "lecture",
      slug: "first-form-script",
      title: { en: "Your first form script, step by step", uk: "Ваш перший скрипт форми крок за кроком" },
    },
    {
      kind: "quiz",
      slug: "js-basics-quiz",
      title: { en: "JavaScript basics check", uk: "Перевірка: основи JavaScript" },
      questions: [
        {
          id: "context",
          mode: "single",
          prompt: {
            en: "How should a form script get the form context?",
            uk: "Як скрипт форми має отримувати контекст форми?",
          },
          options: [
            { id: "a", text: { en: "From the execution context: executionContext.getFormContext(), with 'Pass execution context' ticked", uk: "З контексту виконання: executionContext.getFormContext(), з увімкненим «Pass execution context»" } },
            { id: "b", text: { en: "From the global Xrm.Page object", uk: "З глобального об'єкта Xrm.Page" } },
            { id: "c", text: { en: "With document.getElementById on the form's HTML", uk: "Через document.getElementById у HTML форми" } },
          ],
          correct: ["a"],
        },
        {
          id: "lookup-value",
          mode: "single",
          prompt: {
            en: "What does formContext.getAttribute(\"parentcustomerid\").getValue() return for a filled lookup?",
            uk: "Що повертає formContext.getAttribute(\"parentcustomerid\").getValue() для заповненого lookup?",
          },
          options: [
            { id: "a", text: { en: "An array with one object: { id, name, entityType }", uk: "Масив з одним об'єктом: { id, name, entityType }" } },
            { id: "b", text: { en: "The GUID as a string", uk: "GUID як рядок" } },
            { id: "c", text: { en: "The name of the related record", uk: "Назву пов'язаного запису" } },
          ],
          correct: ["a"],
        },
        {
          id: "strict-equal",
          mode: "single",
          prompt: {
            en: "Which comparison should you use in JavaScript to compare a choice value with 2?",
            uk: "Яке порівняння використати в JavaScript, щоб порівняти значення choice з 2?",
          },
          options: [
            { id: "a", text: { en: "value === 2", uk: "value === 2" } },
            { id: "b", text: { en: "value == \"2\"", uk: "value == \"2\"" } },
            { id: "c", text: { en: "value = 2", uk: "value = 2" } },
          ],
          correct: ["a"],
        },
        {
          id: "async",
          mode: "single",
          prompt: {
            en: "Xrm.WebApi.retrieveRecord returns a Promise. How do you use the result?",
            uk: "Xrm.WebApi.retrieveRecord повертає Promise. Як використати результат?",
          },
          options: [
            { id: "a", text: { en: "await it inside an async function (or use .then), and handle errors with try/catch", uk: "Чекати його через await в async-функції (або .then) й обробляти помилки через try/catch" } },
            { id: "b", text: { en: "Read the record from the variable on the next line without waiting", uk: "Прочитати запис зі змінної на наступному рядку без очікування" } },
            { id: "c", text: { en: "Call it in a while loop until it returns", uk: "Викликати його в циклі while, доки не поверне" } },
          ],
          correct: ["a"],
        },
        {
          id: "namespace",
          mode: "single",
          prompt: {
            en: "Why do form scripts put their functions in a namespace object such as Contoso.Account?",
            uk: "Навіщо скрипти форм кладуть свої функції в об'єкт простору імен на кшталт Contoso.Account?",
          },
          options: [
            { id: "a", text: { en: "So functions from different libraries on the same form don't overwrite each other", uk: "Щоб функції з різних бібліотек на одній формі не перезаписували одна одну" } },
            { id: "b", text: { en: "Because the platform only calls functions with a dot in their name", uk: "Бо платформа викликає лише функції з крапкою в імені" } },
            { id: "c", text: { en: "It makes the script run faster", uk: "Так скрипт працює швидше" } },
          ],
          correct: ["a"],
        },
        {
          id: "set-value",
          mode: "multi",
          prompt: {
            en: "Which statements about setting values from a form script are true?",
            uk: "Які твердження про задання значень зі скрипта форми правильні?",
          },
          options: [
            { id: "a", text: { en: "setValue on a choice takes the number, not the label", uk: "setValue для choice приймає число, а не мітку" } },
            { id: "b", text: { en: "setValue does not fire the column's OnChange; call fireOnChange() if needed", uk: "setValue не запускає OnChange стовпця; за потреби викличте fireOnChange()" } },
            { id: "c", text: { en: "setRequiredLevel(\"required\") makes the column required on the form", uk: "setRequiredLevel(\"required\") робить стовпець обов'язковим на формі" } },
            { id: "d", text: { en: "A value set by a script is checked by plug-ins only if the form is not saved", uk: "Значення, задане скриптом, перевіряється плагінами лише якщо форму не зберегли" } },
          ],
          correct: ["a", "b", "c"],
        },
      ],
    },
  ],
};
