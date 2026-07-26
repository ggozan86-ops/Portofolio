import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names (clsx) and safely resolves conflicting
 * Tailwind utility classes (tailwind-merge). Every component in this
 * project accepts an optional `className` prop and should merge it through
 * this helper rather than string-concatenating classes.
 *
 * Example:
 *   cn("px-4 py-2", isActive && "bg-accent-blue", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
