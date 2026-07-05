export type Intensity = "Delicate" | "Medium" | "Intense";

export type Prize = string;

/** Rank used for sorting — lower number is a higher honour. */
export const PRIZE_RANK: Record<string, number> = {
  "Raúl Castellani International Champion Trophy": 0,
  "Moshe Spak Best International brand": 1,
  "Israel Grand Champion Trophy": 2,
  "Israel Boutique Grand Champion": 3,
  "Best Israeli Family Boutique Grand Champion": 4,
  "Grand Prestige Gold": 5,
  "Gold Medal": 6,
  "Prestige Gold": 7,
  "Prestige Silver": 8,
  "TOP TEN": 9,
};

export function prizeRank(prize: Prize): number {
  return PRIZE_RANK[prize] ?? 50;
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
}

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
