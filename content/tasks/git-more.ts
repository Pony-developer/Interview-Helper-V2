import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "git-fetch-pull",
    ["git"],
    2,
    60,
    ["fetch vs pull", "fetch проти pull"],
    ["What is the difference between `git fetch` and `git pull`?", "Яка різниця між `git fetch` і `git pull`?"],
    [
      ["`fetch` downloads remote commits and updates remote-tracking branches; `pull` fetches and then merges (or rebases) into your branch", "`fetch` завантажує віддалені коміти й оновлює гілки відстеження; `pull` робить fetch, а потім merge (або rebase) у вашу гілку"],
      ["`fetch` uploads your commits; `pull` downloads", "`fetch` вивантажує ваші коміти; `pull` завантажує"],
      ["They are aliases", "Це синоніми"],
      ["`pull` only works on the main branch", "`pull` працює лише на головній гілці"],
    ],
    "a",
    [
      "`git fetch` is always safe: it updates `origin/*` without touching your working tree, so you can inspect incoming changes (`git log HEAD..origin/main`) first. `git pull` = fetch + integrate. Setting `pull.rebase` or `pull.ff=only` controls how it integrates.",
      "`git fetch` завжди безпечний: він оновлює `origin/*`, не чіпаючи робочої копії, тож можна спершу переглянути вхідні зміни (`git log HEAD..origin/main`). `git pull` = fetch + інтеграція. Налаштування `pull.rebase` або `pull.ff=only` визначають, як саме відбувається інтеграція.",
    ],
  ),
  quiz(
    "git-revert-merge",
    ["git"],
    4,
    90,
    ["Reverting a merge commit", "Скасування коміту злиття"],
    ["A feature branch was merged into `main` (merge commit `a1b2c3`) and broke production. `git revert a1b2c3` fails with \"is a merge but no -m option was given\". What should you run?", "Гілку функції злили в `main` (коміт злиття `a1b2c3`), і це зламало продакшн. `git revert a1b2c3` падає з \"is a merge but no -m option was given\". Що треба виконати?"],
    [
      ["`git revert -m 1 a1b2c3`", "`git revert -m 1 a1b2c3`"],
      ["`git reset --hard a1b2c3~1 && git push --force`", "`git reset --hard a1b2c3~1 && git push --force`"],
      ["`git revert -m 2 a1b2c3`", "`git revert -m 2 a1b2c3`"],
      ["`git cherry-pick a1b2c3`", "`git cherry-pick a1b2c3`"],
    ],
    "a",
    [
      "A merge commit has two parents, so Git needs to know which side is the mainline to keep. Parent 1 is the branch you merged into (`main`), so `-m 1` undoes the feature's changes. Rewriting shared history with a force push is the wrong tool on `main`. Note: to re-merge the feature later, you must first revert the revert.",
      "Коміт злиття має двох батьків, тож Git має знати, яку сторону вважати основною. Батько 1 — гілка, в яку зливали (`main`), тож `-m 1` скасовує зміни функції. Переписування спільної історії примусовим push — неправильний інструмент для `main`. Зауважте: щоб потім злити функцію знову, спершу потрібно скасувати цей revert.",
    ],
  ),
  quiz(
    "git-ours-theirs-rebase",
    ["git"],
    5,
    120,
    ["ours and theirs during a rebase", "ours і theirs під час rebase"],
    ["You run `git rebase main` on your `feature` branch and hit a conflict in `config.ts`. You want to keep **your feature branch's** version of the file. Which command does that?", "Ви виконуєте `git rebase main` на своїй гілці `feature` і отримуєте конфлікт у `config.ts`. Ви хочете залишити версію файлу **з вашої гілки feature**. Яка команда це робить?"],
    [
      ["`git checkout --ours config.ts`", "`git checkout --ours config.ts`"],
      ["`git checkout --theirs config.ts`", "`git checkout --theirs config.ts`"],
      ["`git merge --abort`", "`git merge --abort`"],
      ["`git reset config.ts`", "`git reset config.ts`"],
    ],
    "b",
    [
      "During a rebase, Git replays your commits on top of `main`, so \"ours\" is the branch being built (`main` plus already replayed commits) and \"theirs\" is the commit being replayed, which is yours. That is the reverse of a merge. Then `git add config.ts` and `git rebase --continue`.",
      "Під час rebase Git перевідтворює ваші коміти поверх `main`, тож «ours» — гілка, що будується (`main` плюс уже перенесені коміти), а «theirs» — коміт, що переноситься, тобто ваш. Це протилежно до merge. Далі `git add config.ts` і `git rebase --continue`.",
    ],
  ),
  practice({
    slug: "git-semver-bump",
    skills: ["git"],
    complexity: 2,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Version bump from Conventional Commits", "Підвищення версії з Conventional Commits"],
    prompt: [
      "Release tools read commit messages written in the Conventional Commits format to decide the next version. Implement `nextVersion(current, commits)`:\n\n- A breaking change (`feat!:`, `fix(api)!:`, or a line starting with `BREAKING CHANGE:` in the body) → **major** bump.\n- Otherwise any `feat` → **minor** bump.\n- Otherwise any `fix` or `perf` → **patch** bump.\n- Otherwise (`docs`, `chore`, …) → unchanged.\n- Bumping resets the lower parts: `1.4.2` → minor → `1.5.0`.\n- Commit types are case-insensitive and may have a scope: `feat(ui): …`.",
      "Інструменти релізів читають повідомлення комітів у форматі Conventional Commits, щоб визначити наступну версію. Реалізуйте `nextVersion(current, commits)`:\n\n- Несумісна зміна (`feat!:`, `fix(api)!:` або рядок, що починається з `BREAKING CHANGE:` у тілі) → підвищення **major**.\n- Інакше будь-який `feat` → підвищення **minor**.\n- Інакше будь-який `fix` або `perf` → підвищення **patch**.\n- Інакше (`docs`, `chore`, …) → без змін.\n- Підвищення обнуляє молодші частини: `1.4.2` → minor → `1.5.0`.\n- Типи комітів нечутливі до регістру й можуть мати область: `feat(ui): …`.",
    ],
    files: {
      "/src/semver.ts": "export function nextVersion(current: string, commits: string[]): string {\n  // TODO\n  return current;\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { nextVersion } from "./src/semver";\n\nconst commits = ["fix(auth): handle expired tokens", "feat(ui): add dark mode", "docs: update README"];\ndocument.getElementById("app")!.innerHTML =\n  "<h1>Next release</h1><ul>" + commits.map((c) => "<li>" + c + "</li>").join("") + "</ul><p>2.3.1 → <b>" + nextVersion("2.3.1", commits) + "</b></p>";\n',
    },
    visibleFiles: ["/src/semver.ts", "/index.ts"],
    activeFile: "/src/semver.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { nextVersion } from "../src/semver";\n\ndescribe("nextVersion", () => {\n  it("bumps patch for fixes and perf", () => {\n    expect(nextVersion("1.4.2", ["fix: null check"])).toBe("1.4.3");\n    expect(nextVersion("1.4.2", ["perf(list): virtualise rows"])).toBe("1.4.3");\n  });\n  it("bumps minor for features and resets patch", () => {\n    expect(nextVersion("1.4.2", ["fix: a", "feat(ui): dark mode"])).toBe("1.5.0");\n  });\n  it("bumps major for ! and resets minor and patch", () => {\n    expect(nextVersion("1.4.2", ["feat!: drop Node 16"])).toBe("2.0.0");\n    expect(nextVersion("1.4.2", ["fix(api)!: rename field"])).toBe("2.0.0");\n  });\n  it("detects BREAKING CHANGE in the body", () => {\n    expect(nextVersion("0.9.9", ["refactor: new config\\n\\nBREAKING CHANGE: config file renamed"])).toBe("1.0.0");\n  });\n  it("ignores docs and chores", () => {\n    expect(nextVersion("3.0.0", ["docs: typo", "chore: bump deps", "style: format"])).toBe("3.0.0");\n  });\n  it("is case-insensitive and ignores look-alikes", () => {\n    expect(nextVersion("1.0.0", ["FEAT: shout"])).toBe("1.1.0");\n    expect(nextVersion("1.0.0", ["feature: not a conventional type", "fixup! earlier commit"])).toBe("1.0.0");\n  });\n  it("handles no commits", () => expect(nextVersion("1.2.3", [])).toBe("1.2.3"));\n});\n',
    solution: {
      "/src/semver.ts":
        "type Bump = 0 | 1 | 2 | 3; // none, patch, minor, major\n\nconst HEADER = /^(\\w+)(\\([^)]*\\))?(!)?: /;\n\nfunction bumpFor(message: string): Bump {\n  const header = HEADER.exec(message);\n  if (!header) return 0;\n  const type = header[1].toLowerCase();\n  if (header[3] || /^BREAKING[ -]CHANGE: /m.test(message)) return 3;\n  if (type === \"feat\") return 2;\n  if (type === \"fix\" || type === \"perf\") return 1;\n  return 0;\n}\n\nexport function nextVersion(current: string, commits: string[]): string {\n  const [major, minor, patch] = current.split(\".\").map(Number);\n  const bump = commits.reduce<Bump>((max, message) => Math.max(max, bumpFor(message)) as Bump, 0);\n  if (bump === 3) return major + 1 + \".0.0\";\n  if (bump === 2) return major + \".\" + (minor + 1) + \".0\";\n  if (bump === 1) return major + \".\" + minor + \".\" + (patch + 1);\n  return current;\n}\n",
    },
    explanation: [
      "Parse each header with one regex: type, optional `(scope)`, optional `!`, then `: `. Requiring `: ` right after the type is what rejects look-alikes such as `feature:` or `fixup!`. Each commit maps to a bump level, and the release takes the maximum. A multiline regex (`/m`) finds `BREAKING CHANGE:` at the start of any body line. Real tools such as semantic-release also treat 0.x versions specially.",
      "Розбирайте кожен заголовок одним регулярним виразом: тип, необов'язкова `(область)`, необов'язковий `!`, потім `: `. Вимога `: ` одразу після типу відсікає схожі варіанти, як-от `feature:` чи `fixup!`. Кожен коміт дає рівень підвищення, а реліз бере максимум. Багаторядковий вираз (`/m`) знаходить `BREAKING CHANGE:` на початку будь-якого рядка тіла. Справжні інструменти, як-от semantic-release, ще й особливо обробляють версії 0.x.",
    ],
  }),
]);
