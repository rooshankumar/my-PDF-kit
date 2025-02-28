// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import '@/app/globals.css'
import { Providers } from "./providers"
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/footer'


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'My PDF Kit - All-in-One PDF and Image Tools',
  description: 'Convert, compress, and manage your PDFs and images with our powerful, easy-to-use tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}