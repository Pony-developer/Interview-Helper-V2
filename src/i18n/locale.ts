import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

/** Narrows a route param to a supported locale (falls back to the default). */
export function toLocale(value: string | undefined | null): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}
