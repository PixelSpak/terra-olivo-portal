const COUNTRY_FLAG_CODES: Record<string, string> = {
  Argentina: "ar",
  Australia: "au",
  Brazil: "br",
  Chile: "cl",
  Croatia: "hr",
  Cyprus: "cy",
  Greece: "gr",
  Israel: "il",
  Italy: "it",
  Jordan: "jo",
  Malta: "mt",
  Peru: "pe",
  Portugal: "pt",
  "South Africa": "za",
  Spain: "es",
  Turkey: "tr",
  "United States": "us",
};

export function getCountryFlag(country: string): string | undefined {
  const code = COUNTRY_FLAG_CODES[country];
  if (!code) return undefined;

  return `/images/flags/${code}.svg`;
}

