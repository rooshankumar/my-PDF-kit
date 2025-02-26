
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { FileWithPreview } from '@/types/files'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CloudStorage } from '../CloudStorage'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { downloadBlob, createZipFromBlobs } from "@/lib/file-utils"
import { splitPDF as splitPDFByPages } from "@/lib/pdf-utils"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PDFSplitOptionsProps {
  files: FileWithPreview[]
  onProcessComplete?: (urls: string[]) => void
}

type SplitMode = 'pages' | 'range' | 'individual' | 'size' | 'bookmarks'

export function PDFSplitOptions({ files, onProcessComplete }: PDFSplitOptionsProps) {
  const [splitMode, setSplitMode] = useState<SplitMode>('pages')
  const [selectedPages, setSelectedPages] = useState<string>('')
  const [pageRanges, setPageRanges] = useState<string>('')
  const [maxFileSize, setMaxFileSize] = useState<number>(5)
  const [progress, setProgress] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookmarks, setBookmarks] = useState<{ title: string, pageIndex: number }[]>([])
  const [previewPages, setPreviewPages] = useState<number[]>([])
  const [error, setError] = useState<string>('')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadPDFPreview()
  }, [files])

  const loadPDFPreview = async () => {
    if (!files.length) return

    try {
      const file = files[0]
      const arrayBuffer = await file.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      setPreviewPages(Array.from({ length: pageCount }, (_, i) => i + 1))
      setBookmarks([])
    } catch (error) {
      console.error('Error loading PDF preview:', error)
      setError('Error loading PDF preview')
    }
  }

  const validateInput = (): boolean => {
    setError('')
    
    switch (splitMode) {
      case 'pages':
        if (!selectedPages.trim()) {
          setError('Please select at least one page')
          return false
        }
        // Validate page numbers
        const pageNums = selectedPages.split(',').map(p => parseInt(p.trim()))
        if (pageNums.some(isNaN)) {
          setError('Invalid page numbers')
          return false
        }
        break
        
      case 'range':
        if (!pageRanges.trim()) {
          setError('Please enter page ranges')
          return false
        }
        // Validate ranges format (e.g., "1-3,4-6")
        const ranges = pageRanges.split(',')
        for (const range of ranges) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()))
          if (isNaN(start) || isNaN(end) || start > end) {
            setError('Invalid page range format')
            return false
          }
        }
        break
    }
    
    return true
  }

  const handleSplit = async () => {
    if (!files.length) return
    setIsProcessing(true)

    try {
      const file = files[0]
      const arrayBuffer = await file.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      
      let pagesToProcess: number[] = []
      
      switch (splitMode) {
        case 'pages':
          pagesToProcess = selectedPages.split(',').map(p => parseInt(p.trim()))
          break
          
        case 'range':
          const ranges = pageRanges.split(',')
          ranges.forEach(range => {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()))
            for (let i = start; i <= end; i++) {
              pagesToProcess.push(i)
            }
          })
          break
          
        case 'individual':
          pagesToProcess = Array.from({ length: pageCount }, (_, i) => i + 1)
          break
      }

      const totalOperations = pagesToProcess.length
      const blobs = await splitPDFByPages(file.file, pagesToProcess)
      const baseName = file.file.name.replace('.pdf', '')
      
      const downloadOptions = {
        filename: baseName,
        format: 'pdf'
      }
      
      await createZipFromBlobs(blobs, downloadOptions)
      
      const urls = blobs.map(blob => URL.createObjectURL(blob))
      onProcessComplete?.(urls)

      toast({
        title: "Success",
        description: "PDF split successfully"
      })

    } catch (error) {
      console.error("Split failed:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to split PDF",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/tools')}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tools
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Split PDF Options</CardTitle>
          <CardDescription>Choose how you want to split your PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <RadioGroup
              value={splitMode}
              onValueChange={(value: string) => setSplitMode(value as SplitMode)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pages" id="pages" />
                <Label htmlFor="pages">Select specific pages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="range" id="range" />
                <Label htmlFor="range">Split by range</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual">Split every page</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="size" id="size" />
                <Label htmlFor="size">Split by file size</Label>
              </div>
            </RadioGroup>

            {splitMode === 'pages' && (
              <div className="space-y-2">
                <Label>Page Numbers</Label>
                <Input
                  placeholder="e.g., 1,2,3"
                  value={selectedPages}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedPages(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter page numbers separated by commas
                </p>
              </div>
            )}

            {splitMode === 'range' && (
              <div className="space-y-2">
                <Label>Page Ranges</Label>
                <Input
                  placeholder="e.g., 1-3,4-6"
                  value={pageRanges}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageRanges(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter page ranges separated by commas
                </p>
              </div>
            )}

            {splitMode === 'size' && (
              <div className="space-y-4">
                <Label>Maximum File Size: {maxFileSize}MB</Label>
                <Slider
                  value={[maxFileSize]}
                  onValueChange={(value: number[]) => setMaxFileSize(value[0])}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {isProcessing && (
              <Progress value={progress} className="w-full" />
            )}

            <div className="flex justify-between items-center">
              <Button
                onClick={handleSplit}
                disabled={isProcessing || !files.length}
              >
                {isProcessing ? 'Processing...' : 'Split PDF'}
              </Button>

              <CloudStorage files={files} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
