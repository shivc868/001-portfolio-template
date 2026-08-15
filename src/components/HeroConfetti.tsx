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
/** The confetti palette, also reused for the hero arch's word strips. */
export const CONFETTI_COLORS = [
  '#2f6df6',
  '#ef7d2e',
  '#ef6ea8',
  '#a077e8',
  '#63bd4c',
  '#e8d07a',
  '#e04b3c',
  '#8fc5e8',
] as const

const CONFETTI = [
  {x: '4%', y: '22%', c: CONFETTI_COLORS[0]},
  {x: '26%', y: '84%', c: CONFETTI_COLORS[1]},
  {x: '31%', y: '6%', c: CONFETTI_COLORS[2]},
  {x: '45%', y: '52%', c: CONFETTI_COLORS[3]},
  {x: '62%', y: '72%', c: CONFETTI_COLORS[4]},
  {x: '74%', y: '40%', c: CONFETTI_COLORS[5]},
  {x: '86%', y: '72%', c: CONFETTI_COLORS[6]},
  {x: '96%', y: '8%', c: CONFETTI_COLORS[7]},
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
