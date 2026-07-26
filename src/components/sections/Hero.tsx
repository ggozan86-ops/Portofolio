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
              // Fluid clamp() — raised from the previous 2rem→3.75rem curve
              // to 2.125rem→4.5rem. Mobile (320px) barely moves (32px→34px)
              // so small-screen line-wrapping is unaffected; the ceiling at
              // 1024px+ is now 72px instead of 60px, which is the single
              // biggest lever for "the name should dominate the Hero" —
              // everything else in this file is spacing/color, this is the
              // one actual size increase. font-bold (up from font-semibold)
              // adds the weight to carry that larger size without looking
              // thin. leading-[1.05] pins line-height precisely rather than
              // relying on the type-scale default.
              className="animate-fade-in-up text-[clamp(2.125rem,1.6rem+4.4vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-foreground"
              style={{ animationDelay: "80ms" }}
            >
              Muhammad Fauzan A
            </h1>

            <p
              // max-w-md (448px, down from max-w-lg/512px): the previous
              // width let a couple of lines run a touch long for
              // comfortable reading measure — narrowing it back keeps each
              // line closer to an ideal reading length. leading-[1.75]
              // (up from leading-relaxed/1.625) opens the line spacing a
              // little further for the same reason — both changes are
              // pure readability, no copy or color change.
              className="animate-fade-in-up mt-5 max-w-md text-lg leading-[1.75] text-foreground-muted"
              style={{ animationDelay: "160ms" }}
            >
              Crafting thoughtful digital products through code, automation,
              and AI.
            </p>

            {/* Profession list: plain vertical list, not badges/pills —
                hairline dividers create rhythm without adding visual weight. */}
            <ul
              // gap tightened from 12px to 10px: under the larger H1 above,
              // the previous gap read slightly loose relative to the tighter
              // title→description rhythm — this brings the list's own
              // internal rhythm back in line with the rest of the column.
              className="animate-fade-in-up mt-9 flex flex-col gap-2.5"
              style={{ animationDelay: "240ms" }}
            >
              {professions.map((role) => (
                <li
                  key={role}
                  // A single-pixel hairline (down from 2px) reads as a
                  // cleaner, more precise divider at this scale — 2px next
                  // to 1px text strokes was starting to look slightly heavy
                  // rather than "hairline". border-border-hover on rest
                  // (rather than only on :hover) gives the whole list a
                  // touch more definition against the background even
                  // before any interaction, since it was reading a little
                  // too faint next to the now-bolder name above it.
                  className={
                    "border-l border-border-hover pl-3.5 text-[15px] font-medium leading-none " +
                    "tracking-tight text-foreground-muted/90 " +
                    "transition-colors duration-300 ease-premium hover:border-accent-blue/60 hover:text-foreground"
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
                the entrance sequence, with the connection line closing it out.

                w-full is required here, not cosmetic: this div is a flex
                item inside HeroScrollFade's `flex items-center
                justify-center` wrapper, so on the flex main axis it would
                otherwise shrink to fit-content instead of stretching (flex
                only auto-stretches on the cross axis). Without an explicit
                width, HeroVisual's own `w-full` below has no definite
                parent width to resolve 100% against — a classic CSS
                collapse that renders the entire device composition at
                near-zero size. */}
            <div className="w-full animate-fade-in-up" style={{ animationDelay: "420ms" }}>
              <HeroVisual className="max-w-md lg:max-w-none" />
            </div>
          </HeroScrollFade>
        </div>
      </Container>
    </section>
  );
}
