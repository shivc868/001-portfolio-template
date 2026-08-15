export const site = {
  name: 'Akansha S',
  /** The one deliberate typographic quirk — used in exactly one place (footer signature). */
  quirkName: 'akanSha.s',
  role: 'Creative Developer',
  location: 'Bengaluru, India',
  email: 'hello@akansha.example',
  calendly: 'https://calendly.com',
  tagline: 'Creative development for brands that want the web to feel built, not assembled.',
  services: ['WebGL', 'Motion', 'Front-end', 'Design systems'],
  /** The same practice broken out — the about page's hover-expanding list. */
  serviceDetail: [
    {
      name: 'Creative front-end',
      items: ['React & Next.js builds', 'Design-to-code translation', 'Accessibility & semantics'],
    },
    {
      name: 'Motion & interaction',
      items: ['GSAP timelines & scroll', 'Page transitions', 'Micro-interaction systems'],
    },
    {
      name: 'WebGL & shaders',
      items: ['Three.js scenes', 'GLSL shader work', 'Particle & fluid systems'],
    },
    {
      name: 'Performance',
      items: ['Core Web Vitals audits', 'Render & bundle profiling', 'Animation frame budgets'],
    },
    {
      name: 'Design systems',
      items: ['Component libraries', 'Token & theming setup', 'Docs & handover'],
    },
  ],
  socials: [
    {label: 'GitHub', href: 'https://github.com'},
    {label: 'X', href: 'https://x.com'},
    {label: 'CodePen', href: 'https://codepen.io'},
    {label: 'LinkedIn', href: 'https://linkedin.com'},
  ],
  /** Selected clients — the case-study clients plus the work that never became one.
   *  `image` is the frame that wipes in on hover in the clients wall. */
  clients: [
    {name: 'Halcyon Type', image: '/media/halbtags-vibrant-main.jpg'},
    {name: 'Northface Labs', image: '/media/nordwand-vibrant-main.jpg'},
    {name: 'Studio Brut', image: '/media/studio-brut-vibrant-main.jpg'},
    {name: 'Kassette Audio', image: '/media/kassette-poster.jpg'},
    {name: 'Fieldnote', image: '/media/feldweg-vibrant-main.jpg'},
    {name: 'Monolith Cloud', image: '/media/anthrazit-poster.jpg'},
    {name: 'Signal Health', image: '/media/photo-11.jpg'},
    {name: 'Aperture Books', image: '/media/photo-09.jpg'},
    {name: 'Terrace Festival', image: '/media/photo-10.jpg'},
    {name: 'Basecamp Gear', image: '/media/photo-07.jpg'},
  ],
  /** Awards and honours, newest first. Keep the count in sync with the awards stat. */
  recognition: [
    {org: 'Awwwards', detail: 'Site of the Day', work: 'Halcyon', year: 2026},
    {org: 'CSS Design Awards', detail: 'Website of the Day', work: 'Kassette', year: 2026},
    {org: 'Awwwards', detail: 'Developer Award', work: 'Monolith', year: 2025},
    {org: 'The FWA', detail: 'FWA of the Day', work: 'Northface', year: 2025},
    {org: 'Awwwards', detail: 'Honourable Mention', work: 'Fieldnote', year: 2025},
    {org: 'GSAP Showcase', detail: 'Featured Build', work: 'Kassette', year: 2024},
    {org: 'CSS Design Awards', detail: 'Best Innovation', work: 'Studio Brut', year: 2024},
    {org: 'Awwwards', detail: 'Site of the Month, Nominee', work: 'Halcyon', year: 2024},
    {org: 'Webby Awards', detail: 'Nominee, Best Visual Design', work: 'Northface', year: 2023},
  ],
  /** Count-up figures. `value` is the number the counter lands on. */
  stats: [
    {value: 5, suffix: '', label: 'Years shipping'},
    {value: 30, suffix: '+', label: 'Sites in production'},
    {value: 9, suffix: '', label: 'Awards & honours'},
  ],
  /** Hero carousel states: word + cutout + wash hue move together. */
  heroStates: [
    {word: 'Akansha Sharma', cutout: '/media/akansha-sharma.png', wash: '#0B0B0C'},
    {word: 'WEBGL', cutout: '/media/hero-photo.jpg', wash: '#0E86B4'},
    {word: 'MOTION', cutout: '/media/hero-motion.jpg', wash: '#4A22C4'},
  ],
} as const

export type HeroState = (typeof site.heroStates)[number]
