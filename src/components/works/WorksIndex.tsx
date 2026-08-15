'use client'
import {useRef} from 'react'
import Image from 'next/image'
import {gsap, useGSAP, Flip, ScrollSmoother, SplitText} from '@/src/lib/gsap'
import {projects} from '@/src/data/projects'
import {site} from '@/src/data/site'
import {onPageReveal} from '@/src/lib/loadGate'
import {HeroConfetti} from '@/src/components/HeroConfetti'
import {useTransition} from '@/src/components/transition/TransitionProvider'

/** Hero disciplines, shown as pills tucked against the second headline line. */
const HERO_TAGS = [...site.services, 'Editorial'] as const

/**
 * /works index — a dark full-height hero over a list of project rows that
 * alternate side to side. Each row's frame swings in on its pinned corner as
 * it enters, and clicking one hands its Flip state to the detail hero (§7B).
 */
export function WorksIndex() {
  const rootRef = useRef<HTMLElement>(null)
  const {navigate, prefetch, isTransitioning} = useTransition()

  const {contextSafe} = useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const splits: SplitText[] = []

        // Hero entrance — gated on the page reveal so it plays after the
        // transition curtain has cleared, not behind it.
        //
        // Everything that animates is hidden HERE, synchronously: useGSAP runs
        // in a layout effect, so this lands before the browser paints. Hiding
        // inside the reveal callback (or after `fonts.ready` resolves) is a
        // frame or more too late — the text paints in place first and the
        // animation then reads as a blink.
        const lines = root.querySelectorAll<HTMLElement>('[data-hero-line]')
        const rows = root.querySelectorAll<HTMLElement>('[data-row]')
        const fades = root.querySelectorAll<HTMLElement>('[data-hero-fade]')
        const confetti = root.querySelectorAll<HTMLElement>('[data-confetti]')
        const rowParts = root.querySelectorAll<HTMLElement>(
          '[data-swing], [data-row-title], [data-row-meta]',
        )
        gsap.set([...lines, ...fades, ...confetti, ...rowParts], {autoAlpha: 0})

        // The two headline lines drift apart as the page scrolls: the top one
        // runs slightly ahead of the scroll, the bottom one slightly behind.
        // Registered through the smoother rather than via data-speed markup —
        // the attribute scan only runs when ScrollSmoother is created, and
        // this page mounts long after that on a client navigation.
        const smoother = ScrollSmoother.get()
        const fx =
          smoother && lines.length === 2
            ? [
                ...smoother.effects(lines[0], {speed: 1.12}),
                ...smoother.effects(lines[1], {speed: 0.88}),
              ]
            : []

        // Only the image inside each frame lags — the card itself stays put,
        // so the picture slides against its own crop. The 1.2 scale is the
        // headroom that pays for that slide; without it a fast scroll drags
        // an edge into view.
        if (smoother) {
          rows.forEach((row, i) => {
            const inner = row.querySelector<HTMLElement>('[data-parallax]')
            if (!inner) return
            gsap.set(inner, {scale: 1.5})
            fx.push(...smoother.effects(inner, {lag: 0.2}))
          })
        }

        const offReveal = onPageReveal(() => {
          const tl = gsap.timeline()
          lines.forEach((el, i) => {
            const split = SplitText.create(el, {type: 'lines', mask: 'lines'})
            splits.push(split)
            // The line is safe to show the moment it has a mask around it;
            // the mask, not the element, is what holds it back now.
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

        // One timeline per row: the frame hangs off the corner nearest the
        // page's centre and swings down, and only once it has settled does the
        // caption come up out of its mask. elastic.out is the whole effect —
        // a plain eased rotation reads as a slide, not as weight on a hinge.
        //
        // Built after fonts.ready so SplitText measures the real face; the
        // parts are already hidden above, so the wait costs nothing visually.
        document.fonts.ready.then(() => {
          if (!rootRef.current) return
          rows.forEach((row) => {
            const frame = row.querySelector<HTMLElement>('[data-swing]')
            const title = row.querySelector<HTMLElement>('[data-row-title]')
            const meta = row.querySelectorAll<HTMLElement>('[data-row-meta]')
            if (!frame) return
            const left = frame.dataset.swing === 'left'
            gsap.set(frame, {transformOrigin: left ? 'top right' : 'top left'})

            const tl = gsap.timeline({scrollTrigger: {trigger: frame, start: 'top 85%'}})
            tl.to(frame, {autoAlpha: 1, duration: 0.3}).fromTo(
              frame,
              {rotate: left ? 13 : -13},
              {
                rotate: 0,
                duration: 1.6,
                ease: 'elastic.out(1, 0.4)',
                // The frame is also the Flip source; hand it back with a clean
                // transform so the morph measures it, not our hinge.
                onComplete: () => gsap.set(frame, {clearProps: 'rotate,transformOrigin'}),
              },
              0,
            )

            if (title) {
              const split = SplitText.create(title, {type: 'lines', mask: 'lines'})
              splits.push(split)
              // '>-0.55': the tail of an elastic ease is imperceptible motion,
              // so the caption starts where the swing has visually settled
              // rather than where the tween's clock runs out.
              tl.set(title, {autoAlpha: 1}, '>-0.55').fromTo(
                split.lines,
                {yPercent: 110},
                {yPercent: 0, duration: 0.9, ease: 'expo.out'},
                '<',
              )
            }
            tl.to(meta, {autoAlpha: 1, duration: 0.5, stagger: 0.08}, '<0.15')
          })
        })
        return () => {
          offReveal()
          fx.forEach((t) => t.kill())
          splits.forEach((s) => s.revert())
        }
      })
      return () => mm.revert()
    },
    {scope: rootRef},
  )

  const openProject = contextSafe((slug: string, card: HTMLElement) => {
    if (isTransitioning()) return
    const state = Flip.getState(card)
    navigate(`/works/${slug}`, {flip: {state, slug}})
  })

  return (
    <main ref={rootRef} className="min-h-svh bg-white">
      {/* Full-viewport hero — black on black, three shades deep so the band
          has some air in it. [data-nav-dark] drives the nav's inversion. */}
      <header
        data-nav-dark
        className="relative flex min-h-svh flex-col justify-between overflow-hidden bg-linear-to-b from-[#212124] via-[#141416] to-ink px-5 pt-32 pb-14 text-chalk md:px-10"
      >
        <HeroConfetti />

        {/* Two display lines: the first flushed right, the second flushed left
            with the discipline pills tucked into the space it leaves. */}
        {/* flex-1 + justify-center: equal air above and below the pair. */}
        <h1 className="flex flex-1 flex-col justify-center py-6">
          {/* The `!` is load-bearing: .type-display carries its own
              line-height and wins the cascade over a plain leading utility,
              which left the two lines floating a fifth of an em apart. */}
          {/* The 6vw insets pull the two lines toward each other so the
              stagger reads as one block rather than two opposite corners.
              pr-[0.08em] pays back the -0.06em tracking the last glyph gives
              away — without it the line mask crops the final letter. */}
          <span
            data-hero-line
            className="type-display mr-[6vw] block pr-[0.12em] text-right leading-[0.78]!"
          >
            selected work
          </span>
          <span className="flex flex-wrap items-end gap-x-8 gap-y-3">
            {/* shrink-0: as a flex child this line will otherwise give up
                width to the pills beside it, and the line mask then clips
                the final glyph. */}
            <span
              data-hero-line
              className="type-display ml-[6vw] block shrink-0 pr-[0.12em] leading-[0.78]!"
            >
              for brands
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
          {site.tagline}
        </p>
      </header>

      {/* Flat white, no wash — the gradient fought the confetti and the
          frames both. */}
      <section className="relative bg-white px-5 pt-20 pb-28 md:px-10">
        <HeroConfetti />

        {/* Two projects to a row. The right column is dropped half a frame so
            the grid reads as a staggered wall rather than a table. */}
        <ul className="relative grid gap-x-12 gap-y-10 md:grid-cols-2">
          {projects.map((p, i) => {
            // Left column hangs from its top-right corner, right column from its
            // top-left — always the corner nearest the middle of the page.
            const imageLeft = i % 2 === 0
            return (
              <li key={p.slug} data-row className={imageLeft ? '' : 'md:mt-16'}>
                <a
                  href={`/works/${p.slug}`}
                  className={`group block ${imageLeft ? '' : 'md:text-right'}`}
                  onClick={(e) => {
                    e.preventDefault()
                    const card = e.currentTarget.querySelector<HTMLElement>('[data-flip-card]')
                    if (card) openProject(p.slug, card)
                  }}
                  onMouseEnter={() => prefetch(`/works/${p.slug}`)}
                >
                  {/* Flip source — the frame that morphs into the detail hero.
                    data-swing names the corner it hangs from. */}
                  <div
                    data-swing={imageLeft ? 'left' : 'right'}
                    data-flip-card
                    data-flip-id={`project-${p.slug}`}
                    className="aspect-4/3 overflow-hidden rounded-xl"
                  >
                    {/* The lag effect writes this wrapper's transform, so the
                        hover scale has to sit on a different element — GSAP
                        and a CSS transition can't share one transform. */}
                    <div data-parallax className="h-full w-full">
                      <Image
                        src={p.poster}
                        alt=""
                        width={1200}
                        height={900}
                        sizes="(max-width: 768px) 90vw, 46vw"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div
                    className={`mt-5 flex items-baseline gap-4 ${imageLeft ? '' : 'md:justify-end'}`}
                  >
                    <span data-row-meta className="type-mono opacity-50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {/* .type-display-md's own font-size would run this title
                      past the column, hence the `!` override. */}
                    <span
                      data-row-title
                      className="type-display-md text-[clamp(2rem,3.6vw,3.5rem)]! text-ink"
                    >
                      {p.title}
                    </span>
                  </div>
                  <span data-row-meta className="type-mono mt-3 block opacity-60">
                    {p.services[0]} — {p.year}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
