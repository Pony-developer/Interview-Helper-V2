import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 166–177 of the Junior list: Git and version control. */
export const gitQuiz: SlideDef = {
  kind: "quiz",
  slug: "git-quiz",
  title: { en: "Git and version control", uk: "Git і системи контролю версій" },
  questions: [
    question(
      "vcs",
      ["What is a version control system for?", "Для чого потрібна система контролю версій?"],
      [
        ["Only for backing up images", "Лише для резервних копій зображень"],
        [
          "Keeping the history of every change, comparing and restoring versions, and letting several people work on the same code in parallel",
          "Зберігати історію кожної зміни, порівнювати й відновлювати версії та давати кільком людям паралельно працювати з тим самим кодом",
        ],
        ["Compiling the code", "Компілювати код"],
        ["Hosting the website", "Хостити вебсайт"],
      ],
      "b",
    ),
    question(
      "git-commands",
      ["Which command copies a remote repository to your computer for the first time?", "Яка команда вперше копіює віддалений репозиторій на ваш комп'ютер?"],
      [
        ["`git pull`", "`git pull`"],
        ["`git init`", "`git init`"],
        ["`git clone`", "`git clone`"],
        ["`git fetch`", "`git fetch`"],
      ],
      "c",
    ),
    question(
      "merge-rebase",
      ["What is the difference between `git merge` and `git rebase`?", "Яка різниця між `git merge` і `git rebase`?"],
      [
        ["There is no difference", "Різниці немає"],
        ["`rebase` deletes the other branch", "`rebase` видаляє іншу гілку"],
        ["`merge` works only locally", "`merge` працює лише локально"],
        [
          "`merge` joins branches with a merge commit and keeps the history as it was; `rebase` replays your commits on top of the other branch, giving a linear history but new commit hashes, so you don't rebase commits others already use",
          "`merge` об'єднує гілки комітом злиття і зберігає історію як є; `rebase` переносить ваші коміти поверх іншої гілки, даючи лінійну історію, але з новими хешами комітів, тож коміти, якими вже користуються інші, не ребейзять",
        ],
      ],
      "d",
    ),
    question(
      "commit",
      ["Which of these are good practices for commits?", "Які з цього — добрі практики для комітів?"],
      [
        ["One logical change per commit", "Одна логічна зміна на коміт"],
        ["A short, meaningful message, for example \"Fix price rounding in cart\"", "Коротке змістовне повідомлення, наприклад «Fix price rounding in cart»"],
        ["Committing `.env` files with secrets so the team has them", "Комітити файли `.env` із секретами, щоб вони були в команди"],
        ["The code builds and the tests pass at every commit", "Код збирається, а тести проходять на кожному коміті"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "fix-commits",
      [
        "You already pushed a commit with a bug to a shared branch. What is the safe way to undo it?",
        "Ви вже запушили коміт із багом у спільну гілку. Як безпечно його скасувати?",
      ],
      [
        ["`git reset --hard` and then `git push --force`", "`git reset --hard`, а потім `git push --force`"],
        ["Delete the repository and create it again", "Видалити репозиторій і створити його знову"],
        [
          "`git revert <hash>`: it creates a new commit that undoes the change without rewriting history",
          "`git revert <hash>`: він створює новий коміт, що скасовує зміну, не переписуючи історію",
        ],
        ["`git commit --amend` and a force push", "`git commit --amend` і force push"],
      ],
      "c",
    ),
    question(
      "branches",
      ["What is a branch in Git?", "Що таке гілка в Git?"],
      [
        [
          "A movable pointer to a commit, so work on a feature can go on in isolation and be merged later",
          "Рухомий вказівник на коміт, завдяки якому роботу над функцією можна вести ізольовано й злити пізніше",
        ],
        ["A full copy of the repository folder", "Повна копія теки репозиторію"],
        ["A backup stored on the server", "Резервна копія на сервері"],
        ["Another name for a tag", "Інша назва тегу"],
      ],
      "a",
    ),
    question(
      "create-branch",
      ["Which command creates a new branch `feature/login` and switches to it?", "Яка команда створює нову гілку `feature/login` і перемикається на неї?"],
      [
        ["`git branch feature/login`", "`git branch feature/login`"],
        ["`git merge feature/login`", "`git merge feature/login`"],
        ["`git tag feature/login`", "`git tag feature/login`"],
        ["`git switch -c feature/login`", "`git switch -c feature/login`"],
      ],
      "d",
    ),
    question(
      "branching-strategies",
      ["What sets Git Flow apart from trunk-based development?", "Чим Git Flow відрізняється від trunk-based development?"],
      [
        ["Git Flow forbids branches", "Git Flow забороняє гілки"],
        [
          "Git Flow keeps long-lived `main` and `develop` branches plus feature, release and hotfix branches; trunk-based development merges small, short-lived branches into `main` often, usually behind feature flags",
          "Git Flow тримає довготривалі гілки `main` і `develop`, а також гілки feature, release і hotfix; у trunk-based development малі короткоживучі гілки часто зливають у `main`, зазвичай під feature flags",
        ],
        ["Trunk-based development has no `main` branch", "У trunk-based development немає гілки `main`"],
        ["They are the same strategy", "Це та сама стратегія"],
      ],
      "b",
    ),
    question(
      "tags",
      ["What are tags usually used for in Git?", "Для чого зазвичай використовують теги в Git?"],
      [
        [
          "Marking release points, for example `git tag -a v1.2.0 -m \"Release 1.2.0\"`, then `git push origin v1.2.0`",
          "Позначати точки релізів, наприклад `git tag -a v1.2.0 -m \"Release 1.2.0\"`, а потім `git push origin v1.2.0`",
        ],
        ["Labeling issues in the tracker", "Позначати задачі в трекері"],
        ["As branches you keep committing to", "Як гілки, в які продовжують комітити"],
        ["Deleting old commits", "Видаляти старі коміти"],
      ],
      "a",
    ),
    question(
      "merge-conflict",
      ["When does a merge conflict happen, and how do you resolve it?", "Коли виникає конфлікт злиття і як його вирішити?"],
      [
        ["When two people use Git at the same time; you restart Git", "Коли двоє людей одночасно користуються Git; треба перезапустити Git"],
        ["Only when files are deleted, and it cannot be resolved", "Лише коли видаляють файли, і його неможливо вирішити"],
        [
          "When both branches changed the same lines; you edit the file to the correct version, remove the `<<<<<<<`, `=======` and `>>>>>>>` markers, then `git add` and finish the merge",
          "Коли обидві гілки змінили ті самі рядки; треба виправити файл до правильної версії, прибрати маркери `<<<<<<<`, `=======` і `>>>>>>>`, потім `git add` і завершити злиття",
        ],
        ["Git always resolves conflicts automatically", "Git завжди вирішує конфлікти автоматично"],
      ],
      "c",
    ),
    question(
      "remote-practices",
      ["Which of these are good practices for working with remote repositories?", "Які з цього — добрі практики роботи з віддаленими репозиторіями?"],
      [
        ["Pull or fetch often to stay up to date with the main branch", "Часто робити pull чи fetch, щоб не відставати від основної гілки"],
        ["Merge into `main` through pull requests with code review", "Зливати в `main` через pull requests із code review"],
        ["Force-push to the shared `main` branch", "Робити force push у спільну гілку `main`"],
        ["Protect the main branch and run CI on every pull request", "Захистити основну гілку й запускати CI на кожен pull request"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "gitignore",
      [
        "A `.env` file was already committed, and then it was added to `.gitignore`. What happens?",
        "Файл `.env` уже закомітили, а потім додали до `.gitignore`. Що станеться?",
      ],
      [
        ["Git deletes it from the whole history", "Git видаляє його з усієї історії"],
        ["Git stops tracking it immediately", "Git одразу перестає його відстежувати"],
        ["Git reports an error", "Git видає помилку"],
        [
          "Git keeps tracking it: `.gitignore` applies only to untracked files, so you need `git rm --cached .env` (and should rotate any leaked secrets)",
          "Git і далі його відстежує: `.gitignore` діє лише на невідстежувані файли, тож потрібен `git rm --cached .env` (а секрети, що потрапили в репозиторій, варто замінити)",
        ],
      ],
      "d",
    ),
  ],
};
