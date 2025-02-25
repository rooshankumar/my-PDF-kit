
"use client"

import { Navigation } from '@/components/navigation'

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="container flex h-14 items-center">
          <Navigation />
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  )
}
