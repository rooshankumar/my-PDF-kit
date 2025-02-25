
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { convertPDFToImages } from "@/lib/pdf/utils"
import { DragDropFile } from "@/components/DragDropFile"
import { FileWithPreview } from "@/types/files"
import { useToast } from "@/hooks/use-toast"

export function PDFToImages() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleConvert = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      const images = await convertPDFToImages(files[0].file, setProgress)
      if (!images || images.length === 0) {
        throw new Error("No images were generated")
      }

      // Create object URLs for preview
      const imageUrls = images.map(blob => URL.createObjectURL(blob))
      
      // Download as zip if multiple pages
      if (images.length > 1) {
        const zip = new JSZip()
        images.forEach((blob, i) => {
          zip.file(`page-${i + 1}.jpg`, blob)
        })
        const content = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(content)
        const link = document.createElement('a')
        link.href = url
        link.download = `${files[0].file.name.replace('.pdf', '')}-images.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        const url = URL.createObjectURL(images[0])
        const link = document.createElement('a')
        link.href = url
        link.download = files[0].file.name.replace('.pdf', '.jpg')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      // Cleanup preview URLs
      imageUrls.forEach(URL.revokeObjectURL)

      toast({
        title: "Success",
        description: `Converted ${images.length} page${images.length === 1 ? '' : 's'} to images`
      })
    } catch (error) {
      console.error('Conversion failed:', error)
      toast({
        title: "Error",
        description: "Failed to convert PDF to images",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <DragDropFile
        files={files}
        setFiles={setFiles}
        accept={["application/pdf"]}
        maxFiles={1}
        multiple={false}
        showInBox={true}
        previewSize="small"
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <Button 
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Converting...' : 'Convert to Images'}
          </Button>
          
          {isProcessing && (
            <Progress value={progress} className="w-full" />
          )}
        </div>
      )}
    </div>
  )
}
