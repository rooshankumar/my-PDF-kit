
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navigation({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <Link
        href="/tools/pdf"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/tools/pdf"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        PDF Tools
      </Link>
      <Link
        href="/tools/image"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/tools/image"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Image Tools
      </Link>
    </nav>
  )
}
