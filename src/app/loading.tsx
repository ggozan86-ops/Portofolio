/**
 * Route-level loading UI, shown automatically by Next.js while the page
 * (and any async server components it contains) is preparing.
 *
 * Pure CSS animation (no JS spinner library) — a single border-spin, which
 * animates `transform: rotate()` only, staying on the GPU-friendly path.
 *
 * Height matches Hero's own `min-h-[90svh] lg:min-h-[100svh]` exactly
 * (rather than an arbitrary shorter value) so that if this fallback ever
 * renders for the home route — e.g. once a future section adds an async
 * server component — swapping it for the real page causes zero layout
 * shift, instead of the page growing taller the instant content arrives.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[90svh] items-center justify-center lg:min-h-[100svh]"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-blue"
        aria-hidden="true"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
