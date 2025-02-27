
"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { FileWithPreview } from "@/types/files"
import { useToast } from "@/lib/toast"
import { FileUpload } from "@/components/FileUpload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { formatFileSize } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PDFDocument } from 'pdf-lib'
import { Input } from "@/components/ui/input"
import { createPDFFromImages, PageSize } from "@/lib/image/utils"

interface ImageToPDFProps {
  files: FileWithPreview[]
  setFiles: Dispatch<SetStateAction<FileWithPreview[]>>
}

export function ImageToPDF({ files, setFiles }: ImageToPDFProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quality, setQuality] = useState(80)
  const [pageSize, setPageSize] = useState<string>('A4')
  const [expectedSize, setExpectedSize] = useState<number>(0)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const { toast } = useToast()

  const PAGE_SIZES: Record<string, PageSize> = {
    'A4': [595, 842],
    'A5': [420, 595],
    'Letter': [612, 792],
    'Legal': [612, 1008],
    'Custom': [595, 842] // Default to A4 size for custom
  }

  const handleConvert = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      // Convert images to PDF
      const pdfBytes = await createPDFFromImages(
        files.map(f => f.file),
        {
          format: getPageSizeWithOrientation(),
          quality: quality / 100,
          onProgress: setProgress
        }
      )

      // Apply compression if an expected size is specified
      let finalPdfBytes = pdfBytes
      if (expectedSize > 0) {
        // Adjust compression to try to match expected size
        let currentQuality = quality / 100
        const originalSize = pdfBytes.byteLength
        const ratio = expectedSize / originalSize
        
        if (ratio < 0.95) {
          // Need to compress more
          currentQuality = Math.max(0.1, currentQuality * ratio)
          
          // Recreate PDF with adjusted quality
          finalPdfBytes = await createPDFFromImages(
            files.map(f => f.file),
            {
              format: getPageSizeWithOrientation(),
              quality: currentQuality,
              onProgress: setProgress
            }
          )
        }
      }

      // Create a downloadable blob
      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `converted-images.pdf`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
      
      toast({
        title: "Success",
        description: `PDF created successfully (${formatFileSize(blob.size)})`
      })
    } catch (error) {
      console.error("PDF creation failed:", error)
      toast({
        title: "Error",
        description: "Failed to create PDF. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  function getPageSizeWithOrientation(): PageSize {
    const size = PAGE_SIZES[pageSize]
    return orientation === 'landscape' ? [size[1], size[0]] : size
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="file-upload">Upload Images</Label>
          <FileUpload
            value={files}
            onChange={setFiles}
            accept="image/*"
            maxFiles={20}
            maxSize={10 * 1024 * 1024} // 10MB
            previewInDropzone={true}
            previewSize={{ width: "1cm", height: "1cm" }}
            showOnlyInDropzone={true}
          />
          <p className="text-sm text-muted-foreground">
            Upload JPG, PNG, or other image files
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <p className="font-medium mb-2">Selected Images: {files.length}</p>
          <p className="text-sm text-muted-foreground">
            Total Size: {formatFileSize(files.reduce((acc, file) => acc + file.file.size, 0))}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="page-size">Page Size</Label>
          <Select
            value={pageSize}
            onValueChange={setPageSize}
          >
            <SelectTrigger id="page-size">
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="A5">A5</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="orientation">Orientation</Label>
          <Select 
            value={orientation} 
            onValueChange={(value: 'portrait' | 'landscape') => setOrientation(value)}
          >
            <SelectTrigger id="orientation">
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="quality">Image Quality</Label>
            <span className="text-sm text-muted-foreground">{quality}%</span>
          </div>
          <Slider
            id="quality"
            value={[quality]}
            min={10}
            max={100}
            step={5}
            onValueChange={values => setQuality(values[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected-size">Expected Output Size (KB)</Label>
          <div className="flex space-x-2">
            <Input
              id="expected-size"
              type="number"
              min={0}
              value={expectedSize}
              onChange={(e) => setExpectedSize(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Optional"
            />
            <span className="flex items-center text-sm text-muted-foreground">KB</span>
          </div>
          <p className="text-xs text-muted-foreground">
            If set, the output PDF will be compressed to approximately match this size
          </p>
        </div>

        {progress > 0 && progress < 100 && (
          <div className="w-full bg-secondary h-2 rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <Button 
          onClick={handleConvert}
          disabled={isProcessing || files.length === 0}
          className="w-full"
        >
          {isProcessing ? `Converting... ${progress}%` : 'Create PDF'}
        </Button>
      </div>
    </div>
  )
}
