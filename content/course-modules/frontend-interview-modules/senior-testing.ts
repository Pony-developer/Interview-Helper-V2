import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 74–81 of the Senior list: testing. */
export const seniorTestingQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-testing-quiz",
  title: { en: "Testing", uk: "Тестування" },
  questions: [
    question(
      "large-system-tests",
      ["Which split of tests is usually recommended for a large system?", "Який розподіл тестів зазвичай рекомендують для великої системи?"],
      [
        ["Only end-to-end tests", "Лише end-to-end тести"],
        [
          "Many fast unit tests, fewer integration tests and a few end-to-end tests on critical paths (the test pyramid, or the \"trophy\" that leans on integration tests)",
          "Багато швидких юніт-тестів, менше інтеграційних і кілька end-to-end тестів на критичних сценаріях (піраміда тестування або «трофей» з наголосом на інтеграційних)",
        ],
        ["Only manual testing", "Лише ручне тестування"],
        ["100% unit coverage and no other tests", "100% покриття юніт-тестами й жодних інших тестів"],
      ],
      "b",
    ),
    question(
      "custom-test-utils",
      ["Why write a custom `render` helper for component tests?", "Навіщо писати власний хелпер `render` для тестів компонентів?"],
      [
        ["To skip assertions", "Щоб пропускати перевірки"],
        ["To make tests run on the server", "Щоб тести виконувалися на сервері"],
        [
          "To wrap components once in the providers they need (router, store, theme, query client), so every test stays short and consistent",
          "Щоб один раз обгорнути компоненти в потрібні провайдери (роутер, сховище, тема, query client), і кожен тест лишався коротким та одноманітним",
        ],
        ["To replace Testing Library entirely", "Щоб повністю замінити Testing Library"],
      ],
      "c",
    ),
    question(
      "test-data",
      ["How do you organize test data well?", "Як добре організувати тестові дані?"],
      [
        ["Factories or builders that create valid objects with overrides, such as `buildUser({ role: 'admin' })`", "Фабрики чи білдери, що створюють валідні об'єкти з перевизначеннями, як-от `buildUser({ role: 'admin' })`"],
        ["Fixtures for fixed scenarios, kept next to the tests", "Фікстури для фіксованих сценаріїв поруч із тестами"],
        ["One mutable object shared by all tests", "Один змінюваний об'єкт, спільний для всіх тестів"],
        ["Mock Service Worker handlers with API responses for each scenario", "Обробники Mock Service Worker з відповідями API для кожного сценарію"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "ci-testing",
      ["How are tests usually built into CI/CD?", "Як тести зазвичай вбудовують у CI/CD?"],
      [
        ["Tests run only after the production deploy", "Тести запускаються лише після деплою на продакшн"],
        ["Tests run only on developers' machines", "Тести запускаються лише на машинах розробників"],
        ["Tests run once a week", "Тести запускаються раз на тиждень"],
        [
          "Lint, type check and unit tests run on every pull request, e2e tests run against a preview deployment, and merging is blocked if any check fails",
          "Лінтер, перевірка типів і юніт-тести запускаються на кожен pull request, e2e-тести — на preview-розгортанні, а злиття блокується, якщо будь-яка перевірка не пройшла",
        ],
      ],
      "d",
    ),
    question(
      "automation-how",
      ["What is a sound approach to test automation?", "Який підхід до автоматизації тестування обґрунтований?"],
      [
        [
          "Automate stable, repeatable, high-value checks first; write the tests in the project's language (TypeScript) with the team's tools, keep them deterministic and run them in CI",
          "Спершу автоматизувати стабільні, повторювані й цінні перевірки; писати тести мовою проєкту (TypeScript) інструментами команди, робити їх детермінованими й запускати в CI",
        ],
        ["Automate everything, including exploratory testing", "Автоматизувати все, зокрема дослідницьке тестування"],
        ["Only record and replay clicks", "Лише записувати й відтворювати кліки"],
        ["Use a separate language that nobody on the team knows", "Використати окрему мову, якої ніхто в команді не знає"],
      ],
      "a",
    ),
    question(
      "consistent-environments",
      ["How do you keep test results consistent across environments?", "Як забезпечити однакові результати тестів у різних середовищах?"],
      [
        ["Pin dependency versions with a lockfile, and pin the runtime version", "Фіксувати версії залежностей через lock-файл і версію середовища виконання"],
        ["Run the tests in containers or the same CI images", "Запускати тести в контейнерах чи тих самих CI-образах"],
        ["Depend on live production data", "Залежати від живих даних із продакшну"],
        ["Control time, randomness and the network in tests (fake timers, seeded data, mocked APIs)", "Контролювати в тестах час, випадковість і мережу (фейкові таймери, дані із seed, імітовані API)"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "release-criteria",
      ["Which of these are typical green-light criteria for a release?", "Що з цього — типові критерії «зеленого світла» для релізу?"],
      [
        ["All automated checks pass and there are no open critical or blocker bugs", "Усі автоматичні перевірки пройдено, і немає відкритих критичних чи блокувальних багів"],
        ["Key metrics and performance budgets are met", "Ключові метрики та бюджети продуктивності дотримано"],
        ["Acceptance criteria are verified and a rollback plan is ready", "Критерії приймання перевірено, а план відкату готовий"],
        ["The deadline has arrived", "Настав дедлайн"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "chaos-engineering",
      ["How can chaos engineering be applied to the frontend?", "Як можна застосувати chaos engineering на фронтенді?"],
      [
        ["Randomly delete code in production", "Випадково видаляти код на продакшні"],
        ["Ship without tests", "Випускати без тестів"],
        [
          "Deliberately inject failures, such as slow or failing API responses, offline mode or a broken third-party script, to check that the UI degrades gracefully and recovers",
          "Навмисно вносити збої, як-от повільні чи невдалі відповіді API, режим офлайн чи зламаний сторонній скрипт, щоб перевірити, що UI коректно деградує й відновлюється",
        ],
        ["It cannot be applied to the frontend", "На фронтенді це неможливо застосувати"],
      ],
      "c",
    ),
  ],
};
