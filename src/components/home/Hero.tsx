'use client'
import {useCallback, useRef, useState} from 'react'
import Image from 'next/image'
import {gsap, useGSAP, ScrollTrigger} from '@/src/lib/gsap'
import {site} from '@/src/data/site'
import {onPageReveal} from '@/src/lib/loadGate'
import {HeroConfetti} from '@/src/components/HeroConfetti'

const RING_PHRASE = 'Art Direction · Photography · Berlin · Brand Identity · Editorial · '
const RING_REPEATS = 4 // must stay even so the loop seam lands on a phrase boundary; more repeats = tighter letter spacing
const RING_FONT = 28
const STAR_SIZE = 35
const STAR_POOL = 10

/**
 * Marquee text riding the border of the subject's arch (semicircle top,
 * straight sides). The path is rebuilt from the box's real pixel size, so the
 * glyphs never distort; the marquee is a constant-speed startOffset tween.
 */
function ArchMarquee() {
  const boxRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const textPathRef = useRef<SVGTextPathElement>(null)
  const [geom, setGeom] = useState({w: 0, h: 0, d: ''})

  useGSAP(
    () => {
      const measure = () => {
        const box = boxRef.current
        if (!box) return
        const w = box.clientWidth
        const h = box.clientHeight
        const R = (w - 12) / 2
        const y = R + 6
        // same outline as the image's rounded-t-full clip: up the left side,
        // over the semicircle, down the right side, back along the bottom
        const d = `M 6 ${h} L 6 ${y} A ${R} ${R} 0 0 1 ${w - 6} ${y} L ${w - 6} ${h} Z`
        setGeom({w, h, d})
      }
      measure()
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    },
    {scope: boxRef},
  )

  // (re)start the marquee whenever the path geometry changes
  useGSAP(
    () => {
      const path = pathRef.current
      const tp = textPathRef.current
      const box = boxRef.current
      if (!path || !tp || !box || !geom.d) return
      const L = path.getTotalLength()
      // doubled text over a period of L → the loop point is invisible
      tp.setAttribute('textLength', String(2 * L))

      // The face is monospace and textLength pins the total advance, so every
      // char covers the same arc length — separator positions are exact.
      const repeated = RING_PHRASE.repeat(RING_REPEATS)
      const perChar = (2 * L) / repeated.length
      const sepChars = [...repeated].flatMap((ch, i) => (ch === '·' ? [i] : []))
      const stars = box.querySelectorAll<SVGImageElement>('[data-ring-star]')

      const place = (offset: number) => {
        tp.setAttribute('startOffset', String(offset))
        let used = 0
        for (const g of sepChars) {
          const s = offset + (g + 0.5) * perChar
          if (s < 0 || s > L || used >= stars.length) continue
          const pt = path.getPointAtLength(s)
          // offset outward along the path normal so the star sits on the
          // glyph line, not the baseline
          const a = path.getPointAtLength(Math.max(0, s - 1))
          const b = path.getPointAtLength(Math.min(L, s + 1))
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
          const nx = (b.y - a.y) / len
          const ny = -(b.x - a.x) / len
          const cx = pt.x + nx * RING_FONT * 0.35
          const cy = pt.y + ny * RING_FONT * 0.35
          const el = stars[used++]
          el.setAttribute('x', String(cx - STAR_SIZE / 2))
          el.setAttribute('y', String(cy - STAR_SIZE / 2))
          el.style.display = 'block'
        }
        for (let i = used; i < stars.length; i++) stars[i].style.display = 'none'
      }

      const state = {o: -L}
      place(state.o)

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const off = onPageReveal(() => {
        if (reduced) {
          gsap.set(box, {autoAlpha: 1})
          place(-L / 2)
          return
        }
        gsap.to(box, {autoAlpha: 1, duration: 0.8, delay: 0.5})
        gsap.to(state, {
          o: 0,
          duration: 30,
          ease: 'none',
          repeat: -1,
          onUpdate: () => place(state.o),
        })
      })
      return () => off()
    },
    {scope: boxRef, dependencies: [geom.d]},
  )

  return (
    <div
      ref={boxRef}
      className="pointer-events-none absolute bottom-0 left-1/2 h-[calc(80svh+1.5rem)] w-[calc(min(90vw,78svh)+3rem)] -translate-x-1/2 opacity-0"
      aria-hidden="true"
    >
      {geom.d && (
        <svg viewBox={`0 0 ${geom.w} ${geom.h}`} className="h-full w-full overflow-visible">
          <defs>
            <path id="hero-arch" ref={pathRef} d={geom.d} fill="none" />
          </defs>
          <text
            fill="var(--chalk)"
            fontSize={RING_FONT}
            style={{fontFamily: 'var(--font-mono-util), monospace', textTransform: 'uppercase'}}
          >
            <textPath ref={textPathRef} href="#hero-arch" lengthAdjust="spacing">
              {/* nbsp keeps the monospace advance where the dots were — the
                  star images are pinned into those slots each frame */}
              {RING_PHRASE.repeat(RING_REPEATS).replace(/[ ·]/g, ' ')}
            </textPath>
          </text>
          {Array.from({length: STAR_POOL}, (_, i) => (
            <image
              key={i}
              data-ring-star
              href="/media/dark_star.webp"
              width={STAR_SIZE}
              height={STAR_SIZE}
              style={{display: 'none'}}
            />
          ))}
        </svg>
      )}
    </div>
  )
}

/**
 * The hero: display word over a duotone subject on the wash gradient.
 * Word enters via SplitText char masks, subject via a clip-path wipe,
 * both gated behind the preloader.
 */
export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const cutRef = useRef<HTMLDivElement>(null)

  const state = site.heroStates[0]

  useGSAP(
    () => {
      gsap.set(document.documentElement, {'--wash': state.wash})

      const word = wordRef.current
      const cut = cutRef.current
      if (!word || !cut) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Hidden here rather than in the reveal callback — useGSAP runs in a
      // layout effect, so this lands before the first paint and the squares
      // never flash in ahead of their own fade.
      const confetti = gsap.utils.toArray<HTMLElement>('[data-confetti]', rootRef.current)
      if (!reduced) gsap.set(confetti, {autoAlpha: 0})

      // Pin the hero until the next section has scrolled over it —
      // pinSpacing:false lets the following section slide on top. While
      // pinned, the hero content drifts upward on scrub for a parallax feel.
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const content = rootRef.current?.querySelectorAll(':scope > div')
        if (!content) return
        const st = ScrollTrigger.create({
          trigger: rootRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: false,
          scrub: true,
          // y only — an opacity scrub would capture the marquee's pre-fade-in
          // opacity (0) as its start value and re-hide it on every scroll
          animation: gsap.to(content, {y: -180, ease: 'none'}),
        })
        return () => st.kill()
      })

      // Minor mouse parallax on the subject — the image is scaled up a touch
      // so the drift never exposes its edges inside the arch
      let removeParallax: (() => void) | undefined
      if (!reduced && window.matchMedia('(pointer: fine)').matches) {
        const img = cut.querySelector('img')
        if (img) {
          gsap.set(img, {scale: 1.08})
          const xTo = gsap.quickTo(img, 'x', {duration: 0.8, ease: 'power3.out'})
          const yTo = gsap.quickTo(img, 'y', {duration: 0.8, ease: 'power3.out'})
          const onMove = (e: PointerEvent) => {
            xTo((e.clientX / window.innerWidth - 0.5) * 24)
            yTo((e.clientY / window.innerHeight - 0.5) * 16)
          }
          window.addEventListener('pointermove', onMove, {passive: true})
          removeParallax = () => window.removeEventListener('pointermove', onMove)
        }
      }

      // Gated on the page reveal, not the preloader: on a client navigation
      // back to the home page the preloader is long resolved, so a
      // preloader-gated entrance would play behind the transition curtain.
      const off = onPageReveal(() => {
        if (reduced) {
          gsap.set([word, cut], {autoAlpha: 1, y: 0})
          gsap.set(cut, {clipPath: 'inset(0 0 0% 0)'})
          return
        }

        // Subject and word simply rise into place, subject leading.
        // expo.out, not inOut: an inOut entrance is still ~90% short of its
        // travel a third of the way in, which reads as nothing happening.
        gsap.set(cut, {clipPath: 'inset(0 0 0% 0)'})
        gsap.fromTo(
          [cut, word],
          {y: 160, autoAlpha: 0},
          {y: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: 0.01},
        )
        gsap.to(confetti, {
          autoAlpha: 1,
          duration: 0.5,
          delay: 0.2,
          stagger: {each: 0.05, from: 'random'},
        })
      })

      return () => {
        off()
        mm.revert()
        removeParallax?.()
      }
    },
    {scope: rootRef},
  )

  // Refresh trigger positions once the hero image has painted (rule #21)
  const onHeroImgLoad = useCallback(() => ScrollTrigger.refresh(), [])

  return (
    <section
      ref={rootRef}
      data-nav-dark
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-linear-to-b from-[#212124] via-[#141416] to-ink pt-42"
    >
      <h1 className="sr-only">
        {site.name} — {site.role}, {site.location}
      </h1>

      {/* Same background treatment as the works hero — three shades of black
          with the colour confetti as the only saturated thing on it. */}
      <HeroConfetti />

      {/* Marquee text riding the arch border — painted before the image so
          the bottom run hides behind it */}
      <ArchMarquee />

      {/* Duotone subject tinted into the wash */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <div
          ref={cutRef}
          className="absolute bottom-0 h-[80svh] w-[min(90vw,78svh)] overflow-hidden rounded-t-full opacity-0"
          style={{clipPath: 'inset(0 0 100% 0)'}}
          data-cursor-media
        >
          <Image
            src={state.cutout}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 82vw, 38rem"
            className="object-cover object-top"
            onLoad={onHeroImgLoad}
          />
        </div>
      </div>

      {/* Display word — single line, roomy leading so the mask never crops glyphs */}
      <div
        className="relative px-4 pb-[14svh] text-center text-chalk md:pb-[8svh]"
        aria-hidden="true"
      >
        <span ref={wordRef} className="type-display block leading-[1.3] opacity-0">
          {state.word}
        </span>
      </div>
    </section>
  )
}
