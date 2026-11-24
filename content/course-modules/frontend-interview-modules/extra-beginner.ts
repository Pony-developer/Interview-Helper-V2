import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–20 of the additional list: beginner level. */
export const extraBeginnerQuiz: SlideDef = {
  kind: "quiz",
  slug: "extra-beginner-quiz",
  title: { en: "Beginner", uk: "Початковий рівень" },
  questions: [
    question(
      "what-is-html",
      ["What is HTML?", "Що таке HTML?"],
      [
        ["A programming language that runs on the server", "Мова програмування, що виконується на сервері"],
        [
          "A markup language that describes the structure and meaning of a web page's content with tags",
          "Мова розмітки, що за допомогою тегів описує структуру та зміст вмісту вебсторінки",
        ],
        ["A language for styling pages", "Мова для стилізації сторінок"],
        ["A database query language", "Мова запитів до баз даних"],
      ],
      "b",
    ),
    question(
      "b-vs-strong",
      ["What is the difference between `<b>` and `<strong>`?", "Яка різниця між `<b>` і `<strong>`?"],
      [
        ["There is no difference", "Різниці немає"],
        ["`<b>` is deprecated in HTML5", "`<b>` застарів в HTML5"],
        [
          "Both look bold by default, but `<strong>` marks the text as important (screen readers and search engines can use that), while `<b>` only draws attention without extra meaning",
          "За замовчуванням обидва жирні, але `<strong>` позначає текст як важливий (цим можуть користуватися скринрідери й пошукові системи), а `<b>` лише привертає увагу без додаткового змісту",
        ],
        ["`<strong>` only makes the text bigger", "`<strong>` лише збільшує текст"],
      ],
      "c",
    ),
    question(
      "meta-tags",
      [
        "What does `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">` do?",
        "Що робить `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">`?",
      ],
      [
        [
          "Tells mobile browsers to use the device width as the page width instead of a zoomed-out desktop width, so responsive styles work",
          "Каже мобільним браузерам брати ширину пристрою як ширину сторінки, а не зменшену десктопну, тож адаптивні стилі працюють",
        ],
        ["Shows a viewport frame around the page", "Показує рамку вікна перегляду навколо сторінки"],
        ["Sets the page title", "Задає заголовок сторінки"],
        ["Blocks zooming completely", "Повністю блокує масштабування"],
      ],
      "a",
    ),
    question(
      "what-is-css",
      ["What does \"cascading\" mean in Cascading Style Sheets?", "Що означає «каскадні» в назві Cascading Style Sheets?"],
      [
        ["Styles can only be written in one file", "Стилі можна писати лише в одному файлі"],
        ["CSS animations fall down the page like a waterfall", "CSS-анімації спадають сторінкою, як водоспад"],
        ["Each rule applies only to the first matching element", "Кожне правило застосовується лише до першого відповідного елемента"],
        [
          "When several rules target the same element, the browser picks the winner by origin and importance, specificity and source order",
          "Коли кілька правил стосуються одного елемента, браузер обирає переможця за походженням і важливістю, специфічністю та порядком у коді",
        ],
      ],
      "d",
    ),
    question(
      "include-css",
      ["Which of these are ways to include CSS in a page?", "Які з цих способів підключають CSS до сторінки?"],
      [
        ["An external file with `<link rel=\"stylesheet\" href=\"styles.css\">`", "Зовнішній файл через `<link rel=\"stylesheet\" href=\"styles.css\">`"],
        ["A `<style>` block in `<head>`", "Блок `<style>` у `<head>`"],
        ["A `<css src=\"styles.css\">` tag", "Тег `<css src=\"styles.css\">`"],
        ["An inline `style` attribute on an element", "Inline-атрибут `style` на елементі"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "what-is-js",
      ["Which statement about JavaScript is true?", "Яке твердження про JavaScript правильне?"],
      [
        [
          "It is a dynamically typed, single-threaded language with an event loop that runs in browsers and, through Node.js and similar runtimes, on servers",
          "Це динамічно типізована однопотокова мова з event loop, яка працює в браузерах, а через Node.js і схожі середовища — і на серверах",
        ],
        ["It is a simplified version of Java", "Це спрощена версія Java"],
        ["It runs only in the browser", "Вона працює лише в браузері"],
        ["It must be compiled to machine code before the browser can run it", "Її треба скомпілювати в машинний код, перш ніж браузер зможе її виконати"],
      ],
      "a",
    ),
    question(
      "what-is-react",
      ["What is React?", "Що таке React?"],
      [
        ["A full framework with a router, HTTP client and forms built in", "Повноцінний фреймворк із вбудованими роутером, HTTP-клієнтом і формами"],
        ["A CSS framework", "CSS-фреймворк"],
        [
          "A JavaScript library from Meta for building user interfaces from components, where the UI is a function of state",
          "JavaScript-бібліотека від Meta для побудови інтерфейсів із компонентів, де UI є функцією від стану",
        ],
        ["A database for frontend apps", "База даних для фронтенд-застосунків"],
      ],
      "c",
    ),
    question(
      "props-vs-state",
      ["How do props differ from state in React?", "Чим props відрізняються від state у React?"],
      [
        ["They are two names for the same thing", "Це дві назви однієї речі"],
        [
          "Props are passed in by the parent and are read-only for the component; state is owned by the component and changed with its setter, which triggers a re-render",
          "Props передає батьківський компонент, і для компонента вони лише для читання; state належить самому компоненту й змінюється через свій сеттер, що запускає перерендер",
        ],
        ["A component may freely change its own props", "Компонент може вільно змінювати власні props"],
        ["State is shared between all components automatically", "State автоматично спільний для всіх компонентів"],
      ],
      "b",
    ),
    question(
      "jsx",
      ["Which statement about JSX is true?", "Яке твердження про JSX правильне?"],
      [
        ["Browsers run JSX natively", "Браузери виконують JSX нативно"],
        ["JSX is a separate templating language unrelated to JavaScript", "JSX — окрема мова шаблонів, не пов'язана з JavaScript"],
        ["In JSX you write `class` and `for` exactly as in HTML", "У JSX пишуть `class` і `for` точно як в HTML"],
        [
          "It is a syntax extension that a compiler (Babel, esbuild, TypeScript) turns into function calls that create elements; expressions go in `{}`, and attributes are camelCase, like `className`",
          "Це розширення синтаксису, яке компілятор (Babel, esbuild, TypeScript) перетворює на виклики функцій, що створюють елементи; вирази пишуть у `{}`, а атрибути — у camelCase, як-от `className`",
        ],
      ],
      "d",
    ),
    question(
      "what-is-angular",
      ["What is Angular?", "Що таке Angular?"],
      [
        [
          "A full framework from Google written in TypeScript, with components, dependency injection, a router, forms and an HTTP client out of the box",
          "Повноцінний фреймворк від Google на TypeScript із компонентами, впровадженням залежностей, роутером, формами та HTTP-клієнтом з коробки",
        ],
        ["The new name of jQuery", "Нова назва jQuery"],
        ["A UI library from Meta", "UI-бібліотека від Meta"],
        ["A CSS preprocessor", "CSS-препроцесор"],
      ],
      "a",
    ),
    question(
      "angularjs-vs-angular",
      ["How is AngularJS different from Angular?", "Чим AngularJS відрізняється від Angular?"],
      [
        ["They are the same framework under two names", "Це той самий фреймворк під двома назвами"],
        ["Angular is the older one, AngularJS the newer one", "Angular старіший, а AngularJS новіший"],
        [
          "AngularJS (1.x, 2010) is JavaScript with controllers and `$scope`, now end-of-life; Angular (2+, 2016) is a full rewrite in TypeScript with components, a CLI and ahead-of-time compilation",
          "AngularJS (1.x, 2010) — це JavaScript із контролерами та `$scope`, і його підтримку вже припинено; Angular (2+, 2016) — повністю переписаний фреймворк на TypeScript із компонентами, CLI та попередньою (AOT) компіляцією",
        ],
        ["AngularJS is Angular for mobile apps", "AngularJS — це Angular для мобільних застосунків"],
      ],
      "c",
    ),
    question(
      "angular-components",
      ["What makes up an Angular component?", "З чого складається компонент Angular?"],
      [
        ["Only an HTML file", "Лише HTML-файл"],
        [
          "A TypeScript class with the `@Component` decorator, which sets its `selector`, template and styles",
          "Клас на TypeScript із декоратором `@Component`, що задає його `selector`, шаблон і стилі",
        ],
        ["A function that returns JSX", "Функція, що повертає JSX"],
        ["A `.vue` single-file component", "Однофайловий компонент `.vue`"],
      ],
      "b",
    ),
    question(
      "two-way-binding",
      ["What does `<input [(ngModel)]=\"name\">` do in Angular?", "Що робить `<input [(ngModel)]=\"name\">` в Angular?"],
      [
        ["It displays `name` once and never updates it", "Показує `name` один раз і більше не оновлює"],
        ["It only listens to input events", "Лише слухає події введення"],
        ["It is a syntax error", "Це синтаксична помилка"],
        [
          "Two-way binding: the input shows the component's `name`, and typing updates `name` (property binding `[]` plus event binding `()`)",
          "Двостороннє зв'язування: поле показує `name` компонента, а введення оновлює `name` (зв'язування властивості `[]` плюс зв'язування події `()`)",
        ],
      ],
      "d",
    ),
    question(
      "angular-services",
      ["What is an Angular service for?", "Для чого потрібен сервіс в Angular?"],
      [
        [
          "A class marked `@Injectable` that holds shared logic or data, such as API calls or authentication, and is injected into components through dependency injection; with `providedIn: 'root'` it is a single shared instance",
          "Клас із позначкою `@Injectable`, що містить спільну логіку чи дані, як-от виклики API чи автентифікацію, і впроваджується в компоненти через DI; з `providedIn: 'root'` це один спільний екземпляр",
        ],
        ["Rendering the page on the server", "Рендеринг сторінки на сервері"],
        ["Styling components", "Стилізація компонентів"],
        ["Defining routes", "Опис маршрутів"],
      ],
      "a",
    ),
    question(
      "angular-pipes",
      ["What does `{{ price | currency:'EUR' }}` do in an Angular template?", "Що робить `{{ price | currency:'EUR' }}` у шаблоні Angular?"],
      [
        ["Sends the price to the server", "Надсилає ціну на сервер"],
        ["Divides the price by the exchange rate", "Ділить ціну на курс валют"],
        [
          "Passes `price` through the `currency` pipe, which formats it for display (for example as €12.50) without changing the component's data",
          "Пропускає `price` через pipe `currency`, який форматує значення для показу (наприклад, як €12.50), не змінюючи даних компонента",
        ],
        ["Creates a pipeline of HTTP requests", "Створює конвеєр HTTP-запитів"],
      ],
      "c",
    ),
    question(
      "what-is-vue",
      ["What is Vue.js?", "Що таке Vue.js?"],
      [
        ["A framework created by Google", "Фреймворк, створений Google"],
        [
          "A progressive JavaScript framework for user interfaces, created by Evan You: you can add it to part of a page or build a whole SPA, with reactive data and components",
          "Прогресивний JavaScript-фреймворк для інтерфейсів, створений Еваном Ю: його можна додати до частини сторінки або побудувати на ньому цілий SPA, з реактивними даними й компонентами",
        ],
        ["A server-side framework for PHP", "Серверний фреймворк для PHP"],
        ["A CSS library", "CSS-бібліотека"],
      ],
      "b",
    ),
    question(
      "vue-props",
      ["Which statement about props in Vue is true?", "Яке твердження про props у Vue правильне?"],
      [
        ["A child should change its props directly to update the parent", "Щоб оновити батька, дочірній компонент має змінювати свої props напряму"],
        ["Props pass data from a child up to its parent", "Props передають дані від дочірнього компонента вгору до батьківського"],
        ["Props can only be strings", "Props можуть бути лише рядками"],
        [
          "Props pass data down from parent to child and are declared in the child (for example with `defineProps`); the flow is one-way, so the child emits an event instead of changing a prop",
          "Props передають дані вниз від батька до дочірнього компонента й оголошуються в дочірньому (наприклад, через `defineProps`); потік односпрямований, тож дочірній компонент надсилає подію, а не змінює prop",
        ],
      ],
      "d",
    ),
    question(
      "vue-router",
      ["What is Vue Router?", "Що таке Vue Router?"],
      [
        [
          "The official routing library for Vue: it maps URLs to components and switches views without reloading the page, with `<RouterLink>` for links and `<RouterView>` where the matched component renders",
          "Офіційна бібліотека маршрутизації для Vue: зіставляє URL з компонентами й перемикає подання без перезавантаження сторінки, з `<RouterLink>` для посилань і `<RouterView>` там, де рендериться знайдений компонент",
        ],
        ["A network router configuration tool", "Інструмент налаштування мережевого роутера"],
        ["A server that hosts Vue apps", "Сервер, що хостить Vue-застосунки"],
        ["A state management library", "Бібліотека керування станом"],
      ],
      "a",
    ),
    question(
      "git-vs-github",
      ["What is the difference between Git and GitHub?", "Яка різниця між Git і GitHub?"],
      [
        ["GitHub is the newer version of Git", "GitHub — новіша версія Git"],
        ["Git works only together with GitHub", "Git працює лише разом із GitHub"],
        [
          "Git is a distributed version control system that works locally; GitHub is a hosting service for Git repositories that adds pull requests, issues, code review and Actions",
          "Git — розподілена система контролю версій, що працює локально; GitHub — сервіс хостингу Git-репозиторіїв, який додає pull requests, issues, code review та Actions",
        ],
        ["There is no difference", "Різниці немає"],
      ],
      "c",
    ),
    question(
      "git-repository",
      ["Which statement about Git repositories is true?", "Яке твердження про Git-репозиторії правильне?"],
      [
        ["A repository can only live on a server", "Репозиторій може бути лише на сервері"],
        ["`origin` is the name of the main branch", "`origin` — це назва основної гілки"],
        ["A local repository keeps only the latest version of each file", "Локальний репозиторій зберігає лише останню версію кожного файлу"],
        [
          "A local repository on your machine holds the full history; a remote one (GitHub, GitLab) is shared with the team, usually named `origin`, and you sync with `fetch`, `pull` and `push`",
          "Локальний репозиторій на вашій машині містить повну історію; віддалений (GitHub, GitLab) спільний для команди, зазвичай називається `origin`, а синхронізуються через `fetch`, `pull` і `push`",
        ],
      ],
      "d",
    ),
  ],
};
