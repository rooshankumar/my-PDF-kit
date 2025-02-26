"use client"

import { useState } from "react"
import { FileWithPreview } from "@/types/files"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/FileUpload"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { compressImage } from "@/lib/image/compression"
import { useToast } from "@/components/ui/use-toast"
import { downloadBlob } from "@/lib/file-utils"


interface ImageCompressProps {
  files: FileWithPreview[]
  setFiles: (files: FileWithPreview[] | ((prev: FileWithPreview[]) => FileWithPreview[])) => void
}

interface CompressedFile {
  original: File
  compressed: Blob
}

export function ImageCompress({ files, setFiles }: ImageCompressProps) {
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([])
  const { toast } = useToast()

  const handleCompress = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const compressed = await Promise.all(
        files.map(async (file) => {
          // Get the file format from the mime type
          const format = file.file.type.split('/')[1]
          const compressedBlob = await compressImage(file.file, format, quality)

          // Ensure the blob has the correct type
          const blobWithType = new Blob([compressedBlob], { type: file.file.type })

          // Trigger download with the typed blob
          downloadBlob(blobWithType, `compressed_${file.file.name}`)

          return {
            original: file.file,
            compressed: blobWithType,
          }
        })
      )

      setCompressedFiles(compressed)

      toast({
        title: "Success",
        description: `Compressed and downloaded ${files.length} ${files.length === 1 ? 'image' : 'images'}`,
      })
    } catch (error) {
      console.error('Compression error:', error)
      toast({
        title: "Error",
        description: "Failed to compress images",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-6">
        <div className="w-full">
          <FileUpload
            files={files}
            setFiles={setFiles}
            accept={["image/jpeg", "image/png", "image/webp"]}
            maxFiles={10}
            multiple={true}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
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