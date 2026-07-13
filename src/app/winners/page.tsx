import type { Metadata } from "next";
import WinnersExplorer from "@/components/WinnersExplorer";
import {
  getAllAwardEntries,
  getCountries,
  getPrizes,
  getYears,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Winners",
  description:
    "Browse the 2025 and 2026 Terra Olivo award-winning olive oils, filterable by edition, award and country. Past editions will be uploaded soon.",
};

interface WinnersPageProps {
  searchParams?: Promise<{
    year?: string | string[];
  }>;
}

export default async function WinnersPage({ searchParams }: WinnersPageProps) {
  const years = getYears();
  const params = searchParams ? await searchParams : {};
  const requestedYear = Array.isArray(params.year) ? params.year[0] : params.year;
  const initialYear =
    requestedYear && years.includes(Number(requestedYear)) ? requestedYear : undefined;

  return (
    <div className="container-page py-12">
      <header className="border-b border-olive-200 pb-6">
        <h1 className="font-serif text-3xl font-bold text-olive-900">
          Competition Awards
        </h1>
        <p className="mt-2 text-olive-600">
          Award-winning extra virgin olive oils and producer honors from the 2025 and 2026 Terra Olivo editions.
          Past editions will be uploaded soon.
        </p>
      </header>
      <div className="mt-8">
        <WinnersExplorer
          entries={getAllAwardEntries()}
          years={years}
          prizes={getPrizes()}
          countries={getCountries()}
          initialYear={initialYear}
        />
      </div>
    </div>
  );
}
