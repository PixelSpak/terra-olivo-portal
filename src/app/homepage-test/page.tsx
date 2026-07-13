import Image from "next/image";
import Link from "next/link";
import {
  bestAward,
  getAllOils,
  getLatestYear,
  getPortalStats,
  getPrizes,
  getWinnersByYear,
  getYears,
} from "@/lib/data";

const AWARD_LADDER = [
  "Special Awards",
  "Grand Prestige Gold",
  "Prestige Gold",
  "Gold Medal",
];

const SPONSORS = [
  { file: "olive-division", alt: "Olive Division" },
  { file: "kbuzat-iguda", alt: "Kbuzat Iguda" },
  { file: "shaal", alt: "Sha'al" },
  { file: "evoo-world", alt: "EVOO World Ranking" },
  { file: "reg-calabria", alt: "Regione Calabria" },
  { file: "olive-oil-times", alt: "The Olive Oil Times" },
  { file: "portal-olivicola", alt: "Portal Olivícola" },
  { file: "portal-azeite", alt: "Portal do Azeite" },
  { file: "mercacei", alt: "MERCACEI" },
];

export const metadata = {
  title: "Homepage Test | Terra Olivo",
};

export default function HomepageTestPage() {
  const stats = getPortalStats();
  const years = getYears();
  const latestYear = getLatestYear();
  const prizes = getPrizes();
  const latestWinners = getWinnersByYear(latestYear).slice(0, 4);
  const featuredOils = getAllOils()
    .filter((oil) => oil.image && oil.image !== "/images/tempbottle_image.png")
    .slice(0, 3);

  return (
    <div className="bg-[#f8f5ee] text-olive-950">
      <section className="relative overflow-hidden border-b border-olive-900/10 bg-[#f6f1e7]">
        <div
          className="absolute inset-y-0 right-0 hidden w-[54%] bg-cover bg-center opacity-90 lg:block"
          style={{ backgroundImage: "url('/images/bg_main.png')" }}
          aria-hidden
        />
        <div className="absolute inset-y-0 right-0 hidden w-[54%] bg-gradient-to-r from-[#f6f1e7] via-[#f6f1e7]/70 to-olive-950/20 lg:block" />
        <div className="container-page relative grid min-h-[calc(100vh-88px)] gap-10 py-12 lg:grid-cols-[0.72fr_1fr] lg:items-center lg:py-16">
          <aside className="hidden h-full border-r border-olive-900/15 pr-8 lg:flex lg:flex-col lg:justify-between">
            <Image
              src="/logo.png"
              alt="Terra Olivo IOOC"
              width={132}
              height={132}
              className="h-28 w-28 object-contain"
              priority
            />
            <div className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold uppercase tracking-[0.34em] text-olive-600">
              Awarding excellence since 2010
            </div>
            <div className="h-20 w-px bg-olive-900/20" aria-hidden />
          </aside>

          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-4">
              <Image
                src="/logo.png"
                alt=""
                width={76}
                height={76}
                className="h-16 w-16 object-contain lg:hidden"
                priority
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
                  Official Results Portal
                </p>
                <p className="mt-1 text-sm text-olive-700">
                  {years.join(" / ")} editions
                </p>
              </div>
            </div>

            <h1 className="font-serif text-[4.2rem] font-bold uppercase leading-[0.82] tracking-[0.03em] text-olive-950 sm:text-[6.4rem] lg:text-[8.4rem]">
              Terra
              <span className="block text-gold-500">Olivo</span>
            </h1>

            <div className="mt-8 max-w-2xl border-l-4 border-gold-400 pl-5">
              <h2 className="text-xl font-semibold uppercase tracking-[0.22em] text-olive-800 sm:text-2xl">
                Official Award Results Archive
              </h2>
              <p className="mt-4 text-lg leading-8 text-olive-800">
                The official Terra Olivo IOOC results archive, showcasing
                blind-tasted, award-winning extra virgin olive oils from
                producers across the world.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/winners"
                className="inline-flex items-center justify-center border border-gold-500 bg-gold-400 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-olive-950 hover:bg-gold-500"
              >
                View {latestYear} Winners
              </Link>
              <Link
                href="/producers"
                className="inline-flex items-center justify-center border border-olive-950 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-olive-950 hover:bg-olive-950 hover:text-cream"
              >
                Explore Producers
              </Link>
            </div>
          </div>

          <div className="grid gap-4 lg:ml-auto lg:w-full lg:max-w-md">
            <section className="border border-olive-900/15 bg-white/88 p-5 shadow-[0_24px_80px_rgba(28,34,16,0.14)] backdrop-blur">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-olive-500">
                    Current Edition
                  </p>
                  <h3 className="mt-2 font-serif text-5xl font-bold text-olive-950">
                    {latestYear}
                  </h3>
                </div>
                <span className="border border-gold-500/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-600">
                  Certified
                </span>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-olive-900/10 pt-5">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive-500">
                    Awarded Oils
                  </dt>
                  <dd className="mt-1 font-serif text-3xl font-bold text-olive-950">
                    {stats.oils}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive-500">
                    Producers
                  </dt>
                  <dd className="mt-1 font-serif text-3xl font-bold text-olive-950">
                    {stats.producers}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive-500">
                    Countries
                  </dt>
                  <dd className="mt-1 font-serif text-3xl font-bold text-olive-950">
                    {stats.countries}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive-500">
                    Awards
                  </dt>
                  <dd className="mt-1 font-serif text-3xl font-bold text-olive-950">
                    {stats.awards}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="bg-olive-950 p-5 text-cream">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
                Award Hierarchy
              </p>
              <ol className="mt-5 space-y-3">
                {AWARD_LADDER.map((award, index) => (
                  <li
                    key={award}
                    className="flex items-center justify-between border-b border-cream/12 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-semibold">{award}</span>
                    <span className="font-serif text-xl text-gold-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </section>

      <section className="border-b border-olive-900/10 bg-white py-14">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
              Blind tasting, official certificates
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-olive-950 sm:text-5xl">
              A results archive built around the competition, not a directory.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-olive-700">
              Held in Israel, Terra Olivo IOOC recognises excellence through a
              professional blind-tasting process. Each winner page connects the
              awarded oil, producer profile, country, prize tier, and certificate.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Editions", stats.editions],
              ["Prize Levels", prizes.length],
              ["Certificates", stats.awards],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border border-olive-900/10 bg-[#f8f5ee] p-5"
              >
                <p className="font-serif text-4xl font-bold text-gold-500">
                  {value}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-olive-600">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f5ee] py-14">
        <div className="container-page">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
                {latestYear} winners
              </p>
              <h2 className="mt-2 font-serif text-4xl font-bold text-olive-950">
                Latest awarded oils
              </h2>
            </div>
            <Link
              href="/winners"
              className="text-sm font-bold uppercase tracking-[0.16em] text-olive-800 underline decoration-gold-400 underline-offset-8 hover:text-gold-600"
            >
              Browse archive
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {latestWinners.map((oil) => {
              const award = bestAward(oil);
              return (
                <Link
                  key={oil.slug}
                  href={`/winners/${oil.slug}`}
                  className="group bg-white p-4 shadow-sm ring-1 ring-olive-900/10"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-olive-950">
                    <Image
                      src={oil.image ?? "/images/tempbottle_image.png"}
                      alt={oil.name}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                    {award.prize}
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-bold text-olive-950">
                    {oil.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-olive-600">
                    {oil.country}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-olive-950 py-14 text-cream">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-400">
              Visual direction
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold">
              Official, warm, and unmistakably Terraolivo.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-olive-100">
              The test page keeps the competition seal, archive language, award
              ladder, and producer ecosystem visible from the first screen.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredOils.map((oil) => (
              <div
                key={oil.slug}
                className="border border-cream/10 bg-cream/5 p-4"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={oil.image ?? "/images/tempbottle_image.png"}
                    alt={oil.name}
                    fill
                    sizes="(min-width: 1024px) 18vw, 33vw"
                    className="object-contain"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-cream">
                  {oil.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.28em] text-olive-500">
            Official partners &amp; sponsors
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {SPONSORS.map((sponsor) => (
              <div
                key={sponsor.file}
                className="flex h-24 items-center justify-center bg-white p-4 ring-1 ring-olive-900/10"
              >
                <Image
                  src={`/sponsors/${sponsor.file}.png`}
                  alt={sponsor.alt}
                  width={170}
                  height={80}
                  className="max-h-14 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
