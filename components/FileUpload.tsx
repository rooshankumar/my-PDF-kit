
"use client"

import React from 'react'
import { useDropzone } from 'react-dropzone'
import { FileWithPreview } from '@/types/files'
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { compressPDF } from "@/lib/pdf/compression"
import { useToast } from "@/components/ui/use-toast"

interface FileUploadProps {
  files: FileWithPreview[]
  setFiles: (files: FileWithPreview[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  className?: string
}

export function FileUpload({
  files,
  setFiles,
  accept = {
    'application/pdf': ['.pdf']
  },
  maxFiles = 1,
  maxSize = 10485760, // 10MB
  multiple = false,
  className,
}: FileUploadProps) {
  const { toast } = useToast()

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: FileWithPreview[] = []

      try {
        for (const file of acceptedFiles) {
          // Process PDF files
          if (file.type === "application/pdf") {
            const originalSize = file.size
            const processedFile = await compressPDF(file)

            // Show compression result
            if (processedFile.size < originalSize) {
              toast({
                title: "File Compressed",
                description: `Reduced from ${formatFileSize(originalSize)} to ${formatFileSize(processedFile.size)}`,
              })
            }

            const preview = URL.createObjectURL(processedFile)
            newFiles.push({ file: processedFile, preview })
          } else {
            // Non-PDF files
            const preview = URL.createObjectURL(file)
            newFiles.push({ file, preview })
          }
        }

        if (multiple) {
          setFiles((prevFiles: FileWithPreview[]) => [...prevFiles, ...newFiles])
        } else {
          setFiles(newFiles)
        }
      } catch (error) {
        console.error('File processing error:', error)
        toast({
          title: "Error",
          description: "Failed to process file",
          variant: "destructive",
        })
      }
    },
    [setFiles, multiple, toast]
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
  })

  React.useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview))
    }
  }, [files])

  const dropzoneClasses = `
    relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-150 ease-in-out cursor-pointer
    ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
    ${isDragAccept ? 'border-green-500 bg-green-500/5' : ''}
    ${isDragReject ? 'border-red-500 bg-red-500/5' : ''}
    ${!multiple && files.length >= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
  `

  const getDropzoneText = () => {
    if (!multiple && files.length >= 1) {
      return "File uploaded. Remove it to upload another."
    }
    if (isDragActive && isDragAccept) {
      return "Drop files here..."
    }
    if (isDragActive && isDragReject) {
      return "Some files will be rejected..."
    }
    return (
      <div className="space-y-2">
        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
        <div>
          <p className="text-base">
            {multiple ? "Drag & drop files here, or click to select" : "Drag & drop a file here, or click to select"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Accepts PDF files
          </p>
          {maxFiles > 0 && (
            <p className="text-sm text-muted-foreground">
              {multiple ? `Maximum ${maxFiles} files` : "Single file only"}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative">
      <div
        {...getRootProps()}
        className={dropzoneClasses}
      >
        <input {...getInputProps()} />
        {getDropzoneText()}
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Files:</div>
          <ul className="text-sm space-y-1">
            {files.map((file, index) => (
              <li key={index} className="text-muted-foreground">
                {file.file.name}
              </li>
            ))}
          </ul>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="w-full mt-2" 
            onClick={() => {
              files.forEach(file => URL.revokeObjectURL(file.preview))
              setFiles([])
            }}
          >
            Clear Files
          </Button>
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
