/**
 * Colour confetti scattered behind a hero — the only saturated thing on an
 * otherwise black-on-black page, and the treatment the home and works heroes
 * share so the two read as one system.
 *
 * Positions are fixed, not random: a random pass would differ between the
 * server and client render and hydrate mismatched.
 *
 * The squares mount hidden — each hero's own timeline fades `[data-confetti]`
 * in once its page reveal fires.
 */
const CONFETTI = [
  {x: '4%', y: '22%', c: '#2f6df6'},
  {x: '26%', y: '84%', c: '#ef7d2e'},
  {x: '31%', y: '6%', c: '#ef6ea8'},
  {x: '45%', y: '52%', c: '#a077e8'},
  {x: '62%', y: '72%', c: '#63bd4c'},
  {x: '74%', y: '40%', c: '#e8d07a'},
  {x: '86%', y: '72%', c: '#e04b3c'},
  {x: '96%', y: '8%', c: '#8fc5e8'},
] as const

export function HeroConfetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {CONFETTI.map((s) => (
        <span
          key={s.c + s.x}
          data-confetti
          className="absolute block h-2.5 w-2.5"
          style={{left: s.x, top: s.y, background: s.c}}
        />
      ))}
    </div>
  )
}
