// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { GA_TRACKING_ID } from '@/lib/analytics'
import SEO from '@/components/SEO' // Added import for SEO component

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://mypdfkit.netlify.com'),
  title: 'MyPDFKit - Free PDF Tools Online',
  description: 'Merge, split, compress, and edit PDFs online for free with MyPDFKit.',
  keywords: 'merge pdf, split pdf, pdf editor, compress pdf, pdf tools, online pdf converter',
  robots: 'index, follow',
  openGraph: {
    title: 'MyPDFKit - Free PDF Tools Online',
    description: 'Easily merge, split, and edit PDFs with MyPDFKit for free.',
    url: 'https://mypdfkit.netlify.app/',
    siteName: 'MyPDFKit',
    images: [
      {
        url: 'https://mypdfkit.netlify.app/preview.png',
        width: 1200,
        height: 630,
        alt: 'MyPDFKit - PDF Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyPDFKit - Free PDF Tools Online',
    description: 'Easily merge, split, and edit PDFs with MyPDFKit for free.',
    images: ['https://mypdfkit.netlify.app/preview.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  alternates: {
    canonical: 'https://mypdfkit.netlify.app',
  },
  authors: [{ name: 'Roshaan Kumar' }],
  creator: 'Roshaan Kumar',
  publisher: 'My PDF Kit',

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/pdf-folder-logo.svg" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SEO /> {/* Added SEO component */}
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <Analytics />
          <SpeedInsights />
          <GoogleAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}