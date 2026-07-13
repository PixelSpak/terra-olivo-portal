const legalLinks = [
  {
    label: "Terms and conditions",
    href: "https://terraolivo-iooc.com/terms-and-conditions/",
  },
  {
    label: "Privacy policy",
    href: "https://terraolivo-iooc.com/privacy-policy/",
  },
];

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M14.2 8.1V6.6c0-.7.5-.9.9-.9h2.2V2.1L14.2 2c-3.4 0-4.1 2.5-4.1 4.1v2H7.4v3.8h2.7V22h4.1V11.9h2.8l.4-3.8h-3.2Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-0" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#202020] text-white">
      <div className="container-page flex flex-col gap-3 py-4 text-sm sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <a
            href="mailto:contact@terraolivo-iooc.com"
            className="text-[#a8ad52] transition-colors hover:text-[#c0c764]"
          >
            contact@terraolivo-iooc.com
          </a>

          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/terraolivo/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TerraOlivo on Facebook"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-[#a8ad52] hover:text-[#a8ad52]"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.instagram.com/terraolivo_official/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TerraOlivo on Instagram"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-[#a8ad52] hover:text-[#a8ad52]"
            >
              <InstagramIcon />
            </a>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#a8ad52]">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#c0c764]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/10 pt-3 text-xs text-white/50">
          <p>© All rights reserved Terraolivo IOOC. Awarding excellence since 2010.</p>
          <p>
            Made with passion by{" "}
            <a
              href="https://webstack.agency/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a8ad52] transition-colors hover:text-[#c0c764]"
            >
              Webstack.agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
