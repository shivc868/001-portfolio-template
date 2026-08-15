"use client";
import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/src/lib/gsap";

/**
 * Physics2D owner (§6): display-scale text shatters to chars on scroll-in,
 * then reassembles. Fire-and-forget — rule #17: "play none none reset" and an
 * explicit set() back to origin on reset, or re-scrolling shows a broken pile.
 * Off under 768px and under reduced motion.
 */
export function ShatterText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        let split: SplitText | null = null;
        document.fonts.ready.then(() => {
          if (!ref.current) return;
          split = SplitText.create(el, {
            type: "chars",
            onSplit: (self) => {
              const reset = () => gsap.set(self.chars, { x: 0, y: 0, rotation: 0, opacity: 1 });
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: el,
                  start: "top 80%",
                  toggleActions: "play none none reset",
                  onLeaveBack: reset,
                },
              });
              tl.to(self.chars, {
                duration: 0.9,
                physics2D: {
                  velocity: "random(400, 900)",
                  angle: "random(250, 290)",
                  gravity: 1200,
                },
                stagger: { each: 0.015, from: "random" },
              }).to(self.chars, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 0.7,
                ease: "expo.out",
                stagger: { each: 0.012, from: "random" },
              });
              return tl;
            },
          });
        });
        return () => split?.revert();
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {text}
    </span>
  );
}
