import './globals.css'
import type { Metadata } from 'next'
import { Inter, Playfair_Display, Libre_Franklin } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const libreFranklin = Libre_Franklin({ subsets: ['latin'], variable: '--font-libre-franklin' })

export const metadata: Metadata = {
  title: {
    template: '%s - Parwell Farms',
    default: 'Parwell Farms',
  },
  description: 'Discover handcrafted soaps, lotions, salves, balms, and farm-fresh lavender products from Parwell Farms. Shop quality goods made with care.',
  keywords: 'parwell farms, lavender, farm products, handmade soap, lotion, salves, balms',
  icons: {
    icon: [
      { url: '/favicon.jpg', type: 'image/jpeg' },
      { url: '/icons/favicon.jpg', type: 'image/jpeg' },
    ],
    apple: '/favicon.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${libreFranklin.variable}`}>
      <body className="min-h-screen bg-farm-cream text-gray-900">
        <Providers>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

