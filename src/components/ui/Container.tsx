import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerWidth = "narrow" | "default" | "wide" | "full";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Controls max-width. "full" removes the constraint entirely. */
  width?: ContainerWidth;
  /** Render as a different element (e.g. "section", "header") when composed. */
  as?: ElementType;
}

const widthMap: Record<ContainerWidth, string> = {
  narrow: "max-w-container-narrow",
  default: "max-w-container",
  wide: "max-w-container-wide",
  full: "max-w-none",
};

/**
 * Container
 *
 * The single responsive-width primitive for the entire site. Every section
 * (hero, projects, about, contact — built later) should wrap its content in
 * this component instead of redefining horizontal padding and max-width
 * per-section. That keeps the page's horizontal rhythm consistent from a
 * 320px phone up to a 4K display.
 *
 * Horizontal padding scales with viewport via Tailwind's responsive prefixes
 * rather than a fixed pixel value, so content never feels cramped on mobile
 * or excessively narrow on very large screens.
 */
export function Container({
  children,
  className,
  width = "default",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        widthMap[width],
        className
      )}
    >
      {children}
    </Component>
  );
}
