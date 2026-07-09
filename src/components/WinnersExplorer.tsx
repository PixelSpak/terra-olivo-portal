"use client";

import { useMemo, useState } from "react";
import OilCard from "@/components/OilCard";
import { prizeRank, type OliveOil, type Prize } from "@/lib/types";

interface Props {
  oils: OliveOil[];
  years: number[];
  prizes: Prize[];
  countries: string[];
  varieties: string[];
}

const ALL = "All";

export default function WinnersExplorer({
  oils,
  years,
  prizes,
  countries,
  varieties,
}: Props) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>(ALL);
  const [prize, setPrize] = useState<string>(ALL);
  const [country, setCountry] = useState<string>(ALL);
  const [variety, setVariety] = useState<string>(ALL);

  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return oils.filter((oil) => {
      if (country !== ALL && oil.country !== country) return false;
      if (variety !== ALL && !oil.varieties.includes(variety)) return false;
      if (year !== ALL && !oil.awards.some((a) => a.year === Number(year)))
        return false;
      if (prize !== ALL && !oil.awards.some((a) => a.prize === prize))
        return false;
      if (q) {
        const haystack = [
          oil.name,
          oil.region,
          oil.country,
          ...oil.varieties,
          ...oil.tastingNotes,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      const rank = (oil: OliveOil) => {
        if (!oil.image) return 3; // Missing image at the very bottom
        if (oil.format === "good") return 1; // Good format at the very top
        return 2; // Bad format in the middle
      };
      return rank(a) - rank(b);
    });
  }, [oils, query, year, prize, country, variety]);

  const reset = () => {
    setQuery("");
    setYear(ALL);
    setPrize(ALL);
    setCountry(ALL);
    setVariety(ALL);
  };

  const isFiltered =
    query !== "" ||
    year !== ALL ||
    prize !== ALL ||
    country !== ALL ||
    variety !== ALL;

  const selectClass =
    "rounded-lg border border-olive-300 bg-white px-3 py-2 text-sm text-olive-900 focus:border-olive-600 focus:outline-none w-full";

  return (
    <div>
      <div className="mb-6 flex space-x-2 rounded-xl bg-olive-100 p-1 overflow-x-auto">
        <button
          onClick={() => setYear(ALL)}
          className={`whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${year === ALL ? 'bg-white text-olive-900 shadow-sm' : 'text-olive-600 hover:text-olive-900 hover:bg-olive-200/50'}`}
        >
          All Editions
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y.toString())}
            className={`whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${year === y.toString() ? 'bg-white text-olive-900 shadow-sm' : 'text-olive-600 hover:text-olive-900 hover:bg-olive-200/50'}`}
          >
            {y} Edition
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-olive-200 bg-white p-4">
        {/* Mobile toggle button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex w-full items-center justify-between lg:hidden text-olive-900 font-semibold mb-2"
        >
          <span>Filters</span>
          <span className="text-xl leading-none">{showFilters ? "−" : "+"}</span>
        </button>

        <div className={`${showFilters ? "grid" : "hidden"} lg:grid gap-3 sm:grid-cols-2 lg:grid-cols-4`}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search oils, varieties, notes…"
            className={selectClass}
            aria-label="Search winners"
          />

          <select
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            className={selectClass}
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
            aria-label="Filter by country"
          >
            <option value={ALL}>All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            className={selectClass}
            aria-label="Filter by olive variety"
          >
            <option value={ALL}>All varieties</option>
            {varieties.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className={`mt-3 flex items-center justify-between ${!showFilters ? 'lg:flex' : ''}`}>
          <p className="text-sm text-olive-600">
            {results.length} {results.length === 1 ? "winner" : "winners"}
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
        <div className="mt-6 grid gap-2 sm:gap-6 grid-cols-3 lg:grid-cols-4">
          {results.map((oil, index) => (
            <OilCard key={oil.slug} oil={oil} priority={index < 4} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-olive-600">
          No winners match these filters.
        </p>
      )}
    </div>
  );
}
