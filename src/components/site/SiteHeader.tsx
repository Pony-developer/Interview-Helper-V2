import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { Link } from "@/i18n/navigation";
import { HeaderAuth } from "./HeaderAuth";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const links = [
    { href: "/practice", label: t("practice") },
    { href: "/lectures", label: t("lectures") },
    { href: "/#how-it-works", label: t("howItWorks") },
    { href: "/#faq", label: t("faq") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-forest-700 shadow-[0_1px_0_rgb(255_255_255/0.06),0_8px_24px_-16px_rgb(4_36_28/0.8)]">
      <div className="relative mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="shrink-0 rounded-lg">
          <Logo />
        </Link>
        <nav aria-label={t("main")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-4 py-2 text-[0.95rem] font-medium text-forest-50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <LocaleSwitcher />
          </div>
          <HeaderAuth />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
