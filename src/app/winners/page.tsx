import type { Metadata } from "next";
import WinnersExplorer from "@/components/WinnersExplorer";
import {
  getAllOils,
  getCountries,
  getPrizes,
  getYears,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Winners",
  description:
    "Browse the 2025 and 2026 Terra Olivo award-winning olive oils, filterable by edition, award and country. Past editions will be uploaded soon.",
};

export default function WinnersPage() {
  return (
    <div className="container-page py-12">
      <header className="border-b border-olive-200 pb-6">
        <h1 className="font-serif text-3xl font-bold text-olive-900">
          Competition Winners
        </h1>
        <p className="mt-2 text-olive-600">
          Award-winning extra virgin olive oils from the 2025 and 2026 Terra Olivo editions.
          Past editions will be uploaded soon.
        </p>
      </header>
      <div className="mt-8">
        <WinnersExplorer
          oils={getAllOils()}
          years={getYears()}
          prizes={getPrizes()}
          countries={getCountries()}
        />
      </div>
    </div>
  );
}
