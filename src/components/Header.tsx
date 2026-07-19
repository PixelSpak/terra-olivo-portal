"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "https://terraolivo-iooc.com", label: "Main Site", external: true },
  { href: "/winners", label: "Winners" },
  { href: "/producers", label: "Producers" },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 24);
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  const solidHeader = !isHome || isScrolled || isOpen;

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-[100] px-4 transition-all duration-300 sm:top-4">
        <div
          className={`relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-full px-2 transition-all duration-300 sm:h-16 sm:px-2 ${
            solidHeader
              ? "border border-olive-100 bg-white/95 shadow-[0_18px_42px_rgba(28,34,16,0.16)] backdrop-blur"
              : "border border-white/15 bg-olive-950/20 shadow-[0_18px_42px_rgba(28,34,16,0.14)] backdrop-blur-md"
          }`}
        >
          <Link href="/" className="flex items-center gap-2" aria-label="Terra Olivo home">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-white/70 sm:h-12 sm:w-12">
              <Image
                src="/images/terraolivo-logo.png"
                alt="Terra Olivo"
                width={48}
                height={48}
                sizes="48px"
                className="h-full w-full rounded-full object-cover"
                priority
                unoptimized
              />
            </span>
          </Link>
          <nav className="hidden items-center gap-8 pr-4 md:flex">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                    solidHeader
                      ? "text-olive-800 hover:text-olive-500"
                      : "text-cream hover:text-gold-400"
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                    solidHeader
                      ? "text-olive-800 hover:text-olive-500"
                      : "text-cream hover:text-gold-400"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
          <button
            type="button"
            className={`grid h-9 w-9 place-items-center rounded-full border transition-colors md:hidden ${
              solidHeader
                ? "border-olive-200 text-olive-900"
                : "border-white/55 text-cream"
            }`}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="flex h-4 w-4 flex-col justify-between">
              <span className={`h-px w-full bg-current transition ${isOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`h-px w-full bg-current transition ${isOpen ? "opacity-0" : ""}`} />
              <span className={`h-px w-full bg-current transition ${isOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
          {isOpen && (
            <nav className="absolute left-4 right-4 top-[calc(100%+8px)] z-[110] rounded-lg border border-olive-200 bg-white p-2 shadow-[0_18px_40px_rgba(28,34,16,0.14)] md:hidden">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-olive-800 transition-colors hover:bg-olive-50 hover:text-olive-500"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-olive-800 transition-colors hover:bg-olive-50 hover:text-olive-500"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>
          )}
        </div>
      </header>
      {!isHome && <div className="h-20 shrink-0 sm:h-24" aria-hidden="true" />}
    </>
  );
}
