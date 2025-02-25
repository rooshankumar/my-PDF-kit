// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/Header'
import Footer from '@/components/footer'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}