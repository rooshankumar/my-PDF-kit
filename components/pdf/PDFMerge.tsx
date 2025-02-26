"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { FileWithPreview } from "@/types/files"
import { useToast } from "@/lib/toast"
import { FileUpload } from "@/components/FileUpload"
import { ImagePreview } from "@/components/ImagePreview"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "@/lib/utils"
import { PDFDocument } from "pdf-lib"
import { mergePDFs } from "@/lib/pdf/merge"

interface PDFMergeProps {
  files: FileWithPreview[]
  setFiles: Dispatch<SetStateAction<FileWithPreview[]>>
}

interface MergeStats {
  totalSize: number
  totalPages: number
  fileCount: number
  estimatedSize: number
  actualSize: number
}

export function PDFMerge({ files, setFiles }: PDFMergeProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<MergeStats | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const calculateStats = async () => {
      if (!files.length) {
        setStats(null)
        return
      }

      try {
        let totalSize = 0
        let totalPages = 0

        for (const file of files) {
          totalSize += file.file.size
          const arrayBuffer = await file.file.arrayBuffer()
          const pdf = await PDFDocument.load(arrayBuffer)
          totalPages += pdf.getPageCount()
        }

        setStats({
          totalSize,
          totalPages,
          fileCount: files.length,
          estimatedSize: Math.round(totalSize * 0.9), // Rough estimation
          actualSize: 0
        })
      } catch (error) {
        console.error("Failed to calculate stats:", error)
      }
    }

    calculateStats()
  }, [files])

  const handleProcess = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      const mergedBytes = await mergePDFs(files.map(f => f.file), setProgress)

      // Create blob and download
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })

      // Check final size
      const finalSize = blob.size
      const originalTotalSize = files.reduce((acc, file) => acc + file.file.size, 0)

      if (finalSize > originalTotalSize) {
        toast({
          title: "Warning",
          description: "Merged PDF is larger than expected. Try reducing the quality of input PDFs first.",
          variant: "destructive"
        })
        return
      }

      // Update stats
      setStats(prev => prev ? {
        ...prev,
        actualSize: finalSize
      } : null)

      // Download file
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `merged_${files.length}_files.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: `Successfully merged ${files.length} PDFs`
      })
    } catch (error) {
      console.error('Merge failed:', error)
      toast({
        title: "Error",
        description: "Failed to merge PDFs",
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
        <div className="space-y-4">
          <ImagePreview
            files={files}
            setFiles={setFiles}
            canReorder={true}
            previewSize="medium"
          />

          {/* File details */}
          <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
            <div className="text-sm">
              <div className="flex flex-col gap-1">
                {stats && (
                  <>
                    <p className="text-muted-foreground">
                      Files: <span className="font-medium">{stats.fileCount}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Total Pages: <span className="font-medium">{stats.totalPages}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Total Size: <span className="font-medium">{formatFileSize(stats.totalSize)}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Estimated Output Size: <span className="font-medium">{formatFileSize(stats.estimatedSize)}</span>
                    </p>
                    {stats.actualSize > 0 && (
                      <p className="text-green-600 font-medium">
                        Actual Output Size: {formatFileSize(stats.actualSize)}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {progress > 0 && progress < 100 && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <Button
            onClick={handleProcess}
            disabled={isProcessing || !files.length}
            className="w-full"
          >
            {isProcessing 
              ? `Merging... ${Math.round(progress)}%` 
              : `Merge ${files.length} PDF${files.length === 1 ? "" : "s"}`
            }
          </Button>
        </div>
      )}
    </div>
  )
}