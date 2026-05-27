import Link from "next/link";
import AwardBadge from "@/components/AwardBadge";
import OilImage from "@/components/OilImage";
import { bestAward } from "@/lib/data";
import type { OliveOil } from "@/lib/types";

export default function OilCard({ oil }: { oil: OliveOil }) {
  const best = bestAward(oil);
  const wins = oil.awards.length;

  return (
    <Link
      href={`/winners/${oil.slug}`}
      className="group relative flex flex-col h-full transition hover:-translate-y-1"
    >
      <div className="relative flex-1 flex flex-col rounded-2xl bg-olive-900 border border-olive-800 shadow-md p-5 text-center">
        
        {/* Score Badge */}
        {best.score !== undefined && (
          <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-sm font-bold text-olive-950 z-30 shadow-md">
            {best.score}
          </span>
        )}

        {/* Contained Bottle Image */}
        <div className="flex justify-center items-center h-52 w-full mb-4 pointer-events-none z-20">
           <OilImage
             src={oil.image}
             name={oil.name}
             intensity={oil.intensity}
             className="h-full object-contain drop-shadow-xl"
             transparentBg
           />
        </div>

        <div className="flex flex-col items-center justify-end gap-1.5 mt-auto">
          <h3 className="font-serif text-xl font-bold text-cream group-hover:text-gold-400 transition-colors leading-tight">
            {oil.name}
          </h3>
          <p className="text-xs font-medium text-olive-300">
            by {oil.producerSlug?.replace(/-/g, ' ')}
          </p>
          <p className="text-xs font-semibold text-olive-400 mt-1">
            {oil.country} {oil.intensity ? `· ${oil.intensity}` : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}
