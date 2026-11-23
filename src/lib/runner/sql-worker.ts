/// <reference lib="webworker" />
/**
 * Runs PostgreSQL practices in the browser on PGlite. Every run gets a brand-new database, so one
 * run can't leak tables or settings into the next. The next database is created in the background
 * right after a run starts, which keeps later runs quick (the first one also downloads PGlite).
 * A runaway query can't be interrupted inside WebAssembly: the page terminates this worker instead.
 */
import { PGlite } from "@electric-sql/pglite";
import { rawParsers, runSql } from "./sql";

export type SqlWorkerRequest = { id: number; setup: string; code: string };
export type SqlWorkerMessage =
  | { type: "ready" }
  | { type: "load-error"; message: string }
  | { type: "result"; id: number; result: import("./sql").SqlRunResult };

const create = async () => {
  const db = await PGlite.create();
  return { db, parsers: await rawParsers(db) };
};

let next = create();

next.then(
  () => self.postMessage({ type: "ready" } satisfies SqlWorkerMessage),
  (e: unknown) => self.postMessage({ type: "load-error", message: String(e) } satisfies SqlWorkerMessage),
);

self.onmessage = async (event: MessageEvent<SqlWorkerRequest>) => {
  const { id, setup, code } = event.data;
  const { db, parsers } = await next;
  next = create();
  try {
    const result = await runSql(db, setup, code, parsers);
    self.postMessage({ type: "result", id, result } satisfies SqlWorkerMessage);
  } finally {
    db.close().catch(() => {});
  }
};
