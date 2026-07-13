import oilsData from "@/data/oils.json";
import producerAwardsData from "@/data/producer-awards.json";
import producersData from "@/data/producers.json";
import {
  compareAwards,
  prizeRank,
  type Award,
  type AwardEntry,
  type OilAwardEntry,
  type OliveOil,
  type Prize,
  type Producer,
  type ProducerAward,
  type ProducerAwardEntry,
} from "@/lib/types";

const oils = oilsData as OliveOil[];
const producers = producersData as Producer[];
const producerAwards = producerAwardsData as ProducerAward[];
const producersBySlug = new Map(producers.map((producer) => [producer.slug, producer]));

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function oilAwardSlug(oil: OliveOil, award: Award): string {
  return `${oil.slug}-${award.year}-${slugify(award.prize)}`;
}

export function getAwardEntryTitle(entry: AwardEntry): string {
  return entry.kind === "oil" ? entry.oil.name : entry.producer.name;
}

export function compareAwardEntries(a: AwardEntry, b: AwardEntry): number {
  return (
    compareAwards(a.award, b.award) ||
    getAwardEntryTitle(a).localeCompare(getAwardEntryTitle(b))
  );
}

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
  return producersBySlug.get(slug);
}

export function getOilsByProducer(producerSlug: string): OliveOil[] {
  return getAllOils().filter((o) => o.producerSlug === producerSlug);
}

export function getProducerAwards(producerSlug?: string): ProducerAward[] {
  const awards = producerSlug
    ? producerAwards.filter((award) => award.producerSlug === producerSlug)
    : producerAwards;

  return [...awards].sort(compareAwards);
}

export function getAllAwardEntries(): AwardEntry[] {
  const oilEntries: OilAwardEntry[] = oils.flatMap((oil) =>
    oil.awards.map((award) => ({
      kind: "oil" as const,
      slug: oilAwardSlug(oil, award),
      oil,
      producer: getProducerBySlug(oil.producerSlug),
      award,
    })),
  );

  const producerEntries: ProducerAwardEntry[] = producerAwards.flatMap((award) => {
    const producer = getProducerBySlug(award.producerSlug);
    if (!producer) return [];
    return [
      {
        kind: "producer" as const,
        slug: award.slug,
        producer,
        award,
      },
    ];
  });

  return [...oilEntries, ...producerEntries].sort(compareAwardEntries);
}

export function getAwardEntryBySlug(slug: string): AwardEntry | undefined {
  return getAllAwardEntries().find((entry) => entry.slug === slug);
}

/** Total prizes a producer has won across all their oils and editions. */
export function getProducerAwardCount(producerSlug: string): number {
  const oilAwardCount = getOilsByProducer(producerSlug).reduce(
    (sum, oil) => sum + oil.awards.length,
    0,
  );
  return oilAwardCount + getProducerAwards(producerSlug).length;
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
  for (const award of getProducerAwards(producerSlug)) {
    counts.set(award.prize, (counts.get(award.prize) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([prize, count]) => ({ prize, count }))
    .sort((a, b) => prizeRank(a.prize) - prizeRank(b.prize));
}

export function getYears(): number[] {
  const years = new Set<number>();
  for (const oil of oils) for (const a of oil.awards) years.add(a.year);
  for (const award of producerAwards) years.add(award.year);
  return [...years].sort((a, b) => b - a);
}

export function getLatestYear(): number {
  return getYears()[0];
}

export function getPrizes(): Prize[] {
  const prizes = new Set<Prize>();
  for (const oil of oils) for (const a of oil.awards) prizes.add(a.prize);
  for (const award of producerAwards) prizes.add(award.prize);
  return [...prizes].sort((a, b) => prizeRank(a) - prizeRank(b));
}

export function getCountries(): string[] {
  return [
    ...new Set([
      ...oils.map((o) => o.country),
      ...producerAwards.map((award) => award.country),
    ]),
  ].sort();
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
    awards: oils.reduce((sum, o) => sum + o.awards.length, 0) + producerAwards.length,
    editions: getYears().length,
  };
}
