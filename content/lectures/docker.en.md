---
skill: docker
title: "Docker: images, containers and reproducible builds"
summary: "The difference between images and containers, how layers and the build cache work, writing Dockerfiles that build fast and stay small, multi-stage builds, volumes and networks, and keeping secrets out of images."
readingMinutes: 9
---

Docker packages an application with everything it needs to run (runtime, libraries, config) into an **image**, and runs that image as a **container**: an isolated process with its own filesystem and network view. The same image runs the same way on a laptop, in CI and in production, which is the whole point.

## Images and containers

- An **image** is a read-only template, built in layers.
- A **container** is a running instance of an image, with a thin writable layer on top. Deleting a container discards that layer; the image is untouched.
- A **registry** (Docker Hub, GitHub Container Registry, ECR) stores and distributes images, tagged by name and version.

Containers share the host kernel. They isolate processes, files and networks, but they are not virtual machines, so they start in milliseconds and cost little memory.

## Layers and the build cache

Each Dockerfile instruction that changes the filesystem creates a layer. Docker reuses a cached layer as long as the instruction and its inputs are unchanged, and **every layer after a change is rebuilt**. That makes instruction order matter:

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./   # changes rarely
RUN npm ci                               # cached until the lockfile changes
COPY . .                                 # changes on every edit
RUN npm run build
CMD ["node", "dist/server.js"]
```

Copying the whole project before installing dependencies would reinstall everything on every source edit. Put slow, stable steps first.

## Small and safe images

- Start from a minimal base (`-slim`, `alpine`, or distroless) and pin a version tag, not `latest`.
- Use **multi-stage builds**: compile in a full image, then copy only the output into a small runtime image. Compilers and dev dependencies never ship.
- Add a `.dockerignore` so `node_modules`, `.git` and local `.env` files are not sent to the build.
- Run as a non-root user (`USER app`).
- **Never bake secrets into an image.** Every layer is stored and can be inspected, even if a later step deletes the file. Pass secrets at runtime through environment variables or a secrets manager.

## Data, networking and configuration

- Containers are disposable, so data that must survive belongs in a **volume** (or an external database), not in the container's writable layer.
- Containers on the same user-defined network reach each other by service name. Publish ports (`-p 8080:3000`) only for what the outside world needs.
- Configuration comes from environment variables, so one image works in every environment.
- `docker compose` describes several services (app, database, cache) in one YAML file, which is how most local development environments are set up.

## Common mistakes

- Using `latest` tags, so two builds of the "same" image differ.
- Installing development tools in the production image.
- Running processes as root, and mounting the Docker socket into containers, which gives them control of the host.
- Forgetting that one container per process is the normal model: a single container running a web server, a database and a cron job is hard to scale and restart.

## Interview checklist

- Explain images versus containers, and what a layer is.
- Order a Dockerfile to make the build cache effective, and explain why.
- Describe a multi-stage build and why it makes images smaller.
- Explain where secrets belong and why an image is the wrong place.
- Explain volumes, networks and port publishing.
