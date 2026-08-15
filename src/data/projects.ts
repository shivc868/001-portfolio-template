export type Project = {
  slug: string;
  title: string;
  client: string;
  year: number;
  services: string[];
  /** One-line summary shown on index rows and cards. */
  summary: string;
  /** Longer case-study paragraphs for the detail page. */
  description: string[];
  poster: string;
  video: string;
  images: string[];
};

export const projects: Project[] = [
  {
    slug: "halbtags",
    title: "Halbtags",
    client: "Halbtags Journal",
    year: 2026,
    services: ["Art Direction", "Editorial Design", "Photography"],
    summary:
      "A quarterly print journal about working less. Identity, grid system and cover photography for the first four issues.",
    description: [
      "Halbtags is a Berlin print quarterly about the four-day week, slow careers and what people do with the hours they win back. The publishers wanted something that felt closer to a workwear catalogue than a think-piece magazine.",
      "We built the identity around a compressed masthead and a strict two-column grid that the photography is allowed to break. Covers are shot on location with available light — no studio, no retouching beyond the duotone pass that ties every issue to its seasonal colour.",
      "The first issue sold through its 4,000-copy run in six weeks and the masthead now anchors the journal's events series and podcast artwork.",
    ],
    poster: "/media/halbtags-vibrant-main.jpg",
    video: "/media/halbtags.mp4",
    images: ["/media/halbtags-vibrant-bg.jpg", "/media/halbtags-02.jpg"],
  },
  {
    slug: "nordwand",
    title: "Nordwand",
    client: "Nordwand Apparel",
    year: 2025,
    services: ["Campaign", "Photography", "Motion"],
    summary:
      "Autumn campaign for a Munich alpine apparel label — shot over nine days on the Zugspitze, cut into a 60-second hero film.",
    description: [
      "Nordwand makes technical shells for people who actually climb, and their previous campaigns looked like everyone else's: drone shots, summit poses, orange sunsets. The brief was to make weather the protagonist instead.",
      "We shot for nine days in deliberately bad conditions — fog, sleet, flat light — and let the garments' silhouettes carry the frame. The hero film cuts between 16mm and phone footage from the climbing team's own archive.",
      "The campaign ran out-of-home in Munich and Innsbruck and doubled the label's direct sales quarter over quarter.",
    ],
    poster: "/media/nordwand-vibrant-main.jpg",
    video: "/media/nordwand.mp4",
    images: ["/media/nordwand-vibrant-bg.jpg", "/media/nordwand-02.jpg"],
  },
  {
    slug: "studio-brut",
    title: "Studio Brut",
    client: "Studio Brut",
    year: 2025,
    services: ["Brand Identity", "Web Design"],
    summary:
      "Identity and web presence for a furniture workshop casting concrete and aluminium in a former Lichtenberg substation.",
    description: [
      "Studio Brut's founders are two structural engineers who started casting furniture because they were bored of bridges. The work is heavy, exact and completely unornamented — the identity had to be the same.",
      "The wordmark is set in a single weight with no logo beyond it. Product photography treats each piece like a civil-engineering document: elevation, section, detail, always against the same grey.",
      "The site is one page per object with the object's full pour documentation. Nothing animates except the numbers.",
    ],
    poster: "/media/studio-brut-vibrant-main.jpg",
    video: "/media/studio-brut.mp4",
    images: ["/media/studio-brut-vibrant-bg.jpg", "/media/studio-brut-02.jpg"],
  },
  {
    slug: "kassette",
    title: "Kassette",
    client: "Kassette Records",
    year: 2024,
    services: ["Art Direction", "Packaging", "Motion"],
    summary:
      "Sleeve system and release visuals for an electronic label pressing thirty records a year across three sub-imprints.",
    description: [
      "Kassette releases too much music for bespoke covers, so we designed a generative sleeve system instead: one typographic grid, three imprint colours, and a waveform-driven pattern engine the label runs themselves.",
      "Every release gets a unique cover no designer touched, but the shelf reads as one label. The pattern engine also renders the loop visuals the label uses for streaming and club projections.",
      "Three years in, the system has produced ninety-four covers and survived two imprint launches without a redesign.",
    ],
    poster: "/media/kassette-poster.jpg",
    video: "/media/kassette.mp4",
    images: ["/media/kassette-01.jpg", "/media/kassette-02.jpg"],
  },
  {
    slug: "feldweg",
    title: "Feldweg",
    client: "Feldweg Reisen",
    year: 2024,
    services: ["Brand Identity", "Editorial Design", "Photography"],
    summary:
      "Rebrand for a slow-travel operator running walking routes between small-town guesthouses in Brandenburg and Saxony.",
    description: [
      "Feldweg books walking holidays nobody would call spectacular — flat fields, pine forests, lakes you've never heard of. The old brand apologised for that with stock-photo mountains. The new one commits to it.",
      "We photographed the actual routes in the flattest possible light and set the identity in a warm grotesque with hand-drawn route markers. Every guidebook spread pairs a full-bleed field with a single line of walking notes.",
      "Bookings from travellers under forty tripled in the first season after launch.",
    ],
    poster: "/media/feldweg-vibrant-main.jpg",
    video: "/media/feldweg.mp4",
    images: ["/media/feldweg-vibrant-bg.jpg", "/media/feldweg-02.jpg"],
  },
  {
    slug: "anthrazit",
    title: "Anthrazit",
    client: "Verlag Neue Masse",
    year: 2023,
    services: ["Editorial Design", "Photography"],
    summary:
      "A 320-page monograph on post-war concrete housing estates, photographed across two winters in six German cities.",
    description: [
      "Anthrazit documents the Großwohnsiedlungen — the concrete estates everyone photographs as ruins — as places where people actually live. Two winters, six cities, one lens, no people asked to pose.",
      "The book runs photography full-bleed with captions banished to a sewn-in appendix, so the estates get the uninterrupted spreads architecture monographs usually reserve for museums.",
      "It went to a second printing in four months and the series was acquired by the Museum für Fotografie for its permanent collection.",
    ],
    poster: "/media/anthrazit-poster.jpg",
    video: "/media/anthrazit.mp4",
    images: ["/media/anthrazit-01.jpg", "/media/anthrazit-02.jpg"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function nextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
