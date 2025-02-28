
"use client"

import { useState } from "react"
import { PDFToImages } from "@/components/pdf/PDFToImages"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton" // Added import

export default function PDFToImagesPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton />

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Convert PDF to Images</h1>
        <p className="text-muted-foreground">
          Extract images from PDF documents with high quality
        </p>
      </div>

      <Card className="p-6">
        <PDFToImages files={files} setFiles={setFiles} />
      </Card>
    </div>
  )
}
