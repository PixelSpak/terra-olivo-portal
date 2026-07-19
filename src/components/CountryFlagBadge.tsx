import { getCountryFlag } from "@/lib/countryFlags";

export default function CountryFlagBadge({
  country,
  className = "",
}: {
  country: string;
  className?: string;
}) {
  const flag = getCountryFlag(country);
  if (!flag) return null;

  return (
    <span
      className={`block h-9 w-9 overflow-hidden rounded-full shadow-[0_6px_14px_rgba(28,34,16,0.18)] ring-1 ring-olive-950/10 ${className}`}
      title={country}
      aria-label={country}
    >
      <img
        src={flag}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
