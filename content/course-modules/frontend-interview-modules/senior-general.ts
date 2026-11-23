import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–14 of the Senior list: general questions. */
export const seniorGeneralQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-general-quiz",
  title: { en: "General questions", uk: "Загальні запитання" },
  questions: [
    question(
      "senior-skills",
      ["What sets a Senior developer apart beyond coding skill?", "Що відрізняє Senior-розробника, крім навичок написання коду?"],
      [
        ["Making architectural decisions and explaining their trade-offs", "Ухвалює архітектурні рішення й пояснює їхні компроміси"],
        ["Owning outcomes: quality, delivery and production issues", "Відповідає за результат: якість, терміни й проблеми на продакшні"],
        ["Working alone and avoiding code review", "Працює сам і уникає code review"],
        ["Mentoring others and improving the team's processes", "Менторить інших і покращує процеси команди"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "team-communication",
      ["Which practice helps a development team work well together?", "Яка практика допомагає команді розробників добре працювати разом?"],
      [
        ["Talking only through tickets, never directly", "Спілкуватися лише через тікети й ніколи напряму"],
        ["Each developer owns code that nobody else may touch", "Кожен розробник володіє кодом, якого ніхто інший не може торкатися"],
        ["Hiding problems until the release", "Приховувати проблеми до релізу"],
        [
          "Clear agreements and transparency: small pull requests with constructive review, written decisions (for example ADRs) and raising risks early",
          "Чіткі домовленості та прозорість: невеликі pull requests із конструктивним рев'ю, записані рішення (наприклад, ADR) і раннє повідомлення про ризики",
        ],
      ],
      "d",
    ),
    question(
      "estimation",
      ["Which estimation approach is the most reliable?", "Який підхід до оцінювання найнадійніший?"],
      [
        ["One number for the whole project at kickoff, never revisited", "Одне число на весь проєкт на старті, яке ніколи не переглядають"],
        [
          "Break the work into small tasks, estimate them relatively (story points, planning poker) or as ranges, account for unknowns with a buffer, and compare with past velocity",
          "Розбити роботу на невеликі задачі, оцінювати їх відносно (story points, planning poker) чи діапазонами, закладати буфер на невідоме й звірятися з минулою швидкістю команди",
        ],
        ["Let the manager decide alone", "Нехай менеджер вирішує сам"],
        ["Double your first guess and stop there", "Подвоїти першу здогадку й на цьому зупинитися"],
      ],
      "b",
    ),
    question(
      "tech-choice",
      ["What matters when choosing technologies for a project?", "Що важливо під час вибору технологій для проєкту?"],
      [
        ["How well it fits the problem and the requirements", "Наскільки вона пасує до задачі й вимог"],
        ["The team's expertise and the hiring market", "Досвід команди та ринок найму"],
        ["Maturity, community, support and licensing", "Зрілість, спільнота, підтримка й ліцензування"],
        ["Whatever trended on social media this week", "Те, що цього тижня в тренді в соцмережах"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "mentoring",
      ["Which mentoring approach helps a junior developer grow the most?", "Який підхід до менторства найкраще допомагає джуніору рости?"],
      [
        ["Fix their code yourself, so it gets done faster", "Самому виправляти їхній код, щоб було швидше"],
        ["Leave them alone to figure everything out", "Залишити їх розбиратися з усім самостійно"],
        [
          "Pair on tasks, ask guiding questions instead of handing out answers, give gradually harder tasks and regular feedback",
          "Працювати в парі, ставити навідні запитання замість готових відповідей, давати поступово складніші задачі та регулярний фідбек",
        ],
        ["Give feedback only at the end of the quarter", "Давати фідбек лише наприкінці кварталу"],
      ],
      "c",
    ),
    question(
      "introduce-practices",
      ["How do you introduce a new technology or practice into a team?", "Як впровадити в команду нову технологію чи практику?"],
      [
        [
          "Explain the problem it solves, try it in a small pilot, measure the result, document it and adopt it gradually with the team's agreement",
          "Пояснити, яку проблему вона розв'язує, спробувати в невеликому пілоті, виміряти результат, задокументувати й поступово впроваджувати за згодою команди",
        ],
        ["Rewrite the whole project over a weekend", "Переписати весь проєкт за вихідні"],
        ["Make it mandatory without explanation", "Зробити обов'язковою без пояснень"],
        ["Wait until the team finds it on its own", "Чекати, доки команда сама її знайде"],
      ],
      "a",
    ),
    question(
      "conflicts",
      ["Two developers strongly disagree about an approach. What works best?", "Двоє розробників категорично не погоджуються щодо підходу. Що спрацює найкраще?"],
      [
        ["Always side with the more senior person", "Завжди ставати на бік старшого за посадою"],
        ["Ignore it, and it will pass", "Ігнорувати, і все минеться"],
        ["Escalate to HR straight away", "Одразу ескалювати до HR"],
        [
          "Focus on facts and goals: list the trade-offs, prototype or measure if possible, decide and record why, and keep it about the work rather than people",
          "Зосередитися на фактах і цілях: перелічити компроміси, за можливості зробити прототип чи виміряти, ухвалити рішення й записати чому, і говорити про роботу, а не про людей",
        ],
      ],
      "d",
    ),
    question(
      "frontend-future",
      ["Which trends are shaping frontend development in the next few years?", "Які тренди формують фронтенд-розробку на найближчі роки?"],
      [
        ["More rendering on the server and at the edge (server components, streaming)", "Більше рендерингу на сервері та на edge (серверні компоненти, стримінг)"],
        ["The end of JavaScript in browsers", "Кінець JavaScript у браузерах"],
        ["AI-assisted coding tools in everyday work", "Інструменти кодування з AI у щоденній роботі"],
        ["Platform features replacing libraries (view transitions, popover, anchor positioning)", "Можливості платформи, що замінюють бібліотеки (view transitions, popover, anchor positioning)"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "new-frameworks",
      ["Which of these frameworks is built on fine-grained reactivity (signals) rather than a virtual DOM?", "Який із цих фреймворків побудований на дрібнозернистій реактивності (signals), а не на віртуальному DOM?"],
      [
        ["jQuery", "jQuery"],
        ["Backbone.js", "Backbone.js"],
        ["SolidJS", "SolidJS"],
        ["AngularJS 1.x", "AngularJS 1.x"],
      ],
      "c",
    ),
    question(
      "pet-projects",
      ["What makes a pet project or open-source contribution worth mentioning in an interview?", "Що робить пет-проєкт чи внесок в опенсорс вартим згадки на співбесіді?"],
      [
        [
          "You can explain the problem, your decisions and what you learned, and show the code",
          "Ви можете пояснити задачу, свої рішення й те, чого навчилися, і показати код",
        ],
        ["Only the number of GitHub stars", "Лише кількість зірок на GitHub"],
        ["It repeats a tutorial step by step", "Він крок за кроком повторює туторіал"],
        ["It is never finished", "Він ніколи не завершений"],
      ],
      "a",
    ),
    question(
      "talks",
      ["Why can speaking at meetups be valuable for a Senior developer?", "Чому виступи на мітапах можуть бути цінними для Senior-розробника?"],
      [
        ["It replaces writing code", "Це замінює написання коду"],
        [
          "Preparing a talk deepens your understanding, builds your reputation and shares knowledge with the community",
          "Підготовка доповіді поглиблює розуміння, будує репутацію й ділиться знаннями зі спільнотою",
        ],
        ["Every company requires it", "Цього вимагає кожна компанія"],
        ["It has no value", "Це не має цінності"],
      ],
      "b",
    ),
    question(
      "communities",
      ["What is a good way to share professional knowledge regularly?", "Який добрий спосіб регулярно ділитися професійними знаннями?"],
      [
        ["Keep knowledge to yourself to stay irreplaceable", "Тримати знання при собі, щоб лишатися незамінним"],
        ["Only comment on other people's mistakes", "Лише коментувати чужі помилки"],
        [
          "Write posts or internal tech notes, answer questions in communities, and give internal talks or demos",
          "Писати дописи чи внутрішні технічні нотатки, відповідати на запитання в спільнотах і робити внутрішні доповіді чи демо",
        ],
        ["There is no need to share anything", "Ділитися нічим не потрібно"],
      ],
      "c",
    ),
    question(
      "learning-sources",
      ["Which of these are good sources for keeping up with frontend?", "Які з цього — добрі джерела, щоб стежити за фронтендом?"],
      [
        ["Newsletters and blogs such as Frontend Focus, web.dev and Smashing Magazine", "Розсилки й блоги, як-от Frontend Focus, web.dev і Smashing Magazine"],
        ["Podcasts such as Syntax", "Подкасти, як-от Syntax"],
        ["Random memes with no sources", "Випадкові меми без джерел"],
        ["Conference talks, for example from JSConf or CSS Day", "Доповіді з конференцій, наприклад JSConf чи CSS Day"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "new-tools",
      ["What should you consider before recommending a new tool to the team?", "Що варто врахувати, перш ніж рекомендувати команді новий інструмент?"],
      [
        ["Only whether it is new", "Лише те, чи він новий"],
        ["How many stars it has on GitHub", "Скільки в нього зірок на GitHub"],
        [
          "Which concrete problem it solves, how mature and maintained it is, the cost of migrating, and how it fits the existing stack",
          "Яку конкретну проблему він розв'язує, наскільки він зрілий і підтримуваний, яка ціна переходу і як він вписується в наявний стек",
        ],
        ["Whether its logo looks nice", "Чи гарний у нього логотип"],
      ],
      "c",
    ),
  ],
};
