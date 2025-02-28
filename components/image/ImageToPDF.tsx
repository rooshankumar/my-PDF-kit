"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { FileWithPreview } from "@/types/files"
import { useToast } from "@/lib/toast"
import { FileUpload } from "@/components/FileUpload"
import { ImagePreview } from "@/components/ImagePreview"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { formatFileSize } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PDFDocument } from 'pdf-lib'

interface ImageToPDFProps {
  files: FileWithPreview[]
  setFiles: Dispatch<SetStateAction<FileWithPreview[]>>
}

interface ConversionStats {
  totalSize: number
  estimatedPdfSize: number
  actualPdfSize: number
  imageCount: number
}

export function ImageToPDF({ files, setFiles }: ImageToPDFProps) {
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<ConversionStats | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (files.length > 0) {
      const totalSize = files.reduce((sum, file) => sum + file.file.size, 0)
      // Rough estimation of PDF size based on image sizes and quality
      const estimatedPdfSize = Math.round(totalSize * (quality / 100) * 0.8)
      
      setStats({
        totalSize,
        estimatedPdfSize,
        actualPdfSize: 0,
        imageCount: files.length
      })
    } else {
      setStats(null)
    }
  }, [files, quality])

  const handleProcess = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      const pdfDoc = await PDFDocument.create()
      let processedImages = 0

      for (const file of files) {
        const imageBytes = await file.file.arrayBuffer()
        let image
        
        if (file.file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(imageBytes)
        } else if (file.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes)
        } else {
          continue
        }

        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        })

        processedImages++
        setProgress((processedImages / files.length) * 100)
      }

      const pdfBytes = await pdfDoc.save()
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })

      // Update stats with actual PDF size
      setStats(prev => prev ? { ...prev, actualPdfSize: pdfBlob.size } : null)

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'converted-images.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: `Converted ${files.length} image${files.length === 1 ? '' : 's'} to PDF`,
      })
    } catch (error) {
      console.error("Conversion failed:", error)
      toast({
        title: "Error",
        description: "Failed to convert images to PDF",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <FileUpload
          files={files}
          setFiles={setFiles}
          accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
          maxFiles={10}
          multiple={true}
        />

        {files.length > 0 && (
          <div className="space-y-4 mt-6">
            <ImagePreview 
              files={files} 
              setFiles={setFiles}
              canReorder={true}
              previewSize="medium"
            />

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
                disabled={isProcessing}
              />
            </div>

            {/* File details */}
            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              <div className="text-sm">
                <div className="flex flex-col gap-1">
                  <p className="text-muted-foreground">
                    Images: <span className="font-medium">{files.length}</span>
                  </p>
                  {stats && (
                    <>
                      <p className="text-muted-foreground">
                        Total Image Size: <span className="font-medium">{formatFileSize(stats.totalSize)}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Estimated PDF Size: <span className="font-medium">{formatFileSize(stats.estimatedPdfSize)}</span>
                      </p>
                      {stats.actualPdfSize > 0 && (
                        <p className="text-green-600 font-medium">
                          Actual PDF Size: {formatFileSize(stats.actualPdfSize)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {progress > 0 && progress < 100 && (
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <Button
              onClick={handleProcess}
              disabled={isProcessing || !files.length}
              className="w-full"
            >
              {isProcessing 
                ? `Converting... ${Math.round(progress)}%` 
                : `Convert ${files.length} Image${files.length === 1 ? '' : 's'} to PDF`
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
