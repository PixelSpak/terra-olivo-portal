import AwardBadge from "@/components/AwardBadge";
import { getAwardSticker, getAwardStickerPngHref } from "@/lib/awardStickers";
import type { Award } from "@/lib/types";

const CONTACT_EMAIL = "contact@terraolivo-iooc.com";

export default function CertificateImage({ award }: { award: Award }) {
  const sticker = getAwardSticker(award);
  const medalHref = getAwardStickerPngHref(award);

  if (!award.certificatePdf && !sticker) return null;

  return (
    <figure className="rounded-xl border border-olive-200 bg-white p-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <AwardBadge prize={award.prize} year={award.year} />
        <span className="grid w-full grid-cols-1 gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] sm:w-auto sm:grid-cols-none sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
          {award.certificatePdf && (
            <a
              href={award.certificatePdf}
              download
              className="rounded-sm border border-terracotta-200 bg-terracotta-50/40 px-3 py-2 text-center text-terracotta-700 underline-offset-4 transition hover:text-terracotta-800 focus:outline-none focus:ring-2 focus:ring-gold-400/40 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-left sm:hover:underline"
            >
              Download certificate
            </a>
          )}
          {sticker && medalHref && (
            <a
              href={medalHref}
              download={`terraolivo-${sticker.year}-${sticker.slug}-medal.png`}
              className="rounded-sm border border-olive-200 bg-olive-50/60 px-3 py-2 text-center text-olive-700 underline-offset-4 transition hover:text-olive-950 focus:outline-none focus:ring-2 focus:ring-gold-400/40 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-left sm:hover:underline"
            >
              Download medal file
            </a>
          )}
        </span>
      </figcaption>
      {sticker && medalHref && (
        <p className="mt-2 border-t border-olive-100 pt-2 text-xs leading-relaxed text-olive-500">
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
    </figure>
  );
}
