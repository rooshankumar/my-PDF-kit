"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { FileWithPreview } from '@/types/files'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'

interface DragDropFileProps {
  onFilesSelected: (files: FileWithPreview[]) => void
  files: FileWithPreview[]
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  previewSize?: 'small' | 'medium' | 'large'
  showInBox?: boolean
  maxFiles?: number
}

export function DragDropFile({
  onFilesSelected,
  files,
  setFiles,
  acceptedFileTypes = ['*/*'],
  maxFileSize = 50,
  previewSize = 'medium',
  showInBox = true,
  maxFiles = 10
}: DragDropFileProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const previewSizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  useEffect(() => {
    // Cleanup previews when component unmounts
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only set isDragging to false if we're leaving the dropzone
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = useCallback((file: File) => {
    // Check file type
    const isValidType = acceptedFileTypes.includes('*/*') ||
      acceptedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0]
          return file.type.startsWith(baseType + '/')
        }
        return file.type === type
      })

    if (!isValidType) {
      throw new Error(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`)
    }

    // Check file size
    const sizeInMB = file.size / (1024 * 1024)
    if (sizeInMB > maxFileSize) {
      throw new Error(`File size exceeds ${maxFileSize}MB limit`)
    }
  }, [acceptedFileTypes, maxFileSize])

  const createPreview = useCallback((file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }

    if (file.type === 'application/pdf') {
      // For PDFs, we'll return a placeholder. In a production app,
      // you might want to generate a thumbnail using pdf.js
      return ''
    }

    return ''
  }, [])

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: FileWithPreview[] = []
    const errors: string[] = []

    // Check total number of files
    if (files.length + fileList.length > maxFiles) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Maximum ${maxFiles} files allowed`
      })
      return
    }

    for (const file of fileList) {
      try {
        validateFile(file)
        const preview = createPreview(file)
        newFiles.push({
          file,
          preview,
          name: file.name,
          type: file.type,
          size: file.size
        })
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    if (errors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errors.join('\n')
      })
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesSelected(updatedFiles)
    }
  }, [files, setFiles, onFilesSelected, validateFile, maxFiles, toast, createPreview])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    await processFiles(droppedFiles)
  }, [processFiles])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files)
      // Reset input value to allow selecting the same file again
      e.target.value = ''
    }
  }, [processFiles])

  const removeFile = useCallback((indexToRemove: number) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles[indexToRemove]
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      const newFiles = prevFiles.filter((_, index) => index !== indexToRemove)
      onFilesSelected(newFiles)
      return newFiles
    })
  }, [setFiles, onFilesSelected])

  const renderFilePreview = (file: FileWithPreview) => {
    if (file.type.startsWith('image/') && file.preview) {
      return (
        <img
          src={file.preview}
          alt={file.name}
          className={cn("w-full h-full object-cover rounded-lg", previewSize === 'small' && 'max-w-[40px] max-h-[40px]')}
        />
      )
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        {file.type === 'application/pdf' ? (
          <div className="relative w-full h-full">
            <FileText className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground" />
            <canvas className="absolute inset-0 w-full h-full object-contain opacity-30" />
          </div>
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    )
  }

  return (
    <div
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative rounded-lg transition-colors',
        showInBox && 'border-2 border-dashed p-4',
        isDragging && 'border-primary bg-primary/5',
        !showInBox && 'border-transparent'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept={acceptedFileTypes.join(',')}
        className="hidden"
      />

      <div className="grid gap-4">
        {/* Upload Area */}
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Files
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            or drag and drop files here
          </p>
        </div>

        {/* File Previews */}
        {files?.length > 0 && (
          <div className={cn("grid gap-2", {
            'grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12': previewSize !== 'small',
            'grid-cols-4': previewSize === 'small'
          })}>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group aspect-square"
              >
                <div className={cn(
                  'relative w-full h-full rounded-lg overflow-hidden border bg-background',
                  previewSizeClasses[previewSize]
                )}>
                  {renderFilePreview(file)}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}