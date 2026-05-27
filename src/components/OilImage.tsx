import BottleVisual from "@/components/BottleVisual";
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
}: {
  src?: string;
  name: string;
  intensity: Intensity;
  className?: string;
  transparentBg?: boolean;
}) {
  if (src) {
    if (transparentBg) {
      // Direct img without wrappers to prevent flex/grid explosion bugs
      return (
        <img
          src={src}
          alt={name}
          className={`object-contain ${className}`}
        />
      );
    }
    return (
      <div
        className={`grid place-items-center bg-gradient-to-b from-olive-50 to-olive-100 ${className}`}
      >
        <img
          src={src}
          alt={name}
          className="h-full w-auto object-contain py-2 drop-shadow-xl"
        />
      </div>
    );
  }
  return (
    <BottleVisual label={name} category={intensity} className={className} />
  );
}
