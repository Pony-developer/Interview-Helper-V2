"use client";

import type { SqlRunResult } from "./sql";
import type { SqlWorkerMessage, SqlWorkerRequest } from "./sql-worker";

/** How long one run may take once PostgreSQL is loaded. */
const RUN_TIMEOUT_MS = 10_000;
/** The first load downloads PGlite (~10 MB) and starts PostgreSQL. */
const LOAD_TIMEOUT_MS = 90_000;

type Pending = { resolve: (r: SqlRunResult) => void; timer: ReturnType<typeof setTimeout> };

let worker: Worker | null = null;
let ready: Promise<boolean> | null = null;
let seq = 0;
const pending = new Map<number, Pending>();

function kill() {
  worker?.terminate();
  worker = null;
  ready = null;
}

function start(): Promise<boolean> {
  if (ready) return ready;
  const w = new Worker(new URL("./sql-worker.ts", import.meta.url), { type: "module" });
  worker = w;
  ready = new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => {
      kill();
      resolve(false);
    }, LOAD_TIMEOUT_MS);
    w.addEventListener("message", (e: MessageEvent<SqlWorkerMessage>) => {
      const msg = e.data;
      if (msg.type === "ready") {
        clearTimeout(timer);
        resolve(true);
      } else if (msg.type === "load-error") {
        clearTimeout(timer);
        console.error("PGlite failed to load", msg.message);
        kill();
        resolve(false);
      } else if (msg.type === "result") {
        const p = pending.get(msg.id);
        if (!p) return;
        clearTimeout(p.timer);
        pending.delete(msg.id);
        p.resolve(msg.result);
      }
    });
    w.addEventListener("error", (e) => {
      console.error("SQL worker error", e.message);
      clearTimeout(timer);
      kill();
      resolve(false);
      for (const [id, p] of pending) {
        clearTimeout(p.timer);
        pending.delete(id);
        p.resolve({ status: "unavailable", reason: "load" });
      }
    });
  });
  return ready;
}

/** Starts downloading PostgreSQL ahead of the first run (e.g. when a SQL practice is shown). */
export function preloadSql() {
  if (typeof window !== "undefined") void start();
}

/** Runs `setup` and then `code` on a fresh PostgreSQL database in a worker. */
export async function runSqlInBrowser(setup: string, code: string): Promise<SqlRunResult> {
  if (!(await start()) || !worker) return { status: "unavailable", reason: "load" };
  const id = ++seq;
  const w = worker;
  return new Promise<SqlRunResult>((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      // WebAssembly can't be interrupted: throw the whole worker away and start a new one.
      if (worker === w) kill();
      resolve({ status: "unavailable", reason: "timeout" });
    }, RUN_TIMEOUT_MS);
    pending.set(id, { resolve, timer });
    w.postMessage({ id, setup, code } satisfies SqlWorkerRequest);
  });
}
