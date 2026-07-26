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
  // `rounded-lg` (1rem) reads slightly more tactile/contemporary than the
  // previous `rounded-md` (0.75rem) without becoming a pill — still firmly
  // in "minimal" territory. `tracking-tight` tightens button labels the
  // same way the H1 already is, so type across the Hero shares one voice.
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight " +
  // `transform` and `box-shadow` added to the transition list so the new
  // hover-scale and elevation-shadow below animate smoothly instead of
  // snapping; everything else here was already being transitioned.
  // Duration/easing intentionally match Navbar's link-underline and
  // HeroConnectionFlow's settle — one shared "premium" motion curve for
  // every hover-driven transition in the Hero, not a mix of ad hoc ones.
  "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-premium " +
  // Hover scale capped at 1.02 per the brief ("maximum 1.02") — enough to
  // read as "responsive" without feeling springy or game-like. Active
  // press (0.98) was already here and is kept as the "instant feedback" cue.
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
  "hover:scale-[1.02] active:scale-[0.98] active:duration-75 " +
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
    "shadow-[var(--shadow-card)] hover:shadow-[0_10px_28px_-6px_rgba(138,180,248,0.28)]",
  secondary:
    // A faint rest-state shadow (--shadow-card-soft, roughly half the
    // strength of --shadow-card) so the outline button reads as a raised
    // surface even before interaction, instead of looking flat until
    // hovered.
    "bg-background-secondary text-foreground border border-border " +
    "shadow-[var(--shadow-card-soft)] " +
    "hover:border-border-hover hover:bg-background-secondary/80 " +
    "hover:shadow-[var(--shadow-card)]",
  ghost:
    "bg-transparent text-foreground-muted hover:text-foreground " +
    "hover:bg-white/5",
};

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

    if ("href" in props && props.href) {
      const { href, ...anchorProps } = props as ButtonAsAnchor;
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        className={classes}
        {...(props as ButtonAsButton)}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
