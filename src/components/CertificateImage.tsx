import AwardBadge from "@/components/AwardBadge";
import type { Award } from "@/lib/types";

export default function CertificateImage({ award }: { award: Award }) {
  if (!award.certificatePdf) return null;

  return (
    <figure className="rounded-xl border border-olive-200 bg-white p-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <AwardBadge prize={award.prize} year={award.year} />
        <a
          href={award.certificatePdf}
          download
          className="rounded-full border border-terracotta-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-terracotta-700 transition-colors hover:border-terracotta-400 hover:text-terracotta-800"
        >
          Download PDF
        </a>
      </figcaption>
    </figure>
  );
}
