"use client"

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { Progress } from '@/components/ui/progress'
import { usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">{children}</main>
    </div>
  )
}
