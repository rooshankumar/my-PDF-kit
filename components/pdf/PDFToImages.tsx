
"use client"

import { useState } from "react"
import { FileWithPreview } from "@/types/files"
import { useToast } from "@/components/ui/use-toast"
import { convertPDFToImages } from "@/lib/pdf/utils"
import { downloadBlob, createZipFromBlobs } from "@/lib/file-utils"
import { DragDropFile } from "@/components/DragDropFile"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function PDFToImages() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleProcess = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      const images = await convertPDFToImages(
        files[0].file,
        { format: 'jpeg', quality: 0.9 },
        setProgress
      )

      if (images.length === 1) {
        const fileName = files[0].file.name.replace('.pdf', '.jpg')
        downloadBlob(images[0], fileName)
        toast({
          title: "Success",
          description: "Image has been downloaded"
        })
      } else {
        const baseName = files[0].file.name.replace('.pdf', '')
        await createZipFromBlobs(images, {
          filename: baseName,
          format: 'jpg',
          autoDownload: true
        })
        toast({
          title: "Success",
          description: `Created ${images.length} images and downloaded as ZIP`
        })
      }
    } catch (error) {
      console.error('Conversion failed:', error)
      toast({
        title: "Error",
        description: "Failed to convert PDF to images. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <DragDropFile
        files={files}
        setFiles={setFiles}
        onFilesSelected={setFiles}
        acceptedFileTypes={["application/pdf"]}
        maxFiles={1}
        showInBox={true}
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {progress > 0 && (
            <Progress value={progress} className="h-2" />
          )}
          <Button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing 
              ? `Converting... ${Math.round(progress)}%` 
              : "Convert to Images"
            }
          </Button>
        </div>
      )}
    </div>
  )
}
