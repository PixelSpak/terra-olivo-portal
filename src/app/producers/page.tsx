import type { Metadata } from "next";
import ProducerCard from "@/components/ProducerCard";
import {
  getAllProducers,
  getOilsByProducer,
  getProducerAwardCount,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Producers",
  description:
    "Meet the olive oil producers awarded in the Terra Olivo competition and see how many prizes each has won.",
};

export default function ProducersPage() {
  const producers = [...getAllProducers()].sort((a, b) => {
    const aHasLogo = !!a.logo;
    const bHasLogo = !!b.logo;
    if (aHasLogo && !bHasLogo) return -1;
    if (!aHasLogo && bHasLogo) return 1;
    return getProducerAwardCount(b.slug) - getProducerAwardCount(a.slug);
  });

  return (
    <div className="container-page py-12">
      <header className="border-b border-olive-200 pb-6">
        <h1 className="font-serif text-3xl font-bold text-olive-900">
          Producers
        </h1>
        <p className="mt-2 text-olive-600">
          {producers.length} estates and mills behind the Terra Olivo winners,
          ranked by prizes won.
        </p>
      </header>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {producers.map((producer) => (
          <ProducerCard
            key={producer.slug}
            producer={producer}
            awardCount={getProducerAwardCount(producer.slug)}
            oilCount={getOilsByProducer(producer.slug).length}
          />
        ))}
      </div>
    </div>
  );
}
