import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-QFCRZM4KDR";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Terra Olivo | The World's Best Olive Oils",
    template: "%s | Terra Olivo",
  },
  description:
    "Terra Olivo is the official guide to the world's best extra virgin olive oils — an audited classification of award-winning producers and brands.",
  openGraph: {
    type: "website",
    siteName: "Terra Olivo Awards",
    title: "Terra Olivo | The World's Best Olive Oils",
    description:
      "Explore the official TerraOlivo award-winning extra virgin olive oils and producers.",
    url: SITE_URL,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Terra Olivo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terra Olivo | The World's Best Olive Oils",
    description:
      "Explore the official TerraOlivo award-winning extra virgin olive oils and producers.",
    images: ["/logo.png"],
  },
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
