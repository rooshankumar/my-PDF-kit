"use client"

import { useState } from "react"
import { ImageCompress } from "@/components/image/ImageCompress"
import { ImageToPDF } from "@/components/image/ImageToPDF"
import { FileWithPreview } from "@/types/files"
import { ToolLayout } from "@/components/shared/ToolLayout"
import { ImageIcon } from "lucide-react"
import { DragDropFile } from "@/components/DragDropFile"
import { useRouter, useSearchParams } from "next/navigation"


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
    <ToolLayout
      title="Image Tools"
      description="Transform and optimize your images with ease"
      icon={<ImageIcon className="w-8 h-8 text-primary" />}
    >
      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">{titles[tool as keyof typeof titles].title}</h1>
        <p className="text-muted-foreground">
          {titles[tool as keyof typeof titles].description}
        </p>
      </div>
      <DragDropFile acceptedTypes="image/*" files={files} setFiles={setFiles} />
        {tool === 'compress' ? (
          <ImageCompress files={files} setFiles={setFiles} />
        ) : (
          <ImageToPDF files={files} setFiles={setFiles} />
        )}

    </ToolLayout>
  )
}