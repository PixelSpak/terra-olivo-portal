import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AwardBadge from "@/components/AwardBadge";
import AwardSticker, { awardStickerMedalClass } from "@/components/AwardSticker";
import CertificateImage from "@/components/CertificateImage";
import OilImage from "@/components/OilImage";
import ShareButton from "@/components/ShareButton";
import {
  getAllAwardEntries,
  getAwardEntryBySlug,
  getAwardEntryTitle,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return getAllAwardEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getAwardEntryBySlug(slug);
  if (!entry) return { title: "Award Not Found" };

  const title = `${entry.award.prize} | ${getAwardEntryTitle(entry)} | TerraOlivo ${entry.award.year}`;
  const description = `${getAwardEntryTitle(entry)} won ${entry.award.prize} at TerraOlivo ${entry.award.year}.`;
  const url = absoluteUrl(`/awards/${entry.slug}`);
  const image =
    entry.kind === "oil"
      ? entry.oil.image ?? "/logo.png"
      : entry.award.displayLogo ?? entry.producer.logo ?? "/logo.png";

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
          url: image,
          width: 1200,
          height: 630,
          alt: getAwardEntryTitle(entry),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function AwardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getAwardEntryBySlug(slug);
  if (!entry) notFound();

  const award = entry.award;
  const shareTitle = `${award.prize} | ${getAwardEntryTitle(entry)} | TerraOlivo ${award.year}`;
  const shareText = `${getAwardEntryTitle(entry)} won ${award.prize} at TerraOlivo ${award.year}.`;
  const shareUrl = absoluteUrl(`/awards/${entry.slug}`);
  const producerAwardLogo =
    entry.kind === "producer" ? entry.award.displayLogo ?? entry.producer.logo : undefined;
  const usesAwardDisplayLogo =
    entry.kind === "producer" && Boolean(entry.award.displayLogo);

  return (
    <div className="container-page py-10">
      <nav className="flex items-center gap-2 text-sm text-olive-500">
        <Link href="/winners" className="hover:text-olive-700">
          Awards
        </Link>
        <span>/</span>
        <span className="text-olive-800">{award.prize}</span>
      </nav>

      {entry.kind === "oil" ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[380px_1fr] lg:items-start">
          <div className="flex flex-col gap-5 pt-8">
            <div className="relative flex flex-col items-center overflow-hidden rounded-lg border border-gold-400/25 bg-[radial-gradient(circle_at_48%_34%,#fff9eb_0%,#eee4ca_42%,#c5cf9d_100%)] px-6 pb-8 pt-10 shadow-[0_22px_52px_rgba(28,34,16,0.18)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.56),rgba(201,162,39,0.08)_42%,rgba(28,34,16,0.2))]" />
              <AwardSticker
                award={award}
                className={`absolute right-3 top-3 z-30 sm:right-5 sm:top-5 ${awardStickerMedalClass}`}
                priority
              />
              <div className="pointer-events-none z-20 mb-6 flex h-[26rem] w-full items-center justify-center sm:h-[30rem]">
                <OilImage
                  src={entry.oil.image}
                  name={entry.oil.name}
                  intensity={entry.oil.intensity}
                  className="h-full w-full"
                  imageClassName="drop-shadow-[0_22px_30px_rgba(28,34,16,0.32)]"
                  sizes="(max-width: 1024px) 90vw, 440px"
                  eager
                  transparentBg
                />
              </div>
            </div>
            <CertificateImage award={award} />
          </div>

          <div className="flex flex-col gap-7">
            <div>
              <AwardBadge prize={award.prize} year={award.year} />
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-olive-900 sm:text-5xl">
                {award.prize}
              </h1>
              <p className="mt-3 text-lg text-olive-700">
                Awarded to{" "}
                <Link
                  href={`/winners/${entry.oil.slug}`}
                  className="font-semibold text-olive-900 underline-offset-2 hover:underline"
                >
                  {entry.oil.name}
                </Link>
              </p>
              {entry.producer && (
                <p className="mt-1 text-olive-600">
                  By{" "}
                  <Link
                    href={`/producers/${entry.producer.slug}`}
                    className="font-semibold text-olive-800 underline-offset-2 hover:underline"
                  >
                    {entry.producer.name}
                  </Link>
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-sm border border-terracotta-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-terracotta-500">
                  {entry.oil.country}
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

            <p className="whitespace-pre-line text-base leading-relaxed text-olive-700">
              {entry.oil.description}
            </p>

            <div className="rounded-2xl border border-olive-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-olive-400">
                Award Details
              </p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-olive-400">
                    Edition
                  </dt>
                  <dd className="font-semibold text-olive-900">{award.year}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-olive-400">
                    Award
                  </dt>
                  <dd className="font-semibold text-olive-900">{award.prize}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[380px_1fr] lg:items-start">
          <div className="flex flex-col gap-5 pt-8">
            <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-lg border border-gold-400/25 bg-[radial-gradient(circle_at_48%_34%,#fff9eb_0%,#eee4ca_42%,#c5cf9d_100%)] px-6 py-10 text-center shadow-[0_22px_52px_rgba(28,34,16,0.18)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.56),rgba(201,162,39,0.08)_42%,rgba(28,34,16,0.2))]" />
              <AwardSticker
                award={award}
                className={`absolute right-3 top-3 z-30 sm:right-5 sm:top-5 ${awardStickerMedalClass}`}
                priority
              />
              <div className="relative z-20">
                {producerAwardLogo ? (
                  usesAwardDisplayLogo ? (
                    <span className="grid h-36 w-36 place-items-center rounded-full border border-gold-400/45 bg-white p-5 shadow-[0_20px_44px_rgba(28,34,16,0.24)]">
                      <Image
                        src={producerAwardLogo}
                        alt={entry.producer.name}
                        width={152}
                        height={152}
                        sizes="152px"
                        className="h-full w-full object-contain"
                        priority
                        unoptimized
                      />
                    </span>
                  ) : (
                    <Image
                      src={producerAwardLogo}
                      alt={entry.producer.name}
                      width={152}
                      height={152}
                      sizes="152px"
                      className="h-36 w-36 rounded-full border border-gold-400/45 bg-white object-cover p-1 shadow-[0_20px_44px_rgba(28,34,16,0.24)]"
                      priority
                      unoptimized
                    />
                  )
                ) : (
                  <span className="grid h-36 w-36 place-items-center rounded-full border border-gold-400/45 bg-olive-950 font-serif text-5xl font-bold text-gold-400 shadow-[0_20px_44px_rgba(28,34,16,0.24)]">
                    {entry.producer.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <CertificateImage award={award} />
          </div>

          <div className="flex flex-col gap-7">
            <div>
              <AwardBadge prize={award.prize} year={award.year} />
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-olive-900 sm:text-5xl">
                {award.prize}
              </h1>
              <p className="mt-3 text-lg text-olive-700">
                Awarded to{" "}
                <Link
                  href={`/producers/${entry.producer.slug}`}
                  className="font-semibold text-olive-900 underline-offset-2 hover:underline"
                >
                  {entry.producer.name}
                </Link>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-sm border border-terracotta-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-terracotta-500">
                  {entry.award.country}
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

            <p className="whitespace-pre-line text-base leading-relaxed text-olive-700">
              {entry.producer.description}
            </p>

            <div className="rounded-2xl border border-olive-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-olive-400">
                Award Details
              </p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-olive-400">
                    Edition
                  </dt>
                  <dd className="font-semibold text-olive-900">{award.year}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-olive-400">
                    Award Type
                  </dt>
                  <dd className="font-semibold text-olive-900">Producer Award</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
