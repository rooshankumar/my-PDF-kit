"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackToHomeButton({ useRouterNavigation = false }) {
  const router = useRouter()

  if (useRouterNavigation) {
    return (
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 -ml-2 rainbow-back-button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
    )
  }

  return (
    <div className="mb-6">
      <Link href="/">
        <Button variant="outline" className="rainbow-back-button">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
