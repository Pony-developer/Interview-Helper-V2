---
skill: git
title: "Git for teams: commits, branches, merge vs rebase and recovery"
summary: "Git's data model in plain words, branching workflows, when to merge or rebase, resolving conflicts, and how to undo almost anything safely."
readingMinutes: 7
---

Git questions check whether you can collaborate without losing work, and whether you can recover when something goes wrong.

## The model in one paragraph

A **commit** is a snapshot of the project plus metadata and a pointer to its parent(s). A **branch** is just a movable name pointing at a commit. `HEAD` is where you are now. Your work moves through three areas: the **working tree** → the **staging area** (`git add`) → the **repository** (`git commit`).

## Everyday flow

```bash
git switch -c feature/search      # new branch from the current commit
git add -p                        # stage hunks interactively
git commit -m "feat: add search box"
git fetch origin
git rebase origin/main            # replay your commits on the latest main
git push -u origin feature/search # open a pull request
```

Write small, focused commits with messages that explain **why**. Conventional Commits (`feat:`, `fix:`) help with changelogs.

## Merge vs rebase

- **Merge** joins histories with a merge commit. It is non-destructive and shows exactly what happened, but history can get noisy.
- **Rebase** replays your commits on top of another branch. History becomes linear, but commits get **new hashes**.

The golden rule: **don't rebase commits that others already have** (shared/public branches). Rebasing your own local feature branch before a PR is fine. Squash-merging a PR gives `main` one commit per feature.

## Conflicts

Conflicts happen when both sides changed the same lines. Git marks them:

```
<<<<<<< HEAD
const limit = 10;
=======
const limit = 20;
>>>>>>> feature
```

Decide on the correct code (it may combine both sides), remove the markers, run the tests, then `git add` and continue (`git merge --continue` or `git rebase --continue`).

## Undoing things

| Situation | Command |
| --- | --- |
| Discard unstaged changes in a file | `git restore file` |
| Unstage a file | `git restore --staged file` |
| Fix the last commit (not pushed) | `git commit --amend` |
| Undo a pushed commit safely | `git revert <sha>` (creates an inverse commit) |
| Move the branch back, keep changes | `git reset --soft HEAD~1` |
| Throw away commits **locally** | `git reset --hard <sha>` (dangerous) |
| "I lost a commit!" | `git reflog`, then branch from the old sha |

`revert` is safe for shared history. `reset` rewrites it. `git stash` shelves work in progress temporarily.

## Finding bugs

`git bisect` binary-searches history for the commit that introduced a bug. `git blame` (or `git log -p -S "text"`) shows when and why a line changed.

## Interview checklist

- Explain merge vs rebase and the golden rule of rebasing.
- Resolve a conflict and continue the operation.
- Choose `revert` vs `reset` and recover with `reflog`.
- Describe your team's branching and PR workflow.
