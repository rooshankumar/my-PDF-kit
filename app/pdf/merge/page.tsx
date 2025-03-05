"use client"

import { useState } from "react"
import { PDFMerge } from "@/components/pdf/PDFMerge"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { SEO } from '@/components/shared/SEO';

const mergeSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PDF Merge Tool",
  "applicationCategory": "WebApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0"
  },
  "description": "Combine multiple PDFs into one document easily and for free. No registration required."
};

// Consider adding structured data markup for ads to improve ad performance and SEO.
// Explore schema.org for relevant vocabulary.
// Example:  https://schema.org/Advertisement


function AdBannerWide() {
  return (
    <div>
      <script type="text/javascript">
        atOptions = {
          'key': '4d666fdf93d80a362fcea5a1cec89670',
          'format': 'iframe',
          'height': 300,
          'width': 160,
          'params': {}
        };
      </script>
      <script type="text/javascript" src="//www.highperformanceformat.com/4d666fdf93d80a362fcea5a1cec89670/invoke.js"></script>

      <script type='text/javascript' src='//pl25991753.effectiveratecpm.com/e9/a1/55/e9a155569b7769daf0102e8639509723.js'></script>
    </div>
  );
}


export default function PDFMergePage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <SEO
        title="Merge PDF Files Online | Free PDF Combiner Tool"
        description="Combine multiple PDFs into one document easily and for free. No registration required."
        keywords="merge pdf, combine pdf, join pdf files, pdf merger, free pdf combiner"
        schema={mergeSchema}
      />
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
      <div className="my-8">
        <AdBannerWide />
      </div>
    </div>
  )
}