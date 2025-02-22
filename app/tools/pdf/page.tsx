"use client"

import { useState } from 'react'
import { PDFOperations } from '@/components/PDFOperations'
import { PDFSplitOptions } from '@/components/PDFSplitOptions'
import { FileWithPreview } from '@/types/files'
import { DragDropFile } from '@/components/DragDropFile'
import { Card } from '@/components/ui/card'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function PDFTools() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileSize, setFileSize] = useState<string>('')

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFilesSelected = (selectedFiles: FileWithPreview[]) => {
    setFiles(selectedFiles)
    if (selectedFiles.length > 0) {
      setFileSize(formatBytes(selectedFiles[0].file.size))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      if (newFiles.length > 0) {
        setFileSize(formatBytes(newFiles[0].file.size))
      } else {
        setFileSize('')
      }
      return newFiles
    })
  }

  const handleQuickConvert = async (mode: 'compress' | 'split' | 'merge') => {
    if (!files.length) return
    setIsProcessing(true)

    try {
      switch (mode) {
        case 'compress': {
          const file = files[0].file
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          const compressedPdf = await pdfDoc.save({
            useObjectStreams: true,
            updateMetadata: false,
            useCompression: true
          })
          const blob = new Blob([compressedPdf], { type: 'application/pdf' })
          const compressedSize = formatBytes(blob.size)
          const url = URL.createObjectURL(blob)
          
          // Create download link
          const a = document.createElement('a')
          a.href = url
          a.download = `compressed-${files[0].name}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          // Update displayed file size
          setFileSize(`Original: ${formatBytes(file.size)} → Compressed: ${compressedSize}`)
          break
        }
        
        case 'split': {
          const zip = new JSZip()
          
          for (const file of files) {
            const arrayBuffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)
            const totalPages = pdfDoc.getPageCount()
            
            // Create individual PDFs for each page
            for (let i = 0; i < totalPages; i++) {
              const newPdfDoc = await PDFDocument.create()
              const [page] = await newPdfDoc.copyPages(pdfDoc, [i])
              newPdfDoc.addPage(page)
              const pdfBytes = await newPdfDoc.save()
              
              // Add to zip
              const fileName = file.name.replace('.pdf', '')
              zip.file(`${fileName}-page-${i + 1}.pdf`, pdfBytes)
            }
          }
          
          // Generate and download zip
          const zipContent = await zip.generateAsync({ type: 'blob' })
          const url = URL.createObjectURL(zipContent)
          const a = document.createElement('a')
          a.href = url
          a.download = 'split-pdfs.zip'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          break
        }
        
        case 'merge': {
          const mergedPdf = await PDFDocument.create()
          for (const file of files) {
            const buffer = await file.file.arrayBuffer()
            const doc = await PDFDocument.load(buffer)
            const pages = await mergedPdf.copyPages(doc, doc.getPageIndices())
            pages.forEach(page => mergedPdf.addPage(page))
          }
          const pdfBytes = await mergedPdf.save()
          const blob = new Blob([pdfBytes], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `merged-document.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          break
        }
      }
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Preview Area */}
        <Card className="p-6">
          <div className="min-h-[300px] rounded-lg border-2 border-dashed border-gray-300 p-4">
            {files.length === 0 ? (
              <DragDropFile
                files={files}
                setFiles={setFiles}
                onFilesSelected={handleFilesSelected}
                acceptedFileTypes={['application/pdf']}
                maxFileSize={50}
                showInBox={true}
              />
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <AnimatePresence>
                    {files.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <div 
                          className="rounded-lg border overflow-hidden bg-gray-50"
                          style={{ width: '70px', height: '70px' }}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-400" />
                          </div>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-gray-500 truncate">
                            {file.name}
                          </p>
                          {index === 0 && fileSize && (
                            <p className="text-xs text-gray-400">
                              {fileSize}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Compress PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduce file size while maintaining quality
                    {fileSize && <span className="block text-xs mt-1">{fileSize}</span>}
                  </p>
                </div>
                <Button 
                  onClick={() => handleQuickConvert('compress')}
                  disabled={!files.length || isProcessing}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Convert & Download
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Split PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Split PDF into pages or ranges
                    {files.length > 0 && <span className="block text-xs mt-1">Advanced splitting options available below</span>}
                  </p>
                </div>
                <Button 
                  onClick={() => handleQuickConvert('split')}
                  disabled={!files.length || isProcessing}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Quick Split
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Merge PDFs</h3>
                  <p className="text-sm text-muted-foreground">
                    Combine multiple PDFs into one
                    {files.length > 1 && <span className="block text-xs mt-1">Merging {files.length} files</span>}
                  </p>
                </div>
                <Button 
                  onClick={() => handleQuickConvert('merge')}
                  disabled={files.length < 2 || isProcessing}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Merge & Download
                </Button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need more options? Use the advanced tools below for fine-tuned control.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Advanced Operations */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Advanced Options</h2>
        {files.length > 0 && (
          <div className="space-y-6">
            <Tabs defaultValue="split" className="w-full">
              <TabsList>
                <TabsTrigger value="split">Split PDF</TabsTrigger>
                <TabsTrigger value="compress">Compress</TabsTrigger>
                <TabsTrigger value="merge">Merge</TabsTrigger>
              </TabsList>
              <TabsContent value="split">
                <PDFSplitOptions files={files} />
              </TabsContent>
              <TabsContent value="compress">
                <PDFOperations
                  files={files}
                  setFiles={setFiles}
                  mode="compress"
                />
              </TabsContent>
              <TabsContent value="merge">
                <PDFOperations
                  files={files}
                  setFiles={setFiles}
                  mode="merge"
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>
    </div>
  )
}
