import type { Metadata, Viewport } from "next";
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
