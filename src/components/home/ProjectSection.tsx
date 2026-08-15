"use client";
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/src/lib/gsap";
import type { Project } from "@/src/data/projects";
import { ProjectVideo } from "@/src/components/ProjectVideo";
import { MagneticButton } from "@/src/components/MagneticButton";
import { useTransition } from "@/src/components/transition/TransitionProvider";

/**
 * Full-bleed dark section, one per project (§6). The section pins while the
 * video card grows from ~55% width to near-full-bleed via inset() on scrub.
 *
 * `isLast` ends the deck: the final project doesn't pin, so it scrolls away
 * normally instead of the outro sliding over it.
 */
export function ProjectSection({
  project,
  index,
  isLast = false,
}: {
  project: Project;
  index: number;
  isLast?: boolean;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { navigate } = useTransition();

  useGSAP(
    () => {
      const root = rootRef.current;
      const card = cardRef.current;
      const title = titleRef.current;
      const content = contentRef.current;
      if (!root || !card || !title || !content) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Card growth completes exactly as the section reaches the top —
        // it scrubs while the section travels up over the previous one
        gsap.fromTo(
          card,
          { clipPath: "inset(12% 22% 12% 22% round 12px)" },
          {
            clipPath: "inset(2% 2% 2% 2% round 12px)",
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "top top",
              scrub: 0.4,
            },
          }
        );

        // Deck stack: each section pins at the top while the next one
        // slides over it (same pattern as the hero). While pinned, the
        // content drifts upward on scrub as the next project arrives.
        // The last project skips the pin so the outro follows it in normal
        // flow rather than covering it.
        if (!isLast) {
          ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: "+=100%",
            pin: true,
            pinSpacing: false,
            scrub: true,
            animation: gsap.to(content, { y: -160, ease: "none" }),
          });
        }

        // Project name: chars rise out of line masks, staggered from the centre
        document.fonts.ready.then(() => {
          SplitText.create(title, {
            type: "lines,chars",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 110,
                // beat before the reveal so the card growth lands first
                delay: 0.35,
                stagger: { each: 0.045, from: "center" },
                duration: 1.1,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: root,
                  start: "top 60%",
                  toggleActions: "play none none reverse",
                },
              }),
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(card, { clipPath: "none" });
        gsap.fromTo(root, { opacity: 0 }, {
          opacity: 1,
          duration: 0.2,
          scrollTrigger: { trigger: root, start: "top 80%" },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-nav-dark
      className="relative flex min-h-svh items-center overflow-hidden bg-ink text-chalk"
    >
      {/* Parallax background image — scaled well past the frame so neither
          the data-speed drift nor the scrubbed translate exposes an edge */}
      <div className="absolute inset-0" data-speed="0.85" aria-hidden="true">
        <Image
          src={project.images[0]}
          alt=""
          fill
          sizes="100vw"
          className="scale-130 object-cover opacity-30"
        />
      </div>

      {/* Centred video card */}
      <div ref={cardRef} className="absolute inset-0 will-change-[clip-path]">
        <ProjectVideo
          src={project.video}
          poster={project.poster}
          className="h-full w-full object-cover"
        />
        {/* light ink scrim keeps the title legible without muting the colour */}
        <div aria-hidden="true" className="absolute inset-0 bg-ink/25" />
      </div>

      {/* Project name — centred, lifted above the middle; the static translate
          lives on this wrapper so the scrubbed y on the inner div never
          overwrites it */}
      <div className="relative z-10 flex w-full translate-y-[-8svh] justify-center px-5 md:px-10">
        <div ref={contentRef} className="flex flex-col items-center gap-6 text-center">
          <div>
            <span className="type-mono mb-2 block opacity-70">
              {String(index + 1).padStart(2, "0")} — {project.client}, {project.year}
            </span>
            <h2 ref={titleRef} className="type-display-md mx-auto max-w-[9em]">
              {project.title}
            </h2>
          </div>
          <MagneticButton onClick={() => navigate(`/works/${project.slug}`)}>
            View more
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
