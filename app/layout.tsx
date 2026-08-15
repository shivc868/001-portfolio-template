import type {Metadata} from 'next'
import {Archivo, IBM_Plex_Mono, Great_Vibes} from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import {site} from '@/src/data/site'
import {TransitionProvider} from '@/src/components/transition/TransitionProvider'
import {Nav} from '@/src/components/nav/Nav'
import {Preloader} from '@/src/components/Preloader'
import {SmoothScroller} from '@/src/components/SmoothScroller'
import {Footer} from '@/src/components/Footer'

// Clash Display is a Fontshare face (not on Google Fonts) — self-hosted
const clashDisplay = localFont({
  variable: '--font-clash-display',
  src: [
    {path: '../src/fonts/ClashDisplay-400.woff2', weight: '400'},
    {path: '../src/fonts/ClashDisplay-500.woff2', weight: '500'},
    {path: '../src/fonts/ClashDisplay-600.woff2', weight: '600'},
    {path: '../src/fonts/ClashDisplay-700.woff2', weight: '700'},
  ],
})

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
})

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
})

// The hero signature — a single-weight script face, used in exactly one place
const greatVibes = Great_Vibes({
  variable: '--font-signature',
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://akansha.example'),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    images: ['/media/halbtags-poster.jpg'],
  },
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${archivo.variable} ${plexMono.variable} ${greatVibes.variable} antialiased`}
    >
      <body>
        <TransitionProvider>
          {/* Fixed elements live OUTSIDE #smooth-wrapper — rule #6 */}
          <Preloader />
          <Nav />
          <SmoothScroller>
            {children}
            <Footer />
          </SmoothScroller>
        </TransitionProvider>
      </body>
    </html>
  )
}
