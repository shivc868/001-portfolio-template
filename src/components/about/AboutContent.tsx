'use client'
import {useRef, useState} from 'react'
import Image from 'next/image'
import {gsap, useGSAP, ScrollSmoother, SplitText} from '@/src/lib/gsap'
import {site} from '@/src/data/site'
import {onPageReveal} from '@/src/lib/loadGate'
import {HeroConfetti} from '@/src/components/HeroConfetti'
import {useTransition} from '@/src/components/transition/TransitionProvider'

/** Hero chips — the practice in five words, same figure as the works hero. */
const HERO_TAGS = [site.location.split(',')[0], ...site.services] as const

/**
 * One tint per service, in the confetti hues washed down far enough to read
 * black type over. Indexed by position, so a sixth service falls back to the
 * first colour rather than to nothing.
 */
const SERVICE_TINTS = ['#f6e7b0', '#cfe4f4', '#f7d3e3', '#d9ecca', '#e2d8f8'] as const

export function AboutContent() {
  const rootRef = useRef<HTMLElement>(null)
  const servicesRef = useRef<HTMLUListElement>(null)
  const panelSplitRef = useRef<SplitText | null>(null)
  const [active, setActive] = useState(0)
  const {navigate} = useTransition()

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const splits: SplitText[] = []

        // Hidden synchronously — useGSAP runs in a layout effect, so this
        // lands before the first paint. Hiding any later (inside the reveal
        // callback, or after fonts.ready) paints the text in place first and
        // the entrance then reads as a blink.
        const lines = root.querySelectorAll<HTMLElement>('[data-hero-line]')
        const fades = root.querySelectorAll<HTMLElement>('[data-hero-fade]')
        const confetti = root.querySelectorAll<HTMLElement>('[data-confetti]')
        gsap.set([...lines, ...fades, ...confetti], {autoAlpha: 0})

        // The two headline lines drift apart on scroll — top one ahead of the
        // scroll, bottom one behind. Registered through the smoother instance
        // rather than data-speed markup: the attribute scan only runs when
        // ScrollSmoother is created, long before this page mounts.
        const smoother = ScrollSmoother.get()
        const fx =
          smoother && lines.length === 2
            ? [
                ...smoother.effects(lines[0], {speed: 1.12}),
                ...smoother.effects(lines[1], {speed: 0.88}),
              ]
            : []

        const offReveal = onPageReveal(() => {
          const tl = gsap.timeline()
          lines.forEach((el, i) => {
            const split = SplitText.create(el, {type: 'lines', mask: 'lines'})
            splits.push(split)
            // Safe to show the moment it has a mask around it — the mask, not
            // the element's own opacity, is what holds it back from here.
            gsap.set(el, {autoAlpha: 1})
            tl.fromTo(
              split.lines,
              {yPercent: 110},
              {yPercent: 0, duration: 1.1, ease: 'expo.out'},
              i * 0.08,
            )
          })
          tl.to(fades, {autoAlpha: 1, duration: 0.8, stagger: 0.08}, 0.35).to(
            confetti,
            {autoAlpha: 1, duration: 0.5, stagger: {each: 0.05, from: 'random'}},
            0.2,
          )
        })

        // Portrait reveals on a 45° polygon wipe (same function type both ends — rule #14)
        gsap.fromTo(
          '[data-portrait]',
          {clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)'},
          {
            clipPath: 'polygon(0 0, 200% 0, 200% 200%, 0 200%)',
            duration: 1.1,
            ease: 'expo.inOut',
            scrollTrigger: {trigger: '[data-portrait]', start: 'top 80%'},
          },
        )

        // Every block of copy rises out of line masks as it enters — the
        // statement, the paragraphs under it, and the section headings.
        const reveals = root.querySelectorAll<HTMLElement>('[data-reveal]')
        gsap.set(reveals, {autoAlpha: 0})
        document.fonts.ready.then(() => {
          if (!rootRef.current) return
          reveals.forEach((el) => {
            const split = SplitText.create(el, {type: 'lines', mask: 'lines'})
            splits.push(split)
            // text-indent is inherited, so every line box SplitText makes
            // picks up the statement's first-line indent. The breaks were
            // already measured with it — only line one should keep it.
            split.lines.forEach((line, i) => {
              if (i > 0) (line as HTMLElement).style.textIndent = '0'
            })
            gsap.set(el, {autoAlpha: 1})
            gsap.fromTo(
              split.lines,
              {yPercent: 110},
              {
                yPercent: 0,
                duration: 0.9,
                ease: 'expo.out',
                stagger: 0.06,
                scrollTrigger: {trigger: el, start: 'top 88%'},
              },
            )
          })
        })

        return () => {
          offReveal()
          fx.forEach((t) => t.kill())
          splits.forEach((s) => s.revert())
        }
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-portrait]', {clipPath: 'none'})
      })

      return () => mm.revert()
    },
    {scope: rootRef},
  )

  /**
   * The services accordion. Re-runs on every hover because `active` is the
   * dependency — the outgoing panel collapses, the incoming one opens and its
   * lines rise out of fresh masks.
   *
   * The split is created per open and reverted on close, so every reveal
   * starts from a clean mask and no closed panel is left carrying wrapper
   * markup it isn't using.
   */
  useGSAP(
    () => {
      const list = servicesRef.current
      if (!list) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const panels = list.querySelectorAll<HTMLElement>('[data-service-panel]')
      const open = panels[active]

      panelSplitRef.current?.revert()
      panelSplitRef.current = null

      // overwrite kills any open tween still running on that panel, so a fast
      // sweep down the list can never leave two rows open at once.
      panels.forEach((panel, i) => {
        if (i !== active) {
          gsap.to(panel, {height: 0, duration: 0.3, ease: 'none', overwrite: true})
        }
      })
      if (!open) return

      if (reduced) {
        gsap.set(open, {height: 'auto'})
        return
      }

      const split = SplitText.create(open.querySelectorAll<HTMLElement>('[data-service-item]'), {
        type: 'lines',
        mask: 'lines',
      })
      panelSplitRef.current = split

      gsap
        .timeline()
        .to(open, {height: 'auto', duration: 0.3, ease: 'none', overwrite: true})
        .fromTo(
          split.lines,
          {yPercent: 110},
          {yPercent: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out'},
          0.12,
        )
    },
    {dependencies: [active], scope: servicesRef},
  )

  return (
    <main ref={rootRef} className="min-h-svh bg-white">
      {/* Full-viewport hero — the same black-on-black band the home and works
          heroes use. [data-nav-dark] drives the nav's inversion. */}
      <header
        data-nav-dark
        className="relative flex min-h-svh flex-col justify-between overflow-hidden bg-linear-to-b from-[#212124] via-[#141416] to-ink px-5 pt-32 pb-14 text-chalk md:px-10"
      >
        <HeroConfetti />

        {/* flex-1 + justify-center: equal air above and below the pair. */}
        <h1 className="flex flex-1 flex-col justify-center py-6">
          {/* The `!` is load-bearing: .type-display carries its own
              line-height and wins the cascade over a plain leading utility.
              The 6vw insets pull the two lines toward each other, and
              pr-[0.12em] pays back the tracking the last glyph gives away —
              without it the line mask crops the final letter. */}
          <span
            data-hero-line
            className="type-display mr-[6vw] block pr-[0.12em] text-right leading-[0.78]!"
          >
            a decade of
          </span>
          <span className="flex flex-wrap items-end gap-x-8 gap-y-3">
            {/* shrink-0: as a flex child this line would otherwise give up
                width to the chips beside it, and the mask then clips it. */}
            <span
              data-hero-line
              className="type-display ml-[6vw] block shrink-0 pr-[0.12em] leading-[0.78]!"
            >
              being specific
            </span>
            <ul data-hero-fade className="mb-1 flex max-w-md flex-wrap gap-2">
              {HERO_TAGS.map((t) => (
                <li
                  key={t}
                  className="type-mono rounded-full border border-chalk/35 px-3 py-1.5 opacity-80"
                >
                  {t}
                </li>
              ))}
            </ul>
          </span>
        </h1>

        <p data-hero-fade className="ml-auto max-w-sm text-right text-lg opacity-70">
          {site.name} — {site.role}, {site.location}.
        </p>
      </header>

      {/* Flat white below the band, matching the works index */}
      <section className="relative bg-white px-5 pt-24 pb-28 md:px-10">
        <HeroConfetti />

        {/* Small pinned portrait at the far left, the statement carried on the
            right — the image is deliberately the quiet half here. */}
        <div className="relative grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <div
              data-portrait
              className="w-40 overflow-hidden rounded-md md:w-full md:max-w-82"
              style={{aspectRatio: '4 / 5'}}
            >
              <Image
                src="/media/portrait.jpg"
                alt={`Portrait of ${site.name}`}
                width={1000}
                height={1250}
                sizes="(max-width: 768px) 10rem, 13rem"
                className="h-full w-full object-cover"
                data-cursor-media
              />
            </div>
          </div>

          <div className="md:col-span-8 md:col-start-5">
            {/* The first line steps in from the left — that indent is what
                makes the block read as a spoken opening, not a paragraph. */}
            <p
              data-reveal
              className="text-[clamp(1.9rem,4vw,3.6rem)] leading-[1.14] font-semibold tracking-[-0.04em] indent-[30%]"
            >
              hello, i am {site.name.toLowerCase()}, an art director and photographer working across
              brand, editorial and campaign work.
            </p>

            <div className="mt-14 max-w-lg space-y-6 text-lg leading-relaxed opacity-70">
              <p data-reveal>
                ten years of brand and editorial work taught one lesson worth keeping: specificity
                beats volume. most work chases reach — the work that lasts is the work that could
                only have been made for one client.
              </p>
              <p data-reveal>
                the studio takes on a handful of projects a year — identities, campaigns and books —
                and photographs everything it designs.
              </p>
            </div>
          </div>
        </div>

        {/* Services — held in its own dark container so it reads as a
            separate plane from the white above it. Same gradient as the hero,
            so the page bookends itself. data-nav-dark keeps the nav legible
            while this block passes underneath. */}
        <section
          data-nav-dark
          className="mt-32 grid gap-14 overflow-hidden rounded-3xl bg-linear-to-b from-[#212124] via-[#141416] to-ink px-6 py-16 text-chalk md:grid-cols-12 md:px-12 md:py-20"
        >
          <div className="md:col-span-4">
            <h2 data-reveal className="type-display-md">
              services
            </h2>
            <p data-reveal className="mt-6 max-w-xs text-lg leading-relaxed opacity-70">
              positioning, brand and website, built as one thing. no handoffs, no drag, no cutting
              corners on craft.
            </p>
          </div>

          <ul ref={servicesRef} className="md:col-span-8 md:col-start-5">
            {site.serviceDetail.map((s, i) => (
              <li
                key={s.name}
                onMouseEnter={() => setActive(i)}
                className="overflow-hidden rounded-lg border-t border-chalk/12 transition-colors duration-500 last:border-b"
                // Inline, not a class: Tailwind can't compile a colour it only
                // learns at runtime, so a `bg-[${tint}]` would come out empty.
                style={{
                  backgroundColor:
                    i === active ? SERVICE_TINTS[i % SERVICE_TINTS.length] : 'transparent',
                }}
              >
                <button
                  type="button"
                  onFocus={() => setActive(i)}
                  // hover can't reach a touch screen — tapping the row opens it
                  onClick={() => setActive(i)}
                  aria-expanded={i === active}
                  className="flex w-full items-baseline gap-6 px-4 py-5 text-left"
                >
                  {/* Open rows sit on their pastel tint, so their type flips
                      to ink; closed rows are chalk on the dark panel. */}
                  <span
                    className={`type-mono transition-colors duration-500 ${
                      i === active ? 'text-ink/60' : 'text-chalk/35'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-[clamp(1.4rem,2.5vw,2.3rem)] leading-none font-semibold tracking-tight transition-colors duration-500 ${
                      i === active ? 'text-ink' : 'text-chalk/45'
                    }`}
                  >
                    {s.name.toLowerCase()}
                  </span>
                </button>

                {/* Closed by default in CSS so nothing flashes open before the
                    first effect runs; GSAP owns the height from then on. */}
                <div data-service-panel className="h-0 overflow-hidden">
                  <ul className="space-y-2.5 px-4 pt-1 pb-6 pl-14">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-center gap-3">
                        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-ink/45" />
                        {/* Only the text is split — a mask around the flex row
                            would swallow the bullet with it. */}
                        <span data-service-item className="text-base text-ink/70">
                          {it}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  )
}
