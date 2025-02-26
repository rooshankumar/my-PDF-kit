"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { PDFDocument } from 'pdf-lib'
import { FileWithPreview } from '@/types/files'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CloudStorage } from '../CloudStorage'
import { formatBytes } from '@/lib/pdf/utils'
import { Undo2, RotateCcw, X } from 'lucide-react'

interface PDFSplitAdvancedProps {
  files: FileWithPreview[]
  onComplete?: (urls: string[]) => void
}

type SplitMode = 'pages' | 'range' | 'individual' | 'size' | 'bookmarks'

interface PageInfo {
  pageNumber: number
  selected: boolean
  thumbnail?: string
  size?: number
}

export function PDFSplitAdvanced({ files, onComplete }: PDFSplitAdvancedProps) {
  const [splitMode, setSplitMode] = useState<SplitMode>('pages')
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [pageRanges, setPageRanges] = useState<string>('')
  const [maxFileSize, setMaxFileSize] = useState<number>(5)
  const [progress, setProgress] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookmarks, setBookmarks] = useState<{ title: string, pageIndex: number }[]>([])
  const [pages, setPages] = useState<PageInfo[]>([])
  const [error, setError] = useState<string>('')
  const [undoStack, setUndoStack] = useState<Set<number>[]>([])

  useEffect(() => {
    if (files.length > 0) {
      loadPDFPreview(files[0])
    }
  }, [files])

  const loadPDFPreview = async (file: FileWithPreview) => {
    try {
      const arrayBuffer = await file.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()

      // Generate thumbnails and page info
      const newPages: PageInfo[] = []
      for (let i = 0; i < pageCount; i++) {
        newPages.push({
          pageNumber: i + 1,
          selected: false,
          size: await getPageSize(pdfDoc, i)
        })
      }
      setPages(newPages)

      // Try to extract bookmarks
      // Note: This is a placeholder as pdf-lib doesn't directly support bookmark extraction
      setBookmarks([])

    } catch (error) {
      console.error('Error loading PDF:', error)
      setError('Error loading PDF preview')
    }
  }

  const getPageSize = async (pdfDoc: PDFDocument, pageIndex: number): Promise<number> => {
    const page = pdfDoc.getPage(pageIndex)
    const { width, height } = page.getSize()
    // This is an estimation, actual size may vary
    return Math.round((width * height * 0.2) / 1024) // Rough KB estimation
  }

  const togglePage = (pageNumber: number) => {
    setUndoStack(prev => [...prev, selectedPages])
    const newSelected = new Set(selectedPages)
    if (newSelected.has(pageNumber)) {
      newSelected.delete(pageNumber)
    } else {
      newSelected.add(pageNumber)
    }
    setSelectedPages(newSelected)
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1]
      setSelectedPages(previousState)
      setUndoStack(prev => prev.slice(0, -1))
    }
  }

  const handleReset = () => {
    setUndoStack(prev => [...prev, selectedPages])
    setSelectedPages(new Set())
  }

  const validateInput = (): boolean => {
    setError('')

    switch (splitMode) {
      case 'pages':
        if (selectedPages.size === 0) {
          setError('Please select at least one page')
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
          if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > pages.length) {
            setError('Invalid page range format')
            return false
          }
        }
        break

      case 'size':
        if (maxFileSize < 1) {
          setError('Minimum file size is 1MB')
          return false
        }
        break
    }

    return true
  }

  const handleSplit = async () => {
    if (!validateInput()) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const file = files[0]
      const arrayBuffer = await file.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      let pagesToProcess: number[] = []

      switch (splitMode) {
        case 'pages':
          pagesToProcess = Array.from(selectedPages)
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
          pagesToProcess = Array.from({ length: pages.length }, (_, i) => i + 1)
          break

        case 'size':
          // Implement size-based splitting
          let currentSize = 0
          let currentPages: number[] = []

          for (let i = 0; i < pages.length; i++) {
            const pageSize = pages[i].size || 0
            if (currentSize + pageSize > maxFileSize * 1024) { // Convert MB to KB
              if (currentPages.length > 0) {
                pagesToProcess.push(...currentPages)
                currentPages = []
                currentSize = 0
              }
            }
            currentPages.push(i + 1)
            currentSize += pageSize
          }
          if (currentPages.length > 0) {
            pagesToProcess.push(...currentPages)
          }
          break
      }

      const totalOperations = pagesToProcess.length
      const splitDocs: { doc: PDFDocument, name: string }[] = []

      for (let i = 0; i < pagesToProcess.length; i++) {
        const pageIndex = pagesToProcess[i] - 1
        const newPdfDoc = await PDFDocument.create()
        const [page] = await newPdfDoc.copyPages(pdfDoc, [pageIndex])
        newPdfDoc.addPage(page)

        splitDocs.push({
          doc: newPdfDoc,
          name: `${file.name.replace('.pdf', '')}-page-${pagesToProcess[i]}.pdf`
        })

        setProgress((i + 1) / totalOperations * 100)
      }

      // Create URLs for all split PDFs
      const urls: string[] = []
      for (const { doc, name } of splitDocs) {
        const pdfBytes = await doc.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        urls.push(url)
      }

      onComplete?.(urls)

    } catch (error) {
      console.error('Split failed:', error)
      setError('Error processing PDF')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Split PDF Options</CardTitle>
          <CardDescription>Choose how you want to split your PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={splitMode} onValueChange={(value) => setSplitMode(value as SplitMode)}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="pages">Select Pages</TabsTrigger>
              <TabsTrigger value="range">Page Range</TabsTrigger>
              <TabsTrigger value="individual">Every Page</TabsTrigger>
              <TabsTrigger value="size">By Size</TabsTrigger>
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                >
                  <Undo2 className="h-4 w-4 mr-1" />
                  Undo
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReset}
                  disabled={selectedPages.size === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>

              <div className="grid grid-cols-8 gap-2">
                {pages.map((page) => (
                  <Button
                    key={page.pageNumber}
                    variant={selectedPages.has(page.pageNumber) ? "default" : "outline"}
                    className="h-10 w-10 relative group"
                    onClick={() => togglePage(page.pageNumber)}
                  >
                    {page.pageNumber}
                    {page.size && (
                      <span className="absolute -bottom-6 left-0 right-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                        {formatBytes(page.size * 1024)}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="range" className="space-y-4">
              <div className="space-y-2">
                <Label>Page Ranges</Label>
                <Input
                  placeholder="e.g., 1-3,4-6"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter page ranges separated by commas
                </p>
              </div>
            </TabsContent>

            <TabsContent value="size" className="space-y-4">
              <div className="space-y-4">
                <Label>Maximum File Size: {maxFileSize}MB</Label>
                <Slider
                  value={[maxFileSize]}
                  onValueChange={([value]) => setMaxFileSize(value)}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-4">
              {bookmarks.length > 0 ? (
                <div className="space-y-2">
                  {bookmarks.map((bookmark, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{bookmark.title}</span>
                      <span>Page {bookmark.pageIndex + 1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No bookmarks found in this PDF</p>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <p className="text-sm text-red-500 mt-4">{error}</p>
          )}

          {isProcessing && (
            <Progress value={progress} className="w-full mt-4" />
          )}

          <div className="flex justify-between items-center mt-6">
            <Button
              onClick={handleSplit}
              disabled={isProcessing || !files.length}
            >
              {isProcessing ? 'Processing...' : 'Split PDF'}
            </Button>

            <CloudStorage files={files} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}