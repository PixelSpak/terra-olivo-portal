"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-5 z-50 grid h-10 w-10 place-items-center rounded-full border border-olive-200 bg-white/90 text-lg font-semibold text-olive-900 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-olive-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
