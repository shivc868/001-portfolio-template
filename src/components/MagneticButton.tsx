"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/src/lib/gsap";

/**
 * Magnetic hover — quickTo on x/y toward the cursor within a radius,
 * border fill sweeps in via clip-path from the cursor's entry edge.
 */
export function MagneticButton({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const fill = fillRef.current;
      if (!wrap || !fill) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const xTo = gsap.quickTo(wrap, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(wrap, "y", { duration: 0.4, ease: "power3.out" });
      const RADIUS = 60;

      const onMove = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist < r.width / 2 + RADIUS) {
          xTo(dx * 0.35);
          yTo(dy * 0.35);
        } else {
          xTo(0);
          yTo(0);
        }
      };
      const onEnter = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        const fromLeft = e.clientX < r.left + r.width / 2;
        gsap.fromTo(
          fill,
          { clipPath: fromLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
          { clipPath: "inset(0 0% 0 0%)", duration: 0.45, ease: "expo.out" }
        );
      };
      const onLeave = (e: PointerEvent) => {
        xTo(0);
        yTo(0);
        const r = wrap.getBoundingClientRect();
        const toLeft = e.clientX < r.left + r.width / 2;
        gsap.to(fill, {
          clipPath: toLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
          duration: 0.35,
          ease: "expo.in",
        });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      wrap.addEventListener("pointerenter", onEnter);
      wrap.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerenter", onEnter);
        wrap.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: wrapRef }
  );

  return (
    <div ref={wrapRef} className="inline-block will-change-transform">
      <button
        type="button"
        {...rest}
        className={`type-mono relative overflow-hidden rounded-full border border-current px-6 py-3 ${className}`}
      >
        <span
          ref={fillRef}
          aria-hidden="true"
          className="absolute inset-0 bg-wash"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        />
        <span className="relative z-10">{children}</span>
      </button>
    </div>
  );
}
