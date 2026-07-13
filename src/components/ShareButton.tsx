"use client";

import { useState } from "react";

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  label?: string;
}

export default function ShareButton({
  url,
  title,
  text,
  label = "Share Award",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    setOpen((current) => !current);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleShare}
        aria-expanded={open}
        className="text-sm font-semibold text-olive-950 underline underline-offset-4 transition hover:text-black focus:outline-none focus:ring-2 focus:ring-gold-400/40"
      >
        {label}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-lg border border-olive-200 bg-white shadow-[0_18px_45px_rgba(28,34,16,0.16)]">
          <div className="border-b border-olive-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-olive-400">
              Share this page
            </p>
          </div>
          <div className="p-2">
            {shareLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md px-3 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-olive-800 transition hover:bg-olive-50"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
