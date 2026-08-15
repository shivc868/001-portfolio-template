"use client";
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, Flip } from "@/src/lib/gsap";
import type { Project } from "@/src/data/projects";
import { ProjectVideo } from "@/src/components/ProjectVideo";
import { useTransition } from "@/src/components/transition/TransitionProvider";

export function WorkDetail({ project, next }: { project: Project; next: Project }) {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLAnchorElement>(null);
  const { takeFlip, navigate } = useTransition();

  useGSAP(
    () => {
      const hero = heroRef.current;
      const rest = restRef.current;
      if (!hero || !rest) return;

      // §7B: morph from the works-index card, rest fades in behind at -=0.4
      const handoff = takeFlip(project.slug);
      if (handoff && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const tl = gsap.timeline();
        tl.add(
          Flip.from(handoff.state, {
            targets: hero,
            absolute: true,
            duration: 0.9,
            ease: "power4.inOut",
          })
        ).from(rest, { autoAlpha: 0, duration: 0.6 }, "-=0.4");
      }

      // Pinned media column against the scrolling text column, on scrub
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        const st = gsap.to("[data-detail-media] img", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-detail-cols]",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
        return () => {
          st.scrollTrigger?.kill();
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  // Next-project link: circular clip-path expands on hover
  const { contextSafe } = useGSAP({ scope: nextRef });
  const onNextEnter = contextSafe((e: React.MouseEvent) => {
    const el = nextRef.current?.querySelector("[data-next-fill]");
    if (!el) return;
    const r = nextRef.current!.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    gsap.fromTo(
      el,
      { clipPath: `circle(0px at ${cx}px ${cy}px)` },
      { clipPath: `circle(${Math.max(r.width, r.height)}px at ${cx}px ${cy}px)`, duration: 0.6, ease: "expo.out" }
    );
  });
  const onNextLeave = contextSafe((e: React.MouseEvent) => {
    const el = nextRef.current?.querySelector("[data-next-fill]");
    if (!el) return;
    const r = nextRef.current!.getBoundingClientRect();
    gsap.to(el, {
      clipPath: `circle(0px at ${e.clientX - r.left}px ${e.clientY - r.top}px)`,
      duration: 0.45,
      ease: "expo.in",
    });
  });

  return (
    <main ref={rootRef} className="wash-gradient min-h-svh pt-28">
      <header className="px-5 md:px-10">
        <span className="type-mono block opacity-70">
          {project.client} — {project.year}
        </span>
        <h1 className="type-display mt-2 text-ink">{project.title}</h1>
      </header>

      {/* Flip destination — same data-flip-id as the index card */}
      <div
        ref={heroRef}
        data-flip-id={`project-${project.slug}`}
        className="mx-5 mt-10 aspect-video overflow-hidden rounded-xl md:mx-10"
      >
        <ProjectVideo
          src={project.video}
          poster={project.poster}
          className="h-full w-full object-cover"
        />
      </div>

      <div ref={restRef}>
        <div data-detail-cols className="grid gap-10 px-5 py-20 md:grid-cols-2 md:px-10">
          {/* Pinned media column */}
          <div data-detail-media className="space-y-6 md:sticky md:top-24 md:self-start">
            {project.images.map((src, i) => (
              <div key={src} className="overflow-hidden rounded-lg">
                <Image
                  src={src}
                  alt={`${project.title} — image ${i + 1}`}
                  width={1400}
                  height={1000}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="h-auto w-full"
                />
              </div>
            ))}
          </div>
          {/* Scrolling text column */}
          <div className="max-w-prose">
            <ul className="type-mono mb-8 flex flex-wrap gap-3">
              {project.services.map((s) => (
                <li key={s} className="rounded-full border border-ink/30 px-3 py-1">
                  {s}
                </li>
              ))}
            </ul>
            {project.description.map((para) => (
              <p key={para.slice(0, 24)} className="type-bio mb-6 text-lg">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Next project */}
        <a
          ref={nextRef}
          href={`/works/${next.slug}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/works/${next.slug}`);
          }}
          onMouseEnter={onNextEnter}
          onMouseLeave={onNextLeave}
          className="relative block overflow-hidden border-t border-ink/15 px-5 py-16 md:px-10"
        >
          <span
            data-next-fill
            aria-hidden="true"
            className="absolute inset-0 bg-ink"
            style={{ clipPath: "circle(0px at 50% 50%)" }}
          />
          <span className="type-mono relative z-10 block opacity-70 mix-blend-difference text-chalk">
            Next project
          </span>
          <span className="type-display-md relative z-10 mix-blend-difference text-chalk">
            {next.title} →
          </span>
        </a>
      </div>
    </main>
  );
}
