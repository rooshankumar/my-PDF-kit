
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { PDFToImages } from "@/components/pdf/PDFToImages"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"
import { FileWithPreview } from "@/types/files"

export default function PDFToImagesPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton />

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Convert PDF to Images</h1>
        <p className="text-muted-foreground">
          Extract and convert PDF pages to high-quality JPG images
        </p>
      </div>

      <Card className="p-6">
        <PDFToImages files={files} setFiles={setFiles} />
      </Card>
    </div>
  )
}
