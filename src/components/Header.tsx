"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/winners", label: "Winners" },
  { href: "/producers", label: "Producers" },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[100] border-b border-olive-100 bg-white/95 backdrop-blur">
      <div className="container-page relative flex h-14 items-center justify-between sm:h-16">
        <Link href="/" className="flex items-center gap-2" aria-label="Terra Olivo home">
          <Image
            src="/logo.png"
            alt="Terra Olivo"
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
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
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full border border-olive-200 text-olive-900 md:hidden"
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
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-olive-800 transition-colors hover:bg-olive-50 hover:text-olive-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
