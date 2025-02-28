
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function BackToHomeButton() {
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
