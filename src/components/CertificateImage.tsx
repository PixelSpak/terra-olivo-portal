"use client";

import { useState } from "react";
import AwardBadge from "@/components/AwardBadge";
import type { Award } from "@/lib/types";

export default function CertificateImage({ award }: { award: Award }) {
  const [failed, setFailed] = useState(false);
  const showImage = award.certificateImage && !failed;

  return (
    <figure className="overflow-hidden rounded-xl border border-olive-200 bg-white">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={award.certificateImage}
          alt={`${award.prize} certificate, ${award.year}`}
          className="h-32 w-full bg-olive-50 object-contain p-2"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="grid h-32 w-full place-items-center bg-gradient-to-br from-cream to-olive-100">
          <div className="text-center">
            <p className="font-serif text-[10px] uppercase tracking-[0.3em] text-olive-500">
              Terra Olivo {award.year}
            </p>
            <p className="mt-1 font-serif text-lg font-bold text-olive-900">
              Certificate
            </p>
          </div>
        </div>
      )}
      <figcaption className="flex items-center justify-between gap-2 border-t border-olive-200 p-2.5">
        <AwardBadge prize={award.prize} year={award.year} />
        {award.score !== undefined && (
          <span className="text-sm font-semibold text-olive-700">
            {award.score}/100
          </span>
        )}
      </figcaption>
    </figure>
  );
}
