"use client"

import { useState } from "react"
import { ImageToPDF } from "@/components/image/ImageToPDF"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton" // Added import

export default function ImageToPDFPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  //const router = useRouter()  //Removed as not used

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton /> {/* Replaced Back button */}

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Convert Images to PDF</h1>
        <p className="text-muted-foreground">
          Convert multiple images into a single PDF document
        </p>
      </div>

      <Card className="p-6">
        <ImageToPDF files={files} setFiles={setFiles} />
      </Card>
    </div>
  )
} 

