"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { flushSync } from "react-dom";
import Image from "next/image";
import { gsap, useGSAP, Flip } from "@/src/lib/gsap";
import { photos, type Photo } from "@/src/data/photos";

/**
 * /photography — editorial grid with Flip enlarge (one continuous object,
 * never a crossfade) and a pinned horizontal sequence with counter-parallax.
 */
export function PhotoGallery() {
  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Photo | null>(null);
  const [mounted, setMounted] = useState(false);
  const closingRef = useRef(false);
  useEffect(() => setMounted(true), []);

  const { contextSafe } = useGSAP({ scope: rootRef });

  const openPhoto = contextSafe((photo: Photo, itemEl: HTMLElement) => {
    if (active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(photo);
      return;
    }
    // Rule #12: capture state, commit the DOM change synchronously, then Flip
    const state = Flip.getState(itemEl);
    flushSync(() => setActive(photo));
    const overlay = overlayRef.current;
    if (!overlay) return;
    itemEl.style.visibility = "hidden";
    Flip.from(state, {
      targets: overlay,
      absolute: true,
      duration: 0.8,
      ease: "power3.inOut",
    });
    // non-active frames dim
    gsap.to(`[data-photo-item]:not([data-photo-id="${photo.id}"])`, {
      opacity: 0.25,
      duration: 0.4,
    });
  });

  const closePhoto = contextSafe(() => {
    const overlay = overlayRef.current;
    const photo = active;
    if (!overlay || !photo || closingRef.current) return;
    const itemEl = document.querySelector<HTMLElement>(`[data-photo-id="${photo.id}"]`);
    gsap.to("[data-photo-item]", { opacity: 1, duration: 0.4 });
    if (!itemEl || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(null);
      return;
    }
    closingRef.current = true;
    Flip.fit(overlay, itemEl, {
      absolute: true,
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: () => {
        itemEl.style.visibility = "";
        closingRef.current = false;
        setActive(null);
      },
    });
  });

  // Esc closes; overlay button keeps focus while open
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePhoto();
    window.addEventListener("keydown", onKey);
    overlayRef.current?.querySelector("button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [active, closePhoto]);

  // Pinned horizontal sequence — desktop only; swipe carousel under 768px
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        const track = rootRef.current?.querySelector<HTMLElement>("[data-h-track]");
        const section = rootRef.current?.querySelector<HTMLElement>("[data-h-section]");
        if (!track || !section) return;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        // images counter-parallax inside the track
        track.querySelectorAll<HTMLElement>("[data-h-img]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: img,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  const gridPhotos = photos.slice(0, 8);
  const stripPhotos = photos.slice(8);

  return (
    <main ref={rootRef} className="wash-gradient min-h-svh px-0 pt-32 pb-24">
      <header className="mb-16 flex items-end justify-between px-5 md:px-10">
        <h1 className="type-display text-ink">Photo</h1>
        <span className="type-mono">({photos.length}) frames — silver &amp; pixel</span>
      </header>

      {/* Editorial grid, mixed aspect ratios, mono frame index */}
      <ul className="columns-1 gap-5 px-5 sm:columns-2 md:px-10 lg:columns-3">
        {gridPhotos.map((p, i) => (
          <li key={p.id} className="mb-5 break-inside-avoid">
            <button
              type="button"
              data-photo-item
              data-photo-id={p.id}
              data-flip-id={`photo-${p.id}`}
              onClick={(e) => openPhoto(p, e.currentTarget)}
              className="block w-full overflow-hidden rounded-md text-left"
              style={{ aspectRatio: p.aspect }}
              aria-label={`Enlarge ${p.title}`}
            >
              <Image
                src={p.src}
                alt={p.title}
                width={1200}
                height={1200}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-full w-full object-cover"
                data-cursor-media
              />
            </button>
            <p className="type-mono mt-2 flex justify-between opacity-60">
              <span>
                {String(i + 1).padStart(2, "0")} — {p.title}
              </span>
              <span>
                {p.location}, {p.year}
              </span>
            </p>
          </li>
        ))}
      </ul>

      {/* Pinned horizontal sequence */}
      <section data-h-section className="mt-24 overflow-hidden md:h-svh">
        <div
          data-h-track
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 md:h-full md:snap-none md:items-center md:overflow-visible md:px-10"
        >
          {stripPhotos.map((p, i) => (
            <figure key={p.id} className="w-[80vw] shrink-0 snap-center md:w-[44vw]">
              <div className="overflow-hidden rounded-md" style={{ aspectRatio: p.aspect }}>
                <Image
                  data-h-img
                  src={p.src}
                  alt={p.title}
                  width={1200}
                  height={1200}
                  sizes="(max-width: 768px) 80vw, 44vw"
                  className="h-full w-full scale-118 object-cover"
                  data-cursor-media
                />
              </div>
              <figcaption className="type-mono mt-2 opacity-60">
                {String(i + 9).padStart(2, "0")} — {p.title} · {p.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Enlarged frame — portalled outside the smooth wrapper (rule #6) */}
      {mounted &&
        active &&
        createPortal(
          <div className="fixed inset-0 z-70 bg-ink/90" onClick={closePhoto} role="dialog" aria-modal="true" aria-label={active.title}>
            <div
              ref={overlayRef}
              data-flip-id={`photo-${active.id}`}
              className="absolute inset-4 md:inset-12"
            >
              <Image
                src={active.src}
                alt={active.title}
                fill
                sizes="100vw"
                className="rounded-md object-contain"
              />
              <button
                type="button"
                className="type-mono absolute -top-1 right-0 -translate-y-full p-2 text-chalk"
                onClick={closePhoto}
              >
                Close ✕
              </button>
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}
