
"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface DragDropFileProps {
  acceptedTypes?: string
}

export function DragDropFile({ acceptedTypes = "*" }: DragDropFileProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    })))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes === "*" ? undefined : { [acceptedTypes]: [] }
  })

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  return (
    <Card
      {...getRootProps()}
      className="border-dashed p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
    >
      <input {...getInputProps()} />
      <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>Drag and drop files here, or click to select files</p>
      )}
      {files.length > 0 && (
        <div className="mt-4">
          <p>{files.length} file(s) selected</p>
          <Button className="mt-2">Process Files</Button>
        </div>
      )}
    </Card>
  )
}
