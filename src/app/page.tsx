import Image from "next/image";
import Link from "next/link";
import { getLatestYear, getPortalStats } from "@/lib/data";

const SPONSORS = [
  { file: "olive-division",   alt: "Olive Division" },
  { file: "kbuzat-iguda",     alt: "Kbuzat Iguda" },
  { file: "shaal",            alt: "Sha'al" },
  { file: "evoo-world",       alt: "EVOO World Ranking" },
  { file: "reg-calabria",     alt: "Regione Calabria" },
  { file: "sensory-eval",     alt: "Sensory Evaluation Lab of Crete ACR" },
  { file: "bajo-aragon",      alt: "Aceite del Bajo Aragón" },
  { file: "olive-oil-times",  alt: "The Olive Oil Times" },
  { file: "portal-olivicola", alt: "Portal Olivícola" },
  { file: "portal-azeite",    alt: "Portal do Azeite" },
  { file: "mercacei",         alt: "MERCACEI" },
];

export default function HomePage() {
  const stats = getPortalStats();
  const latestYear = getLatestYear();

  return (
    <>
      {/* ── HERO & SPONSORS (Combined Background) ─────────────────── */}
      <div 
        className="relative text-cream bg-cover bg-center bg-no-repeat h-screen flex flex-col justify-between overflow-hidden"
        style={{ backgroundImage: "url('/images/bg_main.png')" }}
      >
        {/* Subtle dark overlay to ensure text readability across both sections */}
        <div className="absolute inset-0 bg-olive-950/50"></div>
        
        {/* HERO CONTENT */}
        <section className="container-page relative z-10 flex flex-col items-center justify-center flex-grow text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            <span>★</span>
            <span>{latestYear} Official Results</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl mx-auto">
            <span className="text-cream">The World&apos;s Best</span>
            <br />
            <span className="text-gold-400">Olive Oils.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-olive-100 sm:text-lg">
            Terra Olivo is the International Olive Oil Competition held annually
            in Israel — a prestigious blind-tasting event that recognises
            excellence in extra virgin olive oil from every corner of the globe.
          </p>

          {/* Primary CTAs */}
          <div className="mt-9 flex flex-wrap justify-center gap-4">
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
          <div className="mt-12 w-full max-w-4xl mx-auto border-t border-olive-500/30 pt-8">
            <dl className="flex flex-wrap justify-center gap-8 lg:gap-16">
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
        </section>

        {/* SPONSORS MARQUEE */}
        <section className="relative z-10 py-6 overflow-hidden border-t border-olive-500/30 shrink-0">
          <div className="container-page mb-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-olive-300">
              Official Partners &amp; Sponsors
            </p>
          </div>
          <div className="relative flex overflow-hidden">
            {/* gradient fade edges using black/transparent to blend with the overlay */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#172016] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#172016] to-transparent" />

            <div className="animate-marquee flex shrink-0 items-center gap-12 whitespace-nowrap">
              {[...SPONSORS, ...SPONSORS].map((s, i) => (
                <div
                  key={i}
                  className="flex h-16 w-36 shrink-0 items-center justify-center rounded-xl bg-white/10 px-4 backdrop-blur-sm"
                >
                  <Image
                    src={`/sponsors/${s.file}.png`}
                    alt={s.alt}
                    width={120}
                    height={56}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
