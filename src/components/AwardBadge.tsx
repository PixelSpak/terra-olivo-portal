import type { Prize } from "@/lib/types";

const styles: Record<Prize, string> = {
  "Grand Prestige Gold": "bg-gold-400 text-olive-950",
  "Best in Class": "bg-terracotta-500 text-white",
  "Prestige Gold": "bg-gold-500 text-olive-950",
  "Prestige Silver": "bg-olive-200 text-olive-900",
};

export default function AwardBadge({
  prize,
  year,
  className = "",
}: {
  prize: Prize;
  year?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[prize]} ${className}`}
    >
      {prize}
      {year !== undefined && (
        <span className="font-normal opacity-80">{year}</span>
      )}
    </span>
  );
}
