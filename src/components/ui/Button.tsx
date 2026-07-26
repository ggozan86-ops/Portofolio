import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsAnchor = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const baseStyles =
  // `rounded-xl` (1.25rem, up from `rounded-lg`/1rem): a visibly rounder,
  // more "premium SaaS" radius — the single biggest lever for the button's
  // perceived polish, per the brief's Apple/Linear/Framer reference point.
  // `tracking-tight` tightens button labels the same way the H1 already
  // is, so type across the Hero shares one voice.
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-medium tracking-tight " +
  // `transform` and `box-shadow` added to the transition list so the new
  // hover-scale and elevation-shadow below animate smoothly instead of
  // snapping; everything else here was already being transitioned.
  // Duration bumped 200ms -> 250ms: pairs better with the new hover
  // elevation below — a touch slower reads as "lifting", 200ms read as
  // "snapping" for a translateY+scale combo this small.
  "transition-[transform,background-color,border-color,color,box-shadow] duration-[250ms] ease-premium " +
  // Hover scale capped at 1.02 per the brief ("maximum 1.02") — enough to
  // read as "responsive" without feeling springy or game-like. A small
  // upward translateY is layered on top of the scale (Tailwind composes
  // transform utilities via CSS variables, so both apply together) — the
  // "soft elevation" cue: the button reads as lifting off the surface, not
  // just growing in place. Active press (0.98, no translateY) was already
  // here and is kept as the "instant feedback" cue.
  //
  // PERF: will-change-transform is now applied only for the states that
  // actually transform (hover/focus-visible/active) instead of always-on.
  // An always-on will-change keeps a composited layer alive for the
  // component's entire mounted lifetime, which costs GPU memory for
  // every Button on the page even when nobody is interacting with it.
  // Scoping it to the interactive states gives the same jank-free
  // transition (the browser still promotes the layer *before* the scale
  // starts, since :hover fires before the transition begins) without
  // paying that cost while idle.
  "hover:will-change-transform focus-visible:will-change-transform active:will-change-transform " +
  "hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] active:duration-75 " +
  // Custom focus-visible ring layered on top of the global one in
  // globals.css — keyboard users get a crisp, on-brand ring; mouse/touch
  // users never see it, since :focus-visible only fires for keyboard focus.
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    // `font-semibold` (vs. the shared `font-medium` base) gives the
    // filled, highest-emphasis CTA slightly more visual weight than its
    // outline sibling — a hierarchy cue that costs nothing structurally.
    "bg-foreground text-background hover:bg-foreground/90 font-semibold " +
    // Soft elevation on hover: a wider, blue-tinted shadow (not plain black)
    // so the "lift" reads as light rather than a heavier drop-shadow.
    // Spread/offset widened slightly to pair with the new -translate-y-0.5
    // above — the shadow now visibly "catches up" to the raised button
    // instead of sitting directly under it, selling the lift. Same color
    // values as before (rgba(138,180,248,...)), only the geometry changed.
    "shadow-[var(--shadow-card)] hover:shadow-[0_18px_38px_-10px_rgba(138,180,248,0.36)]",
  secondary:
    // A faint rest-state shadow (--shadow-card-soft, roughly half the
    // strength of --shadow-card) so the outline button reads as a raised
    // surface even before interaction, instead of looking flat until
    // hovered.
    "bg-background-secondary text-foreground border border-border " +
    "shadow-[var(--shadow-card-soft)] " +
    "hover:border-border-hover hover:bg-background-secondary/80 " +
    "hover:shadow-[var(--shadow-card-hover)]",
  ghost:
    "bg-transparent text-foreground-muted hover:text-foreground " +
    "hover:bg-white/5",
};

/**
 * Sheen sweep: a soft diagonal highlight that slides across the button on
 * hover — the same "light catching glass" language already established on
 * the Hero's laptop/phone screens (see HeroVisual.tsx), reused here for
 * visual consistency rather than invented as a one-off button effect.
 * Absolutely positioned, `pointer-events-none`, and only ever animates
 * `transform` (translateX) — never triggers layout, and costs nothing
 * while idle since it's transparent and off-screen (-100%) at rest.
 */
const sheenStyles =
  "pointer-events-none absolute inset-0 -translate-x-full " +
  "bg-gradient-to-r from-transparent via-white/10 to-transparent " +
  "transition-transform duration-700 ease-premium group-hover:translate-x-full";

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

/**
 * Button
 *
 * Renders as a native <button> by default, or as an <a> when given `href`
 * (e.g. for nav CTAs that link to a section or external URL). Sharing one
 * component keeps visual variants consistent regardless of the underlying
 * element.
 *
 * Motion is restricted to `transform` (scale) on press, which is
 * GPU-composited and never triggers layout — matching the brief's
 * GPU-friendly-animation requirement.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    // Content wrapped in a `relative z-10` span so it stays above the
    // absolutely-positioned sheen sweep below; the arrow is scoped to the
    // `primary` variant only — it's the Hero's single highest-emphasis
    // action ("View Projects"), so it gets the one extra affordance rather
    // than every button on the page gaining an icon it doesn't need.
    const content = (
      <>
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
          {variant === "primary" && (
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-[250ms] ease-premium group-hover:translate-x-1"
            >
              →
            </span>
          )}
        </span>
        <span aria-hidden="true" className={sheenStyles} />
      </>
    );

    if ("href" in props && props.href) {
      const { href, ...anchorProps } = props as ButtonAsAnchor;
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        className={classes}
        {...(props as ButtonAsButton)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
