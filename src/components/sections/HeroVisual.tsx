"use client";

import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./HeroVisual.module.css";

interface HeroVisualProps {
  className?: string;
}

/* ============================================================================
 * CONTENT DATA
 * Kept as plain data rather than inline JSX so the "fake" editor/app content
 * is easy to scan and edit in one place, separate from layout markup below.
 * None of this is real information — it's decorative, and the whole
 * composition is hidden from assistive tech (see the root element below) —
 * so authentic-looking placeholder code/UI text is appropriate here, unlike
 * real page copy.
 * ========================================================================== */

/** A single syntax-highlighted token within a line of the code editor. */
interface CodeToken {
  text: string;
  tone: "keyword" | "type" | "plain" | "comment" | "punct";
}

/**
 * A short, realistic TypeScript snippet themed around shipping a product —
 * intentionally on-topic ("Product", "deploy", "publish") rather than
 * generic lorem-style filler.
 */
const codeLines: CodeToken[][] = [
  [
    { text: "interface", tone: "keyword" },
    { text: " Product ", tone: "plain" },
    { text: "{", tone: "punct" },
  ],
  [
    { text: "  id", tone: "plain" },
    { text: ": ", tone: "punct" },
    { text: "string;", tone: "type" },
  ],
  [
    { text: "  name", tone: "plain" },
    { text: ": ", tone: "punct" },
    { text: "string;", tone: "type" },
  ],
  [
    { text: "  launchedAt", tone: "plain" },
    { text: ": ", tone: "punct" },
    { text: "Date;", tone: "type" },
  ],
  [{ text: "}", tone: "punct" }],
  [{ text: "", tone: "plain" }],
  [{ text: "// ship it", tone: "comment" }],
  [
    { text: "export async function", tone: "keyword" },
    { text: " deploy", tone: "plain" },
    { text: "(product: ", tone: "punct" },
    { text: "Product", tone: "type" },
    { text: ") {", tone: "punct" },
  ],
  [
    { text: "  const build = ", tone: "plain" },
    { text: "await", tone: "keyword" },
    { text: " compile(product);", tone: "plain" },
  ],
  [{ text: "  return publish(build);", tone: "plain" }],
  [{ text: "}", tone: "punct" }],
];

/** Tailwind color-utility class for each token tone. */
const tokenToneClass: Record<CodeToken["tone"], string> = {
  keyword: "text-accent-blue",
  type: "text-accent-purple",
  plain: "text-foreground-muted",
  comment: "text-foreground-subtle",
  punct: "text-foreground-subtle",
};

/** Rows for the fictional productivity-app UI shown on the phone screen. */
const appTasks: ReadonlyArray<{ label: string; time: string; done: boolean }> = [
  { label: "Design review", time: "09:30", done: true },
  { label: "Ship v2.4", time: "11:00", done: false },
  { label: "Sync automation", time: "14:30", done: false },
];

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

/**
 * HeroVisual
 *
 * A premium device composition — laptop (code editor) behind, phone
 * (productivity app) overlapping in front, small AI orb floating nearby —
 * built entirely from styled `div`/`span` elements and CSS. No raster
 * images, no SVG, no animation or 3D library: every shape is a border,
 * radius, and gradient; every motion is a CSS `transform` keyframe.
 *
 * Purely decorative: the whole subtree is hidden from assistive technology
 * (`role="presentation"` + `aria-hidden`), consistent with how the previous
 * placeholder was marked up. Sighted users get the visual; screen reader
 * users skip straight past it to the real content already in `Hero.tsx`.
 *
 * MOUSE PARALLAX (new)
 * On mousemove, the laptop, phone, and orb each shift by a few px —
 * different amounts, so they read as objects at different depths rather
 * than one flat image. This is why each one has an extra plain wrapper
 * `<div>` around its existing float/tilt markup below: the tilt transform
 * and the CSS float-keyframe animation each already own their own
 * `transform`, so the parallax offset needs its own element to write to
 * rather than fighting either of them for the same property.
 *
 * That write happens directly on the DOM via refs inside a rAF-throttled
 * `mousemove` handler — no React state, so moving the mouse never
 * re-renders this component. The listener is only attached when the device
 * has a fine pointer + hover support and the user hasn't asked for reduced
 * motion; on touch/mobile or under `prefers-reduced-motion`, it's simply
 * never attached, so the layers sit at their static tilt position.
 */
function HeroVisualImpl({ className }: HeroVisualProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const laptopParallaxRef = useRef<HTMLDivElement>(null);
  const phoneParallaxRef = useRef<HTMLDivElement>(null);
  const orbParallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!supportsHover || reducedMotion) return;

    const root = rootRef.current;
    if (!root) return;

    let frame: number | null = null;
    let listening = false;
    // Normalized -1..1 relative to viewport center.
    let nx = 0;
    let ny = 0;

    const apply = () => {
      frame = null;
      // Max offsets kept at or under the brief's 6px ceiling. Slightly
      // different multipliers per layer (not just different signs) so the
      // laptop — furthest back — moves least, and the orb — smallest,
      // "floatiest" element — moves most, reinforcing the depth illusion.
      if (laptopParallaxRef.current) {
        laptopParallaxRef.current.style.transform = `translate3d(${nx * 4}px, ${ny * 4}px, 0)`;
      }
      if (phoneParallaxRef.current) {
        phoneParallaxRef.current.style.transform = `translate3d(${nx * 5}px, ${ny * 5}px, 0)`;
      }
      if (orbParallaxRef.current) {
        // Inverted so the orb drifts opposite the devices — a subtle
        // counter-motion cue rather than everything sliding in lockstep.
        orbParallaxRef.current.style.transform = `translate3d(${nx * -6}px, ${ny * -6}px, 0)`;
      }
    };

    const onMove = (e: MouseEvent) => {
      nx = (e.clientX / window.innerWidth - 0.5) * 2;
      ny = (e.clientY / window.innerHeight - 0.5) * 2;
      if (frame === null) frame = requestAnimationFrame(apply);
    };

    // PERF: will-change is applied only while the listener is actually
    // attached (Hero in view), not for the component's whole mounted
    // lifetime — avoids reserving three composited layers on a page the
    // user has already scrolled past.
    const setLayers = (value: string) => {
      if (laptopParallaxRef.current) laptopParallaxRef.current.style.willChange = value;
      if (phoneParallaxRef.current) phoneParallaxRef.current.style.willChange = value;
      if (orbParallaxRef.current) orbParallaxRef.current.style.willChange = value;
    };

    const attach = () => {
      if (listening) return;
      listening = true;
      setLayers("transform");
      window.addEventListener("mousemove", onMove, { passive: true });
    };

    const detach = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("mousemove", onMove);
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      setLayers("auto");
    };

    // PERF: pause the whole effect (listener + composited layers) whenever
    // the Hero scrolls out of view. Without this, a page that later grows
    // additional sections below the Hero would keep a page-wide mousemove
    // listener running — and rAF-scheduling on every mouse move anywhere
    // on the page — for a visual the user can no longer see.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) attach();
        else detach();
      },
      { threshold: 0 }
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      detach();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="presentation"
      aria-hidden="true"
      className={cn(
        // Same reserved aspect ratio as before, so the Hero's left/right
        // balance is unchanged — only what's drawn inside it is new.
        "relative aspect-[4/5] w-full sm:aspect-square",
        className
      )}
      style={{
        perspective: "1400px",
        // PERF: `contain: layout style` tells the browser this subtree's
        // layout can be isolated from the rest of the page (skipped when
        // unrelated content changes elsewhere, and vice versa). Deliberately
        // *not* `paint` here — this box has no overflow-hidden, and its
        // ambient glow child (blur-3xl) is designed to soften right at the
        // edge of this composition; `paint` containment clips content to
        // the border box like overflow:hidden would, which could hard-cut
        // that bleed and visibly change the glow. `layout style` gives the
        // isolation win with none of that clipping risk.
        contain: "layout style",
      }}
    >
      {/* Ambient glow: a single soft, very low-opacity radial wash behind the
          devices. Pure gradient + blur, no extra DOM weight, and subtle
          enough to add depth without becoming a "busy background".
          Opacity trimmed from 20% to 14% — combined with HeroAtmosphere's
          own right-side glow behind this component, 20% was starting to
          compete with the devices themselves for attention rather than
          just lighting them. */}
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full opacity-[0.14] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-blue) 0%, var(--color-accent-purple) 45%, transparent 70%)",
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* LAPTOP — back layer                                               */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="absolute left-1/2 top-[10%] w-[78%]"
        style={{ transform: "translateX(-50%) rotateX(8deg) rotateY(-10deg)" }}
      >
        {/* Parallax wrapper: owns the mouse-driven translate3d(), separate
            from both the static tilt (parent, above) and the float
            animation (child, below) so all three transforms can coexist
            without overwriting each other. */}
        <div ref={laptopParallaxRef}>
        {/* Inner wrapper owns the float animation, so it can animate
            `transform: translateY()` independently of the static 3D tilt
            set on the parent above (animating the same property on one
            element would overwrite the tilt every frame). */}
        <div className={styles.laptopFloat}>
          {/* Screen / lid */}
          <div
            className="relative overflow-hidden rounded-t-lg border border-border bg-background-secondary shadow-[var(--shadow-device-laptop)]"
          >
            {/* Title bar */}
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-foreground-subtle/60" />
              <span className="h-2 w-2 rounded-full bg-foreground-subtle/60" />
              <span className="h-2 w-2 rounded-full bg-foreground-subtle/60" />
            </div>

            {/* Code editor body */}
            <div className="flex gap-3 px-3 py-3 font-mono text-[7px] leading-[1.7] sm:text-[8px] lg:text-[10px]">
              {/* Line numbers */}
              <div className="select-none text-right text-foreground-subtle/70">
                {codeLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Code tokens */}
              <div className="min-w-0 flex-1">
                {codeLines.map((line, i) => (
                  <div key={i} className="whitespace-pre">
                    {line.map((token, j) => (
                      <span key={j} className={tokenToneClass[token.tone]}>
                        {token.text}
                      </span>
                    ))}
                    {line.length === 0 && "\u00A0"}
                  </div>
                ))}
              </div>
            </div>

            {/* Glass reflection: a single diagonal highlight streak, the
                kind of cue that sells "glass screen" on real device mockups.
                Absolutely positioned, non-interactive, opacity kept low
                (8%→0) so it reads as a light catch rather than a visible
                stripe. One extra div, no extra JS, no layout impact. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, transparent 22%, transparent 78%, rgba(255,255,255,0.04) 100%)",
              }}
            />
          </div>

          {/* Base / keyboard deck — a slim trapezoid-like bar beneath the
              screen, just wide enough to read as "laptop", not a full
              illustrated keyboard. */}
          <div className="mx-auto h-2 w-[104%] -translate-x-[2%] rounded-b-md border border-t-0 border-border bg-background-secondary/80" />
          <div className="mx-auto h-[3px] w-[70%] rounded-b-full bg-border" />
        </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* PHONE — front layer, overlapping the laptop's bottom-left corner  */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="absolute bottom-[6%] left-[6%] z-10 w-[34%]"
        style={{ transform: "rotateX(4deg) rotateY(8deg)" }}
      >
        {/* Parallax wrapper — same reasoning as the laptop's above: a
            dedicated element for the mouse-driven translate3d(), separate
            from the static tilt (parent) and the float animation (child). */}
        <div ref={phoneParallaxRef}>
        <div className={styles.phoneFloat}>
          <div className="relative overflow-hidden rounded-[1.1rem] border border-border bg-background-secondary shadow-[var(--shadow-device-phone)]">
            {/* Status bar: a minimal camera-cutout pill, nothing branded */}
            <div className="flex justify-center py-1.5">
              <span className="h-1.5 w-6 rounded-full bg-foreground-subtle/40" />
            </div>

            {/* App content: fictional "Today" productivity view */}
            <div className="space-y-2.5 px-3 pb-3">
              <p className="text-[7px] font-semibold text-foreground sm:text-[8px] lg:text-[10px]">
                Today
              </p>

              {appTasks.map((task) => (
                <div
                  key={task.label}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-1.5 py-1.5"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full border",
                      task.done
                        ? "border-accent-blue bg-accent-blue"
                        : "border-foreground-subtle bg-transparent"
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-[6.5px] text-foreground-muted sm:text-[7.5px] lg:text-[9px]">
                    {task.label}
                  </span>
                  <span className="shrink-0 text-[6px] text-foreground-subtle sm:text-[7px] lg:text-[8px]">
                    {task.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Glass reflection — same technique as the laptop screen, kept
                deliberately fainter (4%→0) since the phone sits in front and
                already reads as the "closer, more lit" object; a reflection
                as strong as the laptop's would flatten that depth cue. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.05) 0%, transparent 25%, transparent 80%, rgba(255,255,255,0.03) 100%)",
              }}
            />
          </div>
        </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* AI ORB — small, elegant, floating near the devices                */}
      {/* ---------------------------------------------------------------- */}
      {/* No separate parallax wrapper needed here: this outer div doesn't
          set its own `transform` (only the inner `styles.orbSpin` element
          below does, for rotation), so it's safe to write the mouse-driven
          translate3d() straight onto it via ref. */}
      <div
        ref={orbParallaxRef}
        className="absolute right-[10%] top-[6%] h-[9%] w-[9%]"
        // Endpoint marker for HeroConnectionFlow, which queries for this
        // attribute — no ref/prop plumbing needed between the two files.
        data-connection-target="orb"
      >
        {/* Independent float layer: its own element, so this can animate
            translateY without touching the parallax ref's transform above
            or the rotation/breathing transforms nested inside it below. */}
        <div className={styles.orbFloat}>
          {/* Outer glow: soft breathing pulse (opacity + scale), separate
              element from the rotating body so the two motions never
              collide on one `transform`. */}
          <div
            className={cn("absolute inset-[-40%] rounded-full blur-xl", styles.orbGlow)}
            style={{
              background:
                "radial-gradient(circle, var(--color-accent-blue) 0%, transparent 70%)",
            }}
          />
          {/* Orb body: the only rotating element, via a conic-gradient sweep
              that reads as a slow, subtle internal shimmer rather than the
              whole orb spinning in place. */}
          <div
            className={cn(
              "relative h-full w-full rounded-full border border-white/10",
              styles.orbSpin
            )}
            style={{
              background:
                "conic-gradient(from 0deg, var(--color-accent-blue), var(--color-accent-purple), var(--color-accent-blue))",
            }}
          >
            {/* Inner core keeps the center calm/opaque so the conic sweep only
                shows as a thin rotating ring of light at the edge. A faint
                top-left radial highlight is layered on top of the flat fill
                — a cheap, static "catch-light" cue that gives the orb a hint
                of sphere-like volume instead of reading as a flat coin. */}
            <div
              className="absolute inset-[15%] rounded-full bg-background-secondary"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.10) 0%, transparent 55%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// PERF: memoized — HeroVisualImpl takes only a static `className` prop and
// has no internal state, so it never needs to re-render after its first
// paint. Wrapping in memo() makes that explicit and future-proof if a
// parent above it ever gains state that would otherwise force a re-render
// of this fairly large JSX tree for no visual reason.
export const HeroVisual = memo(HeroVisualImpl);
HeroVisual.displayName = "HeroVisual";
