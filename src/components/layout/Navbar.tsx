import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/lib/constants";

/**
 * Navbar (placeholder)
 *
 * Structural shell only — final branding/logo and mobile menu behavior are
 * out of scope for this pass. What IS finalized here:
 *  - Sticky positioning at `--nav-height` (kept in sync with `scroll-padding-top`
 *    in globals.css so in-page anchor links land below the bar, not under it).
 *  - A subtle translucent backdrop (not full "glassmorphism" — a restrained
 *    1px border and soft blur only) so content doesn't jump-cut when
 *    scrolling underneath.
 *  - Semantic <nav> + <Link> so the App Router's client-side navigation and
 *    accessibility tree are correct from day one.
 */
export function Navbar() {
  return (
    <header
      className={
        // `animate-fade-in`: the first beat in the entrance sequence
        // (Navbar → Name → Description → ...), using the same existing
        // "fade-in" utility already defined in tailwind.config.ts — no new
        // keyframe needed. Respects prefers-reduced-motion automatically
        // via the global override in globals.css.
        "sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md animate-fade-in " +
        "transition-[background-color,border-color] duration-300 ease-premium"
      }
      style={{ height: "var(--nav-height)" }}
    >
      <Container className="flex h-full items-center justify-between">
        {/* Personal mark: compact "MFA" initials rather than the full name —
            reads cleaner at navbar scale and matches the minimal, premium
            mark treatment (tracking-wide caps) common to personal-brand
            sites. Full name kept for assistive tech via aria-label since
            the visible text is now an abbreviation. */}
        <Link
          href="/"
          aria-label="Muhammad Fauzan A — Home"
          className={
            "rounded-sm text-sm font-semibold uppercase tracking-[0.2em] text-foreground " +
            "transition-opacity duration-200 hover:opacity-80 " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60 " +
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          }
        >
          MFA
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                // `group` + `relative` scope the underline pseudo-element
                // below to this single link only.
                "group relative py-1 text-sm text-foreground-muted " +
                "transition-colors duration-200 hover:text-foreground " +
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60 " +
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm " +
                // Active (mouse-down) state: a brief, slightly dimmer tap
                // response, consistent with the Button's active feedback.
                "active:text-foreground/80"
              }
            >
              {link.label}
              {/* Underline: a 1px bar that grows from the center on hover/focus
                  via `scale-x`, not `width` — GPU-composited, no layout
                  recalculation. Starts at scale-x-0 (invisible, zero width)
                  and animates to scale-x-100 (full width) on hover/focus. */}
              <span
                aria-hidden="true"
                className={
                  "pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 " +
                  "bg-foreground transition-transform duration-300 ease-premium " +
                  "group-hover:scale-x-100 group-focus-visible:scale-x-100"
                }
              />
            </a>
          ))}
        </nav>
      </Container>
    </header>
  );
}
