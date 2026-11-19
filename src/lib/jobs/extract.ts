import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export type ExtractedJob = {
  title: string | null;
  company: string | null;
  text: string;
  source: "json-ld" | "site" | "readability" | "body";
};

const BLOCK = new Set([
  "P", "DIV", "SECTION", "ARTICLE", "UL", "OL", "LI", "H1", "H2", "H3", "H4", "H5", "H6",
  "TABLE", "TR", "BLOCKQUOTE", "PRE", "HEADER", "FOOTER", "DL", "DT", "DD", "BR", "HR",
]);
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "TEMPLATE", "IFRAME", "BUTTON", "FORM", "NAV"]);

type MinimalNode = { nodeType: number; nodeName: string; textContent: string | null; childNodes: ArrayLike<MinimalNode> };

/** DOM → text that keeps line structure (lists become "- item"), so section headers still work. */
export function nodeToText(root: MinimalNode): string {
  const out: string[] = [];
  const walk = (node: MinimalNode) => {
    if (node.nodeType === 3) {
      out.push((node.textContent ?? "").replace(/\s+/g, " "));
      return;
    }
    if (node.nodeType !== 1 || SKIP.has(node.nodeName)) return;
    const block = BLOCK.has(node.nodeName);
    if (block) out.push("\n");
    if (node.nodeName === "LI") out.push("- ");
    for (const child of Array.from(node.childNodes)) walk(child);
    if (block) out.push("\n");
  };
  walk(root);
  return out
    .join("")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l, i, arr) => l || (i > 0 && arr[i - 1]))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const HAS_MARKUP = /<(p|br|li|ul|ol|div|h[1-6]|strong|b|em|span|table)\b/i;

/** HTML (or plain text with line breaks, as some JSON-LD descriptions are) → structured text. */
export function htmlToText(html: string) {
  if (!HAS_MARKUP.test(html)) {
    const { document } = parseHTML(`<!doctype html><html><body><textarea>${html.replace(/</g, "&lt;")}</textarea></body></html>`);
    const decoded = document.querySelector("textarea")?.textContent ?? html; // decodes &amp; etc.
    return decoded
      .split(/\r?\n/)
      .map((l) => l.replace(/[ \t ]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
  return nodeToText(document.body as unknown as MinimalNode);
}

type JobPosting = { "@type"?: string | string[]; title?: string; description?: string; hiringOrganization?: { name?: string } | string };

function findJobPosting(data: unknown): JobPosting | null {
  if (!data || typeof data !== "object") return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  const obj = data as Record<string, unknown>;
  const type = obj["@type"];
  if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return obj as JobPosting;
  if (obj["@graph"]) return findJobPosting(obj["@graph"]);
  return null;
}

const SITE_SELECTORS: { host: RegExp; selectors: string[]; title?: string; company?: string }[] = [
  {
    host: /(^|\.)djinni\.co$/,
    selectors: [".job-post__description", ".job-post-description", "#job-description", "[class*='job-post'] .mb-4", ".profile-page-section"],
    title: "h1",
    company: ".job-details--title, a[href*='/jobs/company-']",
  },
  {
    host: /(^|\.)dou\.ua$/,
    selectors: [".b-vacancy .vacancy-section", ".l-vacancy .b-typo", ".b-typo.vacancy-section", ".l-vacancy"],
    title: ".l-vacancy h1, h1.g-h2, h1",
    company: ".b-compinfo .l-n a, .b-compinfo a",
  },
  {
    host: /(^|\.)glassdoor\.[a-z.]+$/,
    selectors: ["[class*='JobDetails_jobDescription']", "#JobDescriptionContainer", "[data-test='jobDescriptionContent']"],
    title: "h1",
  },
  {
    host: /(^|\.)linkedin\.com$/,
    selectors: [".show-more-less-html__markup", ".description__text"],
    title: "h1",
  },
  {
    host: /(^|\.)work\.ua$/,
    selectors: ["#job-description"],
    title: "h1",
  },
];

export function extractJob(html: string, url: URL): ExtractedJob | null {
  const { document } = parseHTML(html);
  const pageTitle = document.querySelector("title")?.textContent?.trim() ?? null;

  // 1) Structured data: most job boards publish schema.org JobPosting.
  for (const script of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const posting = findJobPosting(JSON.parse(script.textContent ?? ""));
      if (posting?.description) {
        const text = htmlToText(posting.description);
        if (text.length > 120) {
          const org = posting.hiringOrganization;
          return {
            title: posting.title ?? pageTitle,
            company: typeof org === "string" ? org : (org?.name ?? null),
            text: posting.title ? `${posting.title}\n\n${text}` : text,
            source: "json-ld",
          };
        }
      }
    } catch {
      /* ignore malformed JSON-LD */
    }
  }

  // 2) Known job boards.
  const site = SITE_SELECTORS.find((s) => s.host.test(url.hostname));
  if (site) {
    const parts = site.selectors
      .flatMap((sel) => Array.from(document.querySelectorAll(sel)))
      .filter((el, i, arr) => !arr.some((other, j) => j !== i && other !== el && other.contains(el)));
    const text = parts.map((el) => nodeToText(el as unknown as MinimalNode)).join("\n\n").trim();
    if (text.length > 120) {
      const title = site.title ? document.querySelector(site.title)?.textContent?.trim() ?? pageTitle : pageTitle;
      const company = site.company ? document.querySelector(site.company)?.textContent?.trim() ?? null : null;
      return { title, company, text: title ? `${title}\n\n${text}` : text, source: "site" };
    }
  }

  // 3) Readability (article extraction).
  try {
    const article = new Readability(document as unknown as Document, { charThreshold: 200 }).parse();
    if (article?.content) {
      const text = htmlToText(article.content);
      if (text.length > 200) return { title: article.title ?? pageTitle, company: article.siteName ?? null, text, source: "readability" };
    }
  } catch {
    /* fall through */
  }

  // 4) Whole body.
  const body = document.body ? nodeToText(document.body as unknown as MinimalNode) : "";
  if (body.length > 200) return { title: pageTitle, company: null, text: body, source: "body" };
  return null;
}
