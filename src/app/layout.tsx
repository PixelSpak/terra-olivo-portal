import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Terra Olivo | The World's Best Olive Oils",
    template: "%s | Terra Olivo",
  },
  description:
    "Terra Olivo is the official guide to the world's best extra virgin olive oils — an audited classification of award-winning producers and brands.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
