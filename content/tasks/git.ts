import { defineTasks } from "@/lib/content/schema";
import { quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "git-staging",
    ["git"],
    1,
    60,
    ["Staging area", "Індекс (staging)"],
    ["You edited three files but want only one of them in the next commit. What do you do?", "Ви змінили три файли, але в наступний коміт хочете лише один. Що робити?"],
    [
      ["`git add that-file` then `git commit`", "`git add that-file`, потім `git commit`"],
      ["`git commit -a`", "`git commit -a`"],
      ["`git push that-file`", "`git push that-file`"],
      ["`git stash` all three, then commit", "Зробити `git stash` для всіх трьох, потім коміт"],
    ],
    "a",
    [
      "The staging area decides what goes into the next commit. `git add <file>` (or `git add -p` for parts of a file) stages exactly what you want. `commit -a` would include every tracked modified file.",
      "Індекс визначає, що потрапить у наступний коміт. `git add <file>` (або `git add -p` для частин файлу) додає саме те, що потрібно. `commit -a` включив би всі змінені відстежувані файли.",
    ],
  ),
  quiz(
    "git-revert-vs-reset",
    ["git"],
    2,
    90,
    ["Undoing a pushed commit", "Скасування відправленого коміту"],
    ["A bad commit is already on the shared `main` branch. What's the safe way to undo it?", "Поганий коміт уже в спільній гілці `main`. Як безпечно його скасувати?"],
    [
      ["`git revert <sha>` and push", "`git revert <sha>` і push"],
      ["`git reset --hard HEAD~1` and force-push", "`git reset --hard HEAD~1` і force-push"],
      ["Delete the branch and recreate it", "Видалити гілку й створити заново"],
      ["`git commit --amend`", "`git commit --amend`"],
    ],
    "a",
    [
      "`revert` adds a new commit that inverts the changes, so history stays intact and teammates aren't affected. Resetting and force-pushing rewrites shared history and breaks everyone who already pulled.",
      "`revert` додає новий коміт, що скасовує зміни, тож історія лишається цілою й колеги не постраждають. Reset з force-push переписує спільну історію й ламає роботу всім, хто вже отримав зміни.",
    ],
  ),
  quiz(
    "git-rebase-golden-rule",
    ["git"],
    3,
    120,
    ["The golden rule of rebasing", "Золоте правило rebase"],
    ["Why shouldn't you rebase a branch that teammates are also working on?", "Чому не варто робити rebase гілки, з якою працюють і колеги?"],
    [
      ["Rebase rewrites commits with new hashes, so others' copies diverge and they get duplicate or conflicting history", "Rebase переписує коміти з новими хешами, тож копії інших розходяться, і в них з'являється дубльована чи конфліктна історія"],
      ["Rebase deletes the branch on the remote", "Rebase видаляє гілку на віддаленому сервері"],
      ["Rebase only works on local branches", "Rebase працює лише з локальними гілками"],
      ["Rebase loses the file contents", "Rebase втрачає вміст файлів"],
    ],
    "a",
    [
      "Rebasing creates new commits. Anyone who based work on the old ones now has a history Git sees as different, which leads to duplicated commits and painful merges. Rebase private branches; merge or revert on shared ones.",
      "Rebase створює нові коміти. Кожен, хто працював на основі старих, тепер має історію, яку Git вважає іншою, що призводить до дубльованих комітів і болісних злиттів. Робіть rebase приватних гілок, а для спільних використовуйте merge чи revert.",
    ],
  ),
  quiz(
    "git-reflog",
    ["git"],
    3,
    120,
    ["Recovering lost commits", "Відновлення втрачених комітів"],
    ["You ran `git reset --hard HEAD~3` by mistake. How can you get the commits back?", "Ви помилково виконали `git reset --hard HEAD~3`. Як повернути коміти?"],
    [
      ["Find the previous HEAD in `git reflog` and `git reset --hard <sha>` (or create a branch there)", "Знайти попередній HEAD у `git reflog` і виконати `git reset --hard <sha>` (або створити там гілку)"],
      ["They're gone forever", "Вони втрачені назавжди"],
      ["`git revert HEAD~3`", "`git revert HEAD~3`"],
      ["`git stash pop`", "`git stash pop`"],
    ],
    "a",
    [
      "The reflog records where HEAD and branches pointed recently, including commits no longer reachable from any branch. They stay recoverable until garbage collection (typically 30+ days).",
      "Reflog записує, куди нещодавно вказували HEAD і гілки, включно з комітами, недосяжними з жодної гілки. Їх можна відновити, доки їх не прибере збирач сміття (зазвичай 30+ днів).",
    ],
  ),
  quiz(
    "git-bisect",
    ["git"],
    4,
    120,
    ["Finding the bad commit", "Пошук поганого коміту"],
    ["A bug appeared somewhere in the last 1,000 commits. About how many builds does `git bisect` need to find the culprit?", "Помилка з'явилася десь в останніх 1000 комітах. Приблизно скільки збірок потрібно `git bisect`, щоб знайти винуватця?"],
    [
      ["About 10", "Близько 10"],
      ["About 100", "Близько 100"],
      ["About 500", "Близько 500"],
      ["All 1,000", "Усі 1000"],
    ],
    "a",
    [
      "Bisect is a binary search over history: each good/bad answer halves the range, so log₂(1000) ≈ 10 steps. With `git bisect run <test-script>` it can be fully automated.",
      "Bisect є бінарним пошуком по історії: кожна відповідь good/bad вдвічі звужує діапазон, тож потрібно log₂(1000) ≈ 10 кроків. З `git bisect run <test-script>` процес можна повністю автоматизувати.",
    ],
  ),
]);
