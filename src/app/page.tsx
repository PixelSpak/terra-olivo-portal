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
        className="relative text-cream bg-cover bg-center bg-no-repeat h-[100dvh] flex flex-col justify-between overflow-hidden"
        style={{ backgroundImage: "url('/images/bg_main.png')" }}
      >
        {/* Subtle dark overlay to ensure text readability across both sections */}
        <div className="absolute inset-0 bg-olive-950/50"></div>
        
        {/* HERO CONTENT */}
        <section className="container-page relative z-10 flex flex-col items-center justify-center flex-grow text-center py-4 px-4 sm:py-6">
          {/* Headline */}
          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl mx-auto">
            <span className="text-cream">The World&apos;s Best</span>
            <br />
            <span className="text-gold-400">Olive Oils.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 sm:mt-4 max-w-xl mx-auto text-sm leading-relaxed text-olive-100 sm:text-base hidden sm:block">
            TerraOlivo is an International Olive Oil Competition - a prestigious
            blind-tasting event that recognises excellence in extra virgin olive
            oil from every corner of the globe since 2010.
          </p>

          {/* Primary CTAs */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3 w-full sm:w-auto">
            <Link
              href={`/winners?year=${latestYear}`}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold-400 px-6 py-2.5 sm:px-8 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-olive-950 shadow-lg transition-colors hover:bg-gold-500 w-full sm:w-auto"
            >
              Discover {latestYear} Winners
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/producers"
              className="inline-flex items-center justify-center gap-2 rounded-sm border-2 border-cream px-6 py-2.5 sm:px-8 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-cream hover:text-olive-950 w-full sm:w-auto"
            >
              Explore Producers
              <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-3 max-w-xl text-[11px] font-medium uppercase tracking-[0.14em] text-olive-200/85">
            Archive currently includes 2025 and 2026 results. Past editions will be uploaded soon.
          </p>

          {/* Divider + stats */}
          <div className="mt-6 sm:mt-8 w-full max-w-4xl mx-auto border-t border-olive-500/30 pt-4 sm:pt-6">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 justify-center">
              {[
                { value: stats.countries, label: "Countries" },
                { value: stats.oils, label: "Award-Winning Olive Oils" },
                { value: stats.producers, label: "Producers" },
                { value: stats.awards, label: "Awards Granted" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="font-serif text-2xl sm:text-3xl font-bold text-gold-400">
                    {s.value}
                  </dt>
                  <dd className="mt-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-olive-200">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* SPONSORS MARQUEE */}
        <section className="relative z-10 py-3 sm:py-4 overflow-hidden border-t border-olive-500/30 shrink-0 bg-olive-950/20 backdrop-blur-md">
          <div className="container-page mb-2 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-olive-300">
              Official Partners &amp; Sponsors
            </p>
          </div>
          <div className="relative flex overflow-hidden">
            {/* gradient fade edges using black/transparent to blend with the overlay */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-olive-950/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-olive-950/80 to-transparent" />

            <div className="animate-marquee flex shrink-0 items-center gap-10 sm:gap-16 whitespace-nowrap">
              {[...SPONSORS, ...SPONSORS].map((s, i) => (
                <div
                  key={i}
                  className="flex h-14 w-32 sm:h-20 sm:w-48 shrink-0 items-center justify-center rounded-xl bg-white px-3 shadow-sm ring-1 ring-white/80 sm:px-4"
                >
                  <Image
                    src={`/sponsors/${s.file}.png`}
                    alt={s.alt}
                    width={180}
                    height={80}
                    className="max-h-10 w-auto object-contain opacity-95 transition-opacity hover:opacity-100 sm:max-h-14"
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
