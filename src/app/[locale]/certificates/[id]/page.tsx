import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CertificateActions } from "@/components/certificates/CertificateActions";
import { CertificateDocument } from "@/components/certificates/CertificateDocument";
import { SiteHeader } from "@/components/site/SiteHeader";
import { toLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { getCertificate } from "@/lib/data/certificates";
import { localizedPath, privatePageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Params = PageProps<"/[locale]/certificates/[id]">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, id } = await params;
  const locale = toLocale(raw);
  const cert = await getCertificate(id, locale);
  if (!cert) return privatePageMetadata;
  const t = await getTranslations({ locale, namespace: "certificate" });
  // Shareable by link, but kept out of search engines: it shows a person's name.
  return {
    ...privatePageMetadata,
    title: t("metaTitle", { name: cert.holderName, course: cert.courseTitle }),
    description: t("metaDescription", { name: cert.holderName, course: cert.courseTitle, percent: cert.scorePercent }),
  };
}

export default async function CertificatePage({ params }: Params) {
  const { locale: raw, id } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);
  const cert = await getCertificate(id, locale);
  if (!cert) notFound();

  const [t, format] = await Promise.all([getTranslations({ locale, namespace: "certificate" }), getFormatter({ locale })]);
  const url = absoluteUrl(localizedPath(`/certificates/${cert.id}`, locale));
  const issued = new Date(cert.issuedAt);
  const linkedIn = new URL("https://www.linkedin.com/profile/add");
  linkedIn.search = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${cert.courseTitle} · Assay`,
    organizationName: "Assay",
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: url,
    certId: cert.id,
  }).toString();

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-paper-2 focus:outline-none print:min-h-0 print:bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 print:hidden"
          style={{ backgroundImage: "radial-gradient(50rem 30rem at 50% -10%, rgb(201 162 39 / 0.18), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14 print:p-0">
          <div className="mb-8 print:hidden">
            <Link
              href={`/courses/${cert.courseSlug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:underline hover:decoration-gold-500 hover:underline-offset-4"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              {t("backToCourse")}
            </Link>
          </div>

          <CertificateDocument
            id={cert.id}
            holderName={cert.holderName}
            courseTitle={cert.courseTitle}
            issuedOn={format.dateTime(issued, { dateStyle: "long" })}
            percent={cert.scorePercent}
            verifyUrl={url.replace(/^https?:\/\//, "")}
            labels={{
              eyebrow: t("eyebrow"),
              certifies: t("certifies"),
              completed: t("completed"),
              withScore: t("withScore", { percent: cert.scorePercent }),
              issuer: t("issuer"),
              id: t("id"),
              verify: t("verify"),
              seal: t("seal"),
            }}
          />

          <div className="mt-10">
            <CertificateActions url={url} linkedInUrl={linkedIn.toString()} />
          </div>
        </div>
      </main>
    </>
  );
}
