import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from '../components/theme-toggle'
import { ThemeProvider } from 'next-themes'

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
      <head />
      <body className="min-h-screen bg-secondary-light dark:bg-dark-bg transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-200">
              <ThemeToggle />
              <main>
                {children}
              </main>
            </div>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'