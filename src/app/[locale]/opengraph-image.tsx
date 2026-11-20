import { toLocale } from "@/i18n/locale";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

const size = { width: 1200, height: 630 };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** One image per locale, with alt text in the page's language (og:image:alt / twitter:image:alt). */
export async function generateImageMetadata({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return [{ id: "default", alt: t("title"), size, contentType: "image/png" }];
}

/** Loads a Google font subset (TTF) for the given text, so Cyrillic titles render too. */
async function loadFont(family: string, weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "landing.hero.slides.one" });
  const title = t("title");
  const eyebrow = t("eyebrow");
  const font = await loadFont("Unbounded", 800, `${title}assay24K`);
  const body = await loadFont("IBM+Plex+Sans", 500, eyebrow.toUpperCase());

  const dots = [
    [24, 8.5, 5.2, "#E6CF86"],
    [37.4, 16.2, 4.4, "#C9A227"],
    [37.4, 31.8, 5.6, "#D9B84E"],
    [24, 39.5, 4.2, "#C9A227"],
    [10.6, 31.8, 5, "#E6CF86"],
    [10.6, 16.2, 3.8, "#A9851A"],
  ] as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          backgroundColor: "#04241c",
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(201,162,39,0.35), transparent 45%), radial-gradient(circle at 0% 100%, rgba(17,112,79,0.8), transparent 50%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 48 48">
            {dots.map(([cx, cy, r, fill], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill={fill} />
            ))}
            <circle cx="24" cy="24" r="6.4" fill="#11704F" stroke="#E6CF86" strokeWidth="1.6" />
          </svg>
          <span style={{ fontFamily: "Unbounded", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>assay</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontFamily: "Plex", fontSize: 24, letterSpacing: 4, color: "#E6CF86" }}>{eyebrow.toUpperCase()}</span>
          <span style={{ fontFamily: "Unbounded", fontSize: 66, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            {title}
          </span>
        </div>
        <div style={{ display: "flex", height: 4, width: 220, background: "linear-gradient(90deg, #C9A227, #E6CF86)" }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(font ? [{ name: "Unbounded", data: font, weight: 800 as const, style: "normal" as const }] : []),
        ...(body ? [{ name: "Plex", data: body, weight: 500 as const, style: "normal" as const }] : []),
      ],
    },
  );
}
