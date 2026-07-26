import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

/**
 * Generates /sitemap.xml via Next's Metadata Route convention.
 *
 * Only the home page exists today (see app/page.tsx — just `<Hero />`).
 * When Projects/About/Contact become real routes or in-page anchors worth
 * indexing separately, add each as its own entry here rather than
 * maintaining a second, hand-written sitemap file.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
