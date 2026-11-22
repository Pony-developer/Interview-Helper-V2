import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const year = new Date().getFullYear();
  const linkClass = "rounded hover:text-white hover:underline hover:decoration-gold-500 hover:underline-offset-4";

  return (
    <footer className="grain mt-auto bg-forest-800 text-forest-100">
      <div className="relative z-[2] mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 leading-relaxed text-forest-100">{t("tagline")}</p>
          <div className="mt-6">
            <LocaleSwitcher />
          </div>
        </div>
        <nav aria-labelledby="footer-product">
          <h2 id="footer-product" className="text-sm font-bold uppercase tracking-[0.14em] text-gold-300">
            {t("product")}
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link className={linkClass} href="/practice">
                {nav("practice")}
              </Link>
            </li>
            <li>
              <Link className={linkClass} href="/#how-it-works">
                {nav("howItWorks")}
              </Link>
            </li>
            <li>
              <Link className={linkClass} href="/#faq">
                {nav("faq")}
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-learn">
          <h2 id="footer-learn" className="text-sm font-bold uppercase tracking-[0.14em] text-gold-300">
            {t("learn")}
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link className={linkClass} href="/lectures">
                {nav("lectures")}
              </Link>
            </li>
            <li>
              <Link className={linkClass} href="/courses">
                {nav("courses")}
              </Link>
            </li>
            <li>
              <Link className={linkClass} href="/progress">
                {nav("progress")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="relative z-[2] border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-forest-200 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{t("rights", { year })}</p>
          <p>{t("madeFor")}</p>
        </div>
      </div>
    </footer>
  );
}
