import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds hover elevation + border highlight — for interactive cards (e.g. project links). */
  interactive?: boolean;
}

/**
 * Card
 *
 * The base surface for any future bordered content block (project cards,
 * skill tiles, testimonials). Deliberately unopinionated about internal
 * layout — it only owns surface, border, radius, and (optionally) hover
 * behavior — so it can wrap arbitrary content later without fighting
 * built-in padding or typography assumptions.
 *
 * Hover elevation uses `transform: translateY()` + a shadow swap, both
 * GPU-friendly and layout-safe.
 */
export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background-secondary/60 p-6",
        "shadow-[var(--shadow-card)]",
        interactive &&
          // PERF: will-change-transform moved to the hover variant only —
          // see the identical fix + rationale in Button.tsx. Matters more
          // here than on a single Button, since a future page section
          // could mount many interactive Cards at once (e.g. a project
          // grid); each idle card would otherwise hold its own composited
          // layer for no reason.
          "transition-[transform,box-shadow,border-color] duration-300 ease-premium " +
            "hover:will-change-transform hover:-translate-y-1 hover:border-border-hover hover:shadow-[var(--shadow-card-hover)]",
        className
      )}
    >
      {children}
    </div>
  );
}
