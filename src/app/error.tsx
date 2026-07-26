"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/**
 * error.tsx
 *
 * Next.js's App Router convention for a route-level error boundary. Must be
 * a Client Component (Next requirement). Without this, an unhandled render
 * error in production falls back to Next's generic error screen instead of
 * a page that matches the site.
 *
 * Built from the same existing primitives/tokens as `not-found.tsx` — no
 * new visual language, no redesign of anything already shipped.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with real error monitoring (e.g. Vercel's own logging, or an
    // error-tracking SDK) before launch — see "Remaining tasks" in the
    // deployment summary.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[70svh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium tracking-tight text-foreground-subtle">Error</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground-muted">
        An unexpected error occurred. You can try again, or head back to the
        homepage.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button onClick={reset} variant="primary" size="md">
          Try again
        </Button>
        <Button href="/" variant="secondary" size="md">
          Back to home
        </Button>
      </div>
    </Container>
  );
}
