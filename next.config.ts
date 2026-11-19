import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // The classic caching model keeps next-intl static rendering (setRequestLocale)
  // and Supabase cookie sessions straightforward. Revisit when Cache Components
  // becomes mandatory in the next major version.
  cacheComponents: false,
  // Sandpack (2.20) doesn't survive Strict Mode's dev-only double mount: it registers two runtime
  // clients on the same preview iframe and keeps the one that never receives messages, so edits are
  // never sent to the bundler and tests don't re-run. Production never double-mounts; this keeps
  // `next dev` behaving like production for the coding grounds.
  reactStrictMode: false,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
