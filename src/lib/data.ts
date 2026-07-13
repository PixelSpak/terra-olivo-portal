import oilsData from "@/data/oils.json";
import producersData from "@/data/producers.json";
import {
  compareAwards,
  prizeRank,
  type Award,
  type OliveOil,
  type Prize,
  type Producer,
} from "@/lib/types";

const oils = oilsData as OliveOil[];
const producers = producersData as Producer[];

/** Primary award for ordering: newest edition first, then award tier. */
export function bestAward(oil: OliveOil): Award {
  return [...oil.awards].sort(compareAwards)[0];
}

/** Awards sorted newest edition first, then by award tier. */
export function awardsByYear(oil: OliveOil): Award[] {
  return [...oil.awards].sort(compareAwards);
}

export function getAllOils(): OliveOil[] {
  return [...oils].sort((a, b) => {
    const awardOrder = compareAwards(bestAward(a), bestAward(b));
    if (awardOrder !== 0) return awardOrder;

    const aHasImage = !!a.image;
    const bHasImage = !!b.image;

    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;

    return a.name.localeCompare(b.name);
  });
}

export function getAllProducers(): Producer[] {
  return [...producers].sort((a, b) => {
    const aHasLogo = !!a.logo;
    const bHasLogo = !!b.logo;
    if (aHasLogo && !bHasLogo) return -1;
    if (!aHasLogo && bHasLogo) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function getOilBySlug(slug: string): OliveOil | undefined {
  return oils.find((o) => o.slug === slug);
}

export function getProducerBySlug(slug: string): Producer | undefined {
  return producers.find((p) => p.slug === slug);
}

export function getOilsByProducer(producerSlug: string): OliveOil[] {
  return getAllOils().filter((o) => o.producerSlug === producerSlug);
}

/** Total prizes a producer has won across all their oils and editions. */
export function getProducerAwardCount(producerSlug: string): number {
  return getOilsByProducer(producerSlug).reduce(
    (sum, oil) => sum + oil.awards.length,
    0,
  );
}

/** Count of awards a producer holds, grouped by prize tier. */
export function getProducerPrizeBreakdown(
  producerSlug: string,
): { prize: Prize; count: number }[] {
  const counts = new Map<Prize, number>();
  for (const oil of getOilsByProducer(producerSlug)) {
    for (const award of oil.awards) {
      counts.set(award.prize, (counts.get(award.prize) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([prize, count]) => ({ prize, count }))
    .sort((a, b) => prizeRank(a.prize) - prizeRank(b.prize));
}

export function getYears(): number[] {
  const years = new Set<number>();
  for (const oil of oils) for (const a of oil.awards) years.add(a.year);
  return [...years].sort((a, b) => b - a);
}

export function getLatestYear(): number {
  return getYears()[0];
}

export function getPrizes(): Prize[] {
  const prizes = new Set<Prize>();
  for (const oil of oils) for (const a of oil.awards) prizes.add(a.prize);
  return [...prizes].sort((a, b) => prizeRank(a) - prizeRank(b));
}

export function getCountries(): string[] {
  return [...new Set(oils.map((o) => o.country))].sort();
}

/** Oils that won a prize in the given edition year. */
export function getWinnersByYear(year: number): OliveOil[] {
  return getAllOils().filter((o) => o.awards.some((a) => a.year === year));
}

export interface OilFilters {
  query?: string;
  year?: number;
  prize?: string;
  country?: string;
}

export function filterOils(filters: OilFilters): OliveOil[] {
  const query = filters.query?.trim().toLowerCase();
  return getAllOils().filter((oil) => {
    if (filters.country && oil.country !== filters.country) return false;
    if (filters.year && !oil.awards.some((a) => a.year === filters.year))
      return false;
    if (filters.prize && !oil.awards.some((a) => a.prize === filters.prize))
      return false;
    if (query) {
      const haystack = [
        oil.name,
        oil.country,
        ...oil.tastingNotes,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export interface PortalStats {
  oils: number;
  producers: number;
  countries: number;
  awards: number;
  editions: number;
}

export function getPortalStats(): PortalStats {
  return {
    oils: oils.length,
    producers: producers.length,
    countries: getCountries().length,
    awards: oils.reduce((sum, o) => sum + o.awards.length, 0),
    editions: getYears().length,
  };
}
