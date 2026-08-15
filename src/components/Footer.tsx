'use client'
import {useRef, type ReactNode} from 'react'
import {gsap, useGSAP, ScrollTrigger, ScrollSmoother} from '@/src/lib/gsap'
import {site} from '@/src/data/site'
import {TransitionLink} from '@/src/components/transition/TransitionLink'
import {CONFETTI_COLORS} from '@/src/components/HeroConfetti'

/** Internal routes, mirroring the primary nav. */
const SITEMAP = [
  {label: 'Work', href: '/works'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
]

const PIECES = 70

/** Shape of a piece, picked by index so server and client agree — a random
 *  pass here would hydrate mismatched, the same reason HeroConfetti's
 *  positions are hardcoded. */
function pieceShape(i: number) {
  if (i % 3 === 1) return {width: 6, height: 15, borderRadius: 1}
  if (i % 3 === 2) return {width: 9, height: 9, borderRadius: 9999}
  return {width: 11, height: 11, borderRadius: 1}
}

/**
 * Confetti thrown up from beneath the footer once the page bottoms out.
 *
 * Each piece launches on a Physics2D arc — an upward velocity plus gravity, so
 * the rise decelerates and the fall accelerates the way a real throw does,
 * which a scripted y-tween can't fake. On the way down each piece is caught at
 * a jittered rest line just above the footer's bottom edge rather than being
 * left to fall out of the document.
 */
function FooterConfetti() {
  const boxRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const box = boxRef.current
      if (!box) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const pieces = gsap.utils.toArray<HTMLElement>('[data-piece]', box)
        const rand = gsap.utils.random
        gsap.set(pieces, {autoAlpha: 0})

        const burst = () => {
          const {width, height} = box.getBoundingClientRect()
          gsap.killTweensOf(pieces) // re-entry mid-settle: strand no old tweens

          pieces.forEach((el) => {
            // jittered so the pieces pile along the edge instead of aligning
            const floor = height - rand(6, 30)
            let armed = false
            let lastX = 0

            gsap.set(el, {
              x: rand(width * 0.06, width * 0.94),
              y: height + rand(10, 70), // starts below the fold — thrown in from off-screen
              rotation: rand(0, 360),
              scale: rand(0.7, 1.25),
              autoAlpha: 1,
            })

            // safe as a const: a `to` tween does not render at construction,
            // so onUpdate cannot fire before the binding is initialised
            const t = gsap.to(el, {
              duration: 8, // outlived by the floor check below; never runs out
              ease: 'none',
              delay: rand(0, 0.3),
              // physics2D angles run clockwise from +x, so -90 is straight up.
              // ±18° off vertical: wider fans drift pieces hundreds of px
              // sideways over the flight and out through the footer's sides
              physics2D: {velocity: rand(950, 1650), angle: rand(-108, -72), gravity: 2700},
              rotation: `+=${rand(-900, 900)}`,
              onUpdate: () => {
                const y = Number(gsap.getProperty(el, 'y'))
                const x = Number(gsap.getProperty(el, 'x'))
                // arm only once the piece has risen past the rest line —
                // otherwise the below-the-edge launch position lands instantly
                if (y < floor) {
                  armed = true
                  lastX = x
                  return
                }
                if (!armed) return
                // per-frame x delta ≈ the horizontal velocity at impact; the
                // piece keeps skidding in that direction while it bounces,
                // instead of freezing mid-air the moment physics is killed
                const vx = x - lastX
                t.kill()
                gsap.to(el, {y: floor, duration: 0.55, ease: 'bounce.out'})
                gsap.to(el, {
                  x: `+=${gsap.utils.clamp(-60, 60, vx * 14)}`,
                  rotation: `+=${rand(-120, 120)}`,
                  duration: 0.8,
                  ease: 'power3.out',
                })
              },
            })
          })
        }

        // Fires shortly BEFORE the page bottoms out — the footer's bottom edge
        // is the document's, so a start at the exact end sits on max scroll
        // and is easy to never quite reach. bottom+=300 puts the line 300px
        // below the viewport edge: it crosses ~300px of scroll before the end,
        // comfortably inside reachable range, and the throw is already in the
        // air as the user arrives.
        const st = ScrollTrigger.create({
          trigger: box,
          start: 'bottom bottom+=300',
          end: 'bottom top',
          onEnter: burst,
        })

        return () => {
          st.kill()
          gsap.killTweensOf(pieces)
          // only GSAP's own props — clearProps:'all' would also strip React's
          // width/height/background, which React never re-applies on a
          // StrictMode remount because its props haven't changed
          gsap.set(pieces, {clearProps: 'transform,opacity,visibility'})
        }
      })

      return () => mm.revert()
    },
    {scope: boxRef},
  )

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      {Array.from({length: PIECES}, (_, i) => (
        <span
          key={i}
          data-piece
          className="absolute top-0 left-0 block opacity-0 will-change-transform"
          style={{...pieceShape(i), background: CONFETTI_COLORS[i % CONFETTI_COLORS.length]}}
        />
      ))}
    </div>
  )
}

/** Velocity-linked marquee: scroll speed skews and accelerates the strip,
 *  settles when scrolling stops (§6). */
function TalkMarquee() {
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        let extra = 0
        const st = ScrollTrigger.create({
          onUpdate: (self) => {
            extra = gsap.utils.clamp(-6, 6, self.getVelocity() / 300)
            gsap.to(track, {
              skewX: gsap.utils.clamp(-8, 8, self.getVelocity() / 400),
              duration: 0.3,
              overwrite: 'auto',
            })
          },
        })
        let x = 0
        const tick = () => {
          // half the track is a duplicate — wrap at 50%
          x = (x - (0.06 + Math.abs(extra) * 0.05)) % 50
          extra *= 0.94
          if (Math.abs(extra) < 0.05) {
            gsap.to(track, {skewX: 0, duration: 0.4, overwrite: 'auto'})
          }
          gsap.set(track, {xPercent: x})
        }
        gsap.ticker.add(tick)
        return () => {
          gsap.ticker.remove(tick)
          st.kill()
        }
      })
      return () => mm.revert()
    },
    {scope: trackRef},
  )

  const row = Array.from({length: 6}, (_, i) => (
    <span key={i} className="type-display-md px-6 whitespace-nowrap" aria-hidden={i > 0}>
      Let&apos;s talk ↗
    </span>
  ))

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
  )
}

/** One labelled link column. */
function FooterColumn({title, children}: {title: string; children: ReactNode}) {
  return (
    <div>
      <h3 className="type-mono text-chalk/40">{title}</h3>
      <ul className="mt-5 space-y-2.5 text-[0.95rem] font-bold">{children}</ul>
    </div>
  )
}

const linkStyle = 'text-chalk/70 transition-colors duration-200 hover:text-chalk'

export function Footer() {
  const backToTop = () => {
    const smoother = ScrollSmoother.get()
    if (smoother) smoother.scrollTo(0, true)
    else window.scrollTo({top: 0, behavior: 'smooth'})
  }

  return (
    <footer data-nav-dark className="footer-surface relative z-10 text-chalk">
      <FooterConfetti />

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
  )
}
