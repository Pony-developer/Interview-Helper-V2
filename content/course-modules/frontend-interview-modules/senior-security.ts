import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 105–111 of the Senior list: security. */
export const seniorSecurityQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-security-quiz",
  title: { en: "Security", uk: "Безпека" },
  questions: [
    question(
      "web-security",
      ["Which practices are part of securing a web application?", "Які практики входять до забезпечення безпеки вебзастосунку?"],
      [
        ["Validate input and encode output everywhere; never trust the client", "Валідувати вхідні дані й екранувати вихідні всюди; ніколи не довіряти клієнту"],
        [
          "HTTPS everywhere, secure cookie flags and security headers (CSP, HSTS, `X-Content-Type-Options`)",
          "HTTPS усюди, безпечні прапорці cookies і заголовки безпеки (CSP, HSTS, `X-Content-Type-Options`)",
        ],
        ["Hiding the admin page's URL as the only protection", "Приховування адреси адмінки як єдиний захист"],
        ["Keeping dependencies updated and scanning them for known vulnerabilities", "Оновлювати залежності й перевіряти їх на відомі вразливості"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "xss-csrf",
      ["Which pairing of attack and defense is correct?", "Яке поєднання атаки та захисту правильне?"],
      [
        ["Both are prevented by HTTPS alone", "Від обох захищає лише HTTPS"],
        ["CSRF is solved by escaping HTML output", "CSRF вирішується екрануванням HTML-виводу"],
        [
          "XSS injects a script into a page that other users see (defense: escape output, avoid `innerHTML`, use a Content Security Policy); CSRF makes a signed-in user's browser send an unwanted request to your site (defense: `SameSite` cookies, CSRF tokens)",
          "XSS вбудовує скрипт у сторінку, яку бачать інші користувачі (захист: екранувати вивід, уникати `innerHTML`, Content Security Policy); CSRF змушує браузер користувача, що увійшов, надіслати небажаний запит на ваш сайт (захист: cookies із `SameSite`, CSRF-токени)",
        ],
        ["XSS and CSRF are two names for the same attack", "XSS і CSRF — дві назви однієї атаки"],
      ],
      "c",
    ),
    question(
      "api-security",
      ["Which of these are best practices for API security?", "Що з цього — найкращі практики безпеки API?"],
      [
        ["Return detailed stack traces to the client to help debugging", "Повертати клієнту детальні stack trace, щоб полегшити налагодження"],
        ["Authenticate every request and check authorization for each resource on the server", "Автентифікувати кожен запит і перевіряти права на кожен ресурс на сервері"],
        ["Rate limiting and input validation against a schema", "Обмеження частоти запитів і валідація вхідних даних за схемою"],
        ["Least-privilege tokens with short lifetimes", "Токени з мінімальними правами та коротким терміном дії"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "sql-injection",
      ["What is the main protection against SQL injection?", "Який головний захист від SQL-ін'єкцій?"],
      [
        ["Escaping quotes in the frontend", "Екранування лапок на фронтенді"],
        [
          "Parameterized queries (prepared statements), or an ORM that uses them, so user input is never concatenated into SQL; plus database accounts with the least privileges",
          "Параметризовані запити (prepared statements) або ORM, що їх використовує, тож дані користувача ніколи не склеюються з SQL; плюс облікові записи бази даних із мінімальними правами",
        ],
        ["Hiding database error messages", "Приховування повідомлень про помилки бази даних"],
        ["Sending forms with POST instead of GET", "Надсилати форми через POST замість GET"],
      ],
      "b",
    ),
    question(
      "cors-config",
      ["How should CORS be configured for an API that your web app calls with cookies?", "Як налаштувати CORS для API, яке ваш вебзастосунок викликає з cookies?"],
      [
        ["`Access-Control-Allow-Origin: *` together with credentials", "`Access-Control-Allow-Origin: *` разом з обліковими даними (credentials)"],
        ["Turn CORS off in the browser", "Вимкнути CORS у браузері"],
        ["Any setting is fine, because CORS protects the server from all attacks", "Будь-яке налаштування підходить, бо CORS захищає сервер від усіх атак"],
        [
          "Allow only specific trusted origins in `Access-Control-Allow-Origin`, send `Access-Control-Allow-Credentials: true`, and never combine credentials with `*` or blindly echo the `Origin` header back",
          "Дозволяти в `Access-Control-Allow-Origin` лише конкретні довірені origin, надсилати `Access-Control-Allow-Credentials: true` і ніколи не поєднувати credentials із `*` та не віддзеркалювати заголовок `Origin` бездумно",
        ],
      ],
      "d",
    ),
    question(
      "secrets",
      ["How should secrets such as API keys be managed?", "Як керувати секретами, як-от ключами API?"],
      [
        [
          "Keep them out of the repository and the frontend bundle, store them in environment variables or a secrets manager (Vault, a cloud key store), grant access by least privilege and rotate them",
          "Не тримати їх у репозиторії та фронтенд-бандлі, зберігати в змінних оточення чи менеджері секретів (Vault, хмарне сховище ключів), давати доступ за принципом мінімальних прав і регулярно змінювати",
        ],
        ["Commit them to a private repository", "Комітити їх у приватний репозиторій"],
        ["Put them in public frontend environment variables", "Класти їх у публічні змінні оточення фронтенду"],
        ["Share them in the team chat", "Ділитися ними в командному чаті"],
      ],
      "a",
    ),
    question(
      "security-checklist",
      ["Which items belong on a project security checklist?", "Що має бути в чеклісті безпеки проєкту?"],
      [
        ["A dependency audit and automated updates", "Аудит залежностей і автоматичні оновлення"],
        ["Security headers, HTTPS and secure cookie flags", "Заголовки безпеки, HTTPS і безпечні прапорці cookies"],
        ["A review of authentication, authorization and input validation", "Перевірка автентифікації, авторизації та валідації вхідних даних"],
        ["Turning off all logging so attackers can't read it", "Вимкнути все логування, щоб зловмисники не змогли його прочитати"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** Questions 112–115 of the Senior list: accessibility. */
export const seniorAccessibilityQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-accessibility-quiz",
  title: { en: "Accessibility", uk: "Accessibility" },
  questions: [
    question(
      "aria",
      ["What is true about ARIA?", "Що правильно про ARIA?"],
      [
        ["ARIA adds keyboard behavior to elements automatically", "ARIA автоматично додає елементам поведінку з клавіатури"],
        [
          "ARIA adds roles (`role=\"dialog\"`), states (`aria-expanded`) and properties (`aria-label`, `aria-describedby`) for assistive technology; it changes no behavior, and the first rule is to prefer native HTML elements",
          "ARIA додає ролі (`role=\"dialog\"`), стани (`aria-expanded`) і властивості (`aria-label`, `aria-describedby`) для допоміжних технологій; вона не змінює поведінку, а перше правило — надавати перевагу нативним HTML-елементам",
        ],
        ["ARIA is a way to style elements", "ARIA — це спосіб стилізувати елементи"],
        ["Every `<button>` must also have `role=\"button\"`", "Кожен `<button>` має мати ще й `role=\"button\"`"],
      ],
      "b",
    ),
    question(
      "accessible-modal",
      ["What does an accessible modal dialog need?", "Що потрібно доступному модальному вікну?"],
      [
        [
          "`role=\"dialog\"` and `aria-modal=\"true\"` with a label (`aria-labelledby`), or the native `<dialog>` opened with `showModal()`",
          "`role=\"dialog\"` і `aria-modal=\"true\"` з підписом (`aria-labelledby`) або нативний `<dialog>`, відкритий через `showModal()`",
        ],
        ["To open on page load, with no close button", "Відкриватися під час завантаження сторінки й не мати кнопки закриття"],
        ["Focus moves into the dialog, stays inside it, and returns to the trigger when it closes", "Фокус переходить у вікно, лишається в ньому й повертається на кнопку, що його відкрила, після закриття"],
        ["It closes with Escape, and the page behind it is inert", "Воно закривається клавішею Escape, а сторінка за ним неактивна"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "a11y-law",
      ["Which statement about accessibility law is correct?", "Яке твердження про законодавство щодо доступності правильне?"],
      [
        ["Accessibility is never a legal requirement, only a recommendation", "Доступність ніколи не є вимогою закону, лише рекомендацією"],
        ["Only the US has accessibility laws", "Закони про доступність є лише у США"],
        [
          "Many markets require it by law, usually by referring to WCAG: in the US the ADA and Section 508, in the EU the European Accessibility Act (applied from June 2025) with EN 301 549, in the UK the Equality Act, in Canada the Accessible Canada Act and Ontario's AODA; Ukraine has adopted EN 301 549 as a national standard",
          "Багато ринків вимагають її законом, зазвичай посилаючись на WCAG: у США — ADA та Section 508, в ЄС — European Accessibility Act (застосовується з червня 2025 року) разом з EN 301 549, у Великій Британії — Equality Act, у Канаді — Accessible Canada Act та AODA в Онтаріо; Україна запровадила EN 301 549 як національний стандарт",
        ],
        ["The laws everywhere apply only to government websites", "Закони всюди стосуються лише урядових сайтів"],
      ],
      "c",
    ),
    question(
      "a11y-business-case",
      ["Which arguments make a strong business case for accessibility?", "Які аргументи роблять сильне бізнес-обґрунтування доступності?"],
      [
        ["It serves only a tiny group of people, so it is purely charity", "Вона потрібна лише крихітній групі людей, тож це суто благодійність"],
        [
          "A large share of users have a disability (the WHO estimates about 1 in 6 people), plus temporary and situational limitations",
          "Значна частка користувачів має інвалідність (за оцінкою ВООЗ, приблизно кожна шоста людина), а ще є тимчасові та ситуативні обмеження",
        ],
        ["Legal risk: lawsuits and fines under accessibility laws", "Юридичний ризик: позови й штрафи за законами про доступність"],
        ["Accessible sites tend to have better SEO, usability and conversion for everyone", "Доступні сайти зазвичай мають краще SEO, зручність і конверсію для всіх"],
      ],
      ["b", "c", "d"],
    ),
  ],
};
