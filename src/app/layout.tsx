import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { SITE } from "@/lib/site";
import { absoluteUrl, organizationJsonLd, webSiteJsonLd } from "@/lib/seo";
import { CompareProvider } from "@/context/CompareContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Find the Right Power Station for Your Needs`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: `${SITE.name} — Find the Right Power Station for Your Needs`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // overflow-x-hidden on both html and body is a safety net: <html> is the
  // actual scrolling element for the page, so it also needs the constraint.
  // Together they stop any accidental wide content deep in the tree from
  // making the whole page pannable horizontally, without affecting nested
  // overflow-x-auto containers (e.g. the Power Calculator device table),
  // which keep scrolling independently.
  return (
    <html lang="en" data-scroll-behavior="smooth" className="overflow-x-hidden">
      <body className="min-h-screen overflow-x-hidden">
        {/*
          Google AdSense account/verification loader — the official
          snippet, unmodified, published once here so every route gets it
          exactly once. `beforeInteractive` is the only next/script
          strategy Next.js injects into the actual <head> regardless of
          where the component sits in the tree (this root layout has no
          manual <head> element; App Router builds it from the Metadata
          API) — this placement matches Next's own documented pattern for
          beforeInteractive scripts. The script tag keeps its own `async`
          attribute, so the browser fetches it without blocking HTML
          parsing or paint — this only ships the loader, no manual ad
          slots/units are placed anywhere yet.
        */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5968945060876033"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <CompareProvider>
          <Header />
          <main id="main" className="pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </CompareProvider>
      </body>
    </html>
  );
}
