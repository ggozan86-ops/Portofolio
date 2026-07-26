import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

/**
 * Generates /robots.txt at build/request time via Next's Metadata Route
 * convention — replaces a static `public/robots.txt` so the sitemap
 * reference and host always match `siteConfig.url` (and therefore
 * `NEXT_PUBLIC_SITE_URL`) instead of drifting out of sync across
 * Preview/Production Vercel deployments.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
