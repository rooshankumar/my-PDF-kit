// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { GA_TRACKING_ID } from '@/lib/analytics'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  metadataBase: new URL('https://your-domain.com'),
  title: {
    default: 'My PDF Kit - Free Online PDF Tools',
    template: '%s | My PDF Kit'
  },
  description: 'Free online PDF tools to merge, split, compress, convert PDFs. Easy to use, no installation required.',
  keywords: 'pdf tools, pdf editor, merge pdf, split pdf, compress pdf, convert pdf, my pdf kit',
  authors: [{ name: 'Roshaan Kumar' }],
  creator: 'Roshaan Kumar',
  publisher: 'My PDF Kit',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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