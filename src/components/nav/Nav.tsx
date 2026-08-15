'use client'
import {useCallback, useEffect, useRef, useState} from 'react'
import {usePathname} from 'next/navigation'
import {gsap, useGSAP, ScrollTrigger} from '@/src/lib/gsap'
import {site} from '@/src/data/site'
import {TransitionLink} from '@/src/components/transition/TransitionLink'

const NAV_H = 72 // px — the band the inversion rig clips against

const links = [
  {label: 'Design', href: '/works'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
] as const

/** One full copy of the nav bar. Rendered twice for the inversion rig (§6). */
function NavRow({
  chalk,
  onBurger,
  interactive,
}: {
  chalk?: boolean
  onBurger?: () => void
  interactive: boolean
}) {
  return (
    <div
      className={`flex h-full items-center justify-between px-5 md:px-8 ${
        chalk ? 'text-chalk' : 'text-ink'
      }`}
      aria-hidden={!interactive}
    >
      <TransitionLink
        href="/"
        className="text-2xl font-semibold tracking-tight font-(family-name:--font-display)"
        tabIndex={interactive ? 0 : -1}
      >
        Maren&nbsp;Voss<span className="text-wash">.</span>
      </TransitionLink>
      <div className="hidden items-center gap-8 text-lg font-bold md:flex">
        {links.map((l) => (
          <TransitionLink key={l.href} href={l.href} tabIndex={interactive ? 0 : -1}>
            {l.label}
          </TransitionLink>
        ))}
        <a
          href={site.calendly}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={interactive ? 0 : -1}
        >
          Let&apos;s talk ↗
        </a>
      </div>
      <button
        type="button"
        onClick={onBurger}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        aria-label="Open menu"
        tabIndex={interactive ? 0 : -1}
      >
        <span className="block h-0.5 w-6 bg-current" />
        <span className="block h-0.5 w-6 bg-current" />
      </button>
    </div>
  )
}

export function Nav() {
  const rootRef = useRef<HTMLElement>(null)
  const chalkRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLButtonElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Inversion rig: recompute the chalk copy's clip every scroll tick from the
  // actual [data-nav-dark] section boundaries. Clip-path driven — no
  // toggleClass, no CSS transition, no flicker at speed (§6 spec).
  useGSAP(
    () => {
      const chalk = chalkRef.current
      if (!chalk) return

      const update = () => {
        const sections = document.querySelectorAll<HTMLElement>('[data-nav-dark]')
        let top = Infinity
        let bottom = -Infinity
        sections.forEach((s) => {
          const r = s.getBoundingClientRect()
          const a = Math.max(0, r.top)
          const b = Math.min(NAV_H, r.bottom)
          if (b > a) {
            top = Math.min(top, a)
            bottom = Math.max(bottom, b)
          }
        })
        if (bottom <= top) {
          chalk.style.clipPath = 'inset(100% 0 0 0)'
        } else {
          chalk.style.clipPath = `inset(${top}px 0 ${NAV_H - bottom}px 0)`
        }
      }

      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: update,
        onRefresh: update,
      })
      update()
      return () => st.kill()
    },
    {scope: rootRef, dependencies: [pathname]},
  )

  // Full-screen menu: circular clip-path expanding from the burger's coordinates
  const {contextSafe} = useGSAP({scope: rootRef})

  const openMenu = contextSafe(() => {
    setMenuOpen(true)
    const menu = menuRef.current
    const burger = burgerRef.current ?? rootRef.current
    if (!menu || !burger) return
    const r = burger.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const radius = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy),
    )
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.set(menu, {display: 'flex'})
    if (reduced) {
      gsap.fromTo(menu, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.2})
      return
    }
    const tl = gsap.timeline()
    tl.fromTo(
      menu,
      {clipPath: `circle(0px at ${cx}px ${cy}px)`, autoAlpha: 1},
      {clipPath: `circle(${radius}px at ${cx}px ${cy}px)`, duration: 0.7, ease: 'expo.inOut'},
    ).from(
      menu.querySelectorAll('[data-menu-link]'),
      {yPercent: 120, stagger: 0.06, duration: 0.6, ease: 'expo.out'},
      '-=0.25',
    )
  })

  const closeMenu = contextSafe(() => {
    const menu = menuRef.current
    if (!menu) {
      setMenuOpen(false)
      return
    }
    gsap.to(menu, {
      autoAlpha: 0,
      duration: 0.25,
      onComplete: () => {
        gsap.set(menu, {display: 'none', clearProps: 'clipPath,opacity,visibility'})
        setMenuOpen(false)
      },
    })
  })

  // Close on Esc + rudimentary focus trap while open
  useEffect(() => {
    if (!menuOpen) return
    const menu = menuRef.current
    const focusables = menu?.querySelectorAll<HTMLElement>('a, button')
    focusables?.[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
      if (e.key === 'Tab' && focusables && focusables.length > 0) {
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, closeMenu])

  // Close the menu whenever the route changes
  useEffect(() => {
    if (menuRef.current) {
      gsap.set(menuRef.current, {display: 'none'})
    }
    setMenuOpen(false)
  }, [pathname])

  const setBurgerRef = useCallback((el: HTMLButtonElement | null) => {
    burgerRef.current = el
  }, [])

  return (
    <header ref={rootRef} className="fixed inset-x-0 top-0 z-50" style={{height: NAV_H}}>
      {/* Ink copy — the interactive one */}
      <div className="absolute inset-0">
        <NavRow interactive onBurger={openMenu} />
      </div>
      {/* Chalk copy — clipped to dark sections, purely visual */}
      <div
        ref={chalkRef}
        className="pointer-events-none absolute inset-0"
        style={{clipPath: 'inset(100% 0 0 0)'}}
      >
        <NavRow chalk interactive={false} />
      </div>
      {/* invisible burger position anchor for the circular expand */}
      <button
        ref={setBurgerRef}
        type="button"
        className="pointer-events-none absolute top-4 right-5 h-10 w-10 opacity-0 md:hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Full-screen menu */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-0 z-60 hidden flex-col justify-center gap-2 bg-ink px-8 text-chalk"
        style={{display: 'none'}}
      >
        <button
          type="button"
          onClick={closeMenu}
          className="type-mono absolute top-6 right-6 p-2"
          aria-label="Close menu"
        >
          Close ✕
        </button>
        {links.map((l) => (
          <TransitionLink key={l.href} href={l.href} onClick={() => closeMenu()}>
            <span className="roll-mask">
              <span data-menu-link className="type-display-md block">
                {l.label}
              </span>
            </span>
          </TransitionLink>
        ))}
        <a href={site.calendly} target="_blank" rel="noopener noreferrer">
          <span className="roll-mask">
            <span data-menu-link className="type-display-md block text-chalk/60">
              Let&apos;s talk ↗
            </span>
          </span>
        </a>
      </div>
    </header>
  )
}
