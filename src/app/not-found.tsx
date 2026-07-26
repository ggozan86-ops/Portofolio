import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/**
 * not-found.tsx
 *
 * Next.js's App Router convention for the 404 page (rendered for any
 * unmatched route). Required for a production deployment — without it,
 * unmatched routes fall back to Next's unstyled default 404, which breaks
 * the site's visual identity the moment a user hits a bad link.
 *
 * Deliberately minimal and built entirely from existing primitives
 * (`Container`, `Button`) and existing color/spacing tokens — no new
 * component, animation, or visual language introduced.
 */
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container className="flex min-h-[70svh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium tracking-tight text-foreground-subtle">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button href="/" variant="primary" size="md" className="mt-8">
        Back to home
      </Button>
    </Container>
  );
}
