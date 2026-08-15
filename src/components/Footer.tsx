"use client";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger, ScrollSmoother } from "@/src/lib/gsap";
import { site } from "@/src/data/site";
import { TransitionLink } from "@/src/components/transition/TransitionLink";

/** Internal routes, mirroring the primary nav. */
const SITEMAP = [
  { label: "Design", href: "/works" },
  { label: "Photography", href: "/photography" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Velocity-linked marquee: scroll speed skews and accelerates the strip,
 *  settles when scrolling stops (§6). */
function TalkMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let extra = 0;
        const st = ScrollTrigger.create({
          onUpdate: (self) => {
            extra = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
            gsap.to(track, {
              skewX: gsap.utils.clamp(-8, 8, self.getVelocity() / 400),
              duration: 0.3,
              overwrite: "auto",
            });
          },
        });
        let x = 0;
        const tick = () => {
          // half the track is a duplicate — wrap at 50%
          x = (x - (0.06 + Math.abs(extra) * 0.05)) % 50;
          extra *= 0.94;
          if (Math.abs(extra) < 0.05) {
            gsap.to(track, { skewX: 0, duration: 0.4, overwrite: "auto" });
          }
          gsap.set(track, { xPercent: x });
        };
        gsap.ticker.add(tick);
        return () => {
          gsap.ticker.remove(tick);
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: trackRef }
  );

  const row = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="type-display-md px-6 whitespace-nowrap" aria-hidden={i > 0}>
      Let&apos;s talk ↗
    </span>
  ));

  return (
    <a
      href={site.calendly}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden border-y border-chalk/10 py-5"
      aria-label="Let's talk — book an intro call"
    >
      <div
        ref={trackRef}
        className="flex w-max text-chalk/80 transition-colors duration-300 will-change-transform group-hover:text-chalk"
      >
        {row}
        {row}
      </div>
    </a>
  );
}

/** One labelled link column. */
function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="type-mono text-chalk/40">{title}</h3>
      <ul className="mt-5 space-y-2.5 text-[0.95rem] font-bold">{children}</ul>
    </div>
  );
}

const linkStyle = "text-chalk/70 transition-colors duration-200 hover:text-chalk";

export function Footer() {
  const backToTop = () => {
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(0, true);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer data-nav-dark className="footer-surface relative z-10 text-chalk">
      <div className="grid gap-14 px-5 pt-24 pb-16 md:px-10 md:pt-28 lg:grid-cols-2 lg:gap-20">
        {/* Contact lead */}
        <div>
          <h2 className="type-mono text-chalk/40">Get in touch</h2>
          <a
            href={`mailto:${site.email}`}
            className="mt-6 inline-block border-b border-chalk/25 pb-1.5 text-xl font-bold tracking-tight transition-colors duration-200 hover:border-chalk md:text-3xl"
          >
            {site.email}
          </a>
          <p className="mt-8 max-w-[34ch] leading-relaxed text-chalk/55">{site.tagline}</p>
          {/* normal-case so the interior-capital quirk survives */}
          <p className="mt-8 text-sm normal-case text-chalk/35">— {site.quirkName}</p>
        </div>

        {/* Link columns */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:justify-items-end"
        >
          <FooterColumn title="Services">
            {site.services.map((s) => (
              <li key={s} className="text-chalk/70">
                {s}
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Sitemap">
            {SITEMAP.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className={linkStyle}>
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Elsewhere">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                  {s.label} ↗
                </a>
              </li>
            ))}
          </FooterColumn>
        </nav>
      </div>

      <TalkMarquee />

      <div className="flex flex-col gap-4 px-5 py-7 md:flex-row md:items-center md:justify-between md:px-10">
        <span className="type-mono text-chalk/40">
          © {new Date().getFullYear()} {site.name} — {site.location}
        </span>
        <div className="type-mono flex items-center gap-7 text-chalk/40">
          <TransitionLink href="/about" className="transition-colors duration-200 hover:text-chalk">
            Imprint
          </TransitionLink>
          <TransitionLink href="/about" className="transition-colors duration-200 hover:text-chalk">
            Privacy
          </TransitionLink>
          <button
            type="button"
            onClick={backToTop}
            className="transition-colors duration-200 hover:text-chalk"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
