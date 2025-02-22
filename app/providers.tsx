"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/Header"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Header />
        <main>{children}</main>
      </ThemeProvider>
    </>
  )
}