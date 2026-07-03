import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400', '500', '600', '700', '800'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://icchai2026.org'),
  icons: {
    icon: '/images/emoticonimg.png',
    shortcut: '/images/emoticonimg.png',
    apple: '/images/emoticonimg.png',
  },
  title: 'ICCHAI 2026 — International Conference on Contemplative HealthTech and AI',
  description: 'International Conference on Contemplative HealthTech and AI. October 22–23, 2026 | Hybrid — In-person at IIT Delhi & Online Worldwide',
  keywords: 'yoga, meditation, mindfulness, AI, contemplative healthtech, neuroscience, biofeedback, HRV, contemplative science',
  openGraph: {
    title: 'ICCHAI 2026 — International Conference on Contemplative HealthTech and AI',
    description: 'International Conference on Contemplative HealthTech and AI.',
    type: 'website',
    images: [{ url: '/images/og-image.svg', width: 1200, height: 630, alt: 'ICCHAI 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ICCHAI 2026 — International Conference on Contemplative HealthTech and AI',
    description: 'International Conference on Contemplative HealthTech and AI.',
    images: ['/images/og-image.svg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
