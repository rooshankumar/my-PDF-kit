"use client"

import { useState } from "react"
import { ImageCompress } from "@/components/image/ImageCompress"
import { ImageToPDF } from "@/components/image/ImageToPDF"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"

export default function ImageToolsPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const tool = searchParams.get('tool') || 'compress'

  const titles = {
    compress: {
      title: "Compress Image",
      description: "Reduce file size while maintaining quality"
    },
    'to-pdf': {
      title: "JPG to PDF",
      description: "Convert images to PDF format"
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton />

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">{titles[tool as keyof typeof titles].title}</h1>
        <p className="text-muted-foreground">
          {titles[tool as keyof typeof titles].description}
        </p>
      </div>

      <Card className="p-6">
        {tool === 'compress' ? (
          <ImageCompress files={files} setFiles={setFiles} />
        ) : (
          <ImageToPDF files={files} setFiles={setFiles} />
        )}
      </Card>
    </div>
  )
}
