"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface HeroScrollFadeProps {
  children: ReactNode;
  className?: string;
  /**
   * Parallax speed multiplier, relative to how far the Hero has scrolled
   * past the top of the viewport. `1` = the content column (moves at a
   * normal, slightly-faster rate so it visually "leads"). A smaller value
   * (e.g. `0.5`) makes HeroVisual lag gently behind it, per the brief:
   * "HeroVisual moves slightly slower than the text."
   */
  speed?: number;
  /**
   * How much this element fades as the user scrolls through the Hero.
   * `0.6` fades to 40% opacity by the time the section has scrolled a full
   * viewport height; `0.25` only dims to 75%, appropriate for the decorative
   * visual column, which shouldn't disappear as aggressively as the text.
   */
  fadeAmount?: number;
}

/**
 * HeroScrollFade
 *
 * Scroll-linked fade + micro-parallax for a single Hero column.
 *
 * Deliberately NOT built with React state — every scroll tick writes
 * directly to the DOM via a ref inside a rAF callback, so scrolling never
 * triggers a Hero re-render (the brief's core perf rule: no unnecessary
 * React state, transform/opacity only, throttle pointer/scroll work).
 *
 * `prefers-reduced-motion` is honored at the *listener* level: the scroll
 * handler is never attached at all for those users, rather than attaching
 * it and only hiding the visual result. That means zero added scroll-perf
 * cost for anyone who's asked for reduced motion, not just zero visible
 * effect.
 */
export function HeroScrollFade({
  children,
  className,
  speed = 1,
  fadeAmount = 0.6,
}: HeroScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (reducedMotionQuery.matches) return;

    let ticking = false;
    // PERF: the element's document-relative top, measured once (and
    // re-measured only on resize) instead of every scroll frame. Walking
    // the offsetParent chain reads `offsetTop` — a layout-derived value
    // that, unlike getBoundingClientRect(), is unaffected by any
    // transform already applied to the element (relevant here, since
    // this same effect sets `el.style.transform` below).
    let documentTop = 0;
    // Skip redundant style writes when the computed value hasn't visibly
    // changed since the last frame (sub-pixel scroll deltas otherwise
    // still trigger a style recalculation for no visible difference).
    let lastProgress = -1;

    const measureDocumentTop = () => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      documentTop = top;
    };

    const update = () => {
      ticking = false;
      const viewportH = window.innerHeight;

      // Progress: 0 while the Hero's top is still at/below the viewport
      // top, ramping to 1 once it has scrolled a full viewport height
      // further up. Clamped so the effect only plays out across the
      // Hero's own natural scroll range — no runaway values further down
      // the page. Equivalent to the original `-rect.top / viewportH`,
      // but derived from `window.scrollY` (never forces layout) instead
      // of a fresh `getBoundingClientRect()` read every frame.
      const progress = Math.min(
        Math.max((window.scrollY - documentTop) / viewportH, 0),
        1
      );

      if (Math.abs(progress - lastProgress) < 0.001) return;
      lastProgress = progress;

      // Very subtle: 40px max translate at progress=1, scaled by `speed`.
      // This is intentionally understated per the brief ("very subtle, no
      // dramatic parallax") — nowhere near a full-height parallax scroll.
      const translateY = progress * 40 * speed;
      const opacity = 1 - progress * fadeAmount;

      el.style.transform = `translate3d(0, ${translateY}px, 0)`;
      el.style.opacity = String(opacity);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      measureDocumentTop();
      update();
    };

    measureDocumentTop();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [speed, fadeAmount]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
