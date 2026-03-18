import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'ImageToPDF - Professional Image to PDF Conversion Tools',
  description: 'Convert your images to PDF format instantly with our powerful, easy-to-use tool. Perfect for professionals and teams.',
  keywords: 'image to pdf, pdf converter, image converter, professional tools',
  authors: [{ name: 'ImageToPDF' }],
  openGraph: {
    title: 'ImageToPDF - Professional Image to PDF Conversion Tools',
    description: 'Convert your images to PDF format instantly with our powerful, easy-to-use tool.',
    type: 'website',
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