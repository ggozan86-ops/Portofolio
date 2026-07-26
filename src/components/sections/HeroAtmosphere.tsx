import { cn } from "@/lib/utils";
import styles from "./HeroAtmosphere.module.css";

/* ============================================================================
 * PARTICLE DATA
 * Hardcoded positions/sizes/timings rather than `Math.random()` at render
 * time — this keeps HeroAtmosphere a server component (no client JS, no
 * hydration mismatch between server-rendered and client-rendered "random"
 * values) while still reading as organic and non-repeating.
 * ========================================================================== */
interface Particle {
  /** Position as a percentage of the hero section. */
  top: number;
  left: number;
  /** Diameter in px — kept tiny, per the brief. */
  size: number;
  /** Opacity, always kept under 0.2. */
  opacity: number;
  /** One of three drift paths defined in the CSS module, for variety. */
  variant: "particleA" | "particleB" | "particleC";
  /** Seconds — deliberately uneven so particles never sync up. */
  duration: number;
  delay: number;
}

const particles: Particle[] = [
  { top: 12, left: 18, size: 2, opacity: 0.14, variant: "particleA", duration: 24, delay: 0 },
  { top: 22, left: 62, size: 3, opacity: 0.1, variant: "particleB", duration: 31, delay: 2 },
  { top: 8, left: 44, size: 2, opacity: 0.16, variant: "particleC", duration: 27, delay: 4 },
  { top: 34, left: 8, size: 2, opacity: 0.12, variant: "particleB", duration: 34, delay: 1 },
  { top: 46, left: 76, size: 3, opacity: 0.09, variant: "particleA", duration: 29, delay: 6 },
  { top: 62, left: 30, size: 2, opacity: 0.15, variant: "particleC", duration: 22, delay: 3 },
  { top: 70, left: 55, size: 2, opacity: 0.11, variant: "particleA", duration: 36, delay: 5 },
  { top: 18, left: 90, size: 2, opacity: 0.13, variant: "particleB", duration: 26, delay: 7 },
  { top: 80, left: 14, size: 3, opacity: 0.08, variant: "particleC", duration: 33, delay: 2.5 },
  { top: 54, left: 4, size: 2, opacity: 0.14, variant: "particleA", duration: 28, delay: 4.5 },
  { top: 38, left: 96, size: 2, opacity: 0.1, variant: "particleB", duration: 30, delay: 0.5 },
  { top: 88, left: 68, size: 2, opacity: 0.12, variant: "particleC", duration: 25, delay: 6.5 },
];

/**
 * HeroAtmosphere
 *
 * Purely decorative background layer for the Hero section: dark base, two
 * ultra-soft radial gradients, a faint grid, a cheap CSS noise texture, a
 * wider glow anchored behind the visual column, and a handful of drifting
 * particles. No images, no SVG, no canvas — every layer is a plain `div`
 * with a CSS gradient/pattern, and every motion is a `transform` keyframe.
 *
 * `pointer-events-none` + `aria-hidden` mean it can never intercept clicks
 * or be announced to screen readers — it sits behind the Hero's real
 * content and does not participate in interaction or the accessibility
 * tree at all.
 */
export function HeroAtmosphere() {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      // PERF: this layer is purely decorative and self-contained — nothing
      // inside it depends on or affects layout/paint outside its own box.
      // `contain: layout paint` makes that an explicit browser hint,
      // scoping recalculation to this subtree alone.
      style={{ contain: "layout paint" }}
    >
      {/* Layer 1 — primary background. Restates the page background inside
          this component so HeroAtmosphere is self-contained (correct even
          if reused somewhere with a different ambient background). */}
      <div className="absolute inset-0 bg-background" />

      {/* Layer 2 — soft dark-blue radial gradient, opacity under 15%. */}
      <div
        className={cn(
          "absolute -left-[10%] -top-[20%] h-[70%] w-[70%] rounded-full blur-3xl",
          styles.gradientA
        )}
        style={{
          opacity: 0.12,
          background:
            "radial-gradient(circle, var(--color-accent-blue) 0%, transparent 70%)",
          // PERF: caps the blob at 900px regardless of viewport width. The
          // percentage sizing above already resolves below this cap on
          // every common screen (phone through ~1440px desktop), so this
          // is a no-op there; it only kicks in on ultra-wide/4K displays,
          // where 70% of the Hero's width would otherwise hand a 64px
          // blur filter a canvas several times larger than intended —
          // bounding it keeps paint cost constant instead of scaling with
          // monitor size.
          maxWidth: "900px",
          maxHeight: "900px",
        }}
      />

      {/* Layer 3 — soft purple radial gradient, opacity under 10%, offset
          position and independent drift timing so the two blend naturally
          rather than moving in lockstep. */}
      <div
        className={cn(
          "absolute -right-[15%] bottom-[-15%] h-[65%] w-[65%] rounded-full blur-3xl",
          styles.gradientB
        )}
        style={{
          opacity: 0.08,
          background:
            "radial-gradient(circle, var(--color-accent-purple) 0%, transparent 70%)",
          // PERF: same bounded-canvas reasoning as gradientA above.
          maxWidth: "840px",
          maxHeight: "840px",
        }}
      />

      {/* Grid texture — a single tiled line pattern, opacity ~4%. Static
          (no animation): a moving grid would fight the brief's "almost
          invisible, never dominate" instruction. */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), " +
            "linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Noise — a cheap CSS-only stand-in for film grain: a 2px diagonal
          hairline pattern at very low opacity. Deliberately not an SVG
          `<filter>` (feTurbulence) or canvas texture — both cost far more
          to paint than a single tiled linear-gradient the browser caches
          after first paint. */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 2px)",
        }}
      />

      {/* Vignette — a very soft radial darkening toward the section's
          edges. This is the one addition purely for "depth" rather than
          any specific object: without it, the gradients/grid/particles
          above all sit at a flat, even brightness edge-to-edge, which
          reads as a background rather than a space with the devices
          sitting *inside* it. Static (no animation, no extra blur — just
          a gradient), so it costs nothing beyond one more composited
          layer already covered by this container's `contain: layout
          paint`. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      {/* Glow — wider, brighter wash anchored to the right half of the
          section (where HeroVisual sits in the two-column layout), giving
          the devices a soft cinematic backlight without touching
          HeroVisual itself. Trimmed from 0.18 to 0.14: HeroVisual now has
          its own local ambient glow behind the devices, so this outer wash
          only needs to carry the light the rest of the way — at the old
          opacity the two glows stacked into a brighter halo than intended. */}
      <div
        className="absolute right-0 top-1/2 h-[80%] w-[50%] -translate-y-1/2 rounded-full blur-3xl"
        style={{
          opacity: 0.14,
          background:
            "radial-gradient(ellipse, var(--color-accent-blue) 0%, var(--color-accent-purple) 55%, transparent 75%)",
        }}
      />

      {/* Particles — small, slow, non-interactive. */}
      {particles.map((p, i) => (
        <span
          key={i}
          className={cn("absolute rounded-full bg-foreground", styles[p.variant])}
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
