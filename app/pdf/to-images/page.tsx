"use client"

import { PDFToImages } from "@/components/pdf/PDFToImages"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"


export default function PDFToImagesPage() {
  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton />

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