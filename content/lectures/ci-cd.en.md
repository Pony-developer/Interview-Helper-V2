---
skill: ci-cd
title: "CI/CD: automated builds, tests and deployments"
summary: "What continuous integration and continuous delivery mean in practice, designing pipeline stages, building an artifact once and promoting it, caching, secrets, environments and rollbacks, and the habits that keep pipelines fast and trustworthy."
readingMinutes: 9
---

**Continuous integration** means every change is merged to the main branch often and is automatically built and tested. **Continuous delivery** means every change that passes those checks can be released at any time, and often is. A pipeline is the automation that does this: it runs on each push and decides whether the code is safe to ship.

## What a pipeline does

A typical pipeline has ordered stages, and a failure in one stops the rest:

1. **Install** dependencies from the lockfile (`npm ci`, not `npm install`), so the result is reproducible.
2. **Lint and type-check**: the cheapest checks run first, to fail fast.
3. **Unit tests**, then **integration tests** against real services (a database in a container).
4. **Build** the artifact: a Docker image, a bundle, a binary.
5. **Deploy** to a staging environment, run end-to-end tests, then deploy to production.

Keep the pipeline under about ten minutes where possible. Slow pipelines get skipped, retried or ignored, and then they stop protecting anything.

## Build once, promote the same artifact

Build the image or bundle **once**, with a version tag such as the commit SHA, and promote that exact artifact through staging to production. Rebuilding for each environment means production runs code that was never tested. Keep configuration out of the artifact, so the same build runs everywhere with different environment variables.

## Caching and parallelism

Cache dependency directories and build outputs keyed by the lockfile hash, so unchanged dependencies aren't downloaded again. Run independent jobs in parallel: lint, unit tests and the type check don't need each other. Docker layer caching (see the Docker lecture) matters here too: a Dockerfile that copies dependencies first keeps builds quick.

## Secrets and permissions

Store credentials in the CI system's secret store, expose them only to the jobs that need them, and never print them in logs (most CI systems mask known secrets, but not transformed ones). Give each pipeline the smallest permissions it needs: a build job doesn't need production access. Prefer short-lived credentials issued through OIDC over long-lived keys stored in the repository.

## Environments and rollback

Each environment (staging, production) has its own configuration, and production deployments often require an approval or run only from the main branch. Plan the rollback before you need it: redeploying the previous artifact is the fastest fix, which is only possible if the previous artifact still exists and the database changes are backward compatible. Use **feature flags** to ship code turned off and enable it gradually.

## Habits that keep pipelines trustworthy

- Treat a red build as a stop-the-line event; don't merge on top of it.
- Don't skip or quarantine flaky tests without an owner and a deadline. A flaky test trains people to ignore failures.
- Keep the pipeline definition in the repository, reviewed like code.
- Measure how often deployments fail and how long they take to recover, and improve the worst part first.

## Interview checklist

- Explain continuous integration versus continuous delivery.
- Design pipeline stages ordered from fastest to slowest, and explain why.
- Explain "build once, promote the artifact" and why rebuilding per environment is risky.
- Describe how secrets reach a job without appearing in logs, and why OIDC beats stored keys.
- Explain a rollback plan, including the database side.
