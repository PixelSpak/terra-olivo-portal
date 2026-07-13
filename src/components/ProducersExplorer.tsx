"use client";

import { useMemo, useState } from "react";
import ProducerCard from "@/components/ProducerCard";
import type { Producer } from "@/lib/types";

interface Props {
  producers: (Producer & { awardCount: number; oilCount: number })[];
}

export default function ProducersExplorer({ producers }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return producers;

    return producers.filter((p) => {
      const haystack = [p.name, p.country, p.description]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [producers, query]);

  return (
    <div>
      <div className="mb-8 rounded-xl border border-olive-200 bg-white p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search producers by name or country..."
          className="w-full rounded-lg border border-olive-300 bg-white px-4 py-3 text-sm text-olive-900 focus:border-olive-600 focus:outline-none"
          aria-label="Search producers"
        />
        {query && (
          <p className="mt-3 text-sm text-olive-600">
            {results.length} {results.length === 1 ? "producer" : "producers"} found
          </p>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((producer) => (
            <ProducerCard
              key={producer.slug}
              producer={producer}
              awardCount={producer.awardCount}
              oilCount={producer.oilCount}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-olive-600">
          No producers match your search.
        </p>
      )}
    </div>
  );
}
