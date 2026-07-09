import Link from "next/link";
import Image from "next/image";
import type { Producer } from "@/lib/types";

export default function ProducerCard({
  producer,
  awardCount,
  oilCount,
}: {
  producer: Producer;
  awardCount: number;
  oilCount: number;
}) {
  return (
    <Link
      href={`/producers/${producer.slug}`}
      className="group flex flex-col rounded-xl border border-olive-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {producer.logo ? (
          <Image
            src={producer.logo}
            alt={producer.name}
            width={48}
            height={48}
            sizes="48px"
            className="h-12 w-12 shrink-0 rounded-full object-cover border border-olive-200"
          />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-olive-700 font-serif text-xl font-bold text-cream">
            {producer.name.charAt(0)}
          </span>
        )}
        <div>
          <h3 className="font-serif text-lg font-semibold text-olive-900 group-hover:text-olive-600">
            {producer.name}
          </h3>
          <p className="text-sm text-olive-600">
            {producer.region}, {producer.country}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-olive-700">
        {producer.description}
      </p>
      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-sm bg-terracotta-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {awardCount} {awardCount === 1 ? "award" : "awards"} won
        </span>
        <span className="rounded-full bg-olive-100 px-3 py-1 text-xs font-medium text-olive-700">
          {oilCount} {oilCount === 1 ? "oil" : "oils"}
        </span>
      </div>
    </Link>
  );
}
