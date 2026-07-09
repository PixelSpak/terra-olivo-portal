import Image from "next/image";
import type { Intensity } from "@/lib/types";

/**
 * Renders an olive oil photo when one is supplied, otherwise a styled
 * fallback. Real photos sit on the same olive-50→olive-100 gradient
 * as the placeholder so cards look consistent.
 */
export default function OilImage({
  src,
  name,
  intensity,
  className = "",
  transparentBg = false,
  sizes = "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 220px",
  eager = false,
}: {
  src?: string;
  name: string;
  intensity: Intensity;
  className?: string;
  transparentBg?: boolean;
  sizes?: string;
  eager?: boolean;
}) {
  const imageSrc = src ?? "/images/default-bottle.png";
  const alt = src ? name : `${name} bottle`;
  const image = (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      className="object-contain p-2 drop-shadow-xl"
      loading={eager ? "eager" : "lazy"}
    />
  );

  if (transparentBg) {
    return (
      <span className={`relative block ${className}`}>
        {image}
      </span>
    );
  }

  return (
    <span
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-b from-olive-50 to-olive-100 ${className}`}
      data-intensity={intensity}
    >
      {image}
    </span>
  );
}
