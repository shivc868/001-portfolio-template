'use client'
import {useEffect, useRef, useState} from 'react'
import {gsap, useGSAP, ScrollSmoother, SplitText} from '@/src/lib/gsap'
import {site} from '@/src/data/site'
import {onPageReveal} from '@/src/lib/loadGate'
import {HeroConfetti} from '@/src/components/HeroConfetti'

/** Hero chips — what a sender actually wants to know, same figure as the about hero. */
const HERO_TAGS = [site.location.split(',')[0], 'Replies in 2 days', 'Booking from Q3'] as const

/** Live local-time clock in monospace (§6 contact spec). */
function LocalClock() {
  const [time, setTime] = useState('--:--:--')
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Kolkata',
        }).format(new Date()),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="type-mono" suppressHydrationWarning>
      Bengaluru — {time} IST
    </span>
  )
}

function Field({
  label,
  name,
  as = 'input',
}: {
  label: string
  name: string
  as?: 'input' | 'textarea'
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const {contextSafe} = useGSAP({scope: wrapRef})

  // Focus draws a wash underline via clip-path inset
  const onFocus = contextSafe(() => {
    gsap.to(wrapRef.current?.querySelector('[data-underline]') ?? null, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.45,
      ease: 'expo.out',
    })
  })
  const onBlur = contextSafe(() => {
    gsap.to(wrapRef.current?.querySelector('[data-underline]') ?? null, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.35,
      ease: 'expo.in',
    })
  })

  const shared = {
    id: name,
    name,
    onFocus,
    onBlur,
    className:
      'w-full bg-transparent py-3 text-lg font-bold outline-none placeholder:text-ink/35',
    placeholder: label,
  } as const

  return (
    <div ref={wrapRef} className="relative border-b border-ink/25">
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea rows={4} {...shared} />
      ) : (
        <input type={name === 'email' ? 'email' : 'text'} {...shared} />
      )}
      <span
        data-underline
        aria-hidden="true"
        className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-wash"
        style={{clipPath: 'inset(0 100% 0 0)'}}
      />
    </div>
  )
}

export function ContactContent() {
  const rootRef = useRef<HTMLElement>(null)
  const [sent, setSent] = useState(false)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const splits: SplitText[] = []

        // Hidden synchronously — useGSAP runs in a layout effect, so this lands
        // before the first paint. Hiding any later paints the text in place
        // first and the entrance then reads as a blink.
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

        // Copy below the fold rises out of line masks as it enters
        const reveals = root.querySelectorAll<HTMLElement>('[data-reveal]')
        gsap.set(reveals, {autoAlpha: 0})
        document.fonts.ready.then(() => {
          if (!rootRef.current) return
          reveals.forEach((el) => {
            const split = SplitText.create(el, {type: 'lines', mask: 'lines'})
            splits.push(split)
            // text-indent is inherited, so every line box SplitText makes picks
            // up the statement's first-line indent. The breaks were already
            // measured with it — only line one should keep it.
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

        // Links, the form and other interactive blocks can't be line-split
        // without SplitText rebuilding their markup, so they simply rise.
        const rises = gsap.utils.toArray<HTMLElement>('[data-rise]', root)
        const riseTweens = rises.map((el) =>
          gsap.from(el, {
            autoAlpha: 0,
            y: 24,
            duration: 0.9,
            ease: 'expo.out',
            scrollTrigger: {trigger: el, start: 'top 90%'},
          }),
        )

        return () => {
          offReveal()
          fx.forEach((t) => t.kill())
          splits.forEach((s) => s.revert())
          riseTweens.forEach((t) => t.kill())
        }
      })

      return () => mm.revert()
    },
    {scope: rootRef},
  )

  return (
    <main ref={rootRef} className="min-h-svh bg-white">
      {/* Full-viewport hero — the same black-on-black band the about, home and
          works heroes use. [data-nav-dark] drives the nav's inversion. */}
      <header
        data-nav-dark
        className="relative flex min-h-svh flex-col justify-between overflow-hidden bg-linear-to-b from-[#212124] via-[#141416] to-ink px-5 pt-32 pb-14 text-chalk md:px-10"
      >
        <HeroConfetti />

        {/* flex-1 + justify-center: equal air above and below the pair. */}
        <h1 className="flex flex-1 flex-col justify-center py-6">
          {/* The `!` is load-bearing: .type-display carries its own line-height
              and wins the cascade over a plain leading utility. The 6vw insets
              pull the two lines toward each other, and pr-[0.12em] pays back
              the tracking the last glyph gives away — without it the line mask
              crops the final letter. */}
          {/* leading-[1.06], not the sub-1 the display face usually wants:
              Clash's content box is 1.14em (89/25 ascent/descent per 100px)
              and the lines reveal out of SplitText masks, so a short line box
              clips every descender — the g in "shipping", the y in "years".
              The negative margin-bottom gives back the 0.28em the taller line
              box adds, keeping the pair as tight as it looks at 0.78. */}
          <span
            data-hero-line
            className="type-display mr-[6vw] block pr-[0.12em] text-right leading-[1.06]! -mb-[0.28em]"
          >
            let&apos;s make
          </span>
          <span className="flex flex-wrap items-end gap-x-8 gap-y-3">
            {/* shrink-0: as a flex child this line would otherwise give up
                width to the chips beside it, and the mask then clips it. */}
            <span
              data-hero-line
              className="type-display ml-[6vw] block shrink-0 pr-[0.12em] leading-[1.06]!"
            >
              something
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

        <div className="flex flex-wrap items-end justify-between gap-4">
          <span data-hero-fade className="opacity-70">
            <LocalClock />
          </span>
          <p data-hero-fade className="max-w-sm text-right text-lg opacity-70">
            {site.name} — {site.role}, {site.location}.
          </p>
        </div>
      </header>

      {/* Flat white below the band, matching the about page */}
      <section className="relative bg-white px-5 pt-24 pb-28 text-ink md:px-10">
        <HeroConfetti />

        <div className="relative">
          {/* The first line steps in from the left — that indent is what makes
              the block read as a spoken opening, not a paragraph. */}
          <p
            data-reveal
            className="max-w-[16em] text-[clamp(1.9rem,4vw,3.6rem)] leading-[1.14] font-semibold tracking-[-0.04em] indent-[26%]"
          >
            a build, a collaboration or just a good technical question — write, or book twenty
            minutes directly.
          </p>

          <div className="mt-20 grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p data-reveal className="max-w-xs text-lg leading-relaxed opacity-70">
                replies within two working days, usually faster.
              </p>

              <div data-rise className="mt-8 space-y-6">
                <p>
                  <a
                    href={`mailto:${site.email}`}
                    className="decoration-wash text-xl font-bold underline decoration-2 underline-offset-4"
                  >
                    {site.email}
                  </a>
                </p>
                <p>
                  <a
                    href={site.calendly}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="type-mono inline-block rounded-full border border-ink px-6 py-3 transition-colors duration-300 hover:bg-ink hover:text-chalk"
                  >
                    Book a call ↗
                  </a>
                </p>
              </div>

              <ul data-rise className="type-mono mt-10 space-y-2.5 opacity-60">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity duration-200 hover:opacity-100"
                    >
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <form
              data-rise
              className="space-y-8 md:col-span-7 md:col-start-6"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <Field label="Your name" name="name" />
              <Field label="Email" name="email" />
              <Field label="What are we building?" name="message" as="textarea" />
              <button
                type="submit"
                className="type-mono rounded-full bg-ink px-8 py-4 text-chalk transition-opacity duration-200 hover:opacity-80"
              >
                {sent ? 'Sent — talk soon ✓' : 'Send it →'}
              </button>
              {sent && (
                <p className="type-mono text-wash" role="status">
                  Placeholder form — wire it to your provider of choice.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
