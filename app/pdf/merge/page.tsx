"use client"

import { useState } from "react"
import { PDFMerge } from "@/components/pdf/PDFMerge"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PDFMergePage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
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
        <h1 className="text-3xl font-bold">Merge PDFs</h1>
        <p className="text-muted-foreground">
          Combine multiple PDF documents into a single file
        </p>
      </div>

      <Card className="p-6">
        <PDFMerge files={files} setFiles={setFiles} />
      </Card>
    </div>
  )
}