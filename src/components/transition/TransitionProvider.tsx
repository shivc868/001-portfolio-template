'use client'
import {createContext, useCallback, useContext, useEffect, useRef} from 'react'
import {usePathname, useRouter} from 'next/navigation'
import {gsap, Flip, ScrollSmoother, ScrollTrigger, SplitText} from '@/src/lib/gsap'
import {getProject} from '@/src/data/projects'
import {markPageRevealed, resetPageReveal} from '@/src/lib/loadGate'

type FlipHandoff = {
  state: ReturnType<typeof Flip.getState>
  slug: string
}

type NavigateOptions = {
  /** Hands a Flip snapshot to the destination for the shared-element morph. */
  flip?: FlipHandoff
}

type TransitionContextValue = {
  navigate: (href: string, options?: NavigateOptions) => void
  prefetch: (href: string) => void
  /** Consumed once by the works detail hero for the shared-element morph. */
  takeFlip: (slug: string) => FlipHandoff | null
  isTransitioning: () => boolean
}

const TransitionContext = createContext<TransitionContextValue | null>(null)

export function useTransition(): TransitionContextValue {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('useTransition must be used inside TransitionProvider')
  return ctx
}

/** The name the curtain announces. Matches the nav's wording, not the route. */
const ROUTE_LABELS: Record<string, string> = {
  '/': 'Maren Voss',
  '/works': 'Design',
  '/photography': 'Photography',
  '/about': 'About',
  '/contact': 'Contact',
}

function routeLabel(href: string): string {
  if (href.startsWith('/works/')) {
    const slug = href.slice('/works/'.length)
    return getProject(slug)?.title ?? slug.replace(/-/g, ' ')
  }
  return ROUTE_LABELS[href] ?? href.replace(/^\//, '')
}

const isReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Curtain exit timing, in seconds on the exit timeline. */
const EXIT_START = 0.08
const EXIT_DURATION = 0.85
const EXIT_EASE = 'power4.inOut'
/**
 * The page's entrance is released once the panel has travelled this much of
 * the way off screen. Measured in distance moved, not time elapsed — see
 * timeForTravel below for why those are very different here.
 */
const REVEAL_AT_TRAVEL = 0.9

/**
 * Time-progress at which `ease` has produced `travel` of its movement.
 *
 * Eased motion isn't linear in time. A strong inOut curve decelerates hard
 * enough that the last tenth of its *duration* covers almost none of the move,
 * while the midpoint of its duration is barely a quarter of it. Tuning this
 * handoff against elapsed time therefore fights the ease; tuning it against
 * travel does what it looks like it does.
 */
function timeForTravel(ease: string, travel: number): number {
  const fn = gsap.parseEase(ease)
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (fn(mid) < travel) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * Owns route changes (§7).
 *
 * In-app links play a curtain: the outgoing page dims and lifts, a white panel
 * rises over it carrying the destination name (chars staggered from the centre,
 * same figure as the project sections), the route commits while covered, then
 * the panel carries the name up and off to reveal the new page.
 *
 * GSAP rather than React's <ViewTransition>: a view transition paints frozen
 * snapshots for its whole duration, which would stall the curtain's exit
 * mid-flight and freeze the text animation inside it. The two can't both drive
 * one navigation, so the curtain owns it outright.
 */
export function TransitionProvider({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const splitRef = useRef<SplitText | null>(null)
  const busyRef = useRef(false)
  const coveredRef = useRef(false)
  const flipRef = useRef<FlipHandoff | null>(null)
  const failsafeRef = useRef<number | null>(null)

  const prefetch = useCallback((href: string) => router.prefetch(href), [router])

  const navigate = useCallback<TransitionContextValue['navigate']>(
    (href, options) => {
      // Guard: ignore double-clicks mid-transition, and no-op same-route links.
      if (busyRef.current || href === window.location.pathname) return
      busyRef.current = true
      flipRef.current = options?.flip ?? null
      // The incoming page's entrance waits for the curtain to clear again.
      resetPageReveal()

      const overlay = overlayRef.current
      const label = labelRef.current

      // Shared-element navigations (§7B) skip the curtain — the whole point is
      // watching the card morph into the destination hero.
      if (options?.flip || !overlay || !label) {
        coveredRef.current = false
        router.push(href)
        return
      }

      const commit = () => {
        coveredRef.current = true
        router.push(href)
        // If the route never commits (identical path after normalisation, an
        // aborted push), busyRef would latch on and deaden every later click.
        failsafeRef.current = window.setTimeout(() => {
          if (!busyRef.current) return
          gsap.killTweensOf(overlay)
          gsap.set(overlay, {autoAlpha: 0, yPercent: 100})
          gsap.set('#smooth-content > *', {y: 0, opacity: 1})
          busyRef.current = false
          coveredRef.current = false
        }, 3000)
      }

      label.textContent = routeLabel(href)

      if (isReduced()) {
        gsap.set(overlay, {yPercent: 0, autoAlpha: 0})
        gsap.to(overlay, {autoAlpha: 1, duration: 0.25, onComplete: commit})
        return
      }

      // Split after the label text is set; fonts are long loaded by now.
      splitRef.current?.revert()
      splitRef.current = SplitText.create(label, {type: 'lines,chars', mask: 'lines'})

      const tl = gsap.timeline({onComplete: commit})
      tl.set(overlay, {autoAlpha: 1, yPercent: 100})
        // Outgoing page recedes. Target the content's children, never
        // #smooth-wrapper / #smooth-content themselves — ScrollSmoother owns
        // both and animating them corrupts its state.
        .to('#smooth-content > *', {y: -54, opacity: 0.35, duration: 0.75, ease: 'expo.inOut'}, 0)
        // white panel rises over it
        .to(overlay, {yPercent: 0, duration: 0.75, ease: 'power4.inOut'}, 0)
        // destination name arrives out of its mask, from the centre outward
        .from(
          splitRef.current.chars,
          {
            yPercent: 110,
            duration: 0.55,
            stagger: {each: 0.018, from: 'center'},
            ease: 'expo.inOut',
          },
          0.34,
        )
    },
    [router],
  )

  const takeFlip = useCallback<TransitionContextValue['takeFlip']>((slug) => {
    const pending = flipRef.current
    if (pending && pending.slug === slug) {
      flipRef.current = null
      return pending
    }
    return null
  }, [])

  const isTransitioning = useCallback(() => busyRef.current, [])

  // Enter animation + scroll/trigger housekeeping on every route change (rule #8)
  useEffect(() => {
    const overlay = overlayRef.current

    if (failsafeRef.current !== null) {
      clearTimeout(failsafeRef.current)
      failsafeRef.current = null
    }

    ScrollSmoother.get()?.scrollTo(0, false)
    window.scrollTo(0, 0)
    // the incoming page inherits the outgoing one's dim/lift — clear it while
    // the curtain still covers everything (the new main is a fresh node, but
    // the persistent footer keeps the exit styles)
    gsap.set('#smooth-content > *', {y: 0, opacity: 1})

    // Measure only once the new page has painted.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()

        if (!overlay) return
        if (!coveredRef.current) {
          // Flip morph, popstate or an interrupted navigation — no curtain to
          // wait on, so release the entrance immediately rather than stalling
          // any timeline gated on it.
          if (busyRef.current) {
            gsap.killTweensOf(overlay)
            gsap.set(overlay, {autoAlpha: 0, yPercent: 100})
            busyRef.current = false
          }
          markPageRevealed()
          return
        }
        coveredRef.current = false

        const finish = () => {
          busyRef.current = false
          gsap.set(overlay, {autoAlpha: 0, yPercent: 100})
          splitRef.current?.revert()
          splitRef.current = null
          // Fallback: the timeline normally releases this a beat earlier, but
          // a killed/interrupted exit must never leave the entrance stranded.
          markPageRevealed()
        }

        if (isReduced()) {
          gsap.to(overlay, {autoAlpha: 0, duration: 0.25, delay: 0.1, onComplete: finish})
          return
        }

        // Panel carries the name up and off; the name runs slightly ahead of it
        // so it reads as travelling rather than riding along.
        const tl = gsap.timeline({delay: 0.08, onComplete: finish})
        // if (splitRef.current) {
        //   tl.to(
        //     splitRef.current.chars,
        //     {
        //       yPercent: -110,
        //       duration: 0.5,
        //       stagger: {each: 0.018, from: 'edges'},
        //       ease: 'expo.inOut',
        //     },
        //     0,
        //   )
        // }
        tl.to(overlay, {yPercent: -100, duration: EXIT_DURATION, ease: EXIT_EASE}, EXIT_START)
        // Entrance starts once the panel is 90% of the way off screen, so the
        // last of it clears over content that is already moving.
        tl.add(
          () => markPageRevealed(),
          EXIT_START + EXIT_DURATION * timeForTravel(EXIT_EASE, REVEAL_AT_TRAVEL),
        )
      }),
    )

    return () => cancelAnimationFrame(raf)
  }, [pathname])

  return (
    <TransitionContext.Provider value={{navigate, prefetch, takeFlip, isTransitioning}}>
      {children}
      {/* No inline transform here: GSAP drives the curtain with yPercent, and
          a CSS translateY(100%) would be parsed as a 900px pixel offset that
          every later yPercent write stacks on top of — parking the curtain
          permanently off-screen. autoAlpha covers the initial hidden state. */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 z-100 flex items-center justify-center bg-white px-5"
        style={{opacity: 0, visibility: 'hidden'}}
      >
        <span ref={labelRef} className="type-display-md block text-center text-ink" />
      </div>
    </TransitionContext.Provider>
  )
}
