import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from './theme-provider'
import { ClientLayout } from './client-layout'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Image to PDF Converter',
  description: 'Convert your images to PDF files easily with our free online tool.',
  keywords: 'image to pdf, pdf converter, image converter, online pdf tool',
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Name',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
        <meta name="google-adsense-account" content="ca-pub-4504451013594034" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <GoogleAnalytics />
        <ThemeProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}