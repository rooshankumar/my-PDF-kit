"use client"

import { useState } from "react"
import { FileWithPreview } from "@/types/files"
import { useToast } from "@/lib/toast"
import { FileUpload } from "@/components/FileUpload"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { formatFileSize } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { compressPDF } from "@/lib/pdf-utils"

interface PDFCompressProps {
  files: FileWithPreview[]
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>
}

interface CompressedFile {
  original: File
  compressed: Blob
  originalSize: number
  compressedSize: number
  name: string
}

export function PDFCompress({ files, setFiles }: PDFCompressProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [quality, setQuality] = useState(80)
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([])
  const { toast } = useToast()

  // Estimate compressed size based on quality
  const estimateCompressedSize = (originalSize: number, quality: number) => {
    const ratio = (quality * 0.95 + 5) / 100
    return Math.round(originalSize * ratio)
  }

  const handleCompress = async () => {
    if (!files.length) return
    setIsProcessing(true)

    try {
      const compressed = await Promise.all(
        files.map(async (file) => {
          // Map quality to low/medium/high
          let compressionLevel: 'low' | 'medium' | 'high'
          if (quality <= 33) compressionLevel = 'low'
          else if (quality <= 66) compressionLevel = 'medium'
          else compressionLevel = 'high'

          const compressedBlob = await compressPDF(file.file, compressionLevel)

          // Trigger download
          const url = URL.createObjectURL(compressedBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = `compressed_${file.file.name}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          return {
            original: file.file,
            compressed: compressedBlob,
            originalSize: file.file.size,
            compressedSize: compressedBlob.size,
            name: file.file.name
          }
        })
      )

      setCompressedFiles(compressed)

      toast({
        title: "Success",
        description: `Compressed and downloaded ${files.length} ${files.length === 1 ? 'PDF' : 'PDFs'}`,
      })
    } catch (error) {
      console.error('Compression error:', error)
      toast({
        title: "Error",
        description: "Failed to compress PDFs",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <FileUpload
          files={files}
          setFiles={setFiles}
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={10}
          multiple={true}
          className="w-full"
        />

        {files.length > 0 && (
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Quality</Label>
                <span className="text-sm text-muted-foreground">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={([value]) => setQuality(value)}
                min={1}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* File size details */}
            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              {files.map((file, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">{file.file.name}</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground">
                      Original size: <span className="font-medium">{formatFileSize(file.file.size)}</span>
                    </p>
                    {compressedFiles[index] ? (
                      <p className="text-green-600 font-medium">
                        Compressed size: {formatFileSize(compressedFiles[index].compressedSize)}
                        {" "}
                        ({Math.round((1 - compressedFiles[index].compressedSize / file.file.size) * 100)}% smaller)
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Expected size: <span className="font-medium">{formatFileSize(estimateCompressedSize(file.file.size, quality))}</span>
                        {" "}
                        (approximately {Math.round((1 - estimateCompressedSize(file.file.size, quality) / file.file.size) * 100)}% smaller)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing 
                ? "Compressing..." 
                : `Compress ${files.length} ${files.length === 1 ? 'PDF' : 'PDFs'}`
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
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
