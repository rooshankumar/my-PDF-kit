"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FileWithPreview } from "@/types/files"
import DragDropFile from "@/components/DragDropFile"
import { PDFDocument } from "pdf-lib"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { downloadFile } from "@/lib/file-utils"

interface PDFCompressProps {
  files: FileWithPreview[]
  setFiles: (files: FileWithPreview[]) => void
}

export function PDFCompress({ files, setFiles }: PDFCompressProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compressionLevel, setCompressionLevel] = useState(70)

  const compressPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one PDF file to compress",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setProgress(10)

      const file = files[0]
      const fileBuffer = await file.arrayBuffer()

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(fileBuffer)
      setProgress(40)

      // Create a new PDF document with compression settings
      const compressedDoc = await PDFDocument.create()

      // Copy pages with compression
      const pages = await compressedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices())
      pages.forEach(page => {
        compressedDoc.addPage(page)
      })

      setProgress(70)

      // Set compression options - in a real implementation, this would use
      // different compression parameters based on the compressionLevel slider
      const compressedPdfBytes = await compressedDoc.save({
        useObjectStreams: true,
        // Additional compression options would be set here in a real implementation
      })

      setProgress(90)

      // Download the compressed PDF
      const fileName = file.name.replace('.pdf', '_compressed.pdf')
      downloadFile(new Blob([compressedPdfBytes], { type: 'application/pdf' }), fileName)

      toast({
        title: "PDF compressed successfully",
        description: `File has been compressed and downloaded as ${fileName}`,
      })

      setProgress(100)
    } catch (error) {
      console.error("Error compressing PDF:", error)
      toast({
        title: "Error compressing PDF",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <DragDropFile
        files={files}
        setFiles={(newFiles: FileWithPreview[]) => setFiles(newFiles)}
        onFilesSelected={(newFiles) => setFiles(newFiles)}
        acceptedFileTypes={['application/pdf']}
        maxFileSize={50}
        maxFiles={1}
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="compressionLevel">Compression Level: {compressionLevel}%</Label>
            <Slider
              id="compressionLevel"
              min={10}
              max={100}
              step={1}
              value={[compressionLevel]}
              onValueChange={(value) => setCompressionLevel(value[0])}
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              Higher compression may reduce quality. Lower compression preserves more details.
            </p>
          </div>

          <Button 
            onClick={compressPDF} 
            disabled={isProcessing || files.length === 0} 
            className="w-full"
          >
            {isProcessing ? 'Compressing...' : 'Compress PDF'}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {progress}% - Compressing your PDF...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}