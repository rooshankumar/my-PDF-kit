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

interface PDFToolsState {
  files: FileWithPreview[],
  isProcessing: boolean,
  fileSize: string,
  updateMetadata?: boolean; // Kept it as is since it's part of the state but not in save
}

export default function PDFTools() {
  const [state, setState] = useState<PDFToolsState>({
    files: [],
    isProcessing: false,
    fileSize: '',
    updateMetadata: false  // Initialize as needed
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFilesSelected = (selectedFiles: FileWithPreview[]) => {
    setState(prev => ({
      ...prev,
      files: selectedFiles,
      fileSize: selectedFiles.length > 0 ? formatBytes(selectedFiles[0].file.size) : ''
    }))
  }

  const handleRemoveFile = (index: number) => {
    setState(prev => {
      const newFiles = prev.files.filter((_, i) => i !== index)
      return {
        ...prev,
        files: newFiles,
        fileSize: newFiles.length > 0 ? formatBytes(newFiles[0].file.size) : ''
      }
    })
  }

  const handleQuickConvert = async (mode: 'compress' | 'split' | 'merge') => {
    if (!state.files.length) return
    setState(prev => ({ ...prev, isProcessing: true }))

    try {
      switch (mode) {
        case 'compress': {
          const file = state.files[0].file
          const arrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          const compressedPdf = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            preservePDFFormFields: true,
            compress: true,
            imageQuality: 0.8,
            compressImages: true
          })

          const blob = new Blob([compressedPdf], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)

          // Create download link
          const a = document.createElement('a')
          a.href = url
          a.download = `compressed-${state.files[0].name}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          // Update displayed file size
          setState(prev => ({
            ...prev,
            fileSize: `Original: ${formatBytes(file.size)} → Compressed: ${formatBytes(blob.size)}`
          }))
          break
        }

        // Add cases for 'split' and 'merge' as in your original code...
      }
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Preview Area */}
        <Card className="p-6">
          <div className="min-h-[300px] rounded-lg border-2 border-dashed border-gray-300 p-4">
            {state.files.length === 0 ? (
              <DragDropFile
                files={state.files}
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
                    {state.files.map((file, index) => (
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
                          {index === 0 && state.fileSize && (
                            <p className="text-xs text-gray-400">
                              {state.fileSize}
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
                    {state.fileSize && <span className="block text-xs mt-1">{state.fileSize}</span>}
                  </p>
                </div>
                <Button 
                  onClick={() => handleQuickConvert('compress')}
                  disabled={!state.files.length || state.isProcessing}
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
                    {state.files.length > 0 && <span className="block text-xs mt-1">Advanced splitting options available below</span>}
                  </p>
                </div>
                <Button 
                  onClick={() => handleQuickConvert('split')}
                  disabled={!state.files.length || state.isProcessing}
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
                    {state.files.length > 1 && <span className="block text-xs mt-1">Merging {state.files.length} files</span>}
                  </p>
                </div>
                <Button 
                  onClick={() => handleQuickConvert('merge')}
                  disabled={state.files.length < 2 || state.isProcessing}
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
    </div>
  )
}