import { IBM_Plex_Mono, IBM_Plex_Sans, Unbounded } from "next/font/google";

export const fontDisplay = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

export const fontSans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
