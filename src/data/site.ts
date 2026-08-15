export const site = {
  name: 'Maren Voss',
  /** The one deliberate typographic quirk — used in exactly one place (footer signature). */
  quirkName: 'maren voSs',
  role: 'Art Director & Photographer',
  location: 'Berlin, Germany',
  email: 'studio@marenvoss.example',
  calendly: 'https://calendly.com/marenvoss/intro',
  tagline: 'Art direction and photography for brands that would rather be specific than loud.',
  services: ['Branding', 'Photography', 'Art Direction', 'Web design'],
  /** The same practice broken out — the about page's hover-expanding list. */
  serviceDetail: [
    {
      name: 'Brand strategy',
      items: ['Positioning & messaging', 'Brand voice & tone', 'Audience & competitor research'],
    },
    {
      name: 'Visual identity',
      items: ['Logotype & marks', 'Type & colour systems', 'Identity guidelines'],
    },
    {
      name: 'Art direction',
      items: ['Campaign concepts', 'Photography direction', 'Editorial layouts'],
    },
    {
      name: 'Photography',
      items: ['Studio & location shoots', 'Retouching & grading', 'Image libraries'],
    },
    {
      name: 'Web design',
      items: ['Design systems', 'Motion & interaction', 'Build handover'],
    },
  ],
  socials: [
    {label: 'Instagram', href: 'https://instagram.com'},
    {label: 'Behance', href: 'https://behance.net'},
    {label: 'Are.na', href: 'https://are.na'},
  ],
  /** Selected clients — the case-study clients plus the work that never became one.
   *  `image` is the frame that wipes in on hover in the clients wall. */
  clients: [
    {name: 'Halbtags Journal', image: '/media/halbtags-vibrant-main.jpg'},
    {name: 'Nordwand Apparel', image: '/media/nordwand-vibrant-main.jpg'},
    {name: 'Studio Brut', image: '/media/studio-brut-vibrant-main.jpg'},
    {name: 'Kassette Records', image: '/media/kassette-poster.jpg'},
    {name: 'Feldweg Reisen', image: '/media/feldweg-vibrant-main.jpg'},
    {name: 'Verlag Neue Masse', image: '/media/anthrazit-poster.jpg'},
    {name: 'Deutsche Oper Berlin', image: '/media/photo-11.jpg'},
    {name: 'Aufbau Verlag', image: '/media/photo-09.jpg'},
    {name: 'Kunsthalle Rostock', image: '/media/photo-10.jpg'},
    {name: 'Bergfreunde', image: '/media/photo-07.jpg'},
  ],
  /** Awards and honours, newest first. Keep the count in sync with the awards stat. */
  recognition: [
    {
      org: 'Art Directors Club Deutschland',
      detail: 'Bronze, Editorial',
      work: 'Halbtags',
      year: 2025,
    },
    {
      org: 'Type Directors Club',
      detail: 'Certificate of Typographic Excellence',
      work: 'Kassette',
      year: 2024,
    },
    {org: 'German Design Award', detail: 'Winner, Brand Identity', work: 'Studio Brut', year: 2024},
    {org: 'D&AD', detail: 'Wood Pencil, Campaign Photography', work: 'Nordwand', year: 2024},
    {org: 'European Design Awards', detail: 'Silver, Visual Identity', work: 'Feldweg', year: 2023},
    {
      org: 'Deutscher Fotobuchpreis',
      detail: 'Shortlist, Documentary',
      work: 'Anthrazit',
      year: 2023,
    },
    {org: 'Berliner Type', detail: 'Gold, Editorial Typography', work: 'Halbtags', year: 2022},
    {
      org: 'Deutscher Designer Club',
      detail: 'Nominee, Spatial & Print',
      work: 'Studio Brut',
      year: 2022,
    },
  ],
  /** Count-up figures. `value` is the number the counter lands on. */
  stats: [
    {value: 10, suffix: '', label: 'Years in practice'},
    {value: 40, suffix: '+', label: 'Projects delivered'},
    {value: 8, suffix: '', label: 'Awards & honours'},
  ],
  /** Hero carousel states: word + cutout + wash hue move together. */
  heroStates: [
    {word: 'Design', cutout: '/media/hero-design-2.jpg', wash: '#0B0B0C'},
    {word: 'PHOTO', cutout: '/media/hero-photo.jpg', wash: '#0E86B4'},
    {word: 'MOTION', cutout: '/media/hero-motion.jpg', wash: '#4A22C4'},
  ],
} as const

export type HeroState = (typeof site.heroStates)[number]
