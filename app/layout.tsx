import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from './theme-provider'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ClientLayout } from './client-layout'
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'PDF Kit - Convert Images to PDF',
  description: 'Free online tool to convert images to PDF with customizable options',
  keywords: 'pdf converter, image to pdf, online pdf tool, free pdf converter',
  authors: [{ name: 'PDF Kit Team' }],
  creator: 'PDF Kit',
  publisher: 'PDF Kit',
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
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SX6743LDN3"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SX6743LDN3');
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow">
              <ClientLayout>
                {children}
              </ClientLayout>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}