"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroConnectionFlow.module.css";

interface PathData {
  d: string;
  width: number;
  height: number;
}

/**
 * HeroConnectionFlow
 *
 * The Hero's one signature moment: a soft line of light draws itself once,
 * on load, from the CTA buttons toward the AI orb in HeroVisual — a quiet
 * visual cue that everything on the page is connected. It plays once,
 * settles to a near-invisible trace, and never loops or repeats.
 *
 * Self-contained, same pattern as CursorGlow: it locates its two endpoints
 * by querying `[data-connection-source]` (the CTA row, marked in Hero.tsx)
 * and `[data-connection-target]` (the orb, marked in HeroVisual.tsx) inside
 * its own parent — the Hero `<section>`. No refs or props need to be
 * threaded through either of those files beyond those two data attributes.
 *
 * No canvas, no SVG filters beyond a single CSS drop-shadow, no animation
 * library — one <path>, one CSS keyframe, GPU-friendly the whole way
 * (stroke-dashoffset and opacity only).
 */
export function HeroConnectionFlow() {
  const rootRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [path, setPath] = useState<PathData | null>(null);

  // Measure endpoints and build the curve. Runs once on mount, then again
  // (geometry only, not a replay of the draw-in) on resize.
  useEffect(() => {
    const svg = rootRef.current;
    const parent = svg?.parentElement;
    if (!svg || !parent) return;

    // Purely decorative — skipped entirely (not just visually hidden)
    // under reduced motion, so there's no measurement or render cost for
    // those users either.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const measure = () => {
      const source = parent.querySelector<HTMLElement>("[data-connection-source]");
      const target = parent.querySelector<HTMLElement>("[data-connection-target]");
      if (!source || !target) return;

      const parentRect = parent.getBoundingClientRect();
      const s = source.getBoundingClientRect();
      const t = target.getBoundingClientRect();

      // Start: top-center of the CTA row. End: center of the orb. Both
      // converted to coordinates relative to the Hero section.
      const x1 = s.left + s.width / 2 - parentRect.left;
      const y1 = s.top - parentRect.top;
      const x2 = t.left + t.width / 2 - parentRect.left;
      const y2 = t.top + t.height / 2 - parentRect.top;

      // A gentle arc rather than a straight ruled line: offset the midpoint
      // perpendicular to the direct path, capped so it always reads as a
      // soft curve, never a dramatic swoop.
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy) || 1;
      const offset = Math.min(dist * 0.18, 56);
      const controlX = (x1 + x2) / 2 - (dy / dist) * offset;
      const controlY = (y1 + y2) / 2 + (dx / dist) * offset;

      setPath({
        d: `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`,
        width: parentRect.width,
        height: parentRect.height,
      });
    };

    measure();

    let resizeFrame: number | null = null;
    const onResize = () => {
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    };
  }, []);

  // Feeds the path's real length into the CSS custom property the keyframe
  // animation reads for stroke-dasharray/stroke-dashoffset — has to happen
  // after the `d` attribute above is actually in the DOM, hence a separate
  // effect keyed on `path`.
  useEffect(() => {
    if (!path || !pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    pathRef.current.style.setProperty("--path-length", String(length));
  }, [path]);

  // Nothing to draw until the first measurement resolves — avoids a flash
  // of an unstyled/zero-length path on the very first frame.
  if (!path) return null;

  return (
    <svg
      ref={rootRef}
      role="presentation"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      viewBox={`0 0 ${path.width} ${path.height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="hero-connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-accent-blue)" />
          <stop offset="100%" stopColor="var(--color-accent-purple)" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={path.d}
        fill="none"
        stroke="url(#hero-connection-gradient)"
        strokeWidth={1.5}
        strokeLinecap="round"
        className={styles.connectionPath}
        style={{ filter: "drop-shadow(0 0 5px rgba(138, 180, 248, 0.45))" }}
      />
    </svg>
  );
}
