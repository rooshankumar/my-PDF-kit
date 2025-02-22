"use client"

import { PDFToImages } from "@/components/pdf/PDFToImages"

export default function PDFToImagesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Convert PDF to Images
      </h1>
      <div className="max-w-xl mx-auto">
        <PDFToImages />
      </div>
    </div>
  )
}
