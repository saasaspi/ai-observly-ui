import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AmplitudeInit } from "@/components/amplitude-init";
import { Inter, Outfit } from "next/font/google";
import { JsonLd } from "@/components/seo";
import { pageMetadata, SITE_URL, ORGANIZATION_ID } from "@/lib/seo";
import { HomepageContentProvider } from "@/components/homepage-content";
import { client } from "@/lib/sanity/client";
import { POSTS_QUERY, type PostSummary } from "@/lib/sanity/queries";
import { DeferredGoogleAnalytics } from "@/components/deferred-google-analytics";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--font-outfit" });

export const metadata: Metadata = {
  ...pageMetadata("/"),
  metadataBase: new URL(SITE_URL),
  title: { default: "AI Cost & Margin Tracking | AI Observly", template: "%s | AI Observly" },
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" }, { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] },
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posts: PostSummary[] = await client.fetch(`${POSTS_QUERY}[0...3]`, {}, { next: { revalidate: 60 } });
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Analytics 4 */}
        <Script id="ga4-init" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-P93V7K0XZB');
        `}</Script>
      </head>
      <body suppressHydrationWarning>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", "@id": ORGANIZATION_ID,
          name: "AI Observly", url: SITE_URL, logo: `${SITE_URL}/logo.png`, sameAs: ["https://x.com/dsvnaregalkar"] }} />
        <Providers>
          <AmplitudeInit />
          <DeferredGoogleAnalytics />
          <HomepageContentProvider posts={posts}>
          {children}
          </HomepageContentProvider>
        </Providers>
      </body>
    </html>
  );
}
