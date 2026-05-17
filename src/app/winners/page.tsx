import type { Metadata } from "next";
import WinnersExplorer from "@/components/WinnersExplorer";
import {
  getAllOils,
  getCountries,
  getPrizes,
  getVarieties,
  getYears,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Winners",
  description:
    "Browse every award-winning olive oil from the Terra Olivo competition, filterable by edition, prize and country.",
};

export default function WinnersPage() {
  return (
    <div className="container-page py-12">
      <header className="border-b border-olive-200 pb-6">
        <h1 className="font-serif text-3xl font-bold text-olive-900">
          Competition Winners
        </h1>
        <p className="mt-2 text-olive-600">
          Award-winning extra virgin olive oils from every Terra Olivo edition.
        </p>
      </header>
      <div className="mt-8">
        <WinnersExplorer
          oils={getAllOils()}
          years={getYears()}
          prizes={getPrizes()}
          countries={getCountries()}
          varieties={getVarieties()}
        />
      </div>
    </div>
  );
}
