"use client"

import { useState } from "react"
import { PDFMerge } from "@/components/PDFMerge"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"

const mergeSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PDF Merge Tool",
  "applicationCategory": "Utility",
  "offers": {
    "@type": "Offer",
    "price": "0"
  }
};

export default function PDFMergePage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <SEO 
        title="Merge PDF Files Online - Free PDF Merger"
        description="Combine multiple PDF documents into a single file with our free online PDF merger tool. Fast, secure, and easy to use."
        schema={mergeSchema}
      />
      <BackToHomeButton />

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Merge PDFs</h1>
        <p className="text-muted-foreground">
          Combine multiple PDF files into a single document
        </p>
      </div>

      <Card className="p-6">
        <PDFMerge files={files} setFiles={setFiles} />
      </Card>
    </div>
  )
}