"use client";
import { Fragment, useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, SplitText } from "@/src/lib/gsap";
import { site } from "@/src/data/site";
import { TransitionLink } from "@/src/components/transition/TransitionLink";

/**
 * Light bridge between the dark project deck and the dark footer: who the
 * studio works for, what the work has won, and three figures that count up
 * on scroll. Solid paper, no bottom fade — an overlay pinned to bottom-0 here
 * leaves a hairline of paper showing on fractional scroll offsets.
 *
 * Laid out as full-width bands rather than side-by-side columns: two lists of
 * unequal length sitting next to each other strand a pocket of whitespace
 * under the shorter one.
 *
 * Every reveal is a real mask (overflow-hidden parent, translated child) and
 * every rule draws from its left edge, so the whole section resolves as one
 * choreographed pass rather than a set of fades.
 */

/** Rules draw from the left; sits on top of whatever edge it decorates. */
const RULE = "absolute inset-x-0 block h-px origin-left";

/** Hover preview clip states — `round` keeps the corners through the wipe. */
const CLIP_HIDDEN = "inset(0% 0% 100% 0% round 10px)";
const CLIP_SHOWN = "inset(0% 0% 0% 0% round 10px)";

/**
 * Masked text — the child is what the timeline translates.
 *
 * `className` goes on the OUTER span: that element is the grid/flex item, so
 * layout classes (col-span, alignment) have to land there. Type and colour
 * classes inherit down to the child, which is the part that moves.
 */
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <span data-mask className="block">
        {children}
      </span>
    </span>
  );
}

/** Band header: mono label left, count right, rule drawing underneath. */
function BandHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="relative flex items-baseline justify-between pb-4">
      <span className="block overflow-hidden">
        <span data-col-label className="type-mono block opacity-50">
          {label}
        </span>
      </span>
      <span className="block overflow-hidden">
        <span data-col-label className="type-mono block opacity-50">
          ({count})
        </span>
      </span>
      <span data-rule className={`${RULE} bottom-0 bg-ink/15`} />
    </div>
  );
}

export function HomeRecognition() {
  const rootRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const head = headRef.current;
      if (!root || !head) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = <T extends Element>(sel: string, within: Element = root) =>
          gsap.utils.toArray<T>(sel, within);

        // ── Intro: eyebrow rule wipes out, label and heading chars mask up
        const intro = gsap.timeline({
          scrollTrigger: { trigger: "[data-intro]", start: "top 82%" },
        });
        intro
          .from("[data-eyebrow-rule]", {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.9,
            ease: "expo.inOut",
          })
          .from("[data-eyebrow]", { yPercent: 110, duration: 0.7, ease: "expo.out" }, 0.1);

        let split: SplitText | null = null;
        document.fonts.ready.then(() => {
          if (!headRef.current) return;
          split = SplitText.create(head, {
            type: "lines,chars",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 110,
                duration: 1.1,
                stagger: 0.018,
                ease: "expo.out",
                scrollTrigger: { trigger: head, start: "top 85%" },
              }),
          });
        });

        // ── Bands: header rule draws, then rows cascade out of their masks
        const bandTimelines = q<HTMLElement>("[data-col]").map((band) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: band, start: "top 82%" } });
          tl.from(q("[data-col-label]", band), { yPercent: 110, duration: 0.7, ease: "expo.out" }, 0)
            .from(
              q("[data-rule]", band),
              { scaleX: 0, transformOrigin: "left center", duration: 1, ease: "expo.inOut" },
              0.05
            )
            .from(
              q("[data-mask]", band),
              { yPercent: 110, duration: 0.9, stagger: 0.03, ease: "expo.out" },
              0.15
            );

          const itemRules = q("[data-item-rule]", band);
          if (itemRules.length) {
            tl.from(
              itemRules,
              {
                scaleX: 0,
                transformOrigin: "left center",
                duration: 0.8,
                stagger: 0.05,
                ease: "expo.out",
              },
              0.2
            );
          }
          return tl;
        });

        // ── Stats: rule draws, figures mask up and tick to their values
        const statsBlock = root.querySelector("[data-stats]");
        const stats = gsap.timeline({
          scrollTrigger: { trigger: statsBlock ?? root, start: "top 85%" },
        });
        if (statsBlock) {
          stats
            .from(q("[data-rule]", statsBlock), {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 1.1,
              ease: "expo.inOut",
            })
            .from(
              q("[data-stat]", statsBlock),
              { yPercent: 110, duration: 1, stagger: 0.08, ease: "expo.out" },
              0.12
            )
            .from(
              q("[data-stat-label]", statsBlock),
              { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.08, ease: "power3.out" },
              0.34
            );

          q<HTMLElement>("[data-count]", statsBlock).forEach((el, i) => {
            const target = Number(el.dataset.count);
            const suffix = el.dataset.suffix ?? "";
            const n = { v: 0 };
            el.textContent = `0${suffix}`;
            stats.to(
              n,
              {
                v: target,
                duration: 1.8,
                ease: "power2.out",
                onUpdate: () => {
                  el.textContent = `${Math.round(n.v)}${suffix}`;
                },
              },
              0.12 + i * 0.08
            );
          });
        }

        return () => {
          split?.revert();
          intro.kill();
          stats.kill();
          bandTimelines.forEach((t) => t.kill());
        };
      });

      // ── Client wall: the hovered name's frame wipes up, riding the cursor.
      // Positioned against the wall rather than the viewport — ScrollSmoother
      // transforms the page, which would break position: fixed here.
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const wall = wallRef.current;
        const preview = previewRef.current;
        if (!wall || !preview) return;

        const layers = gsap.utils.toArray<HTMLElement>("[data-preview]", preview);
        gsap.set(preview, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
        gsap.set(layers, { clipPath: CLIP_HIDDEN });

        const xTo = gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3.out" });
        const yTo = gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3.out" });

        let active = -1;
        const onMove = (e: PointerEvent) => {
          const r = wall.getBoundingClientRect();
          xTo(e.clientX - r.left);
          yTo(e.clientY - r.top);
        };

        const hide = () => {
          gsap.to(preview, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
          gsap.to(layers, { clipPath: CLIP_HIDDEN, duration: 0.45, ease: "power3.out" });
        };

        const onOver = (e: PointerEvent) => {
          const name = (e.target as HTMLElement).closest<HTMLElement>("[data-client]");
          if (!name) {
            if (active !== -1) {
              active = -1;
              hide();
            }
            return;
          }
          const i = Number(name.dataset.client);
          if (i === active) return;
          active = i;

          // seed the position so the frame opens under the cursor, not mid-flight
          const r = wall.getBoundingClientRect();
          gsap.set(preview, { x: e.clientX - r.left, y: e.clientY - r.top });

          gsap.to(preview, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
          layers.forEach((layer, j) => {
            gsap.set(layer, { zIndex: j === i ? 2 : 1 });
            gsap.to(layer, {
              clipPath: j === i ? CLIP_SHOWN : CLIP_HIDDEN,
              scale: j === i ? 1 : 1.05,
              duration: j === i ? 0.75 : 0.45,
              ease: "power3.out",
            });
          });
        };

        wall.addEventListener("pointermove", onMove);
        wall.addEventListener("pointerover", onOver);
        wall.addEventListener("pointerleave", hide);
        return () => {
          wall.removeEventListener("pointermove", onMove);
          wall.removeEventListener("pointerover", onOver);
          wall.removeEventListener("pointerleave", hide);
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    // relative z-10 lifts this section above the pinned project deck it scrolls over
    <section
      ref={rootRef}
      className="relative z-10 bg-paper px-5 pt-28 pb-28 text-ink md:px-10 md:pt-32"
    >
      <div data-intro>
        <div className="flex items-center gap-4">
          <span data-eyebrow-rule className="block h-px w-10 origin-left bg-ink/30" />
          <span className="block overflow-hidden">
            <span data-eyebrow className="type-mono block opacity-50">
              Studio
            </span>
          </span>
        </div>
        <h2 ref={headRef} className="type-display-md mt-6 max-w-[11em]">
          Clients &amp; recognition
        </h2>
      </div>

      {/* Client wall — one flowing run of names, each previewing its work on hover */}
      <div data-col className="mt-20">
        <BandHeader label="Selected clients" count={site.clients.length} />

        <div ref={wallRef} className="relative mt-8">
          <div
            ref={previewRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-20 w-[clamp(180px,15vw,260px)] opacity-0"
            style={{ aspectRatio: "4 / 5" }}
          >
            {site.clients.map((c) => (
              <Image
                key={c.name}
                data-preview
                src={c.image}
                alt=""
                fill
                sizes="260px"
                className="rounded-[10px] object-cover"
              />
            ))}
          </div>

          {/* hovering one name dims the rest */}
          <div className="flex flex-wrap items-baseline text-[clamp(1.25rem,2.4vw,2.125rem)] leading-none font-bold tracking-tight [&:hover>span]:opacity-30 [&:hover>span:hover]:opacity-100 [&>span]:transition-opacity [&>span]:duration-300">
            {site.clients.map((c, i) => (
              <Fragment key={c.name}>
                <span data-client={i} className="cursor-default">
                  <Reveal>{c.name}</Reveal>
                </span>
                {i < site.clients.length - 1 && (
                  <span aria-hidden="true" className="px-3 opacity-25 md:px-4">
                    ·
                  </span>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Recognition — full-width rows: year, awarding body, honour, the work */}
      <div data-col className="mt-24">
        <BandHeader label="Recognition" count={site.recognition.length} />
        <ul className="mt-2">
          {site.recognition.map((r) => (
            <li key={`${r.org}-${r.year}-${r.work}`} className="relative">
              <div className="grid grid-cols-1 gap-x-8 gap-y-1 py-5 md:grid-cols-12 md:items-baseline">
                <Reveal className="type-mono opacity-50 md:col-span-2">{r.year}</Reveal>
                <Reveal className="text-lg leading-snug font-bold md:col-span-4">{r.org}</Reveal>
                <Reveal className="leading-snug opacity-60 md:col-span-4">{r.detail}</Reveal>
                <Reveal className="type-mono opacity-50 md:col-span-2 md:text-right">
                  {r.work}
                </Reveal>
              </div>
              <span data-item-rule className={`${RULE} bottom-0 bg-ink/10`} />
            </li>
          ))}
        </ul>
      </div>

      {/* Figures + exit */}
      <div data-stats className="relative mt-24 pt-12">
        <span data-rule className={`${RULE} top-0 bg-ink/15`} />
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
            {site.stats.map((s) => (
              <div key={s.label}>
                <span className="block overflow-hidden">
                  {/* server-rendered at its final value so it reads without JS */}
                  <span
                    data-stat
                    data-count={s.value}
                    data-suffix={s.suffix}
                    className="type-stat block"
                  >
                    {s.value}
                    {s.suffix}
                  </span>
                </span>
                <span data-stat-label className="type-mono mt-3 block opacity-50">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <TransitionLink
            href="/about"
            data-stat-label
            className="type-mono inline-block shrink-0 border-b border-current pb-1 transition-opacity duration-200 hover:opacity-60"
          >
            More about the studio →
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
