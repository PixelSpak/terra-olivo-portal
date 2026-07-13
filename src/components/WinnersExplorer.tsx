"use client";

import { useMemo, useState } from "react";
import AwardEntryCard from "@/components/AwardEntryCard";
import {
  prizeRank,
  type AwardEntry,
  type OliveOil,
  type Prize,
} from "@/lib/types";

interface Props {
  entries: AwardEntry[];
  years: number[];
  prizes: Prize[];
  countries: string[];
  initialYear?: string;
}

const ALL = "All";

function entryCountry(entry: AwardEntry): string {
  return entry.kind === "oil" ? entry.oil.country : entry.award.country;
}

function oilSearchableText(oil: OliveOil, prize: Prize): string {
  return [
    oil.name,
    oil.producerSlug.replace(/-/g, " "),
    oil.country,
    prize,
    ...oil.tastingNotes,
  ]
    .join(" ")
    .toLowerCase();
}

function producerAwardSearchableText(entry: AwardEntry): string {
  if (entry.kind !== "producer") return "";

  return [
    entry.producer.name,
    entry.producer.country,
    entry.producer.description,
    entry.award.prize,
  ]
    .join(" ")
    .toLowerCase();
}

export default function WinnersExplorer({
  entries,
  years,
  prizes,
  countries,
  initialYear = ALL,
}: Props) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>(initialYear);
  const [prize, setPrize] = useState<string>(ALL);
  const [country, setCountry] = useState<string>(ALL);

  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (country !== ALL && entryCountry(entry) !== country) return false;
      if (year !== ALL && entry.award.year !== Number(year)) return false;
      if (prize !== ALL && entry.award.prize !== prize) return false;
      if (q) {
        const haystack =
          entry.kind === "oil"
            ? oilSearchableText(entry.oil, entry.award.prize)
            : producerAwardSearchableText(entry);
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      const aName = a.kind === "oil" ? a.oil.name : a.producer.name;
      const bName = b.kind === "oil" ? b.oil.name : b.producer.name;
      return (
        b.award.year - a.award.year ||
        prizeRank(a.award.prize) - prizeRank(b.award.prize) ||
        aName.localeCompare(bName)
      );
    });
  }, [entries, query, year, prize, country]);

  const reset = () => {
    setQuery("");
    setYear(ALL);
    setPrize(ALL);
    setCountry(ALL);
  };

  const isFiltered =
    query !== "" ||
    year !== ALL ||
    prize !== ALL ||
    country !== ALL;

  const inputClass =
    "rounded-lg border border-olive-300 bg-white px-3 py-2 text-sm text-olive-900 focus:border-olive-600 focus:outline-none w-full";
  const selectClass =
    "w-full appearance-none rounded-lg border border-olive-300 bg-white py-2 pl-3 pr-12 text-sm text-olive-900 focus:border-olive-600 focus:outline-none";
  const selectStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23536031' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundPosition: "right 1rem center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "18px 18px",
  };

  return (
    <div>
      <div className="rounded-xl border border-olive-200 bg-white p-3 sm:p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search olive oils, producers, countries..."
          className={inputClass}
          aria-label="Search winners"
        />

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="mt-2 flex w-full items-center justify-center rounded-lg border border-olive-200 bg-cream/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-olive-800 transition-colors hover:bg-olive-50 lg:hidden"
        >
          {showFilters ? "Hide filters" : "Show filters"}
        </button>

        <div className={`${showFilters ? "grid" : "hidden"} mt-3 gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-3`}>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={selectClass}
            style={selectStyle}
            aria-label="Filter by edition"
          >
            <option value={ALL}>All years</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            className={selectClass}
            style={selectStyle}
            aria-label="Filter by award"
          >
            <option value={ALL}>All awards</option>
            {[...prizes]
              .sort((a, b) => prizeRank(a) - prizeRank(b))
              .map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
          </select>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={selectClass}
            style={selectStyle}
            aria-label="Filter by country"
          >
            <option value={ALL}>All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-olive-600">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium text-olive-700 hover:text-olive-500"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((entry, index) => (
            <AwardEntryCard
              key={entry.slug}
              entry={entry}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-olive-600">
          No awards match these filters.
        </p>
      )}
    </div>
  );
}
