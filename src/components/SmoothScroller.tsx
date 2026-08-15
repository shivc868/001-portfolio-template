"use client";
import { useRef } from "react";
import { gsap, useGSAP, ScrollSmoother } from "@/src/lib/gsap";

/**
 * Creates the single sitewide ScrollSmoother instance (rule #7).
 * Reduced motion → no smoother at all; native scroll (rule: quality floor).
 */
export function SmoothScroller({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        smoothTouch: 0,
        normalizeScroll: true,
      });
      return () => smoother.kill();
    });
    return () => mm.revert();
  }, { scope: wrapperRef });

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
