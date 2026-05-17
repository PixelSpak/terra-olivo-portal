import Link from "next/link";
import ProducerCard from "@/components/ProducerCard";
import {
  getAllProducers,
  getLatestYear,
  getOilsByProducer,
  getPortalStats,
  getProducerAwardCount,
} from "@/lib/data";

const SPONSORS = [
  { name: "IOOC International", sub: "Founding Partner" },
  { name: "Israel Olive Board", sub: "Official Supporter" },
  { name: "Ministry of Agriculture", sub: "Government Partner" },
  { name: "Dan Hotels", sub: "Venue Partner" },
  { name: "Haifa Municipality", sub: "Host City" },
  { name: "Israel Export Institute", sub: "Trade Partner" },
  { name: "Mediterranean Olive Forum", sub: "Industry Partner" },
  { name: "Slow Food Israel", sub: "Cultural Partner" },
  { name: "Albert Reichmann Foundation", sub: "Supporting Partner" },
  { name: "Israeli Culinary Institute", sub: "Academic Partner" },
];

export default function HomePage() {
  const stats = getPortalStats();
  const latestYear = getLatestYear();
  const topProducers = [...getAllProducers()]
    .sort((a, b) => getProducerAwardCount(b.slug) - getProducerAwardCount(a.slug))
    .slice(0, 3);

  return (
    <>
      {/* ── DARK HERO ─────────────────────────────────────────────── */}
      <section className="bg-olive-700 text-cream">
        <div className="container-page py-24 lg:py-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            <span>★</span>
            <span>{latestYear} Official Results</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="text-cream">The World&apos;s Best</span>
            <br />
            <span className="text-gold-400">Olive Oils.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-olive-100 sm:text-lg">
            Terra Olivo is the International Olive Oil Competition held annually
            in Israel — a prestigious blind-tasting event that recognises
            excellence in extra virgin olive oil from every corner of the globe.
          </p>

          {/* Primary CTAs */}
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/winners"
              className="inline-flex items-center gap-2 rounded-sm bg-gold-400 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-olive-950 shadow-lg transition-colors hover:bg-gold-500"
            >
              Discover the {latestYear} Winners
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/producers"
              className="inline-flex items-center gap-2 rounded-sm border-2 border-cream px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-cream hover:text-olive-950"
            >
              Explore Producers
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Divider + stats */}
          <div className="mt-12 border-t border-olive-600 pt-10">
            <dl className="flex flex-wrap gap-10">
              {[
                { value: stats.countries, label: "Countries" },
                { value: stats.oils, label: "Award-Winning Oils" },
                { value: stats.producers, label: "Producers" },
                { value: stats.awards, label: "Prizes Awarded" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="font-serif text-3xl font-bold text-gold-400">
                    {s.value}
                  </dt>
                  <dd className="mt-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-olive-200">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── SPONSORS MARQUEE ──────────────────────────────────────── */}
      <section className="bg-olive-800 py-14 overflow-hidden border-t border-olive-700">
        <div className="container-page mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-olive-300">
            Official Partners &amp; Sponsors
          </p>
        </div>
        <div className="relative flex overflow-hidden">
          {/* gradient fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-olive-800 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-olive-800 to-transparent" />


          <div className="animate-marquee flex shrink-0 items-center gap-12 whitespace-nowrap">
            {[...SPONSORS, ...SPONSORS].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-xl border border-olive-800 bg-olive-900/60 px-8 py-4 text-center"
              >
                <span className="font-serif text-base font-bold text-cream">
                  {s.name}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-olive-500">
                  {s.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT THE COMPETITION ─────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
              About the Competition
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-olive-900">
              A Global Standard for Olive Oil Excellence
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: "🌍",
                title: "International Submissions",
                text: "Producers from across the Mediterranean and beyond submit their finest extra virgin olive oils each year, representing dozens of countries and hundreds of varieties.",
              },
              {
                icon: "👁",
                title: "Rigorous Blind Tasting",
                text: "An elite international panel of certified judges evaluates each oil blind — scoring aroma, fruitiness, bitterness, pungency and harmony with no knowledge of origin.",
              },
              {
                icon: "🏆",
                title: "Prestigious Recognition",
                text: "From Grand Prestige Gold to Gold Medal, winning oils receive official certificates and international visibility, helping consumers discover the very best.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-olive-100 p-7 text-center"
              >
                <span className="text-4xl">{item.icon}</span>
                <h3 className="mt-4 font-serif text-lg font-bold text-olive-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-olive-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP PRODUCERS ─────────────────────────────────────────── */}
      <section className="bg-olive-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl font-bold text-olive-900">
              Most Awarded Producers
            </h2>
            <Link
              href="/producers"
              className="text-sm font-semibold text-olive-700 hover:text-olive-500"
            >
              View all →
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
        </div>
      </section>
    </>
  );
}
