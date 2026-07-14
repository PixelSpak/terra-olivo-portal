import { getAwardSticker } from "@/lib/awardStickers";
import type { Award } from "@/lib/types";

export const awardStickerMedalClass =
  "h-32 w-32 rotate-6 drop-shadow-[0_14px_28px_rgba(28,34,16,0.24)] transition duration-300 hover:rotate-0 hover:scale-105 group-hover:rotate-0 group-hover:scale-105";

export default function AwardSticker({
  award,
  className = "",
  imageClassName = "",
  priority = false,
  variant = "default",
}: {
  award: Pick<Award, "year" | "prize">;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  variant?: "default" | "card";
}) {
  const sticker = getAwardSticker(award);
  if (!sticker) return null;
  const image =
    variant === "card" && sticker.cardImage ? sticker.cardImage : sticker.image;

  return (
    <span
      className={`block shrink-0 ${className}`}
      title={`${sticker.label} ${sticker.year}`}
      aria-label={`${sticker.label} ${sticker.year}`}
    >
      <span className="relative block h-full w-full">
        <img
          src={image}
          alt=""
          className={`h-full w-full object-contain ${imageClassName}`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </span>
    </span>
  );
}
