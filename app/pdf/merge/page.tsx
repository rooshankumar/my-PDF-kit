"use client"

import { useState } from "react"
import { PDFMerge } from "@/components/pdf/PDFMerge" //Preserved import from original
import { FileWithPreview } from "@/types/files" //Preserved import from original
import { Card } from "@/components/ui/card" //Preserved import from original
import { Button } from "@/components/ui/button" //Preserved import from original
import { ArrowLeft } from "lucide-react" //Preserved import from original
import { useRouter } from "next/navigation" //Preserved import from original
import { SEO } from '@/components/shared/SEO'; //Preserved import from original


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
  const router = useRouter()

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <SEO 
        title="Merge PDF Files Online - Free PDF Merger"
        description="Combine multiple PDF documents into a single file with our free online PDF merger tool. Fast, secure, and easy to use."
        schema={mergeSchema}
      />

      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 -ml-2"
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