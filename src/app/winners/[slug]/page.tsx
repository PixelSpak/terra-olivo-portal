import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AwardBadge from "@/components/AwardBadge";
import CertificateImage from "@/components/CertificateImage";
import OilCard from "@/components/OilCard";
import OilImage from "@/components/OilImage";
import {
  awardsByYear,
  bestAward,
  getAllOils,
  getOilBySlug,
  getOilsByProducer,
  getProducerBySlug,
} from "@/lib/data";

export function generateStaticParams() {
  return getAllOils().map((oil) => ({ slug: oil.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const oil = getOilBySlug(slug);
  if (!oil) return { title: "Winner Not Found" };
  return { title: oil.name, description: oil.description };
}

function isOrganic(name: string) {
  return /\b(organic|bio|biolog|biologico|biologique|organico)\b/i.test(name);
}

export default async function WinnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const oil = getOilBySlug(slug);
  if (!oil) notFound();

  const producer = getProducerBySlug(oil.producerSlug);
  const best = bestAward(oil);
  const awards = awardsByYear(oil);
  const related = getOilsByProducer(oil.producerSlug)
    .filter((o) => o.slug !== oil.slug)
    .slice(0, 3);

  const organic = isOrganic(oil.name) || isOrganic(producer?.name ?? "");
  const years = [...new Set(oil.awards.map((a) => a.year))].sort();

  return (
    <div className="container-page py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-olive-500">
        <Link href="/winners" className="hover:text-olive-700">
          Winners
        </Link>
        <span>/</span>
        <span className="text-olive-800">{oil.name}</span>
      </nav>

      {/* Hero grid */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[380px_1fr] lg:items-start">

        {/* Left — image + certificates */}
        <div className="flex flex-col gap-5 pt-8">
          <div className="relative rounded-2xl bg-olive-900 shadow-sm border border-olive-800 pb-8 px-6 pt-8 flex flex-col items-center">
            
            {/* Year badge - moved to the top left of the card in normal flow */}
            <div className="absolute left-4 top-4 grid h-14 w-14 place-items-center rounded-full border-2 border-gold-400 bg-olive-950 text-center shadow-md z-30">
              <span className="block text-[10px] font-semibold uppercase leading-none tracking-wide text-gold-400">
                Terra
              </span>
              <span className="block font-serif text-sm font-bold leading-none text-cream">
                {years[years.length - 1]}
              </span>
            </div>

            {/* Contained Bottle Image */}
            <div className="flex justify-center items-center h-80 w-full mb-6 pointer-events-none z-20">
              <OilImage
                src={oil.image}
                name={oil.name}
                intensity={oil.intensity}
                className="h-full object-contain drop-shadow-2xl"
                transparentBg
              />
            </div>
            
          </div>

          {/* Certificate images stacked below */}
          {awards.filter((a) => a.certificateImage).slice(0, 2).map((award) => (
            <CertificateImage key={`${award.year}-${award.prize}`} award={award} />
          ))}
          {awards.filter((a) => a.certificateImage).length > 2 && (
            <p className="text-center text-sm text-olive-500">
              +{awards.filter((a) => a.certificateImage).length - 2} more certificates below
            </p>
          )}

          {/* Certificate PDF download */}
          {oil.certificate && (() => {
            const fileIdMatch = oil.certificate.match(/id=([^&]+)/);
            const fileId = fileIdMatch ? fileIdMatch[1] : null;
            if (!fileId) return null;
            return (
              <a
                href={`/api/certificate/${fileId}?name=${encodeURIComponent(oil.name + ' Certificate')}`}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-terracotta-400 bg-terracotta-50 px-5 py-3 text-sm font-bold text-terracotta-700 shadow-sm transition-all hover:bg-terracotta-100 hover:shadow-md"
                download
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Download Official Certificate (PDF)
              </a>
            );
          })()}
        </div>

        {/* Right — all details */}
        <div className="flex flex-col gap-7">

          {/* Meta tags */}
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-olive-600">
            <span>{oil.country}</span>
            {oil.varieties.length > 0 && (
              <>
                <span className="text-terracotta-500">·</span>
                <span>{oil.varieties.join(", ")}</span>
              </>
            )}
            <span className="text-terracotta-500">·</span>
            <span>{oil.intensity}</span>
            {organic && (
              <>
                <span className="text-terracotta-500">·</span>
                <span className="text-olive-500">Organic</span>
              </>
            )}
          </div>

          {/* Name + producer */}
          <div>
            <h1 className="font-serif text-4xl font-bold leading-tight text-olive-900 sm:text-5xl">
              {oil.name}
            </h1>
            {producer && (
              <p className="mt-2 text-lg text-olive-600">
                By{" "}
                <Link
                  href={`/producers/${producer.slug}`}
                  className="font-semibold text-olive-800 underline-offset-2 hover:underline"
                >
                  {producer.name}
                </Link>
              </p>
            )}
          </div>

          {/* Award badges */}
          <div className="flex flex-wrap gap-2">
            {awards.map((award) => (
              <AwardBadge key={`${award.year}-${award.prize}`} prize={award.prize} year={award.year} />
            ))}
          </div>

          {/* Description */}
          <p className="text-base leading-relaxed text-olive-700">
            {oil.description}
          </p>

          {/* Classification card */}
          <div className="rounded-2xl border border-olive-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-olive-400">
              Classification
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-sm border border-terracotta-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-terracotta-500">
                {oil.country}
              </span>
              {organic && (
                <span className="rounded-sm border border-olive-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-olive-600">
                  🌿 Organic
                </span>
              )}
              <span className="rounded-sm border border-olive-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-olive-700">
                {oil.intensity}
              </span>
              {oil.varieties.map((v) => (
                <span
                  key={v}
                  className="rounded-sm border border-gold-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-600"
                >
                  {v}
                </span>
              ))}
              {oil.acidity !== undefined && (
                <span className="rounded-sm border border-olive-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-olive-600">
                  Acidity {oil.acidity.toFixed(2)}%
                </span>
              )}
            </div>
          </div>

          {/* Tasting sensations — only if data exists */}
          {oil.tastingNotes.length > 0 && (
            <div className="rounded-2xl border border-olive-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-olive-400">
                Tasting Sensations
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {oil.tastingNotes.map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-gold-400 px-3 py-1 text-xs font-medium text-olive-800"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Awards history / consistency */}
          <div className="rounded-2xl border border-olive-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-olive-400">
              Award History
            </p>
            <div className="mt-4 space-y-2">
              {awards.map((award) => (
                <div
                  key={`${award.year}-${award.prize}`}
                  className="flex items-center gap-3"
                >
                  <span className="w-10 shrink-0 text-right text-sm font-bold text-olive-900">
                    {award.year}
                  </span>
                  <div className="h-px flex-1 bg-olive-100" />
                  <AwardBadge prize={award.prize} />
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-olive-500">
              {oil.awards.length}{" "}
              {oil.awards.length === 1 ? "prize" : "prizes"} won
              {years.length > 1 && ` across ${years.length} editions`}
            </p>
          </div>

          {/* Harvest / acidity quick facts */}
          {(oil.harvestYear || oil.region) && (
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-olive-200 bg-olive-200 sm:grid-cols-3">
              {oil.harvestYear && (
                <div className="bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-olive-400">Harvest</p>
                  <p className="mt-1 font-semibold text-olive-900">{oil.harvestYear}</p>
                </div>
              )}
              {oil.region && (
                <div className="bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-olive-400">Region</p>
                  <p className="mt-1 font-semibold text-olive-900">{oil.region}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All certificates (if more than 2) */}
      {awards.filter((a) => a.certificateImage).length > 2 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl font-bold text-olive-900">
            All Certificates
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {awards.map((award) => (
              <CertificateImage key={`${award.year}-${award.prize}`} award={award} />
            ))}
          </div>
        </section>
      )}

      {/* Producer card */}
      {producer && (
        <section className="mt-14 overflow-hidden rounded-2xl border border-olive-200">
          <div className="bg-olive-500 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-olive-100">
              About the producer
            </p>
          </div>
          <div className="bg-white p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-gold-400 bg-olive-900 font-serif text-2xl font-bold text-gold-400">
                {producer.name.charAt(0)}
              </span>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-bold text-olive-900">
                  {producer.name}
                </h3>
                <p className="text-sm text-olive-600">
                  {[producer.region, producer.country].filter(Boolean).join(", ")}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-olive-700">
                  {producer.description}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/producers/${producer.slug}`}
                className="inline-block rounded-sm bg-olive-900 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-olive-800"
              >
                Producer Profile
              </Link>
              {producer.website && (
                <a
                  href={producer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-sm border border-olive-300 px-5 py-2.5 text-sm font-semibold text-olive-700 hover:bg-olive-50"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* More from this producer */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl font-bold text-olive-900">
            More from {producer?.name ?? "this producer"}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((o) => (
              <OilCard key={o.slug} oil={o} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
