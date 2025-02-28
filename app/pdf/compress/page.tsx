"use client"

import { useState } from "react"
import { PDFCompress } from "@/components/pdf/PDFCompress"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"


export default function PDFCompressPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  //const router = useRouter() // This line is removed as it's not used

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton />

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
"use client"

import { useState } from "react"
import { PDFCompress } from "@/components/pdf/PDFCompress"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"

export default function PDFCompressPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton />

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
