import awardStickersData from "@/data/award-stickers.json";
import type { Award, Prize } from "@/lib/types";

export interface AwardSticker {
  year: number;
  label: string;
  slug: string;
  image: string;
  sourceFile: string;
}

const awardStickers = awardStickersData as AwardSticker[];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return normalize(value).replace(/\s+/g, "-");
}

const awardStickerAliases: Record<string, string> = {
  [normalize("Gold Medal")]: "gold",
  [normalize("Grand Prestige Gold")]: "gran-prestige-gold",
  [normalize("Gran Prestige Gold")]: "gran-prestige-gold",
  [normalize("Prestige Gold")]: "prestige-gold",
  [normalize("TOP TEN")]: "top",
  [normalize("Top")]: "top",
  [normalize("Raúl Castellani International Champion Trophy")]:
    "best-international-award",
  [normalize("Raul Castellani International Champion Trophy")]:
    "best-international-award",
  [normalize("Moshe Spak Best International brand")]:
    "best-international-brand",
  [normalize("Moshe Spak Best International Brand")]:
    "best-international-brand",
  [normalize("Israel Boutique Grand Champion")]:
    "israeli-boutique-grand-champion",
  [normalize("Best Israeli Boutique Grand Champion")]:
    "best-israeli-family-boutique-grand-champion",
  [normalize("Best Israeli Family Boutique Grand Champion")]:
    "best-israeli-family-boutique-grand-champion",
  [normalize("Best Israeli family Boutique Grand Champion")]:
    "best-israeli-family-boutique-grand-champion",
  [normalize("Best Flavored Oil")]: "best-flavored",
  [normalize("Best International Packaging")]: "packaging",
  [normalize("Best Israeli Comercial Brand")]: "best-israeli-commercial-brand",
  [normalize("Best Israeli Commercial Brand")]: "best-israeli-commercial-brand",
  [normalize("Best Israeli Flavoured")]: "best-israeli-flavored",
  [normalize("Best Israeli Flavored")]: "best-israeli-flavored",
  [normalize("Best Israeli Olive Council Quality award")]:
    "best-israeli-olive-council-quality-award",
  [normalize("Best Israeli Olive Council Quality Award")]:
    "best-israeli-olive-council-quality-award",
  [normalize("Best of Brazil")]: "best-of-brasil",
  [normalize("Best of Creta")]: "best-of-crete",
  [normalize("Best of Crete")]: "best-of-crete",
  [normalize("Best Packaging")]: "packaging",
  [normalize("Packaging")]: "packaging",
};

const stickersByYearAndSlug = new Map(
  awardStickers.map((sticker) => [`${sticker.year}:${sticker.slug}`, sticker]),
);

export function getAllAwardStickers(): AwardSticker[] {
  return [...awardStickers];
}

export function getAwardSticker(
  award: Pick<Award, "year" | "prize">,
): AwardSticker | undefined {
  const stickerSlug =
    awardStickerAliases[normalize(award.prize)] ?? slugify(award.prize);

  return stickersByYearAndSlug.get(`${award.year}:${stickerSlug}`);
}

export function hasAwardSticker(prize: Prize, year: number): boolean {
  return Boolean(getAwardSticker({ prize, year }));
}
