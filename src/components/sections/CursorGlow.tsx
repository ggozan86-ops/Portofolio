"use client";

import { useEffect, useRef } from "react";

/** Diameter in px. Large + heavily blurred so it reads as ambient light,
 * never as a distinct shape. */
const SIZE = 480;
/** Peak opacity while the cursor is inside the Hero section. Kept very low
 * per the brief — trimmed slightly from an earlier 0.12 now that
 * HeroAtmosphere and HeroVisual both carry their own ambient glow too, so
 * this one stays a light accent rather than adding a third overlapping
 * light source. */
const TARGET_OPACITY = 0.1;

/**
 * CursorGlow
 *
 * A soft, oversized radial-gradient blob that trails the cursor within the
 * Hero section — the ambient-light cue used by Linear/Raycast-style
 * interfaces rather than a literal cursor replacement.
 *
 * Implementation notes:
 * - Self-contained: it reads mouse position off its own parent element
 *   (the Hero `<section>`), so it can be dropped in without any prop
 *   wiring or lifting state into Hero.tsx.
 * - No React state at all — position and opacity are written straight to
 *   the DOM via a ref, rAF-throttled, so mousemove never causes a re-render.
 * - `pointer-events-none` guarantees it can never intercept clicks.
 * - Automatically inert — the listener is never attached — on touch
 *   devices (no fine pointer / no hover capability) and under
 *   `prefers-reduced-motion`.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!supportsHover || reducedMotion) return;

    let frame: number | null = null;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = null;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      // Center the glow on the cursor, in coordinates relative to the
      // Hero section (its nearest positioned ancestor).
      x = e.clientX - rect.left - SIZE / 2;
      y = e.clientY - rect.top - SIZE / 2;
      el.style.opacity = String(TARGET_OPACITY);
      if (frame === null) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };

    // PERF: will-change is set here, only once we know the listener will
    // actually attach, rather than unconditionally in the JSX below. This
    // element only ever animates on hover-capable, motion-allowed desktop
    // — on touch devices this whole effect returns early above, so it
    // never needs (or gets) a promoted compositing layer.
    el.style.willChange = "transform, opacity";
    parent.addEventListener("mousemove", onMove, { passive: true });
    parent.addEventListener("mouseleave", onLeave);

    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 -z-10"
      style={{
        width: SIZE,
        height: SIZE,
        opacity: 0,
        // PERF: `contain: layout style` scopes browser recalculation to
        // just this element. Deliberately not `paint` — this glow's whole
        // effect relies on its blur(80px) filter bleeding well past its
        // own 480px box edges to read as soft ambient light; `paint`
        // containment would clip that bleed at the border box (same as
        // overflow:hidden), hard-cutting the glow's edge.
        contain: "layout style",
        // Opacity transition handles the "disappear smoothly" requirement
        // on mouseleave; the transform itself is updated imperatively (not
        // transitioned) so it tracks the cursor without lag.
        transition: "opacity 400ms ease-out",
        background:
          "radial-gradient(circle, var(--color-accent-blue) 0%, var(--color-accent-purple) 40%, transparent 70%)",
        filter: "blur(80px)",
      }}
    />
  );
}
