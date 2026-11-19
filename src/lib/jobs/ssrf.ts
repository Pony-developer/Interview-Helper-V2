import { isIP } from "node:net";

function ipv4ToInt(ip: string) {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

const V4_BLOCKS: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function inV4Block(ip: string) {
  const n = ipv4ToInt(ip);
  return V4_BLOCKS.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (n & mask) === (ipv4ToInt(base) & mask);
  });
}

/** True for loopback, private, link-local, CGNAT, multicast, documentation and other non-public addresses. */
export function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return inV4Block(address);
  if (version === 6) {
    const a = address.toLowerCase().replace(/^\[|\]$/g, "");
    if (a === "::" || a === "::1") return true;
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(a);
    if (mapped) return inV4Block(mapped[1]);
    if (/^::ffff:[0-9a-f]{1,4}:[0-9a-f]{1,4}$/.test(a)) return true; // hex-form IPv4-mapped
    if (/^f[cd]/.test(a)) return true; // fc00::/7 unique local
    if (/^fe[89ab]/.test(a)) return true; // fe80::/10 link-local
    if (/^ff/.test(a)) return true; // multicast
    if (/^64:ff9b:/.test(a)) return true; // NAT64 (can reach v4 private space)
    if (/^2001:db8:/.test(a)) return true; // documentation
    return false;
  }
  return true; // not an IP at all → treat as unsafe
}

export type UrlCheck = { ok: true; url: URL } | { ok: false; reason: "invalid_url" | "blocked_host" };

/** Static checks before any network access. */
export function checkJobUrl(raw: string): UrlCheck {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, reason: "invalid_url" };
  if (url.username || url.password) return { ok: false, reason: "invalid_url" };
  if (url.port && url.port !== "443" && url.port !== "80") return { ok: false, reason: "blocked_host" };
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, reason: "blocked_host" };
  }
  if (isIP(host.replace(/^\[|\]$/g, "")) && isPrivateAddress(host)) return { ok: false, reason: "blocked_host" };
  if (!host.includes(".") && !isIP(host)) return { ok: false, reason: "blocked_host" };
  return { ok: true, url };
}
