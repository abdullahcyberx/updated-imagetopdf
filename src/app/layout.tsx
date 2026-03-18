import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: {
    default: 'Image to PDF Converter Online – Free JPG & PNG | imagetopdf.shehzada.tech',
    template: '%s | imagetopdf.shehzada.tech',
  },
  description: 'Convert JPG, PNG, BMP, GIF or any image to PDF online for free. Fast, secure, no installation required. Works on Windows, Mac, and mobile. No signup needed.',
  keywords: [
    'image to pdf online',
    'jpg to pdf converter',
    'png to pdf converter',
    'convert jpg to pdf online',
    'convert png to pdf free',
    'merge images into pdf online',
    'multiple images to pdf',
    'free image to pdf converter',
    'image to pdf without signup',
    'convert photos to pdf online',
    'image to pdf without watermark',
    'batch convert images to pdf online',
    'jpg png bmp gif to pdf online',
    'convert bmp to pdf online',
    'convert gif to pdf online',
    'online image to pdf converter free',
    'image to pdf converter no limit',
  ],
  authors: [{ name: 'Shehzada', url: 'https://imagetopdf.shehzada.tech' }],
  creator: 'Shehzada',
  publisher: 'Shehzada',
  metadataBase: new URL('https://imagetopdf.shehzada.tech'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Image to PDF Converter Online – Free JPG & PNG',
    description: 'Convert JPG, PNG, or any image to PDF online for free. Fast, secure, no installation required. Works on Windows, Mac, and mobile.',
    url: 'https://imagetopdf.shehzada.tech',
    siteName: 'ImageToPDF by Shehzada',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image to PDF Converter Online – Free JPG & PNG',
    description: 'Convert JPG, PNG, or any image to PDF online for free. Fast, secure, no installation required.',
    creator: '@shehzada',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-primary-black text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}