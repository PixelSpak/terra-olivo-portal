"use client";

import { useMemo, useState } from "react";
import OilCard from "@/components/OilCard";
import {
  compareAwards,
  prizeRank,
  type Award,
  type OliveOil,
  type Prize,
} from "@/lib/types";

interface Props {
  oils: OliveOil[];
  years: number[];
  prizes: Prize[];
  countries: string[];
}

const ALL = "All";

function primaryAwardForFilters(
  oil: OliveOil,
  selectedYear: string,
  selectedPrize: string,
): Award {
  const matchingAwards = oil.awards.filter((award) => {
    if (selectedYear !== ALL && award.year !== Number(selectedYear)) return false;
    if (selectedPrize !== ALL && award.prize !== selectedPrize) return false;
    return true;
  });

  return [...(matchingAwards.length > 0 ? matchingAwards : oil.awards)].sort(
    compareAwards,
  )[0];
}

function hasMatchingAward(
  oil: OliveOil,
  selectedYear: string,
  selectedPrize: string,
): boolean {
  return oil.awards.some((award) => {
    if (selectedYear !== ALL && award.year !== Number(selectedYear)) return false;
    if (selectedPrize !== ALL && award.prize !== selectedPrize) return false;
    return true;
  });
}

function compareAwardsForExplorer(a: Award, b: Award): number {
  return b.year - a.year || prizeRank(a.prize) - prizeRank(b.prize);
}

export default function WinnersExplorer({
  oils,
  years,
  prizes,
  countries,
}: Props) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>(ALL);
  const [prize, setPrize] = useState<string>(ALL);
  const [country, setCountry] = useState<string>(ALL);

  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return oils.filter((oil) => {
      if (country !== ALL && oil.country !== country) return false;
      if (!hasMatchingAward(oil, year, prize)) return false;
      if (q) {
        const haystack = [
          oil.name,
          oil.producerSlug.replace(/-/g, " "),
          oil.country,
          ...oil.tastingNotes,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      const awardOrder = compareAwardsForExplorer(
        primaryAwardForFilters(a, year, prize),
        primaryAwardForFilters(b, year, prize),
      );
      return awardOrder || a.name.localeCompare(b.name);
    });
  }, [oils, query, year, prize, country]);

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

  const selectClass =
    "rounded-lg border border-olive-300 bg-white px-3 py-2 text-sm text-olive-900 focus:border-olive-600 focus:outline-none w-full";

  return (
    <div>
      <div className="rounded-xl border border-olive-200 bg-white p-3 sm:p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search oils, producers, countries..."
          className={selectClass}
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
        </div>
        <div className="mt-3 flex items-center justify-between">
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
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((oil, index) => {
            const displayAward = primaryAwardForFilters(oil, year, prize);
            return (
              <OilCard
                key={oil.slug}
                oil={oil}
                award={displayAward}
                priority={index < 4}
              />
            );
          })}
        </div>
      ) : (
        <p className="mt-12 text-center text-olive-600">
          No winners match these filters.
        </p>
      )}
    </div>
  );
}
