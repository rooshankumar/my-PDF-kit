"use client"

import { useState } from "react"
import { downloadBlob, compressImage, createZipFromBlobs } from "@/lib/file-utils"
import { useToast } from "@/lib/toast"
import { FileWithPreview } from "@/types/files"
import { FileUpload } from "@/components/FileUpload"
import { ImagePreview } from "@/components/ImagePreview"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface ImageOperationsProps {
  defaultMode?: "compress" | "convert"
}

export function ImageOperations({ defaultMode = "compress" }: ImageOperationsProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleCompress = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      const compressedBlobs = await Promise.all(
        files.map(file => compressImage(file.file, file.file.type.split('/')[1], quality / 100))
      )

      if (compressedBlobs.length === 1) {
        await downloadBlob(compressedBlobs[0], `compressed-${files[0].file.name}`)
      } else {
        await createZipFromBlobs(compressedBlobs, {
          filename: 'compressed-images',
          format: 'jpg',
          autoDownload: true
        })
      }

      toast({
        title: "Success",
        description: `Compressed ${files.length} image${files.length === 1 ? "" : "s"}`
      })
    } catch (error) {
      console.error("Compression failed:", error)
      toast({
        title: "Error",
        description: "Failed to compress images",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-6">
        <FileUpload
          files={files}
          setFiles={setFiles}
          accept={{
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
          }}
          multiple={true}
          maxFiles={10}
        />
        {files.length > 0 && (
          <div className="space-y-4">
            <ImagePreview
              files={files}
              setFiles={setFiles}
              canReorder={false}
              previewSize="medium"
            />
            <div className="space-y-2">
              <Label>Quality: {quality}%</Label>
              <Slider
                value={[quality]}
                onValueChange={([value]) => setQuality(value)}
                min={1}
                max={100}
                step={1}
                disabled={isProcessing}
              />
            </div>
            <Button 
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Compressing...' : 'Compress and Download'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
