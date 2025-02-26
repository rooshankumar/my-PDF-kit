"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { FileWithPreview } from "@/types/files"
import { useToast } from "@/lib/toast"
import { FileUpload } from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PDFDocument } from "pdf-lib"
import { formatFileSize } from "@/lib/utils"
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
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PDFSplitProps {
  files: FileWithPreview[]
  setFiles: Dispatch<SetStateAction<FileWithPreview[]>>
}

interface PDFInfo {
  pageCount: number
  fileSize: number
  fileName: string
}

export function PDFSplit({ files, setFiles }: PDFSplitProps) {
  const [splitMode, setSplitMode] = useState<'range' | 'pages'>('range')
  const [range, setRange] = useState("")
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (files.length > 0) {
      loadPDFInfo()
    } else {
      setSelectedPages([])
      setRange("")
      setPdfInfo(null)
    }
  }, [files])

  const loadPDFInfo = async () => {
    try {
      const file = files[0]
      const arrayBuffer = await file.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPdfInfo({
        pageCount: pdfDoc.getPageCount(),
        fileSize: file.file.size,
        fileName: file.file.name
      })
    } catch (error) {
      console.error("Failed to load PDF info:", error)
    }
  }

  const togglePage = (pageNum: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNum)) {
        return prev.filter(p => p !== pageNum)
      } else {
        return [...prev, pageNum].sort((a, b) => a - b)
      }
    })
  }

  const handleSplit = async () => {
    if (!files.length) return
    if (splitMode === 'range' && !range) return
    if (splitMode === 'pages' && !selectedPages.length) return

    setIsProcessing(true)

    try {
      const file = files[0].file
      const arrayBuffer = await file.arrayBuffer()
      const sourcePdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = sourcePdfDoc.getPageCount()
      
      let pagesToExtract: number[] = []
      
      if (splitMode === 'range') {
        // Parse range (1-based page numbers)
        let [start, end] = range.split('-').map(Number)
        
        // Validate range
        if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
          throw new Error(`Invalid range. Please enter a range between 1 and ${totalPages}`)
        }

        // Create array of pages to extract
        pagesToExtract = Array.from({ length: end - start + 1 }, (_, i) => start + i - 1)
      } else {
        // Use selected pages (convert to 0-based indices)
        pagesToExtract = selectedPages.map(p => p - 1)
      }
      
      // Create new PDF
      const newPdfDoc = await PDFDocument.create()
      
      // Copy pages
      for (let i = 0; i < pagesToExtract.length; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [pagesToExtract[i]])
        newPdfDoc.addPage(copiedPage)
        setProgress(((i + 1) / pagesToExtract.length) * 100)
      }
      
      // Save and download
      const pdfBytes = await newPdfDoc.save()
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = splitMode === 'range' 
        ? `split_${range}.pdf`
        : `split_pages_${selectedPages.join('-')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: splitMode === 'range'
          ? `Split PDF pages ${range} successfully`
          : `Split PDF pages ${selectedPages.join(', ')} successfully`
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
    <div className="space-y-4 max-w-2xl mx-auto">
      <FileUpload
        files={files}
        setFiles={setFiles}
        accept={["application/pdf"]}
        maxFiles={1}
        multiple={false}
      />

      {files.length > 0 && pdfInfo && (
        <div className="space-y-4">
          {/* PDF Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">PDF Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <Label className="text-muted-foreground">Pages</Label>
                  <p className="font-medium">{pdfInfo.pageCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Size</Label>
                  <p className="font-medium">{formatFileSize(pdfInfo.fileSize)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">File</Label>
                  <p className="font-medium truncate" title={pdfInfo.fileName}>
                    {pdfInfo.fileName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Split Options Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Split Options</CardTitle>
              <CardDescription className="text-xs">Choose how to split your PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={splitMode} onValueChange={(value: string) => setSplitMode(value as 'range' | 'pages')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="range">Page Range</TabsTrigger>
                  <TabsTrigger value="pages">Select Pages</TabsTrigger>
                </TabsList>

                <TabsContent value="range" className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Page Range</Label>
                    <Input
                      placeholder={`e.g., 1-${pdfInfo.pageCount}`}
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      className="h-8"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter page range (e.g., "1-1" for first page only)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="pages" className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Select Pages</Label>
                    <ScrollArea className="h-[150px] rounded-md border p-2">
                      <div className="grid grid-cols-8 gap-1">
                        {Array.from({ length: pdfInfo.pageCount }, (_, i) => i + 1).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={selectedPages.includes(pageNum) ? "default" : "outline"}
                            className="h-8 w-8 text-xs"
                            onClick={() => togglePage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                    {selectedPages.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedPages.join(', ')}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {progress > 0 && (
                <Progress value={progress} className="h-2" />
              )}

              <Button
                onClick={handleSplit}
                disabled={isProcessing || (splitMode === 'range' ? !range : !selectedPages.length)}
                className="w-full h-8 text-sm"
              >
                {isProcessing 
                  ? `Processing... ${Math.round(progress)}%` 
                  : splitMode === 'range'
                    ? "Split PDF by Range"
                    : `Split PDF (${selectedPages.length} pages selected)`
                }
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
