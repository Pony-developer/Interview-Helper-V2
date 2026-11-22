import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CertificateActions } from "@/components/certificates/CertificateActions";
import { CertificateDocument } from "@/components/certificates/CertificateDocument";
import { SiteHeader } from "@/components/site/SiteHeader";
import { toLocale } from "@/i18n/locale";

/** Development preview of the certificate design with sample data (404 in production). */
export default async function DevCertificate({ params }: PageProps<"/[locale]/dev/certificate">) {
  if (process.env.NODE_ENV === "production") notFound();
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const [t, format] = await Promise.all([getTranslations({ locale, namespace: "certificate" }), getFormatter({ locale })]);
  const id = "3f2a9c1e-7b4d-4e8a-9c21-5d6e7f8a9b0c";

  return (
    <>
      <SiteHeader />
      <main id="main" className="on-light bg-paper-2 px-4 py-10 sm:px-8 print:bg-white print:p-0">
        <CertificateDocument
          id={id}
          holderName="Olena Kovalenko"
          courseTitle="C#"
          issuedOn={format.dateTime(new Date("2026-11-22T12:00:00Z"), { dateStyle: "long" })}
          percent={94}
          verifyUrl={`assay.dev/certificates/${id}`}
          labels={{
            eyebrow: t("eyebrow"),
            certifies: t("certifies"),
            completed: t("completed"),
            withScore: t("withScore", { percent: 94 }),
            issuer: t("issuer"),
            id: t("id"),
            verify: t("verify"),
            seal: t("seal"),
          }}
        />
        <div className="mt-10">
          <CertificateActions url={`https://assay.dev/certificates/${id}`} linkedInUrl="https://www.linkedin.com/profile/add" />
        </div>
      </main>
    </>
  );
}
