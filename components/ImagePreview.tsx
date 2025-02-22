"use client"

import { useState } from "react"
import Image from "next/image"
import { Trash, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FileWithPreview } from "@/types/files"

interface ImagePreviewProps {
  files: FileWithPreview[]
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>
  canReorder?: boolean
  previewSize?: "small" | "medium" | "large"
}

export function ImagePreview({ 
  files, 
  setFiles, 
  canReorder = true,
  previewSize = "small" 
}: ImagePreviewProps) {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(
    files[0]?.preview || null
  )

  const handleRemove = (index: number) => {
    setFiles(files => {
      const newFiles = [...files]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleReorder = (oldIndex: number, newIndex: number) => {
    setFiles(files => {
      const newFiles = [...files]
      const [movedFile] = newFiles.splice(oldIndex, 1)
      newFiles.splice(newIndex, 0, movedFile)
      return newFiles
    })
  }

  const previewSizes = {
    small: { width: 60, height: 60 },
    medium: { width: 100, height: 100 },
    large: { width: 150, height: 150 }
  }

  const { width, height } = previewSizes[previewSize]

  return (
    <div className="space-y-4">
      {selectedPreview && (
        <div className="relative w-full h-48 mb-4">
          <Image
            src={selectedPreview}
            alt="Selected preview"
            fill
            className="object-contain"
            priority
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div key={index} className="relative group">
            <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
              <Image
                src={file.preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover rounded-md hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => setSelectedPreview(file.preview)}
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-md">
              <div className="flex items-center space-x-1">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemove(index)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
                {canReorder && (
                  <>
                    {index > 0 && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleReorder(index, index - 1)}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                    )}
                    {index < files.length - 1 && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleReorder(index, index + 1)}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
