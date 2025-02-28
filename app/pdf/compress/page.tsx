"use client"

import { useState } from "react"
import { PDFCompress } from "@/components/pdf/PDFCompress"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from 'next/link';


export default function PDFCompressPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Link href="/" className="mb-6 flex items-center gap-2 -ml-2 rainbow-back-button">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Compress PDF</h1>
        <p className="text-muted-foreground">
          Reduce PDF file size while maintaining quality
        </p>
      </div>

      <Card className="p-6">
        <PDFCompress files={files} setFiles={setFiles} />
      </Card>
    </div>
  )
}