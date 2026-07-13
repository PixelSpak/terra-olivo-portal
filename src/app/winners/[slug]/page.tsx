import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AwardBadge from "@/components/AwardBadge";
import AwardSticker, { awardStickerMedalClass } from "@/components/AwardSticker";
import BottleImageSubmission from "@/components/BottleImageSubmission";
import CertificateDownloads from "@/components/CertificateDownloads";
import OilCard from "@/components/OilCard";
import OilImage from "@/components/OilImage";
import ShareButton from "@/components/ShareButton";
import {
  awardsByYear,
  bestAward,
  getAllAwardEntries,
  getAllOils,
  getOilBySlug,
  getOilsByProducer,
  getProducerBySlug,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

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

  const producer = getProducerBySlug(oil.producerSlug);
  const best = bestAward(oil);
  const title = `${oil.name} | TerraOlivo ${best.year} ${best.prize}`;
  const description = `${oil.name}${producer ? ` by ${producer.name}` : ""} won ${best.prize} at TerraOlivo ${best.year}.`;
  const url = absoluteUrl(`/winners/${oil.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "Terra Olivo Awards",
      images: [
        {
          url: oil.image ?? "/logo.png",
          width: 1200,
          height: 630,
          alt: oil.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [oil.image ?? "/logo.png"],
    },
  };
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
  const awardLinks = new Map(
    getAllAwardEntries()
      .filter((entry) => entry.kind === "oil" && entry.oil.slug === oil.slug)
      .map((entry) => [
        `${entry.award.year}-${entry.award.prize}`,
        `/awards/${entry.slug}`,
      ]),
  );
  const related = getOilsByProducer(oil.producerSlug)
    .filter((o) => o.slug !== oil.slug)
    .slice(0, 3);

  const years = [...new Set(oil.awards.map((a) => a.year))].sort();
  const shareTitle = `${oil.name} | TerraOlivo ${best.year} ${best.prize}`;
  const shareText = `${oil.name}${producer ? ` by ${producer.name}` : ""} won ${best.prize} at TerraOlivo ${best.year}.`;
  const shareUrl = absoluteUrl(`/winners/${oil.slug}`);
  const currentImage = oil.image ?? "/images/tempbottle_image.png";
  const usesTemporaryBottle = currentImage === "/images/tempbottle_image.png";

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

        {/* Left — image */}
        <div className="flex flex-col gap-5 pt-8">
          <div className="relative flex flex-col items-center overflow-hidden rounded-lg border border-gold-400/25 bg-[radial-gradient(circle_at_48%_34%,#fff9eb_0%,#eee4ca_42%,#c5cf9d_100%)] px-6 pb-8 pt-10 shadow-[0_22px_52px_rgba(28,34,16,0.18)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.56),rgba(201,162,39,0.08)_42%,rgba(28,34,16,0.2))]" />
            <div className="pointer-events-none absolute inset-x-8 bottom-8 h-16 rounded-full bg-olive-950/10 blur-2xl" />
            <AwardSticker
              award={best}
              className={`absolute right-3 top-3 z-30 sm:right-5 sm:top-5 ${awardStickerMedalClass}`}
              priority
            />

            {/* Contained Bottle Image */}
            <div className="flex h-[26rem] w-full justify-center items-center mb-6 pointer-events-none z-20 sm:h-[30rem]">
              <OilImage
                src={oil.image}
                name={oil.name}
                intensity={oil.intensity}
                className="h-full w-full"
                imageClassName="drop-shadow-[0_22px_30px_rgba(28,34,16,0.32)]"
                sizes="(max-width: 1024px) 90vw, 440px"
                eager
                transparentBg
              />
            </div>
          </div>
          <BottleImageSubmission
            oilSlug={oil.slug}
            oilName={oil.name}
            producerSlug={oil.producerSlug}
            producerName={producer?.name}
            country={oil.country}
            awardYears={years.join(", ")}
            currentImage={currentImage}
            usesTemporaryBottle={usesTemporaryBottle}
            sourcePage={`/winners/${oil.slug}`}
          />
        </div>

        {/* Right — all details */}
        <div className="flex flex-col gap-7">

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
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-sm border border-terracotta-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-terracotta-500">
                {oil.country}
              </span>
            </div>
            <div className="mt-2">
              <ShareButton
                title={shareTitle}
                text={shareText}
                url={shareUrl}
                label="Share"
              />
            </div>
          </div>

          {/* Award badges */}
          <div className="flex flex-wrap gap-2">
            {awards.map((award) => (
              <Link
                key={`${award.year}-${award.prize}`}
                href={awardLinks.get(`${award.year}-${award.prize}`) ?? "#"}
                className="inline-block"
              >
                <AwardBadge prize={award.prize} year={award.year} />
              </Link>
            ))}
          </div>

          {/* Description */}
          <p className="text-base leading-relaxed text-olive-700">
            {oil.description}
          </p>

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
                  <Link
                    href={awardLinks.get(`${award.year}-${award.prize}`) ?? "#"}
                    className="inline-block"
                  >
                    <AwardBadge prize={award.prize} />
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-olive-500">
              {oil.awards.length}{" "}
              {oil.awards.length === 1 ? "award" : "awards"} won
              {years.length > 1 && ` across ${years.length} editions`}
            </p>
          </div>

          {/* Harvest quick fact */}
          {oil.harvestYear && (
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-olive-200 bg-olive-200 sm:grid-cols-3">
              <div className="bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-olive-400">Harvest</p>
                <p className="mt-1 font-semibold text-olive-900">{oil.harvestYear}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <CertificateDownloads
          awards={awards}
          oilName={oil.name}
          legacyCertificate={oil.certificate}
        />
      </div>

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
                  {producer.country}
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
