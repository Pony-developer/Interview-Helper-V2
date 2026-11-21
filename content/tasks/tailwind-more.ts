import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "tw-jit-scanning",
    ["tailwind", w("vite", 0.3)],
    2,
    75,
    ["How Tailwind generates classes", "Як Tailwind генерує класи"],
    ["Why does Tailwind's build step only find class names written out in full in your source files?", "Чому крок збирання Tailwind знаходить лише назви класів, записані повністю у ваших вихідних файлах?"],
    [
      ["It scans your files for literal class names and generates CSS only for those, so names built at runtime, like `text-${color}-500`, are never generated", "Він шукає буквальні назви класів у ваших файлах і генерує CSS лише для них, тож назви, складені під час виконання, як `text-${color}-500`, ніколи не створюються"],
      ["It runs your JavaScript in a sandbox to see which classes you use", "Він запускає ваш JavaScript у пісочниці, щоб побачити, які класи ви використовуєте"],
      ["It downloads class definitions from a CDN on every build", "Він завантажує визначення класів з CDN під час кожного збирання"],
      ["It ignores class names inside JavaScript files", "Він ігнорує назви класів у файлах JavaScript"],
    ],
    "a",
    [
      "Tailwind's JIT engine reads your content files as text and emits only the utilities it finds, which keeps CSS small. It doesn't execute your code, so a class assembled from parts never appears in the text it scans. Keep full class names in the source, for example by mapping states to complete class strings in an object.",
      "Рушій JIT у Tailwind читає ваші файли вмісту як текст і видає лише знайдені утиліти, тож CSS лишається маленьким. Він не виконує ваш код, тому клас, зібраний з частин, ніколи не з'являється в тексті, який він сканує. Записуйте повні назви класів у вихідному коді, наприклад, зіставляючи стани з повними рядками класів у об'єкті.",
    ],
  ),
  quiz(
    "tw-responsive-prefixes",
    ["tailwind", w("responsive-design", 0.3)],
    2,
    75,
    ["Responsive prefixes are mobile-first", "Префікси адаптивності мобільні за замовчуванням"],
    ["In `class=\"p-2 md:p-6 lg:p-8\"`, which screen sizes does each class apply to?", "У `class=\"p-2 md:p-6 lg:p-8\"` до яких розмірів екрана застосовується кожен клас?"],
    [
      ["`p-2` on all sizes, `md:p-6` from the medium breakpoint up, `lg:p-8` from the large breakpoint up", "`p-2` на всіх розмірах, `md:p-6` від середнього брейкпоінта і вище, `lg:p-8` від великого брейкпоінта і вище"],
      ["`p-2` only on phones, `md:p-6` only on tablets, `lg:p-8` only on desktops", "`p-2` лише на телефонах, `md:p-6` лише на планшетах, `lg:p-8` лише на настільних комп'ютерах"],
      ["`md:p-6` overrides `p-2` on every size, including phones", "`md:p-6` перевизначає `p-2` на кожному розмірі, включно з телефонами"],
      ["The prefixes apply only inside containers", "Префікси застосовуються лише всередині контейнерів"],
    ],
    "a",
    [
      "Unprefixed utilities apply everywhere, and each prefix applies from its breakpoint upward (`min-width` queries). That's mobile-first: set the small-screen default, then add changes for larger screens. Writing `md:` only ever adds or overrides at medium and up, so you never need to undo styles for phones.",
      "Утиліти без префікса застосовуються скрізь, а кожен префікс — від свого брейкпоінта вгору (запити `min-width`). Це мобільний підхід: задайте стиль для малих екранів, а потім додайте зміни для більших. `md:` завжди додає або перевизначає лише від середнього розміру і вище, тому стилі для телефонів ніколи не треба скасовувати.",
    ],
  ),
]);
