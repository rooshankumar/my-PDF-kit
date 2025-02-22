"use client"

import { useState } from "react"
import { PDFSplit } from "@/components/pdf/PDFSplit"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PDFSplitPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const router = useRouter()

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
        <h1 className="text-3xl font-bold">Split PDF</h1>
        <p className="text-muted-foreground">
          Extract pages or split PDF into multiple files
        </p>
      </div>

      <Card className="p-6">
        <PDFSplit files={files} setFiles={setFiles} />
      </Card>
    </div>
  )
}
