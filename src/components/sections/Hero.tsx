import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HeroVisual } from "@/components/sections/HeroVisual";
import { HeroAtmosphere } from "@/components/sections/HeroAtmosphere";
import { HeroScrollFade } from "@/components/sections/HeroScrollFade";
// PERF: CursorGlow + HeroConnectionFlow are now loaded via a single
// dynamically-imported wrapper (ssr: false) instead of being bundled into
// the page's initial JS — see HeroDecorativeEffects.tsx for why this is
// safe with zero visual difference.
import { HeroDecorativeEffects } from "@/components/sections/HeroDecorativeEffects";

/**
 * Vertical profession list. Kept as data rather than hardcoded JSX so the
 * roles can be reordered or extended without touching markup — but rendered
 * as plain list items (not badges/pills), per the brief.
 */
const professions = [
  "Web Developer",
  "AI Engineer",
  "Automation Engineer",
  "Bot Developer",
] as const;

/**
 * Hero
 *
 * Two-column premium hero: identity + positioning on the left (45%),
 * reserved visual space on the right (55%). Collapses to a single,
 * content-first column on mobile.
 *
 * Motion is a single CSS fade-in-up on mount for each content block,
 * staggered a few tens of milliseconds apart — that part is still a plain
 * CSS animation, zero JS.
 *
 * Scroll-linked fade/parallax and the cursor glow are added via
 * `HeroScrollFade` / `CursorGlow` — small, self-contained client components
 * composed in here. Hero itself stays a server component; none of its own
 * markup or logic needed to become interactive to support this.
 *
 * ENTRANCE SEQUENCE
 * Navbar → Name → Description → Profession list → Buttons → HeroVisual →
 * Connection line. Each step's `animationDelay` starts before the previous
 * one's 0.7s fade-in-up has finished, so they overlap rather than queue —
 * nothing in the sequence sits waiting on a hard pause. The connection
 * line (see HeroConnectionFlow) is the sequence's closing beat: its own
 * 900ms delay is timed to begin right as HeroVisual settles in.
 */
export function Hero() {
  return (
    <section
      aria-label="Introduction"
      className="relative isolate flex min-h-[90svh] items-center overflow-hidden py-16 lg:min-h-[100svh]"
    >
      {/* Decorative background layer — see HeroAtmosphere.tsx. `isolate` +
          `overflow-hidden` on this section are the only two classes added
          for this feature: they give the atmosphere's `-z-10` a stacking
          context to stay contained in (so it can't render behind the
          Navbar or bleed into the next section) and clip the slow-drifting
          gradients/particles to the section's own bounds. Neither affects
          spacing, height, or centering. */}
      <HeroAtmosphere />

      {/* Cursor glow + signature connection-line moment — both purely
          decorative with no server-rendered visual output of their own,
          so they're loaded through a dynamic (ssr:false) wrapper to keep
          their JS off the critical path. See HeroDecorativeEffects.tsx. */}
      <HeroDecorativeEffects />

      <Container>
        <div
          className={
            // 45% / 55% split on large screens; single column below that.
            // `minmax(0, Nfr)` keeps long content from blowing the grid track out.
            "grid grid-cols-1 items-center gap-12 " +
            "lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] lg:gap-16"
          }
        >
          {/* ============================== LEFT: identity & positioning ============================== */}
          {/* Wrapped in HeroScrollFade at speed=1: on scroll, this column
              fades and drifts up at the "normal" rate — the reference the
              visual column (below) is deliberately slower than. */}
          <HeroScrollFade speed={1} fadeAmount={0.6}>
          <div className="flex flex-col items-start text-left">
            <h1
              // Fluid clamp() replaces the old text-4xl/5xl/6xl breakpoint
              // jumps. Coefficients are chosen so this curve passes through
              // the *exact same sizes* the old classes gave at 320px
              // (38px/2.375rem, from text-4xl), 640px (48px/3rem, text-5xl)
              // and 1024px+ (60px/3.75rem, text-6xl) — so nothing changes
              // at any previously-tested breakpoint — while every width in
              // between (375, 768...) now scales smoothly instead of
              // holding one size until the next hard jump. Flat above
              // 1024px, same as before, since the Container's max-width
              // already caps line length for 1440/1920/4K. leading-[1.05]
              // pins line-height precisely rather than relying on the
              // type-scale default.
              className="animate-fade-in-up text-[clamp(2rem,1.75rem+3.125vw,3.75rem)] font-semibold leading-[1.05] tracking-tight text-foreground"
              style={{ animationDelay: "80ms" }}
            >
              Muhammad Fauzan A
            </h1>

            <p
              // mt-5 (20px, down from 24px): tightens the title→description
              // pair slightly so they read as one grouped unit, with the
              // larger mt-9 below it doing the work of separating that unit
              // from the profession list — a clearer two-tier rhythm than
              // three similarly-sized gaps in a row.
              className="animate-fade-in-up mt-5 max-w-md text-lg leading-relaxed text-foreground-muted"
              style={{ animationDelay: "160ms" }}
            >
              Crafting thoughtful digital products through code, automation,
              and AI.
            </p>

            {/* Profession list: plain vertical list, not badges/pills —
                hairline dividers create rhythm without adding visual weight. */}
            <ul
              className="animate-fade-in-up mt-9 flex flex-col gap-3"
              style={{ animationDelay: "240ms" }}
            >
              {professions.map((role) => (
                <li
                  key={role}
                  // Typography-only refinement (per the brief — no per-item
                  // load animation): tighter tracking and medium weight read
                  // as more "designed" than the plain default text-base, and
                  // a static hover-to-full-opacity gives a little life
                  // without animating each item on mount. leading-none since
                  // these are short single-line labels — the default
                  // paragraph line-height only added unused vertical space
                  // inside each <li>.
                  className={
                    "border-l-2 border-border pl-4 text-[15px] font-medium leading-none " +
                    "tracking-tight text-foreground-muted/90 " +
                    "transition-colors duration-300 ease-premium hover:border-border-hover hover:text-foreground"
                  }
                >
                  {role}
                </li>
              ))}
            </ul>

            {/* CTAs: primary (filled) + secondary (outline), reusing the
                shared Button component as-is — no new variants needed. */}
            <div
              className="animate-fade-in-up mt-10 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "320ms" }}
              // Start endpoint for HeroConnectionFlow — queried by data
              // attribute, no ref/prop wiring needed.
              data-connection-source="cta"
            >
              <Button href="#work" variant="primary" size="lg">
                View Projects
              </Button>
              <Button href="#contact" variant="secondary" size="lg">
                Contact
              </Button>
            </div>
          </div>
          </HeroScrollFade>

          {/* ============================== RIGHT: reserved visual space ============================== */}
          {/* speed=0.5, fadeAmount=0.25: moves at half the rate of the text
              column above and fades far less — "HeroVisual moves slightly
              slower than the text", per the brief, without it feeling like
              it's being left behind. */}
          <HeroScrollFade
            speed={0.5}
            fadeAmount={0.25}
            className="flex items-center justify-center"
          >
            {/* Delay pushed to 420ms — after the CTAs (320ms) rather than
                before them, so HeroVisual is now the second-to-last beat in
                the entrance sequence, with the connection line closing it out. */}
            <div className="animate-fade-in-up" style={{ animationDelay: "420ms" }}>
              <HeroVisual className="max-w-md lg:max-w-none" />
            </div>
          </HeroScrollFade>
        </div>
      </Container>
    </section>
  );
}
