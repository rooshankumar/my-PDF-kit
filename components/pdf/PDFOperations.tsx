"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { CloudStorage } from '../CloudStorage'
import { QRCodeGenerator } from '../QRCodeGenerator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  FileText,
  Share2
} from 'lucide-react'
import { FileWithPreview } from '@/types/files'
import { compressPDF, mergePDFs, formatBytes } from '@/lib/pdf/utils'

interface PDFOperationsProps {
  files: FileWithPreview[]
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>
  mode: 'compress' | 'merge'
  onProcessComplete?: (url: string) => void
}

export function PDFOperations({
  files,
  setFiles,
  mode,
  onProcessComplete
}: PDFOperationsProps) {
  const [compressionLevel, setCompressionLevel] = useState(50)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFileUrl, setProcessedFileUrl] = useState<string>('')

  const handleCompress = async () => {
    if (!files.length) return
    setIsProcessing(true)
    
    try {
      const compressedBlob = await compressPDF(files[0].file)
      const url = URL.createObjectURL(compressedBlob)
      setProcessedFileUrl(url)
      onProcessComplete?.(url)
    } catch (error) {
      console.error('Compression failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setIsProcessing(true)
    
    try {
      const mergedBlob = await mergePDFs(files.map(f => f.file))
      const url = URL.createObjectURL(mergedBlob)
      setProcessedFileUrl(url)
      onProcessComplete?.(url)
    } catch (error) {
      console.error('Merge failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-6">
        {mode === 'compress' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Compression Level: {compressionLevel}%</Label>
              <Slider
                value={[compressionLevel]}
                onValueChange={([value]) => setCompressionLevel(value)}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <Button
              onClick={handleCompress}
              disabled={isProcessing || !files.length}
              className="w-full"
            >
              {isProcessing ? 'Compressing...' : 'Compress PDF'}
            </Button>
          </div>
        )}

        {mode === 'merge' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Drag to reorder PDFs before merging
            </p>
            <Button
              onClick={handleMerge}
              disabled={isProcessing || files.length < 2}
              className="w-full"
            >
              {isProcessing ? 'Merging...' : 'Merge PDFs'}
            </Button>
          </div>
        )}

        {/* Common Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t mt-4">
          <CloudStorage files={files} />
        </div>
      </Card>

      {/* Processed File Section */}
      {processedFileUrl && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Processed File</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share File</DialogTitle>
                  <DialogDescription>
                    Scan this QR code to access the processed file
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <QRCodeGenerator url={processedFileUrl} size={200} />
                </div>
                <CloudStorage fileUrl={processedFileUrl} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            <a
              href={processedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Download Processed File
            </a>
          </div>
        </Card>
      )}
    </div>
  )
}
