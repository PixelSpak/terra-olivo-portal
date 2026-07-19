import { getAwardSticker, getAwardStickerPngHref } from "@/lib/awardStickers";
import type { Award } from "@/lib/types";

const CONTACT_EMAIL = "contact@terraolivo-iooc.com";

interface AwardDownload {
  key: string;
  label: string;
  certificateHref?: string;
  medalHref?: string;
  medalFilename?: string;
  medalImage?: string;
  medalAlt?: string;
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
  const downloads: AwardDownload[] = awards.map((award) => {
    const sticker = getAwardSticker(award);
    const medalHref = getAwardStickerPngHref(award);

    return {
      key: `${award.year}-${award.prize}`,
      label: award.prize,
      certificateHref: award.certificatePdf,
      medalHref,
      medalFilename:
        sticker && medalHref
          ? `terraolivo-${sticker.year}-${sticker.slug}-medal.png`
          : undefined,
      medalImage: sticker?.image,
      medalAlt: sticker ? `${sticker.label} ${sticker.year}` : undefined,
      year: award.year,
    };
  });

  const legacyHref = legacyCertificate
    ? certificateApiHref(legacyCertificate, oilName)
    : undefined;
  const legacyAward = awards.find((award) => !award.certificatePdf);

  if (legacyHref && legacyAward) {
    const matchingDownload = downloads.find(
      (download) => download.key === `${legacyAward.year}-${legacyAward.prize}`,
    );

    if (matchingDownload && !matchingDownload.certificateHref) {
      matchingDownload.certificateHref = legacyHref;
    }
  }

  if (legacyHref && !legacyAward) {
    downloads.push({
      key: "terraolivo-certificate",
      label: "TerraOlivo certificate",
      certificateHref: legacyHref,
    });
  }

  const availableDownloads = downloads.filter(
    (download) => download.certificateHref || download.medalHref,
  );
  if (availableDownloads.length === 0) return null;

  const title =
    availableDownloads.length === 1 ? "Official downloads" : "All downloads";
  const hasMedalDownloads = availableDownloads.some((download) => download.medalHref);

  return (
    <section className="overflow-hidden rounded-xl border border-olive-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="px-4 pt-4 font-serif text-xl font-bold text-olive-900">
          {title}
        </h2>
        <span className="px-4 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-olive-500">
          {availableDownloads.length} {availableDownloads.length === 1 ? "award" : "awards"}
        </span>
      </div>

      <div className="mt-4 divide-y divide-olive-100 border-t border-olive-100">
        {availableDownloads.map((download) => (
          <div
            key={download.key}
            className="grid w-full min-w-0 grid-cols-[3rem_1fr] items-center gap-x-3 gap-y-3 px-4 py-4 text-left sm:grid-cols-[3rem_1fr_auto] sm:gap-x-4 sm:py-3"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center">
              {download.medalImage ? (
                <img
                  src={download.medalImage}
                  alt={download.medalAlt ?? ""}
                  className="h-12 w-12 object-contain drop-shadow-[0_5px_9px_rgba(28,34,16,0.18)]"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full border border-gold-400/35 bg-cream font-serif text-xs font-bold text-olive-900">
                  {download.year}
                </span>
              )}
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
            <span className="col-span-2 grid w-full grid-cols-1 gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] sm:col-span-1 sm:flex sm:w-auto sm:shrink-0 sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
              {download.certificateHref && (
                <a
                  href={download.certificateHref}
                  download
                  className="rounded-sm border border-terracotta-200 bg-terracotta-50/40 px-3 py-2 text-center text-terracotta-700 underline-offset-4 transition hover:text-terracotta-800 focus:outline-none focus:ring-2 focus:ring-gold-400/40 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-left sm:hover:underline"
                >
                  Download certificate
                </a>
              )}
              {download.medalHref && (
                <a
                  href={download.medalHref}
                  download={download.medalFilename}
                  className="rounded-sm border border-olive-200 bg-olive-50/60 px-3 py-2 text-center text-olive-700 underline-offset-4 transition hover:text-olive-950 focus:outline-none focus:ring-2 focus:ring-gold-400/40 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-left sm:hover:underline"
                >
                  Download medal file
                </a>
              )}
            </span>
          </div>
        ))}
      </div>
      {hasMedalDownloads && (
        <p className="border-t border-olive-100 px-4 py-3 text-xs leading-relaxed text-olive-500">
          * For high-resolution artwork and print-ready files, please contact us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-olive-700 underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}
    </section>
  );
}
