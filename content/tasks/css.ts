import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Dashboard</title>
</head>
<body>
  <header class="toolbar">
    <strong class="brand">Dashboard</strong>
    <form class="search">
      <label class="visually-hidden" for="q">Search projects</label>
      <input id="q" placeholder="Search…" />
    </form>
  </header>
  <main>
    <ul class="cards">
      <li class="card"><span class="badge">New</span><h2>Alpha</h2><p>Design system</p></li>
      <li class="card"><h2>Beta</h2><p>Billing</p></li>
      <li class="card"><h2>Gamma</h2><p>Search</p></li>
      <li class="card"><h2>Delta</h2><p>Mobile app</p></li>
    </ul>
  </main>
  <script src="index.js"></script>
</body>
</html>
`;

const STARTER_CSS = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f7f5ef;
}

/* 1. Toolbar: brand left, search right, vertically centred */
.toolbar {
  padding: 12px 16px;
  background: #0b5a43;
  color: white;
}

/* 2. Cards: a grid with a 16px gap */
.cards {
  list-style: none;
  margin: 0;
  padding: 16px;
}

/* 3. Pin the badge to the card's top-right corner (8px) */
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.badge {
  background: #c9a227;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
}

/* 4. Hide visually, keep it for screen readers */
.visually-hidden {
}
`;

const SOLUTION_CSS = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f7f5ef;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #0b5a43;
  color: white;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 16px;
}

.card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #c9a227;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
`;

export default defineTasks([
  quiz(
    "css-specificity",
    ["css"],
    2,
    90,
    ["Which rule wins?", "Яке правило перемагає?"],
    ["What colour is the link?", "Якого кольору буде посилання?"],
    [
      ["red", "червоного (red)"],
      ["green", "зеленого (green)"],
      ["blue", "синього (blue)"],
      ["orange", "помаранчевого (orange)"],
    ],
    "b",
    [
      "Specificities: `#nav a` = (1,0,1), `.menu .link` = (0,2,0), `a.link` = (0,1,1), `nav a` = (0,0,2). The id selector wins regardless of source order.",
      "Специфічності: `#nav a` = (1,0,1), `.menu .link` = (0,2,0), `a.link` = (0,1,1), `nav a` = (0,0,2). Селектор з id перемагає незалежно від порядку в коді.",
    ],
    {
      code: "<nav id=\"nav\" class=\"menu\"><a class=\"link\" href=\"/\">Home</a></nav>\n\n#nav a       { color: green; }\n.menu .link  { color: red; }\na.link       { color: blue; }\nnav a        { color: orange; }",
      codeLanguage: "css",
    },
  ),
  quiz(
    "css-box-sizing",
    ["css"],
    1,
    60,
    ["Box sizing", "Box sizing"],
    ["With the default `box-sizing: content-box`, how wide is this element on screen (excluding margin)?", "За типового `box-sizing: content-box` якої ширини цей елемент на екрані (без margin)?"],
    [
      ["200px", "200px"],
      ["240px", "240px"],
      ["244px", "244px"],
      ["264px", "264px"],
    ],
    "c",
    [
      "content-box: width covers only the content, so 200 + 2×20 padding + 2×2 border = 244px. With `border-box` it would be exactly 200px.",
      "content-box: ширина охоплює лише вміст, тож 200 + 2×20 padding + 2×2 рамки = 244px. З `border-box` було б рівно 200px.",
    ],
    { code: ".box {\n  width: 200px;\n  padding: 20px;\n  border: 2px solid;\n  margin: 10px;\n}", codeLanguage: "css" },
  ),
  quiz(
    "css-flex-vs-grid",
    ["css"],
    2,
    90,
    ["Flexbox or Grid", "Flexbox чи Grid"],
    ["You need a card gallery whose columns line up across rows and reflow by width. What fits best?", "Потрібна галерея карток, колонки якої вирівнюються між рядками й перебудовуються залежно від ширини. Що підходить найкраще?"],
    [
      ["`display: grid` with `repeat(auto-fill, minmax(16rem, 1fr))`", "`display: grid` з `repeat(auto-fill, minmax(16rem, 1fr))`"],
      ["`display: flex` with `flex-wrap: wrap` and no widths", "`display: flex` з `flex-wrap: wrap` без ширин"],
      ["`float: left` on every card", "`float: left` для кожної картки"],
      ["A `<table>` with one cell per card", "`<table>` з однією клітинкою на картку"],
    ],
    "a",
    [
      "Grid is two-dimensional: columns stay aligned across rows, and `auto-fill` + `minmax` creates as many columns as fit. Wrapped flex items size row by row, so the last row's items stretch or misalign. Tables are for tabular data.",
      "Grid двовимірний: колонки вирівнюються між рядками, а `auto-fill` + `minmax` створює стільки колонок, скільки вміщується. Flex-елементи з перенесенням розраховуються рядок за рядком, тож в останньому рядку вони розтягуються або зсуваються. Таблиці призначені для табличних даних.",
    ],
  ),
  quiz(
    "css-stacking-context",
    ["css"],
    4,
    150,
    ["z-index doesn't work", "z-index не працює"],
    ["The modal has `z-index: 9999` but still appears **under** the header. What's the most likely cause?", "Модальне вікно має `z-index: 9999`, але все одно з'являється **під** шапкою. Яка найімовірніша причина?"],
    [
      ["The modal's parent creates a stacking context (e.g. `transform`) with a lower z-index than the header", "Батько модального вікна створює контекст накладання (наприклад, `transform`) з меншим z-index, ніж у шапки"],
      ["z-index can't exceed 999", "z-index не може бути більшим за 999"],
      ["z-index only works with `display: flex`", "z-index працює лише з `display: flex`"],
      ["The header is rendered later in the DOM, which always wins", "Шапка рендериться пізніше в DOM, а це завжди перемагає"],
    ],
    "a",
    [
      "z-index values are compared only within the same stacking context. If an ancestor with `transform`, `opacity < 1`, `filter` or a positioned z-index forms a context below the header, nothing inside can rise above it. Render modals in a portal at the end of `<body>`.",
      "Значення z-index порівнюються лише в межах одного контексту накладання. Якщо предок із `transform`, `opacity < 1`, `filter` або позиціюванням із z-index утворює контекст нижче шапки, ніщо всередині не підніметься вище. Рендерте модальні вікна через портал у кінці `<body>`.",
    ],
  ),
  quiz(
    "css-visually-hidden",
    ["css", w("web-accessibility")],
    3,
    120,
    ["Hidden but accessible", "Приховано, але доступно"],
    ["You want a label that screen readers announce but sighted users don't see. Which approach works?", "Потрібна мітка, яку оголошують зчитувачі екрана, але не бачать зрячі користувачі. Який підхід працює?"],
    [
      ["`display: none`", "`display: none`"],
      ["`visibility: hidden`", "`visibility: hidden`"],
      ["Clip it to a 1×1px absolutely positioned box with `overflow: hidden`", "Обрізати до абсолютно позиціонованого блоку 1×1px з `overflow: hidden`"],
      ["`opacity: 0; height: 0`", "`opacity: 0; height: 0`"],
    ],
    "c",
    [
      "`display: none` and `visibility: hidden` remove content from the accessibility tree too. The \"visually hidden\" pattern keeps it in the tree while taking no visible space. Zero-height tricks are unreliable across screen readers.",
      "`display: none` і `visibility: hidden` прибирають вміст і з дерева доступності. Патерн «візуально прихований» залишає його в дереві, не займаючи видимого місця. Трюки з нульовою висотою ненадійні в різних зчитувачах.",
    ],
  ),
  practice({
    slug: "css-dashboard-layout",
    skills: ["css", w("responsive-design")],
    complexity: 2,
    estSeconds: 900,
    framework: "vanilla-js",
    title: ["Toolbar, grid and badge", "Панель, сітка й бейдж"],
    prompt: [
      "Edit `styles.css` (the HTML is fixed):\n\n1. `.toolbar`: a **flex** row with the brand on the left and the search on the right (`space-between`), vertically centred.\n2. `.cards`: a **grid** with a `16px` gap that fits as many ≥160px columns as possible.\n3. `.badge`: pinned to the **top-right** corner of its card, 8px from each edge.\n4. `.visually-hidden`: hidden visually but still read by screen readers (no `display: none`).\n\nThe preview updates as you type.",
      "Відредагуйте `styles.css` (HTML фіксований):\n\n1. `.toolbar`: **flex**-рядок, де бренд ліворуч, а пошук праворуч (`space-between`), вирівняні по вертикалі по центру.\n2. `.cards`: **grid** з проміжком `16px`, що вміщує якомога більше колонок завширшки від 160px.\n3. `.badge`: закріплений у **правому верхньому** куті своєї картки, по 8px від кожного краю.\n4. `.visually-hidden`: прихований візуально, але доступний для зчитувачів екрана (без `display: none`).\n\nПопередній перегляд оновлюється під час введення.",
    ],
    files: {
      "/styles.css": STARTER_CSS,
      "/index.html": HTML,
      "/index.js": 'import "./styles.css";\n',
    },
    visibleFiles: ["/styles.css", "/index.html"],
    activeFile: "/styles.css",
    tests: 'import { describe, it, expect, waitFor } from "./test-kit";\n\nconst css = (sel, prop) => getComputedStyle(document.querySelector(sel)).getPropertyValue(prop);\n\ndescribe("dashboard CSS", () => {\n  it("lays out the toolbar with flexbox", async () => {\n    await waitFor(() => expect(css(".toolbar", "display")).toBe("flex"));\n    expect(css(".toolbar", "justify-content")).toBe("space-between");\n    expect(css(".toolbar", "align-items")).toBe("center");\n  });\n  it("uses a grid with a 16px gap for the cards", () => {\n    expect(css(".cards", "display")).toBe("grid");\n    expect(css(".cards", "column-gap")).toBe("16px");\n    expect(css(".cards", "row-gap")).toBe("16px");\n  });\n  it("pins the badge to the top-right corner of its card", () => {\n    expect(css(".card", "position")).toBe("relative");\n    expect(css(".badge", "position")).toBe("absolute");\n    expect(css(".badge", "top")).toBe("8px");\n    expect(css(".badge", "right")).toBe("8px");\n  });\n  it("hides the search label visually but not from screen readers", () => {\n    const label = document.querySelector(".visually-hidden");\n    const style = getComputedStyle(label);\n    expect(style.display).not.toBe("none");\n    expect(style.visibility).not.toBe("hidden");\n    expect(style.position).toBe("absolute");\n    expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);\n    expect(style.overflow).toBe("hidden");\n  });\n});\n',
    solution: { "/styles.css": SOLUTION_CSS },
    explanation: [
      "Flexbox handles the one-dimensional toolbar (`justify-content` on the main axis, `align-items` on the cross axis). Grid with `repeat(auto-fill, minmax(160px, 1fr))` makes responsive columns. An absolutely positioned badge needs a positioned ancestor (`position: relative` on the card). The visually-hidden pattern clips the label to 1px while keeping it in the accessibility tree.",
      "Flexbox обробляє одновимірну панель (`justify-content` на головній осі, `align-items` на поперечній). Grid з `repeat(auto-fill, minmax(160px, 1fr))` дає адаптивні колонки. Абсолютно позиціонованому бейджу потрібен позиціонований предок (`position: relative` на картці). Патерн visually-hidden обрізає мітку до 1px, залишаючи її в дереві доступності.",
    ],
  }),
]);
