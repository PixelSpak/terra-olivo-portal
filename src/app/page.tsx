import Link from "next/link";
import OilCard from "@/components/OilCard";
import ProducerCard from "@/components/ProducerCard";
import {
  getAllProducers,
  getLatestYear,
  getOilsByProducer,
  getPortalStats,
  getProducerAwardCount,
  getWinnersByYear,
} from "@/lib/data";

export default function HomePage() {
  const stats = getPortalStats();
  const latestYear = getLatestYear();
  const latestWinners = getWinnersByYear(latestYear).slice(0, 6);
  const topProducers = [...getAllProducers()]
    .sort((a, b) => getProducerAwardCount(b.slug) - getProducerAwardCount(a.slug))
    .slice(0, 3);

  return (
    <>
      <section className="bg-olive-900 text-cream">
        <div className="container-page grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
              International Olive Oil Competition
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              The Terra Olivo Winners
            </h1>
            <p className="mt-5 max-w-md text-olive-200">
              Every year the Terra Olivo competition awards the finest extra
              virgin olive oils from around the world. Browse the winners, the
              prizes they earned and the producers behind them.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/winners"
                className="rounded-sm bg-terracotta-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-terracotta-600"
              >
                Browse Winners
              </Link>
              <Link
                href="/producers"
                className="rounded-sm border border-cream px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-cream hover:bg-olive-800"
              >
                Explore Producers
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Winning Oils", value: stats.oils },
              { label: "Prizes Awarded", value: stats.awards },
              { label: "Producers", value: stats.producers },
              { label: "Countries", value: stats.countries },
              { label: "Editions", value: stats.editions },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-olive-700 bg-olive-800 p-5 text-center"
              >
                <dt className="font-serif text-3xl font-bold text-gold-400">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-olive-200">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-olive-900">
              {latestYear} Winners
            </h2>
            <p className="mt-1 text-sm text-olive-600">
              Top oils from the latest Terra Olivo edition.
            </p>
          </div>
          <Link
            href="/winners"
            className="text-sm font-semibold text-olive-700 hover:text-olive-500"
          >
            View all winners &rarr;
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestWinners.map((oil) => (
            <OilCard key={oil.slug} oil={oil} />
          ))}
        </div>
      </section>

      <section className="bg-olive-50 py-16">
        <div className="container-page">
          <h2 className="text-center font-serif text-2xl font-bold text-olive-900">
            How the Competition Works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Submission",
                text: "Producers from around the world submit their extra virgin olive oils for the annual competition.",
              },
              {
                step: "02",
                title: "Blind Tasting",
                text: "An international panel scores each oil on aroma, balance, fruitiness, bitterness and pungency.",
              },
              {
                step: "03",
                title: "The Prizes",
                text: "Winning oils are awarded prizes and certificates, then published here in the Terra Olivo portal.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="font-serif text-3xl font-bold text-terracotta-500">
                  {item.step}
                </span>
                <h3 className="mt-2 font-serif text-lg font-semibold text-olive-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-olive-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-2xl font-bold text-olive-900">
            Most Awarded Producers
          </h2>
          <Link
            href="/producers"
            className="text-sm font-semibold text-olive-700 hover:text-olive-500"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topProducers.map((producer) => (
            <ProducerCard
              key={producer.slug}
              producer={producer}
              awardCount={getProducerAwardCount(producer.slug)}
              oilCount={getOilsByProducer(producer.slug).length}
            />
          ))}
        </div>
      </section>
    </>
  );
}
