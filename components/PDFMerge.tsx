
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FileWithPreview } from '@/types/files'
import { PDFDocument } from 'pdf-lib'
import { FileUpload } from './FileUpload'
import { ImagePreview } from './ImagePreview'
import { mergePDFs } from '@/lib/pdf-utils'
import { downloadBlob } from '@/lib/file-utils'
import { useToast } from '@/lib/toast'
import { formatBytes } from '@/lib/file-utils'

interface PDFMergeProps {
  files: FileWithPreview[]
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>
}

export function PDFMerge({ files, setFiles }: PDFMergeProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Error",
        description: "Please upload at least two PDF files to merge",
        variant: "destructive"
      })
      return
    }
    
    setIsProcessing(true)
    setProgress(0)

    try {
      const mergedBytes = await mergePDFs(
        files.map(f => f.file), 
        (value) => setProgress(value)
      )
      
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      downloadBlob(blob, 'merged-documents.pdf')
      
      const totalSize = files.reduce((acc, file) => acc + file.file.size, 0)
      
      toast({
        title: "Success",
        description: `Merged ${files.length} PDFs (${formatBytes(totalSize)}) into one document`
      })
    } catch (error) {
      console.error("Merge failed:", error)
      toast({
        title: "Error",
        description: "Failed to merge PDFs. Please try again with different files.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <FileUpload
        files={files}
        setFiles={setFiles}
        accept={{ 'application/pdf': ['.pdf'] }}
        maxFiles={10}
        multiple={true}
      />
      
      {files.length > 0 && (
        <ImagePreview
          files={files}
          setFiles={setFiles}
          canReorder={true}
          previewSize="small"
        />
      )}
      
      {progress > 0 && progress < 100 && (
        <Progress value={progress} className="my-4" />
      )}
      
      <Button
        onClick={handleMerge}
        disabled={isProcessing || files.length < 2}
        className="w-full"
      >
        {isProcessing ? `Merging... ${Math.round(progress)}%` : "Merge PDFs"}
      </Button>
      
      {files.length === 1 && (
        <p className="text-sm text-muted-foreground text-center">
          Please upload at least one more PDF to merge
        </p>
      )}
      
      {files.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Upload PDFs to combine them into a single document
        </p>
      )}
    </div>
  )
}
