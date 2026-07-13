import type { Award } from "@/lib/types";

interface CertificateDownload {
  key: string;
  label: string;
  href: string;
  year?: number;
}

function certificateApiHref(certificate: string, oilName: string): string | undefined {
  const fileIdMatch = certificate.match(/id=([^&]+)/);
  const fileId = fileIdMatch ? fileIdMatch[1] : null;
  if (!fileId) return undefined;

  return `/api/certificate/${fileId}?name=${encodeURIComponent(`${oilName} Certificate`)}`;
}

export default function CertificateDownloads({
  awards,
  oilName,
  legacyCertificate,
}: {
  awards: Award[];
  oilName: string;
  legacyCertificate?: string;
}) {
  const downloads: CertificateDownload[] = awards
    .filter((award) => award.certificatePdf)
    .map((award) => ({
      key: `${award.year}-${award.prize}`,
      label: award.prize,
      href: award.certificatePdf!,
      year: award.year,
    }));

  const legacyHref = legacyCertificate
    ? certificateApiHref(legacyCertificate, oilName)
    : undefined;
  const legacyAward = awards.find((award) => !award.certificatePdf);

  if (legacyHref) {
    downloads.push({
      key: legacyAward
        ? `${legacyAward.year}-${legacyAward.prize}-legacy`
        : "terraolivo-certificate",
      label: legacyAward?.prize ?? "TerraOlivo certificate",
      href: legacyHref,
      year: legacyAward?.year,
    });
  }

  if (downloads.length === 0) return null;

  const title =
    downloads.length === 1 ? "Download official certificate" : "All certificates";

  return (
    <section className="overflow-hidden rounded-2xl border border-olive-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="px-4 pt-4 font-serif text-xl font-bold text-olive-900">
          {title}
        </h2>
        <span className="px-4 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-olive-500">
          {downloads.length} {downloads.length === 1 ? "file" : "files"}
        </span>
      </div>

      <div className="mt-4 divide-y divide-olive-100 border-t border-olive-100">
        {downloads.map((download) => (
          <a
            key={download.key}
            href={download.href}
            download
            className="group flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition hover:bg-cream/70 focus:outline-none focus-visible:bg-cream/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400/60"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold-400/35 bg-cream font-serif text-xs font-bold text-olive-900">
              PDF
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase leading-snug tracking-[0.12em] text-olive-900">
                {download.label}
              </span>
              {download.year && (
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                  TerraOlivo {download.year}
                </span>
              )}
            </span>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-terracotta-600 transition group-hover:text-terracotta-700">
              Download
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
