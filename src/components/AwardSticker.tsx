import Image from "next/image";
import { getAwardSticker } from "@/lib/awardStickers";
import type { Award } from "@/lib/types";

export default function AwardSticker({
  award,
  className = "",
  imageClassName = "",
  sizes = "80px",
  priority = false,
}: {
  award: Pick<Award, "year" | "prize">;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const sticker = getAwardSticker(award);
  if (!sticker) return null;

  return (
    <span
      className={`block shrink-0 ${className}`}
      title={`${sticker.label} ${sticker.year}`}
      aria-label={`${sticker.label} ${sticker.year}`}
    >
      <span className="relative block h-full w-full">
        <Image
          src={sticker.image}
          alt=""
          fill
          sizes={sizes}
          className={`object-contain ${imageClassName}`}
          priority={priority}
        />
      </span>
    </span>
  );
}
