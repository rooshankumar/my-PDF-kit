
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FileWithPreview } from '@/types/files'
import { PDFDocument } from 'pdf-lib'
import { FileUpload } from './FileUpload'
import { ImagePreview } from './ImagePreview'
import { mergePDFs } from '@/lib/pdf/merge'
import { downloadBlob } from '@/lib/file-utils'
import { useToast } from '@/lib/toast'
import { formatBytes } from '@/lib/file-utils'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface PDFMergeProps {
  files: FileWithPreview[]
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>
}

export function PDFMerge({ files, setFiles }: PDFMergeProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quality, setQuality] = useState(80)
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
        (value) => setProgress(value),
        quality
      )
      
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      downloadBlob(blob, 'merged-documents.pdf')
      
      const totalSize = files.reduce((acc, file) => acc + file.file.size, 0)
      const mergedSize = blob.size
      const reduction = ((totalSize - mergedSize) / totalSize * 100).toFixed(1)
      
      toast({
        title: "Success",
        description: `Merged ${files.length} PDFs (${formatBytes(totalSize)}) into one document (${formatBytes(mergedSize)}, ${reduction}% reduction)`
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
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <Label>Output Quality</Label>
              <span className="text-sm text-muted-foreground">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              min={10}
              max={100}
              step={5}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Lower quality = smaller file size, higher quality = better appearance
            </p>
          </div>
        </CardContent>
      </Card>
      
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
