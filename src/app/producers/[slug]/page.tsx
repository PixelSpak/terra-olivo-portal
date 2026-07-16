import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AwardBadge from "@/components/AwardBadge";
import OilCard from "@/components/OilCard";
import {
  compareAwardEntries,
  getAllAwardEntries,
  getAllProducers,
  getOilsByProducer,
  getProducerAwardCount,
  getProducerBySlug,
  getProducerPrizeBreakdown,
} from "@/lib/data";
import type { Prize } from "@/lib/types";

export function generateStaticParams() {
  return getAllProducers().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producer = getProducerBySlug(slug);
  if (!producer) return { title: "Producer Not Found" };
  return { title: producer.name, description: producer.description };
}

export default async function ProducerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producer = getProducerBySlug(slug);
  if (!producer) notFound();

  const oils = getOilsByProducer(producer.slug);
  const totalPrizes = getProducerAwardCount(producer.slug);
  const breakdown = getProducerPrizeBreakdown(producer.slug);

  const history = getAllAwardEntries()
    .filter((entry) =>
      entry.kind === "oil"
        ? entry.oil.producerSlug === producer.slug
        : entry.producer.slug === producer.slug,
    )
    .sort(compareAwardEntries);

  const meta: { label: string; value: string }[] = [
    { label: "Country", value: producer.country },
  ];
  if (producer.founded)
    meta.push({ label: "Founded", value: String(producer.founded) });

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-olive-600">
        <Link href="/producers" className="hover:text-olive-500">
          Producers
        </Link>
        <span className="mx-2">/</span>
        <span className="text-olive-900">{producer.name}</span>
      </nav>

      <header className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <div className="flex items-center gap-4">
            {producer.logo ? (
              <Image
                src={producer.logo}
                alt={producer.name}
                width={64}
                height={64}
                sizes="64px"
                className="h-16 w-16 shrink-0 rounded-full object-cover border border-olive-200 bg-white"
                unoptimized
              />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-olive-700 font-serif text-2xl font-bold text-cream">
                {producer.name.charAt(0)}
              </span>
            )}
            <div>
              <h1 className="font-serif text-4xl font-bold text-olive-900">
                {producer.name}
              </h1>
              <p className="mt-1 text-olive-600">
                {producer.country}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl whitespace-pre-line text-olive-700">
            {producer.description}
          </p>
          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="text-xs uppercase tracking-wide text-olive-500">
                  {m.label}
                </dt>
                <dd className="font-medium text-olive-900">{m.value}</dd>
              </div>
            ))}
            {producer.website && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-olive-500">
                  Website
                </dt>
                <dd>
                  <a
                    href={producer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-olive-700 underline-offset-2 hover:underline"
                  >
                    Visit site
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-olive-200 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-olive-500">
            Awards won
          </p>
          <p className="font-serif text-5xl font-bold text-gold-500">
            {totalPrizes}
          </p>
          <p className="mt-1 text-sm text-olive-600">
            across {oils.length} {oils.length === 1 ? "Olive oil" : "Olive oils"} and producer honors
          </p>
          <ul className="mt-4 space-y-2 border-t border-olive-200 pt-4">
            {breakdown.map(({ prize, count }) => (
              <li
                key={prize}
                className="flex items-center justify-between gap-3"
              >
                <AwardBadge prize={prize as Prize} />
                <span className="text-sm font-semibold text-olive-800">
                  &times;{count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <section className="mt-14">
        <h2 className="font-serif text-2xl font-bold text-olive-900">
          Award-Winning Olive Oils
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {oils.map((oil) => (
            <OilCard key={oil.slug} oil={oil} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl font-bold text-olive-900">
          Award History
        </h2>
        <div className="mt-6 overflow-hidden rounded-xl border border-olive-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-olive-50 text-xs uppercase tracking-wide text-olive-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Edition</th>
                <th className="px-4 py-3 font-semibold">Olive Oil</th>
                <th className="px-4 py-3 font-semibold">Award</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-200">
              {history.map((entry) => (
                <tr key={entry.slug}>
                  <td className="px-4 py-3 font-medium text-olive-900">
                    {entry.award.year}
                  </td>
                  <td className="px-4 py-3">
                    {entry.kind === "oil" ? (
                      <Link
                        href={`/winners/${entry.oil.slug}`}
                        className="text-olive-700 underline-offset-2 hover:underline"
                      >
                        {entry.oil.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-olive-700">
                        Producer award
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/awards/${entry.slug}`} className="inline-block">
                      <AwardBadge prize={entry.award.prize} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
