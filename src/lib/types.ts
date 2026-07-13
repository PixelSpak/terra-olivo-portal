export type Intensity = "Delicate" | "Medium" | "Intense";

export type Prize = string;

export const AWARD_ORDER: Prize[] = [
  "Raúl Castellani International Champion Trophy",
  "Moshe Spak Best International brand",
  "Israel Grand Champion Trophy",
  "Israel Boutique Grand Champion",
  "Best Israeli family Boutique Grand Champion",
  "TOP TEN",
  "Best of Turkey",
  "Best of Spain",
  "Best of Greece",
  "Best of Argentina",
  "Best of Brazil",
  "Best of Creta",
  "Best of Italy",
  "Best of Portugal",
  "Best Sweet Almond",
  "Best Flavored Oil",
  "Best International Organic",
  "Best International Packaging",
  "Best Israeli Comercial Brand",
  "Best Israeli Boutique Brand",
  "Best Israeli Olive Mill",
  "Best Israeli Coratina",
  "Best Israeli Souri",
  "Best Israeli Picual",
  "Best Israeli Arbequina",
  "Best Israeli Koroneiki",
  "Best Israeli Picholine",
  "Best Israeli Blend",
  "Best Israeli Olive Council Quality award",
  "Best Israeli Flavoured",
  "Best Israeli Packaging",
  "Grand Prestige Gold",
  "Prestige Gold",
  "Gold Medal",
];

/** Rank used for sorting — lower number is a higher honour. */
export const PRIZE_RANK: Record<string, number> = Object.fromEntries(
  AWARD_ORDER.map((prize, index) => [prize, index]),
);

export function prizeRank(prize: Prize): number {
  return PRIZE_RANK[prize] ?? 99;
}

export function compareAwards(a: Award, b: Award): number {
  return (
    b.year - a.year ||
    prizeRank(a.prize) - prizeRank(b.prize) ||
    (b.score ?? -1) - (a.score ?? -1) ||
    a.prize.localeCompare(b.prize)
  );
}

/** A single win: one olive oil taking one prize in one competition edition. */
export interface Award {
  year: number;
  prize: Prize;
  /** Competition category, e.g. an intensity class or a special category. */
  category?: string;
  /** Panel score out of 100. */
  score?: number;
  /** Path or URL to the award certificate image (placeholder for now). */
  certificateImage?: string;
  /** Path or URL to a downloadable PDF certificate for this award. */
  certificatePdf?: string;
}

export interface ProducerAward extends Award {
  slug: string;
  producerSlug: string;
  country: string;
  /** Award-specific logo shown on award cards/pages without changing the producer logo. */
  displayLogo?: string;
}

export interface OilAwardEntry {
  kind: "oil";
  slug: string;
  oil: OliveOil;
  producer?: Producer;
  award: Award;
}

export interface ProducerAwardEntry {
  kind: "producer";
  slug: string;
  producer: Producer;
  award: ProducerAward;
}

export type AwardEntry = OilAwardEntry | ProducerAwardEntry;

export interface OliveOil {
  slug: string;
  name: string;
  producerSlug: string;
  country: string;
  region: string;
  varieties: string[];
  intensity: Intensity;
  harvestYear?: number;
  /** Free acidity expressed as %. */
  acidity?: number;
  description: string;
  tastingNotes: string[];
  /** Path or URL to the olive oil photo (placeholder for now). */
  image?: string;
  /** Image format classification: 'good' (proper bottle) or 'bad' (not ideal). */
  format?: "good" | "bad";
  /** Every prize this oil has won, across all editions. */
  awards: Award[];
  /** URL to the official PDF certificate on Google Drive. */
  certificate?: string;
}

export interface Producer {
  slug: string;
  name: string;
  country: string;
  region: string;
  founded?: number;
  description: string;
  website?: string;
  /** Path or URL to the producer photo (placeholder for now). */
  image?: string;
  /** Path or URL to the producer logo. */
  logo?: string;
}
