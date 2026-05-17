import Link from "next/link";

const navLinks = [
  { href: "/winners", label: "Winners" },
  { href: "/producers", label: "Producers" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-olive-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-gold-400 bg-olive-900 font-serif text-base font-bold text-gold-400">
            T
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-olive-900">
            Terra Olivo
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-olive-800 transition-colors hover:text-olive-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
