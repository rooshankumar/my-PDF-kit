"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud } from "lucide-react"

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void
  maxFiles: number
  accept: Record<string, string[]>
}

export default function FileDropzone({ onFilesAdded, maxFiles, accept }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdded(acceptedFiles)
    },
    [onFilesAdded],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    accept,
  })

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground"}
        ${isDragReject ? "border-destructive bg-destructive/10" : ""}
      `}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        {isDragActive ? "Drop the files here ..." : "Drag 'n' drop some files here, or click to select files"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">(Only *.jpg, *.jpeg and *.pdf files will be accepted)</p>
    </div>
  )
}

