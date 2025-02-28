"use client"

import { useSearchParams } from 'next/navigation'
import { ImageToPDF } from '@/components/image/ImageToPDF'
import { ImageCompress } from '@/components/image/ImageCompress'
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"

export default function ImageToolsPage() {
  const searchParams = useSearchParams()
  const tool = searchParams.get('tool')

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton />

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">
          {tool === 'to-pdf' ? 'Convert Images to PDF' : 'Compress Images'}
        </h1>
        <p className="text-muted-foreground">
          {tool === 'to-pdf' 
            ? 'Convert multiple images into a single PDF document' 
            : 'Compress your images while maintaining quality'}
        </p>
      </div>

      <div className="p-6 border rounded-lg">
        {tool === 'to-pdf' ? <ImageToPDF /> : <ImageCompress />}
      </div>
    </div>
  )
}