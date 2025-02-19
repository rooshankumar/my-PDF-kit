import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from '../components/theme-toggle'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Universal Document Converter",
  description: "Convert images to PDF and PDF to images with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>
          <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-200">
            <ThemeToggle />
            <main>
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

import './globals.css'