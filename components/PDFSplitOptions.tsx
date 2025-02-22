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
import { CloudStorage } from './CloudStorage'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { downloadBlob } from "@/lib/file-utils"
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
  const [range, setRange] = useState("")
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

      // Try to load bookmarks if available
      // Note: pdf-lib doesn't support bookmark extraction directly
      // This is a placeholder for future implementation
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
    if (!files.length || !range) return
    setIsProcessing(true)

    try {
      const file = files[0].file
      const arrayBuffer = await file.arrayBuffer()
      const sourcePdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = sourcePdfDoc.getPageCount()
      
      // Parse range (1-based page numbers)
      let [start, end] = range.split('-').map(Number)
      
      // Validate range
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid range. Please enter a range between 1 and ${totalPages}`)
      }

      // Convert to 0-based indices and ensure within bounds
      start = Math.max(0, start - 1)
      end = Math.min(end, totalPages)
      
      // Create new PDF
      const newPdfDoc = await PDFDocument.create()
      
      // Copy pages in range
      for (let i = start; i < end; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [i])
        newPdfDoc.addPage(copiedPage)
      }
      
      // Save and download
      const pdfBytes = await newPdfDoc.save()
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })
      
      await downloadBlob(pdfBlob, {
        filename: `split_${range}.pdf`,
        autoDownload: true
      })

      toast({
        title: "Success",
        description: `Split PDF pages ${range} successfully`
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
    }
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/tools')}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tools
      </Button>

      <div>
        <label className="text-sm font-medium">Page Range</label>
        <p className="text-sm text-muted-foreground mb-2">
          Enter page range (e.g., "1-1" for first page only, "1-2" for first two pages)
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., 1-3"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />
          <Button 
            onClick={handleSplit}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Split PDF"}
          </Button>
        </div>
      </div>
    </div>
  )
}