import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * Performance-first defaults:
 * - `reactStrictMode` catches unsafe lifecycle usage early in development.
 * - Modern image formats (AVIF, then WebP) are preferred; Next will fall back
 *   automatically for browsers that don't support them.
 * - `compress` enables gzip on the Node server output (no-op on most edge/CDN
 *   hosts that already compress, but harmless and safe as a default).
 * - `poweredByHeader: false` drops the `X-Powered-By: Next.js` response
 *   header — standard production hardening (avoids advertising framework/
 *   version to automated scanners) with zero behavioral effect.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    // Device sizes tuned for the 320px -> 4K responsive range required by the brief.
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1920, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    // Only pull in the parts of a package actually used, reducing client JS.
    optimizePackageImports: ["clsx", "tailwind-merge"],
  },

  /**
   * Baseline security headers, applied to every route. Vercel's edge
   * network already sets a few of these by default, but declaring them
   * here keeps the behavior identical on any other host and makes the
   * policy visible/version-controlled in the codebase rather than implicit
   * platform behavior.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevents the browser from MIME-sniffing a response away from
          // its declared Content-Type — mitigates a class of content-
          // injection attacks with no effect on normal rendering.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Blocks this site from being rendered inside a third-party
          // <iframe>, preventing clickjacking. No legitimate embedding use
          // case exists for a personal portfolio.
          { key: "X-Frame-Options", value: "DENY" },
          // Only sends the full referrer on same-origin navigations; other
          // sites only see the origin, not the full path/query — a
          // reasonable default privacy posture for outbound link clicks.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
