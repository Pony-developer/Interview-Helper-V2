import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getLectures } from "@/lib/data/lectures";
import { localizedPath } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

function entry(path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, absoluteUrl(localizedPath(path, l))]),
  );
  languages["x-default"] = absoluteUrl(localizedPath(path, routing.defaultLocale));
  return {
    url: absoluteUrl(localizedPath(path, routing.defaultLocale)),
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lectures = await getLectures(routing.defaultLocale);
  return [
    entry("/", 1),
    entry("/lectures", 0.8),
    ...lectures.map((l) => entry(`/lectures/${l.slug}`, 0.6, l.updatedAt === new Date(0).toISOString() ? undefined : l.updatedAt)),
  ];
}
