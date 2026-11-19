import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth/safe-next";
import { checkJobUrl, isPrivateAddress } from "@/lib/jobs/ssrf";

describe("isPrivateAddress", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.10",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "::",
    "fc00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "64:ff9b::a00:1",
    "not-an-ip",
  ])("blocks %s", (ip) => expect(isPrivateAddress(ip)).toBe(true));

  it.each(["8.8.8.8", "104.18.32.7", "172.32.0.1", "2606:4700::6810:84e5"])("allows %s", (ip) =>
    expect(isPrivateAddress(ip)).toBe(false),
  );
});

describe("checkJobUrl", () => {
  it("accepts public http(s) URLs", () => {
    expect(checkJobUrl("https://djinni.co/jobs/123-frontend/").ok).toBe(true);
    expect(checkJobUrl("http://jobs.dou.ua/companies/x/vacancies/1/").ok).toBe(true);
  });
  it.each([
    ["ftp://example.com/file", "invalid_url"],
    ["javascript:alert(1)", "invalid_url"],
    ["https://user:pass@example.com/", "invalid_url"],
    ["not a url", "invalid_url"],
    ["http://localhost:3000/", "blocked_host"],
    ["http://app.localhost/", "blocked_host"],
    ["http://127.0.0.1/", "blocked_host"],
    ["http://[::1]/", "blocked_host"],
    ["http://169.254.169.254/latest/meta-data/", "blocked_host"],
    ["https://example.com:8443/", "blocked_host"],
    ["http://intranet/", "blocked_host"],
    ["http://db.internal/", "blocked_host"],
  ])("rejects %s", (url, reason) => {
    expect(checkJobUrl(url)).toEqual({ ok: false, reason });
  });
});

describe("safeNextPath", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeNextPath("/uk/practice?skills=react")).toBe("/uk/practice?skills=react");
    expect(safeNextPath("/interview/abc#x")).toBe("/interview/abc#x");
  });
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "\\\\evil.com", "evil.com", "/%0d%0aSet-Cookie:x", "javascript:alert(1)"])(
    "rejects %s",
    (value) => {
      const out = safeNextPath(value, "/practice");
      expect(out.startsWith("/")).toBe(true);
      expect(out.startsWith("//")).toBe(false);
      expect(new URL(out, "https://assay.dev").origin).toBe("https://assay.dev");
    },
  );
  it("falls back for empty values", () => {
    expect(safeNextPath(null)).toBe("/practice");
    expect(safeNextPath("", "/uk/practice")).toBe("/uk/practice");
  });
});
