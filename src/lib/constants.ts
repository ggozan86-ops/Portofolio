/**
 * Centralized site configuration.
 *
 * Kept separate from `layout.tsx` so metadata, nav links, and social URLs
 * have one place to be edited as the real content comes in later — nothing
 * here is content-specific to a person yet, since the brief explicitly
 * excludes hero/about/contact copy at this stage.
 *
 * PRODUCTION NOTE: every value below is a placeholder ready to be swapped
 * for real content before launch — see the "Remaining tasks" list in the
 * deployment summary. `url` reads from `NEXT_PUBLIC_SITE_URL` first so the
 * same code works unmodified across Vercel's Production/Preview
 * environments (each gets its own URL) without a code change per
 * environment — see `.env.example`.
 */

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://example.com";

export const siteConfig = {
  name: "Portfolio",
  title: "Portfolio — Foundation",
  titleTemplate: "%s — Portfolio",
  description:
    "A premium, minimal personal portfolio built with Next.js, TypeScript, and Tailwind CSS.",
  // TODO: replace with real, specific SEO keywords once page copy is final.
  keywords: [
    "portfolio",
    "web developer",
    "AI engineer",
    "automation engineer",
    "bot developer",
    "Next.js",
    "TypeScript",
  ] as string[],
  // TODO: replace with the site owner's real name and profile URL(s).
  author: { name: "Muhammad Fauzan A", url: siteUrl },
  creator: "Muhammad Fauzan A",
  publisher: "Muhammad Fauzan A",
  url: siteUrl,
  ogImage: "/og-image.png",
  locale: "en_US",
  themeColor: "#09090B",
  // Used for the PWA manifest / apple-mobile-web-app-title — kept short
  // per platform conventions (home-screen labels truncate long names).
  applicationName: "Portfolio",
  // TODO: replace with real handles once social accounts are finalized.
  twitterHandle: "@example",
} as const;

/**
 * Primary navigation links. Placeholder targets only — the sections they
 * point to (About, Work, Contact) are not built yet, but the Navbar
 * component needs a data shape to render against.
 */
export const navLinks: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];
