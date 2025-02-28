"use client"

import { PDFToImages } from "@/components/pdf/PDFToImages"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PDFToImagesPage() {
  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 -ml-2 rainbow-back-button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Convert PDF to Images</h1>
        <p className="text-muted-foreground">
          Convert PDF pages into high-quality images
        </p>
      </div>

      <Card className="p-6">
        <PDFToImages />
      </Card>
    </div>
  )
}