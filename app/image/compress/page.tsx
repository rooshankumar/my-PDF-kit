
"use client"

import { useState } from "react"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"

export default function ImageCompressPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton />

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Compress Images</h1>
        <p className="text-muted-foreground">
          Reduce image file size while maintaining quality
        </p>
      </div>

      <Card className="p-6">
        {/* Replace with your image compression component */}
        <div className="p-4 text-center">
          <p>Image compression functionality will be implemented here</p>
        </div>
      </Card>
    </div>
  )
}
