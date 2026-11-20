import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const PRIVATE = ["/practice", "/interview", "/results", "/progress", "/admin", "/login", "/api/", "/auth/", "/dev/"];

export default function robots(): MetadataRoute.Robots {
  const disallow = [...PRIVATE, ...PRIVATE.map((p) => `/uk${p}`)];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
