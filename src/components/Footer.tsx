import Link from "next/link";

const legalLinks = [
  { label: "Accessibility statement", href: "#" },
  { label: "Terms and conditions", href: "#" },
  { label: "Privacy policy", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#202020] text-white">
      <div className="container-page py-5 sm:py-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-start">
          <section>
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/45">
              Contact
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
              <a
                href="mailto:contact@terraolivo-iooc.com"
                className="text-[#a8ad52] hover:text-[#c0c764]"
              >
                contact@terraolivo-iooc.com
              </a>
              <a
                href="tel:+972546522655"
                className="text-[#a8ad52] hover:text-[#c0c764]"
              >
                +972-54-652-2655
              </a>
              <address className="not-italic text-white/70">
                Nava Semel 7, Kiryat Ono, Israel
              </address>
            </div>

            <div className="mt-2.5 flex items-center gap-3 text-white/55">
              <a
                href="https://www.facebook.com/TerraOlivo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Terra Olivo on Facebook"
                className="hover:text-[#a8ad52]"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/55 text-[13px] font-bold text-[#202020] transition-colors hover:bg-[#a8ad52]">
                  f
                </span>
              </a>
              <a
                href="https://www.instagram.com/terraolivoiooc/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Terra Olivo on Instagram"
                className="hover:text-[#a8ad52]"
              >
                <span className="grid h-5 w-5 place-items-center rounded-md border-2 border-white/55 text-[11px] font-semibold leading-none text-white/55 transition-colors hover:border-[#a8ad52] hover:text-[#a8ad52]">
                  ○
                </span>
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/55">
              Newsletter
            </h2>
            <form
              action="mailto:contact@terraolivo-iooc.com"
              method="post"
              encType="text/plain"
              className="mt-2"
            >
              <div className="flex items-center gap-3 border-b border-[#a8ad52]/80 pb-2">
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  placeholder="Stay up to date"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/45 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 text-sm text-white transition-colors hover:text-[#c0c764]"
                >
                  Submit
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-3 text-xs text-white/50">
          <p>
            © All rights reserved Terraolivo IOOC. Awarding excellence since 2010.
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[#a8ad52]">
            {legalLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-[#c0c764]">
                {link.label}
              </Link>
            ))}
          </nav>
          <p>
            Made with passion by{" "}
            <a
              href="https://webstack.agency"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a8ad52] hover:text-[#c0c764]"
            >
              Webstack.agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
