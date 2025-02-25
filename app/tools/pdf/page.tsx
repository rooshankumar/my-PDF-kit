"use client"

import { useState } from "react"
import { PDFOperations } from "@/components/PDFOperations"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'


export default function PDFToolsPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const tool = searchParams.get('tool') || 'compress'

  const titles: Record<string, { title: string; description: string }> = {
    compress: {
      title: "Compress PDF",
      description: "Reduce file size while maintaining quality"
    },
    merge: {
      title: "Merge PDFs",
      description: "Combine multiple PDFs into one"
    },
    split: {
      title: "Split PDF",
      description: "Split PDF into multiple files"
    }
  }

  const currentTool = titles[tool] || titles.compress

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">{currentTool.title}</h1>
        <p className="text-muted-foreground">
          {currentTool.description}
        </p>
      </div>

      <Card className="p-6">
        <PDFOperations 
          files={files} 
          setFiles={setFiles} 
          mode={tool as 'compress' | 'merge' | 'split'} 
        />
      </Card>
    </div>
  )
}