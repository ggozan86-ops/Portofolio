import type { ReactNode } from "react";

/** A single primary navigation entry. */
export interface NavLink {
  label: string;
  href: string;
}

/** Shared shape for components that just wrap children with a className. */
export interface WithChildren {
  children: ReactNode;
  className?: string;
}
