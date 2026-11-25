import { toLocale } from "@/i18n/locale";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookOpen, Bug, Clock, Mail } from "lucide-react";
import { ContactForm, CopyEmail } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Link } from "@/i18n/navigation";
import { publicPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    ...publicPageMetadata({ path: "/contact", locale, title: t("title"), description: t("description") }),
  };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const email = siteConfig.contactEmail;

  const notes = [
    { icon: Bug, title: t("notes.bug.title"), body: t("notes.bug.body") },
    { icon: BookOpen, title: t("notes.content.title"), body: t("notes.content.body") },
    { icon: Clock, title: t("notes.reply.title"), body: t("notes.reply.body") },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")}>
          <div className="mt-9 flex animate-rise flex-wrap items-center gap-4 [animation-delay:180ms]">
            <a
              href={`mailto:${email}`}
              className="group inline-flex items-center gap-3 font-display text-xl font-bold text-white sm:text-2xl"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-500 text-forest-950 transition group-hover:rotate-[-8deg]">
                <Mail aria-hidden className="h-5 w-5" />
              </span>
              <span className="underline decoration-gold-500/60 decoration-2 underline-offset-[6px] transition group-hover:decoration-gold-300">
                {email}
              </span>
            </a>
            <CopyEmail email={email} />
          </div>
        </PageHero>

        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.45fr] lg:gap-20">
          <aside aria-labelledby="contact-notes" className="lg:pt-4">
            <h2 id="contact-notes" className="font-display text-2xl font-bold text-forest-700">
              {t("notesTitle")}
            </h2>
            <div className="gold-rule mt-3 w-20" />
            <ol className="mt-10 space-y-10">
              {notes.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="grid animate-rise grid-cols-[auto_1fr] gap-5" style={{ animationDelay: `${120 + i * 80}ms` }}>
                  <div className="relative">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-50 text-forest-700 ring-1 ring-forest-100">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="absolute -right-2 -top-2 font-mono text-[0.7rem] font-semibold text-gold-700">
                      0{i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{title}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-12 rounded-2xl border border-dashed border-paper-3 p-5 text-sm leading-relaxed text-ink-muted">
              {t.rich("faqNudge", {
                link: (chunks) => (
                  <Link
                    href="/#faq"
                    className="font-semibold text-forest-700 underline decoration-gold-500 underline-offset-4 hover:text-forest-900"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </aside>

          <section aria-labelledby="contact-form-title">
            <h2 id="contact-form-title" className="sr-only">
              {t("formTitle")}
            </h2>
            <ContactForm email={email} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
