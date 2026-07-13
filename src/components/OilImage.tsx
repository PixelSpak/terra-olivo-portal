"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fallbackOilImageSrc, TEMP_BOTTLE_IMAGE } from "@/lib/imageFallback";
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
  imageClassName = "",
  transparentBg = false,
  sizes = "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 220px",
  eager = false,
}: {
  src?: string;
  name: string;
  intensity: Intensity;
  className?: string;
  imageClassName?: string;
  transparentBg?: boolean;
  sizes?: string;
  eager?: boolean;
}) {
  const initialImageSrc = src ?? TEMP_BOTTLE_IMAGE;
  const [imageSrc, setImageSrc] = useState(initialImageSrc);
  const alt = imageSrc === TEMP_BOTTLE_IMAGE ? `${name} bottle` : name;

  useEffect(() => {
    setImageSrc(initialImageSrc);
  }, [initialImageSrc]);

  const image = (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-contain p-1 drop-shadow-xl ${imageClassName}`}
      loading={eager ? "eager" : "lazy"}
      preload={eager}
      onError={() => {
        setImageSrc((currentSrc) => fallbackOilImageSrc(currentSrc));
      }}
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
