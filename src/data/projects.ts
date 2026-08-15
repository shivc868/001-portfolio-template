export type Project = {
  slug: string
  title: string
  client: string
  year: number
  services: string[]
  /** One-line summary shown on index rows and cards. */
  summary: string
  /** Longer case-study paragraphs for the detail page. */
  description: string[]
  poster: string
  video: string
  images: string[]
}

export const projects: Project[] = [
  {
    slug: 'halcyon',
    title: 'Halcyon',
    client: 'Halcyon Type',
    year: 2026,
    services: ['WebGL', 'Front-end', 'Motion'],
    summary:
      'A type foundry storefront where every specimen is live text rendered through a shader — no images, fully selectable.',
    description: [
      'Halcyon sells variable fonts, and their old specimen pages were flat PNGs: beautiful, unselectable, and impossible to keep in sync with the actual font files. The brief was to make the specimens real text again without losing the art direction.',
      'Every specimen renders as live DOM text with a WebGL layer sampling it as a texture, so the distortion, chromatic split and weight-axis morph all run on real glyphs. Screen readers get the plain text, search engines index it, and the shader degrades to static type when WebGL is unavailable.',
      'Draw calls are batched per specimen block and the render loop pauses on IntersectionObserver, so a page with fourteen live specimens still holds sixty frames on a four-year-old laptop.',
    ],
    poster: '/media/halbtags-vibrant-main.jpg',
    video: '/media/halbtags.mp4',
    images: ['/media/halbtags-vibrant-bg.jpg', '/media/halbtags-02.jpg'],
  },
  {
    slug: 'northface-labs',
    title: 'Northface',
    client: 'Northface Labs',
    year: 2025,
    services: ['WebGL', 'Motion', 'Performance'],
    summary:
      'Product launch site for an alpine hardware label — a scroll-driven terrain scene rendered from real elevation data.',
    description: [
      'Northface wanted the launch page to put you on the mountain rather than show you a photo of one. We built the hero as a Three.js terrain generated from public elevation tiles of the actual route their team tested on.',
      'Scroll drives a single GSAP timeline that moves the camera, shifts the fog density and swaps the shader between three weather states. The whole sequence is one scrubbed timeline, so scrubbing backwards is exactly as smooth as scrubbing forwards.',
      'The terrain mesh is decimated at four LOD levels and streamed as compressed binary, bringing the hero to 780KB total. Mobile drops to a pre-baked video and the timeline drives that instead.',
    ],
    poster: '/media/nordwand-vibrant-main.jpg',
    video: '/media/nordwand.mp4',
    images: ['/media/nordwand-vibrant-bg.jpg', '/media/nordwand-02.jpg'],
  },
  {
    slug: 'studio-brut',
    title: 'Studio Brut',
    client: 'Studio Brut',
    year: 2025,
    services: ['Front-end', 'Design systems'],
    summary:
      'Site and component library for a furniture workshop casting concrete and aluminium — heavy, exact, nothing decorative.',
    description: [
      "Studio Brut's founders are structural engineers who started casting furniture because they were bored of bridges. The work is heavy, exact and completely unornamented — the build had to be the same.",
      'One page per object, each rendered from the object\'s real pour documentation as structured data. The component library is eleven primitives and no variants; anything a page needs beyond that is a composition, not a new component.',
      'Nothing animates except the numbers. The whole site ships 34KB of JavaScript and scores 100 on every Lighthouse axis, which the founders liked considerably more than any animation would have.',
    ],
    poster: '/media/studio-brut-vibrant-main.jpg',
    video: '/media/studio-brut.mp4',
    images: ['/media/studio-brut-vibrant-bg.jpg', '/media/studio-brut-02.jpg'],
  },
  {
    slug: 'kassette',
    title: 'Kassette',
    client: 'Kassette Audio',
    year: 2024,
    services: ['WebGL', 'Motion', 'Front-end'],
    summary:
      'A label player where the artwork is generated from the audio itself — one shader, thirty releases, no designer in the loop.',
    description: [
      'Kassette releases too much music for bespoke cover art, so instead of covers we built a pattern engine: the label uploads a track, the Web Audio API analyses it, and a GLSL shader renders a cover unique to that waveform.',
      "The same engine drives the player's live visualiser and the loop videos the label uses for streaming and club projections — one shader, three output sizes, rendered to canvas and exported straight from the browser.",
      'Three years in it has produced ninety-four covers with no designer touching any of them, and the shelf still reads as one label.',
    ],
    poster: '/media/kassette-poster.jpg',
    video: '/media/kassette.mp4',
    images: ['/media/kassette-01.jpg', '/media/kassette-02.jpg'],
  },
  {
    slug: 'fieldnote',
    title: 'Fieldnote',
    client: 'Fieldnote',
    year: 2024,
    services: ['Front-end', 'Motion', 'Design systems'],
    summary:
      'A slow-travel booking flow rebuilt as one continuous page — no steps, no wizard, no losing your place.',
    description: [
      'Fieldnote books walking holidays through small-town guesthouses, and their old booking flow was a five-step wizard that lost 60% of people between steps two and three. The new one is a single page that never navigates.',
      'Every choice expands the next section in place using FLIP, so the page you started on is the page you finish on and your earlier answers stay visible above you. Browser back works, deep links work, and the whole state lives in the URL.',
      'Completion rate went from 38% to 71% in the first quarter, and support tickets asking "did my booking go through" stopped almost entirely.',
    ],
    poster: '/media/feldweg-vibrant-main.jpg',
    video: '/media/feldweg.mp4',
    images: ['/media/feldweg-vibrant-bg.jpg', '/media/feldweg-02.jpg'],
  },
  {
    slug: 'monolith',
    title: 'Monolith',
    client: 'Monolith Cloud',
    year: 2023,
    services: ['Front-end', 'Design systems', 'Performance'],
    summary:
      'Docs platform for an infrastructure company — 2,400 pages, instant search, and a build that finishes in under a minute.',
    description: [
      'Monolith had 2,400 documentation pages across six products and a docs build that took nineteen minutes, which meant nobody wanted to fix a typo. The rebuild treated build time as the primary design constraint.',
      'Content is MDX compiled at the route level with an incremental cache, and search runs entirely client-side against a 90KB prebuilt index — no search service, no network round trip, results as you type.',
      'Full builds now finish in 48 seconds and incremental ones in under three. Documentation contributions from engineers outside the docs team went up fourfold in six months.',
    ],
    poster: '/media/anthrazit-poster.jpg',
    video: '/media/anthrazit.mp4',
    images: ['/media/anthrazit-01.jpg', '/media/anthrazit-02.jpg'],
  },
]
