import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'The Abyss - Shadow Self Journey',
  description: 'A profound psychological journey into the Jungian concept of the shadow archetype. Discover the hidden aspects of your psyche through deep introspective questions.',
  keywords: 'psychology, shadow self, Carl Jung, personality, self-discovery, shadow work, psychological assessment',
  authors: [{ name: 'Shadow Self App' }],
  robots: 'index, follow',
  openGraph: {
    title: 'The Abyss - Shadow Self Journey',
    description: 'Explore the hidden depths of your psyche through a transformative psychological journey.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Abyss - Shadow Self Journey',
    description: 'Explore the hidden depths of your psyche through a transformative psychological journey.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-black text-white antialiased">
        <div id="root">
          {children}
        </div>
        <div id="modal-root"></div>
        <Toaster />
      </body>
    </html>
  )
}