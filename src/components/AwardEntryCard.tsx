import Image from "next/image";
import Link from "next/link";
import AwardSticker, { awardStickerMedalClass } from "@/components/AwardSticker";
import OilImage from "@/components/OilImage";
import type { AwardEntry } from "@/lib/types";

export default function AwardEntryCard({
  entry,
  priority = false,
}: {
  entry: AwardEntry;
  priority?: boolean;
}) {
  const award = entry.award;
  const href = entry.kind === "oil" ? `/winners/${entry.oil.slug}` : `/awards/${entry.slug}`;

  if (entry.kind === "producer") {
    const producerLogo = entry.award.displayLogo ?? entry.producer.logo;

    return (
      <Link
        href={href}
        className="group relative flex h-full flex-col transition duration-300 hover:-translate-y-1.5"
      >
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-olive-950/15 bg-[#fbf7ec] text-center shadow-[0_16px_38px_rgba(28,34,16,0.14)] ring-1 ring-white/70 transition duration-300 group-hover:border-gold-400/75 group-hover:shadow-[0_26px_64px_rgba(28,34,16,0.26)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative min-h-[300px] overflow-hidden bg-[radial-gradient(circle_at_46%_34%,#fffaf0_0%,#eee5cd_43%,#c3ce9d_100%)] px-3 pb-3 pt-4 sm:min-h-[320px] sm:px-5 sm:pb-5 sm:pt-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.58),rgba(201,162,39,0.08)_45%,rgba(28,34,16,0.17))]" />
            <div className="pointer-events-none absolute inset-x-8 bottom-5 h-12 rounded-full bg-olive-950/12 blur-2xl transition duration-300 group-hover:bg-gold-500/20" />
            <div className="pointer-events-none absolute left-4 top-4 h-20 w-px bg-gradient-to-b from-gold-400/50 to-transparent opacity-70" />
            <div className="pointer-events-none absolute left-4 top-4 h-px w-20 bg-gradient-to-r from-gold-400/50 to-transparent opacity-70" />
            <AwardSticker
              award={award}
              className={`absolute right-2 top-2 z-30 sm:right-4 sm:top-4 ${awardStickerMedalClass}`}
              priority={priority}
              variant="card"
            />
            <div className="pointer-events-none relative z-20 flex h-60 w-full items-center justify-center sm:h-64">
              {producerLogo ? (
                entry.award.displayLogo ? (
                  <span className="grid h-28 w-28 place-items-center rounded-full border border-gold-400/45 bg-white p-4 shadow-[0_18px_36px_rgba(28,34,16,0.22)] transition duration-500 group-hover:scale-[1.06]">
                    <Image
                      src={producerLogo}
                      alt={entry.producer.name}
                      width={112}
                      height={112}
                      sizes="112px"
                      className="h-full w-full object-contain"
                      priority={priority}
                    />
                  </span>
                ) : (
                  <Image
                    src={producerLogo}
                    alt={entry.producer.name}
                    width={112}
                    height={112}
                    sizes="112px"
                    className="h-28 w-28 rounded-full border border-gold-400/45 bg-white object-cover p-1 shadow-[0_18px_36px_rgba(28,34,16,0.22)] transition duration-500 group-hover:scale-[1.06]"
                    priority={priority}
                  />
                )
              ) : (
                <span className="grid h-28 w-28 place-items-center rounded-full border border-gold-400/45 bg-olive-950 font-serif text-4xl font-bold text-gold-400 shadow-[0_18px_36px_rgba(28,34,16,0.22)] transition duration-500 group-hover:scale-[1.06]">
                  {entry.producer.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="absolute bottom-3 left-1/2 z-30 flex min-h-9 w-[calc(100%-2rem)] max-w-[17rem] -translate-x-1/2 items-center justify-center rounded-full border border-gold-400/45 bg-white/85 px-3 py-1 text-center text-[10px] font-bold uppercase leading-snug tracking-[0.14em] text-olive-900 shadow-sm backdrop-blur">
              {award.prize} · {award.year}
            </div>
          </div>
          <div className="relative flex flex-1 min-h-[118px] flex-col items-center justify-end gap-1 bg-[linear-gradient(180deg,#1d260f_0%,#101706_100%)] px-3 pb-4 pt-5 sm:min-h-[158px] sm:gap-1.5 sm:px-5 sm:pb-6 sm:pt-7">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-gold-400/8 to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-400/80">
              Producer Award
            </p>
            <h3 className="font-serif text-xl font-bold leading-tight text-cream transition-colors group-hover:text-gold-400">
              {entry.producer.name}
            </h3>
            <p className="line-clamp-1 text-xs font-medium text-olive-200">
              {award.prize}
            </p>
            <p className="mt-1 line-clamp-1 text-xs font-bold uppercase tracking-[0.12em] text-gold-400/80">
              {entry.award.country}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  const producerName = entry.producer?.name ?? entry.oil.producerSlug.replace(/-/g, " ");

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col transition duration-300 hover:-translate-y-1.5"
    >
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-olive-950/15 bg-[#fbf7ec] text-center shadow-[0_16px_38px_rgba(28,34,16,0.14)] ring-1 ring-white/70 transition duration-300 group-hover:border-gold-400/75 group-hover:shadow-[0_26px_64px_rgba(28,34,16,0.26)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative min-h-[300px] overflow-hidden bg-[radial-gradient(circle_at_46%_34%,#fffaf0_0%,#eee5cd_43%,#c3ce9d_100%)] px-3 pb-3 pt-4 sm:min-h-[320px] sm:px-5 sm:pb-5 sm:pt-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.58),rgba(201,162,39,0.08)_45%,rgba(28,34,16,0.17))]" />
          <div className="pointer-events-none absolute inset-x-8 bottom-5 h-12 rounded-full bg-olive-950/12 blur-2xl transition duration-300 group-hover:bg-gold-500/20" />
          <div className="pointer-events-none absolute left-4 top-4 h-20 w-px bg-gradient-to-b from-gold-400/50 to-transparent opacity-70" />
          <div className="pointer-events-none absolute left-4 top-4 h-px w-20 bg-gradient-to-r from-gold-400/50 to-transparent opacity-70" />
          <AwardSticker
            award={award}
            className={`absolute right-2 top-2 z-30 sm:right-4 sm:top-4 ${awardStickerMedalClass}`}
            priority={priority}
            variant="card"
          />
          <div className="pointer-events-none relative z-20 flex h-60 w-full items-center justify-center sm:h-64">
            <OilImage
              src={entry.oil.image}
              name={entry.oil.name}
              intensity={entry.oil.intensity}
              className="h-full w-full transition duration-500 group-hover:scale-[1.06]"
              imageClassName="drop-shadow-[0_22px_28px_rgba(28,34,16,0.32)]"
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 33vw, 280px"
              eager={priority}
              transparentBg
            />
          </div>
          <div className="absolute bottom-3 left-1/2 z-30 flex min-h-9 w-[calc(100%-2rem)] max-w-[17rem] -translate-x-1/2 items-center justify-center rounded-full border border-gold-400/45 bg-white/90 px-3 py-1 text-center text-[9px] font-bold uppercase leading-snug tracking-[0.13em] text-olive-900 shadow-sm backdrop-blur sm:text-[10px] sm:tracking-[0.14em]">
            {award.prize.replace(" Medal", "")} · {award.year}
          </div>
        </div>
        <div className="relative flex flex-1 min-h-[118px] flex-col items-center justify-end gap-1 bg-[linear-gradient(180deg,#1d260f_0%,#101706_100%)] px-3 pb-4 pt-5 sm:min-h-[158px] sm:gap-1.5 sm:px-5 sm:pb-6 sm:pt-7">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-gold-400/8 to-transparent" />
          <h3 className="font-serif text-[14px] font-bold leading-tight text-cream transition-colors group-hover:text-gold-400 sm:text-xl">
            {entry.oil.name}
          </h3>
          <p className="line-clamp-1 text-[10px] font-medium capitalize text-olive-200 sm:text-xs">
            by {producerName}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gold-400/80 sm:mt-1 sm:text-xs">
            {entry.oil.country}
          </p>
        </div>
      </div>
    </Link>
  );
}
