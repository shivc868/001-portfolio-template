"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/src/lib/gsap";
import { markPreloaderDone } from "@/src/lib/loadGate";

const KEY = "mv-preloaded";

/** First visit only (sessionStorage-gated). Counter 00→100, ink panel exits
 *  via clip-path; the hero starts 0.6s before the panel finishes clearing. */
export function Preloader() {
  const panelRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      if (sessionStorage.getItem(KEY)) {
        setGone(true);
        markPreloaderDone();
        return;
      }
      const panel = panelRef.current;
      const counter = counterRef.current;
      if (!panel || !counter) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        sessionStorage.setItem(KEY, "1");
        gsap.to(panel, {
          autoAlpha: 0,
          duration: 0.2,
          delay: 0.3,
          onComplete: () => {
            setGone(true);
            markPreloaderDone();
          },
        });
        return;
      }

      const state = { n: 0 };
      const tl = gsap.timeline({
        onComplete: () => setGone(true),
      });
      tl.to(state, {
        n: 100,
        duration: 1.4,
        ease: "power2.inOut",
        onUpdate: () => {
          counter.textContent = String(Math.round(state.n)).padStart(2, "0");
        },
      })
        .add(() => {
          sessionStorage.setItem(KEY, "1");
        })
        .to(panel, {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.2,
          ease: "expo.inOut",
        })
        // hero starts while the panel is still clearing (-=0.6)
        .add(() => markPreloaderDone(), "-=0.6");
    },
    { scope: panelRef }
  );

  if (gone) return null;

  return (
    <div
      ref={panelRef}
      aria-hidden="true"
      className="fixed inset-0 z-80 bg-ink"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <span
        ref={counterRef}
        className="type-mono absolute bottom-6 left-6 text-2xl text-chalk"
      >
        00
      </span>
    </div>
  );
}
