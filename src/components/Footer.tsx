import Link from "next/link";

const legalLinks = [
  { label: "Accessibility statement", href: "#" },
  { label: "Terms and conditions", href: "#" },
  { label: "Privacy policy", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#202020] text-white">
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.25fr] lg:items-start">
          <section>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-white/45">
              Get in touch
            </p>
            <h2 className="mt-1 text-2xl font-light uppercase tracking-wide text-white">
              Contact
            </h2>

            <div className="mt-20 space-y-5 text-lg">
              <p>
                <a
                  href="mailto:contact@terraolivo-iooc.com"
                  className="text-[#a8ad52] hover:text-[#c0c764]"
                >
                  contact@terraolivo-iooc.com
                </a>
              </p>
              <p>
                <a
                  href="tel:+972546522655"
                  className="text-[#a8ad52] hover:text-[#c0c764]"
                >
                  +972-54-652-2655
                </a>
              </p>
              <address className="not-italic leading-relaxed text-white/90">
                Nava Semel 7
                <br />
                Kiryat Ono
                <br />
                Israel
              </address>
            </div>

            <div className="mt-5 flex items-center gap-5 text-white/55">
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

          <section className="lg:pt-20">
            <h2 className="text-center text-sm font-medium uppercase tracking-[0.35em] text-white">
              Sign up to our newsletter
            </h2>
            <form
              action="mailto:contact@terraolivo-iooc.com"
              method="post"
              encType="text/plain"
              className="mx-auto mt-9 max-w-3xl"
            >
              <div className="flex items-end gap-4 border-b border-[#a8ad52] pb-4">
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  placeholder="Stay up to date"
                  className="min-w-0 flex-1 bg-transparent text-lg text-white placeholder:text-white/45 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 text-base text-white transition-colors hover:text-[#c0c764]"
                >
                  Submit
                </button>
              </div>
              <p className="mt-4 text-center text-sm italic text-white/45">
                By entering your email, you agree to receive marketing emails and confirm our Terms of Service and Privacy Policy.
              </p>
            </form>
          </section>
        </div>

        <div className="mt-24 grid gap-8 text-sm text-white/50 lg:grid-cols-[1fr_auto] lg:items-center">
          <p className="text-base">
            © All rights reserved Terraolivo IOOC. Awarding excellence since 2010.
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[#a8ad52]">
            {legalLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-[#c0c764]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-10 text-center text-sm text-white/45">
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
    </footer>
  );
}
