import "server-only";

import { lookup } from "node:dns";
import { Agent, fetch as undiciFetch } from "undici";
import { extractJob, type ExtractedJob } from "./extract";
import { checkJobUrl, isPrivateAddress } from "./ssrf";

export type JobPageError = "invalid_url" | "blocked_host" | "blocked" | "not_found" | "too_large" | "timeout" | "not_html" | "empty" | "network";
export type JobPageResult = ({ ok: true; url: string } & ExtractedJob) | { ok: false; error: JobPageError; status?: number };

const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

/**
 * Resolves DNS at connect time and refuses private addresses, which also defeats
 * DNS-rebinding (the address that is checked is the one that is connected to).
 */
const guardedAgent = new Agent({
  connect: {
    lookup(hostname, options, callback) {
      lookup(hostname, { ...options, all: true }, (err, addresses) => {
        if (err) return callback(err, "", 4);
        const list = (Array.isArray(addresses) ? addresses : [{ address: addresses as unknown as string, family: 4 }]) as {
          address: string;
          family: number;
        }[];
        const bad = list.find((a) => isPrivateAddress(a.address));
        if (bad || !list.length) return callback(Object.assign(new Error("blocked_host"), { code: "EBLOCKED" }), "", 4);
        if ((options as { all?: boolean }).all) return (callback as unknown as (e: null, a: typeof list) => void)(null, list);
        return callback(null, list[0].address, list[0].family);
      });
    },
  },
  headersTimeout: TIMEOUT_MS,
  bodyTimeout: TIMEOUT_MS,
});

async function readLimited(body: ReadableStream<Uint8Array> | null) {
  if (!body) return "";
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw Object.assign(new Error("too_large"), { code: "ETOOLARGE" });
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function fetchJobPage(rawUrl: string): Promise<JobPageResult> {
  const check = checkJobUrl(rawUrl);
  if (!check.ok) return { ok: false, error: check.reason };

  let url = check.url;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const res = await undiciFetch(url, {
        dispatcher: guardedAgent,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AssayJobReader/1.0; +https://assay.dev)",
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
          "Accept-Language": "en,uk;q=0.9",
        },
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) return { ok: false, error: "network", status: res.status };
        const next = checkJobUrl(new URL(location, url).toString());
        if (!next.ok) return { ok: false, error: next.reason };
        url = next.url;
        continue;
      }
      if (res.status === 404 || res.status === 410) return { ok: false, error: "not_found", status: res.status };
      if (res.status === 401 || res.status === 403 || res.status === 429 || res.status === 503) {
        return { ok: false, error: "blocked", status: res.status };
      }
      if (!res.ok) return { ok: false, error: "network", status: res.status };
      const type = res.headers.get("content-type") ?? "";
      if (!/text\/html|application\/xhtml/i.test(type)) return { ok: false, error: "not_html" };
      const length = Number(res.headers.get("content-length") ?? 0);
      if (length > MAX_BYTES) return { ok: false, error: "too_large" };

      const html = await readLimited(res.body as ReadableStream<Uint8Array> | null);
      const job = extractJob(html, url);
      if (!job) return { ok: false, error: "empty" };
      // Cloudflare / bot-wall pages are short and mention verification.
      if (job.text.length < 400 && /(verify you are human|checking your browser|enable javascript|captcha)/i.test(job.text)) {
        return { ok: false, error: "blocked" };
      }
      return { ok: true, url: url.toString(), ...job, text: job.text.slice(0, 20_000) };
    }
    return { ok: false, error: "network" };
  } catch (e) {
    const err = e as { name?: string; code?: string; message?: string; cause?: { code?: string; message?: string } };
    if (err.name === "AbortError") return { ok: false, error: "timeout" };
    if (err.code === "ETOOLARGE") return { ok: false, error: "too_large" };
    if (err.cause?.code === "EBLOCKED" || err.message === "blocked_host" || err.cause?.message === "blocked_host") {
      return { ok: false, error: "blocked_host" };
    }
    return { ok: false, error: "network" };
  } finally {
    clearTimeout(timer);
  }
}
