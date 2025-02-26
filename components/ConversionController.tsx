"use client"

import { useState } from "react"
import FileDropzone from "./FileDropzone"
import SmartOptions from "./SmartOptions"
import PreviewPanel from "./PreviewPanel"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export default function ConversionController() {
  const [files, setFiles] = useState<File[]>([])
  const [conversionType, setConversionType] = useState<"to-pdf" | "to-image" | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<"low" | "perfect" | "high">("perfect")
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleAutoMode = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const fileType = newFiles[0].type
      if (fileType === "application/pdf") {
        setConversionType("to-image")
      } else if (fileType.startsWith("image/")) {
        setConversionType("to-pdf")
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please upload PDF or image files only.",
          variant: "destructive",
        })
        return
      }
      setFiles(newFiles)
    }
  }

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload files before converting.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))
    formData.append("conversionType", conversionType || "")
    formData.append("compressionLevel", compressionLevel)

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(await response.text())

      const result = await response.json()
      setConvertedFileUrl(result.fileUrl)

      toast({
        title: "Conversion successful",
        description: "Your file is ready for download.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <TooltipProvider>
      <div className="flex w-full max-w-7xl">
        <PreviewPanel files={files} />
        <div className="flex-1 space-y-6 p-6">
          <FileDropzone
            onFilesAdded={handleAutoMode}
            maxFiles={1}
            accept={{
              "image/*": [".png", ".jpg", ".jpeg"],
              "application/pdf": [".pdf"],
            }}
          />
          <SmartOptions
            conversionType={conversionType}
            compressionLevel={compressionLevel}
            setCompressionLevel={setCompressionLevel}
          />
          <div className="flex space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleConvert} className="flex-1">
                  Convert
                </Button>
              </TooltipTrigger>
              <TooltipContent>Convert your files</TooltipContent>
            </Tooltip>
            {convertedFileUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild className="flex-1">
                    <a href={convertedFileUrl} download>Download</a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download converted file</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

