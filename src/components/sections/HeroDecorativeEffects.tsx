"use client";

import dynamic from "next/dynamic";

/**
 * HeroDecorativeEffects
 *
 * PERF: code-splits CursorGlow and HeroConnectionFlow out of the initial
 * JS payload via `next/dynamic(..., { ssr: false })`.
 *
 * Both components are safe to defer with zero visual difference:
 * - CursorGlow always mounts at `opacity: 0` and only becomes visible
 *   after a real mousemove event inside the Hero — there is nothing to
 *   see from it before that happens either way.
 * - HeroConnectionFlow renders `null` until its own effect has measured
 *   its two endpoints on the client — same story, nothing is visible
 *   before hydration regardless of how it's loaded.
 *
 * Since neither one has any server-rendered visual output to begin with,
 * moving them into their own client-loaded chunk doesn't introduce a
 * flash of missing content (no CLS) — it just removes their code from
 * the JS that has to be parsed/executed before the rest of the Hero can
 * hydrate, which is a direct Total-Blocking-Time / Time-to-Interactive
 * win on the Lighthouse mobile run.
 *
 * `ssr: false` requires a Client Component boundary in the App Router
 * (Next.js rejects it inside a Server Component), which is the only
 * reason this thin wrapper exists rather than calling `dynamic()`
 * straight from Hero.tsx — Hero.tsx itself stays a server component.
 */
const CursorGlow = dynamic(
  () => import("./CursorGlow").then((mod) => mod.CursorGlow),
  { ssr: false }
);

const HeroConnectionFlow = dynamic(
  () => import("./HeroConnectionFlow").then((mod) => mod.HeroConnectionFlow),
  { ssr: false }
);

export function HeroDecorativeEffects() {
  return (
    <>
      <CursorGlow />
      <HeroConnectionFlow />
    </>
  );
}
