import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

/**
 * Font loading via `next/font`.
 *
 * - Self-hosted automatically by Next (no runtime request to Google Fonts,
 *   so no render-blocking third-party network call — a direct Lighthouse
 *   win).
 * - `display: "swap"` avoids invisible text while the font loads.
 * - `variable` exposes each as a CSS custom property, consumed by
 *   `tailwind.config.ts` (`fontFamily.sans` / `fontFamily.mono`) so the rest
 *   of the app just uses Tailwind's `font-sans` / `font-mono` utilities.
 */
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * SEO metadata using the App Router's typed Metadata API.
 * Centralized in `siteConfig` (src/lib/constants.ts) so it's edited in one
 * place once real content/copy is ready — every field below just reads
 * from that object rather than hardcoding strings here.
 *
 * `alternates.canonical: "/"` resolves against `metadataBase` to the full
 * canonical URL for the home page. Once additional routes exist, each
 * page/section should set its own `alternates.canonical` the same way.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [siteConfig.author],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  applicationName: siteConfig.applicationName,
  alternates: {
    // Placeholder — resolves to `siteConfig.url` until real routes exist.
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.title }],
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Icon/manifest paths are placeholders — see "Favicon" in the deployment
  // summary for which binary assets still need to be dropped into /public.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: siteConfig.applicationName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    // Prevents iOS Safari from auto-linking things that look like phone
    // numbers/addresses inside body copy — desirable for a portfolio
    // where code snippets and dates could otherwise be mis-detected.
    telephone: false,
  },
};

/** Separate `viewport` export (required by Next 15) — also sets the
 * browser UI (address bar) color to match the dark theme.
 * `colorScheme: "dark"` tells the browser this site is dark-only so it can
 * render its own UI (scrollbars, form controls) with matching dark chrome
 * instead of a light default; `viewportFit: "cover"` lets the layout
 * extend under the notch/home-indicator on iOS, consistent with the
 * full-bleed dark background. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {/* Skip link: invisible until keyboard-focused, then jumps straight
            to <main> — lets keyboard/screen-reader users bypass the Navbar
            (and, once built, any future announcement banner) instead of
            tabbing through it on every page load. Uses only existing
            design tokens, so it introduces no new visual language. */}
        <a
          href="#main-content"
          className={
            "sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 " +
            "focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-md " +
            "focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-2 " +
            "focus-visible:text-sm focus-visible:font-medium focus-visible:text-background " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60 " +
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          }
        >
          Skip to main content
        </a>
        <Navbar />
        {/* id="main-content" is the skip link's target and gives the page's
            primary landmark a stable anchor; no visual or layout change. */}
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
