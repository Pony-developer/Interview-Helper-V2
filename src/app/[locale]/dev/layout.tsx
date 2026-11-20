import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";

/** Developer-only tools: never indexed (also disallowed in robots.txt). */
export const metadata: Metadata = { ...privatePageMetadata };

export default function DevLayout({ children }: LayoutProps<"/[locale]/dev">) {
  return children;
}
