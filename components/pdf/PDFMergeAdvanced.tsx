"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
import { CloudStorage } from '../CloudStorage'
import { formatBytes } from '@/lib/pdf/utils'
import { ArrowUp, ArrowDown, Trash2, FileText } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DroppableProps, DraggableProps, DropResult } from 'react-beautiful-dnd'

type PageSize = 'A4' | 'Letter' | 'Legal' | 'Custom'
type Orientation = 'portrait' | 'landscape'

interface PDFMergeAdvancedProps {
  files: FileWithPreview[]
  onComplete?: (url: string) => void
}

interface PDFPreview {
  file: FileWithPreview
  pageCount: number
  size: number
  thumbnail?: string
}

export function PDFMergeAdvanced({ files, onComplete }: PDFMergeAdvancedProps) {
  const [orderedFiles, setOrderedFiles] = useState<PDFPreview[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('A4')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [progress, setProgress] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadPDFPreviews()
  }, [files])

  const loadPDFPreviews = async () => {
    const previews: PDFPreview[] = []
    
    for (const file of files) {
      try {
        const arrayBuffer = await file.file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        
        previews.push({
          file,
          pageCount: pdfDoc.getPageCount(),
          size: file.file.size,
          // TODO: Generate thumbnail
        })
      } catch (error) {
        console.error('Error loading PDF:', error)
      }
    }
    
    setOrderedFiles(previews)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(orderedFiles)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setOrderedFiles(items)
  }

  const removeFile = (index: number) => {
    setOrderedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= orderedFiles.length) return
    
    const items = Array.from(orderedFiles)
    const [movedItem] = items.splice(index, 1)
    items.splice(newIndex, 0, movedItem)
    
    setOrderedFiles(items)
  }

  const handleMerge = async () => {
    if (orderedFiles.length < 2) {
      setError('Please add at least 2 PDFs to merge')
      return
    }
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      const mergedPdf = await PDFDocument.create()
      const totalFiles = orderedFiles.length
      
      for (let i = 0; i < totalFiles; i++) {
        const file = orderedFiles[i]
        const arrayBuffer = await file.file.file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        
        // Apply page size and orientation if needed
        if (pageSize !== 'Custom') {
          pages.forEach(page => {
            const { width, height } = page.getSize()
            if (orientation === 'landscape') {
              page.setSize(Math.max(width, height), Math.min(width, height))
            } else {
              page.setSize(Math.min(width, height), Math.max(width, height))
            }
          })
        }
        
        pages.forEach(page => mergedPdf.addPage(page))
        setProgress(((i + 1) / totalFiles) * 100)
      }
      
      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      onComplete?.(url)
      
    } catch (error) {
      console.error('Merge failed:', error)
      setError('Error merging PDFs')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Merge PDF Files</CardTitle>
          <CardDescription>Drag and drop to reorder files before merging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Size</label>
                <Select value={pageSize} onValueChange={(value: PageSize) => setPageSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Custom">Keep Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Orientation</label>
                <Select 
                  value={orientation} 
                  onValueChange={(value: Orientation) => setOrientation(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pdf-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {orderedFiles.map((file, index) => (
                      <Draggable
                        key={file.file.file.name}
                        draggableId={file.file.file.name}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{file.file.file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {file.pageCount} pages • {formatBytes(file.size)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveFile(index, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveFile(index, 'down')}
                                disabled={index === orderedFiles.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {isProcessing && (
              <Progress value={progress} className="w-full" />
            )}

            <div className="flex justify-between items-center">
              <Button
                onClick={handleMerge}
                disabled={isProcessing || orderedFiles.length < 2}
              >
                {isProcessing ? 'Processing...' : 'Merge PDFs'}
              </Button>

              <CloudStorage files={files} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
