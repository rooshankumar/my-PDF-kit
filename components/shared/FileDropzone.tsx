"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, FileIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileDropzoneProps {
  accept: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  onDrop: (acceptedFiles: File[]) => void
  isUploading?: boolean
  progress?: number
  title?: string
  description?: string
}

export function FileDropzone({
  accept,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onDrop,
  isUploading = false,
  progress = 0,
  title = "Drop your files here",
  description = "or click to browse"
}: FileDropzoneProps) {
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)
      setFiles(acceptedFiles)
      onDrop(acceptedFiles)
    },
    [onDrop]
  )

  const onDropRejected = useCallback((fileRejections: any[]) => {
    const error = fileRejections[0]?.errors[0]
    if (error?.code === "file-too-large") {
      setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`)
    } else if (error?.code === "file-invalid-type") {
      setError("Invalid file type")
    } else if (error?.code === "too-many-files") {
      setError(`Maximum ${maxFiles} file${maxFiles === 1 ? "" : "s"} allowed`)
    } else {
      setError("Error uploading file")
    }
  }, [maxFiles, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    onDropAccepted,
    onDropRejected,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 
          transition-colors duration-200 ease-in-out
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
          ${isUploading ? "pointer-events-none opacity-50" : "cursor-pointer hover:border-primary"}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-500 mt-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mt-3"
          >
            <div className="flex items-center gap-3">
              <FileIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Progress Bar */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground mt-2">
            Processing... {progress}%
          </p>
        </motion.div>
      )}
    </div>
  )
}
