import type { Metadata } from "next";
import ProducersExplorer from "@/components/ProducersExplorer";
import {
  getAllProducers,
  getOilsByProducer,
  getProducerAwardCount,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Producers",
  description:
    "Meet the olive oil producers awarded in the Terra Olivo competition and see how many awards each has won.",
};

export default function ProducersPage() {
  const producersData = [...getAllProducers()].map((producer) => ({
    ...producer,
    awardCount: getProducerAwardCount(producer.slug),
    oilCount: getOilsByProducer(producer.slug).length,
  })).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="container-page py-12">
      <header className="border-b border-olive-200 pb-6 mb-8">
        <h1 className="font-serif text-3xl font-bold text-olive-900">
          Producers
        </h1>
        <p className="mt-2 text-olive-600">
          {producersData.length} estates and mills behind the Terra Olivo winners,
          listed alphabetically.
        </p>
      </header>
      
      <ProducersExplorer producers={producersData} />
    </div>
  );
}
