import type { Intensity } from "@/lib/types";

const fill: Record<Intensity, string> = {
  Delicate: "#c5d0a5",
  Medium: "#7d8e4a",
  Intense: "#536031",
};

export default function BottleVisual({
  label,
  category,
  className = "",
}: {
  label: string;
  category: Intensity;
  className?: string;
}) {
  const initial = label.trim().charAt(0).toUpperCase();
  return (
    <div
      className={`grid place-items-center bg-gradient-to-b from-olive-50 to-olive-100 ${className}`}
    >
      <svg
        viewBox="0 0 80 160"
        className="h-full max-h-44 w-auto py-5"
        role="img"
        aria-label={`${label} bottle`}
      >
        <rect x="34" y="4" width="12" height="16" rx="2" fill="#2d361a" />
        <path
          d="M30 20 h20 v14 q14 8 14 30 v82 q0 8 -8 8 h-32 q-8 0 -8 -8 v-82 q0 -22 14 -30 z"
          fill={fill[category]}
          stroke="#2d361a"
          strokeWidth="2"
        />
        <rect
          x="20"
          y="74"
          width="40"
          height="56"
          rx="3"
          fill="#f0ebe3"
          opacity="0.92"
        />
        <text
          x="40"
          y="108"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="26"
          fontWeight="bold"
          fill="#2d361a"
        >
          {initial}
        </text>
      </svg>
    </div>
  );
}
