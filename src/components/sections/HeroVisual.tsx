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

/** Editor tab label — on-theme with the snippet below, gives the title bar
 * something to anchor on (real editors never show a title bar with no open
 * tab) without introducing any new fictional narrative. */
const activeFile = "product.ts";

/** Rows for the fictional productivity-app UI shown on the phone screen.
 * `accent` alternates blue/purple per row — a computed visual variation
 * (see render below), not new copy — so the list reads less monochrome
 * than a single repeated dot color. */
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
        if (entry?.isIntersecting) attach();
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

      {/* Ground shadow: a single flattened, blurred ellipse beneath the
          whole composition. This is the cue real product photography relies
          on to read as "resting on a surface" rather than "pasted onto the
          background" — without it, devices floating with drop shadows alone
          still look weightless. Pure gradient + blur (same technique as the
          ambient glow above), so it costs nothing extra to composite. Sized
          and positioned to sit roughly under the laptop's base, not the
          full bounding box, so it doesn't read as a giant dark smear. */}
      <div
        className="pointer-events-none absolute bottom-[6%] left-1/2 h-[8%] w-[62%] -translate-x-1/2 rounded-[50%] opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, transparent 80%)",
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* LAPTOP — back layer                                               */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="absolute left-1/2 top-[8%] w-[82%]"
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
            {/* Title bar: real (muted) traffic-light colors instead of flat
                grey dots — a small, instantly-recognizable realism cue that
                costs nothing extra (still just three spans), kept soft via
                opacity rather than full-saturation so it reads as premium
                rather than literally mimicking macOS chrome. */}
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#FF5F57]/70" />
              <span className="h-2 w-2 rounded-full bg-[#FEBC2E]/70" />
              <span className="h-2 w-2 rounded-full bg-[#28C840]/70" />
            </div>

            {/* Tab bar: a single active file tab, the detail that makes the
                title bar above read as "an editor with a file open" instead
                of a generic window chrome. One div, matches the existing
                border/background tokens already used everywhere else here. */}
            <div className="flex items-center border-b border-border bg-background/40 px-3">
              <span className="flex items-center gap-1.5 border-b-2 border-accent-blue py-1.5 pr-3 text-[6.5px] font-medium text-foreground sm:text-[7.5px] lg:text-[9px]">
                <span className="h-[5px] w-[5px] shrink-0 rounded-[2px] bg-accent-blue/70" />
                {activeFile}
              </span>
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
                {codeLines.map((line, i) => {
                  const isLastLine = i === codeLines.length - 1;
                  return (
                    <div key={i} className="whitespace-pre">
                      {line.map((token, j) => (
                        <span key={j} className={tokenToneClass[token.tone]}>
                          {token.text}
                        </span>
                      ))}
                      {line.length === 0 && "\u00A0"}
                      {/* Blinking caret after the final line — the one
                          purely CSS `opacity` keyframe in the whole editor,
                          cheap enough to run indefinitely, and the detail
                          that most sells "live code" rather than a static
                          screenshot. */}
                      {isLastLine && (
                        <span
                          className={cn(
                            "ml-[1px] inline-block h-[0.9em] w-[1.5px] translate-y-[0.15em] bg-accent-blue align-middle",
                            styles.cursorBlink
                          )}
                        />
                      )}
                    </div>
                  );
                })}
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
              illustrated keyboard. A subtle top-to-bottom gradient (instead
              of a flat fill) gives this thin bar a hint of the same
              beveled-metal look real laptop decks catch light on. */}
          <div
            className="mx-auto h-2 w-[104%] -translate-x-[2%] rounded-b-md border border-t-0 border-border"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-background-secondary) 0%, var(--color-background) 100%)",
            }}
          />
          <div className="mx-auto h-[3px] w-[70%] rounded-b-full bg-border" />
        </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* PHONE — front layer, overlapping the laptop's bottom-left corner  */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="absolute bottom-[6%] left-[6%] z-10 w-[36%]"
        style={{ transform: "rotateX(4deg) rotateY(8deg)" }}
      >
        {/* Parallax wrapper — same reasoning as the laptop's above: a
            dedicated element for the mouse-driven translate3d(), separate
            from the static tilt (parent) and the float animation (child). */}
        <div ref={phoneParallaxRef}>
        <div className={styles.phoneFloat}>
          <div className="relative overflow-hidden rounded-[1.4rem] border border-border bg-background-secondary shadow-[var(--shadow-device-phone)]">
            {/* Status bar: a dark "dynamic island" pill (rather than a plain
                camera-cutout dot) — the single most recognizable modern-
                smartphone cue, and still just one extra div/one extra
                background color. */}
            <div className="relative flex justify-center py-2">
              <span className="h-[9px] w-9 rounded-full bg-background" />
            </div>

            {/* App content: fictional "Today" productivity view */}
            <div className="space-y-2.5 px-3 pb-3">
              {/* Header row: title + a small radial completion ring, giving
                  the header the same "at a glance" data-visualization feel
                  as a real productivity app rather than plain text alone.
                  The ring is a conic-gradient circle — the exact technique
                  already used for the AI orb below, so this introduces no
                  new rendering approach to the composition. */}
              <div className="flex items-center justify-between pt-0.5">
                <div>
                  <p className="text-[7px] font-semibold text-foreground sm:text-[8px] lg:text-[10px]">
                    Today
                  </p>
                  <p className="text-[5.5px] text-foreground-subtle sm:text-[6.5px] lg:text-[7.5px]">
                    1 of 3 done
                  </p>
                </div>
                <div
                  className="relative h-[14px] w-[14px] shrink-0 rounded-full sm:h-4 sm:w-4"
                  style={{
                    background:
                      "conic-gradient(var(--color-accent-blue) 0% 33%, var(--color-border) 33% 100%)",
                  }}
                >
                  <div className="absolute inset-[2px] rounded-full bg-background-secondary" />
                </div>
              </div>

              {appTasks.map((task, index) => (
                <div
                  key={task.label}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-1.5 py-1.5"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full border",
                      task.done
                        ? "border-accent-blue bg-accent-blue"
                        : index % 2 === 1
                          ? "border-accent-purple/70 bg-transparent"
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

            {/* Home indicator: the thin rounded bar every modern iOS-style
                phone mockup has at the very bottom — a one-line addition
                that immediately reads as "phone" even at a glance. */}
            <div className="flex justify-center pb-2 pt-1">
              <span className="h-[3px] w-8 rounded-full bg-foreground-subtle/30" />
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
          translate3d() straight onto it via ref.

          z-20 added explicitly (laptop/phone have no z-index of their own,
          phone only reaches z-10): without it the orb still wins by DOM
          order in the default stacking layer, but that's an implicit,
          easy-to-accidentally-break guarantee — making it explicit means
          the orb can never silently end up visually buried under a future
          change to either device layer. Position nudged from
          right-[8%]/top-[5%] to right-[4%]/top-[2%] and size bumped
          11%→13%: at the previous position/size its glow was reading as
          part of the laptop's own ambient backlight rather than a
          separate floating object — pushing it further out past the
          laptop's top-right corner and giving it a touch more presence
          fixes that separation. */}
      <div
        ref={orbParallaxRef}
        className="absolute right-[4%] top-[2%] z-20 h-[13%] w-[13%]"
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
              collide on one `transform`. Base opacity raised (via the
              wrapper below) so the glow reads clearly even at the low
              point of its breathing cycle, instead of nearly disappearing
              against the dark backdrop. */}
          <div
            className={cn(
              "absolute inset-[-55%] rounded-full opacity-90 blur-xl",
              styles.orbGlow
            )}
            style={{
              background:
                "radial-gradient(circle, var(--color-accent-blue) 0%, transparent 65%)",
            }}
          />

          {/* Satellite: a single small dot orbiting the orb on its own
              rotating ring — the classic "AI is thinking/active" visual
              shorthand, built the same way the orb's own internal shimmer
              is (a CSS `rotate` keyframe on an invisible circular wrapper).
              The dot itself doesn't rotate in place, only its position
              around the ring — so it never looks like a spinning icon,
              just a small light circling the orb. */}
          <div className={cn("absolute inset-[-55%]", styles.orbitRing)}>
            <span
              className="absolute left-1/2 top-0 h-[9%] w-[9%] -translate-x-1/2 rounded-full bg-accent-purple shadow-[0_0_6px_1px_var(--color-accent-purple)]"
            />
          </div>

          {/* Orb body: the only rotating element, via a conic-gradient sweep
              that reads as a slow, subtle internal shimmer rather than the
              whole orb spinning in place. A visible border/ring (rather
              than the previous border-white/10) gives the sphere a crisp
              silhouette so it reads as a solid object at a glance, even
              before the glow around it is noticed. */}
          <div
            className={cn(
              "relative h-full w-full rounded-full border border-white/25 shadow-[var(--shadow-card)]",
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
              className="absolute inset-[13%] rounded-full bg-background-secondary"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.14) 0%, transparent 55%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* STATUS CHIP — small floating card, the compositional "third        */}
      {/* weight" that keeps the upper-left of the frame from reading empty  */}
      {/* ---------------------------------------------------------------- */}
      {/* On-theme with the "ship it" code snippet on the laptop and the
          task-completion UI on the phone — a small "deployed" status card,
          the kind of ambient detail Linear/Vercel-style marketing sites use
          to fill negative space with something that still feels like real
          product UI rather than an arbitrary decorative shape. Positioned
          in the gap above the laptop and left of the orb; its own float
          animation (slowest of the four) keeps it from moving in sync with
          any other layer. No parallax wrapper — this card is meant to read
          as sitting further back/passive compared to the three interactive-
          feeling objects, so it only gets the ambient float, not the
          mouse-driven depth shift. */}
      <div className="absolute left-[2%] top-[2%] hidden w-[30%] sm:block">
        <div className={styles.chipFloat}>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-background-secondary/90 px-2.5 py-1.5 shadow-[var(--shadow-card-soft)]">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-accent-blue" />
              <span
                className={cn(
                  "absolute inset-[-3px] rounded-full bg-accent-blue/60",
                  styles.chipPulse
                )}
              />
            </span>
            <span className="truncate text-[6.5px] font-medium tracking-tight text-foreground-muted sm:text-[7.5px] lg:text-[9px]">
              Build passing
            </span>
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
